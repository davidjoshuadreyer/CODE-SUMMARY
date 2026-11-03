import gzip
import hashlib
import io
import json
import tarfile
import pytest
from doppler_lab import archive
from doppler_lab.flights import load_tracks


def trace():
    return {'icao': 'abc123', 'timestamp': 1700000000, 'trace': [[i*10,49+i*.01,-123,1000,100,0,0] for i in range(5)]}


def fixture(tmp_path,name='2024/traces/23/trace_full_abc123.json',value=None,link=False):
    content=io.BytesIO()
    with tarfile.open(fileobj=content,mode='w') as tar:
        info=tarfile.TarInfo(name)
        raw=gzip.compress(json.dumps(trace() if value is None else value).encode())
        if link:
            info.type=tarfile.SYMTYPE;info.linkname='/etc/passwd';tar.addfile(info)
        else:
            info.size=len(raw);tar.addfile(info,io.BytesIO(raw))
    raw=content.getvalue()
    parts=[tmp_path/'test.tar.aa',tmp_path/'test.tar.ab']
    parts[0].write_bytes(raw[:580]);parts[1].write_bytes(raw[580:])
    return parts


def test_split_crop_roundtrip(tmp_path):
    parts=fixture(tmp_path)
    output=archive.extract_tracks(parts,start_utc=1700000015,end_utc=1700000025)
    track=output['tracks'][0]
    assert track['times_utc']==[1700000010,1700000020,1700000030]
    assert track['altitudes_m']==[304.8]*3
    target=tmp_path/'tracks.json';target.write_text(json.dumps(output))
    assert load_tracks(target)[0]['altitude_datum']=='barometric'
    assert not archive.extract_tracks(parts,flight_ids=['ffffff'])['tracks']
    assert not archive.extract_tracks(parts,start_utc=1800000000)['tracks']
    assert not archive.extract_tracks(parts,bbox=(0,1,0,1))['tracks']
    assert len(archive.extract_tracks(parts,bbox=(49.015,49.025,-124,-122))['tracks'][0]['times_utc'])==5


@pytest.mark.parametrize('name,link',[('../traces/trace_full_abc123.json',False),('/traces/trace_full_abc123.json',False),('safe',True)])
def test_unsafe(tmp_path,name,link):
    with pytest.raises(ValueError,match='Unsafe|forbidden'):
        archive.extract_tracks(fixture(tmp_path,name,link=link))


def test_limits_missing_parts(tmp_path):
    parts=fixture(tmp_path)
    for options,message in [({'max_bytes':10},'budget'),({'max_json_bytes':10},'JSON limit'),({'max_member_bytes':10},'member size'),({'max_points':2},'point budget')]:
        with pytest.raises(ValueError,match=message):archive.extract_tracks(parts,**options)
    with pytest.raises(ValueError,match='contiguous'):archive.extract_tracks(parts[1:])
    with pytest.raises((tarfile.ReadError,EOFError,OSError)):archive.extract_tracks(parts[:1])


def test_ground_and_bad_trace(tmp_path):
    value=trace()
    for row in value['trace']:row[3]='ground'
    assert archive.extract_tracks(fixture(tmp_path,value=value))['tracks']==[]
    value['trace']=[[0]]
    with pytest.raises(ValueError,match='Malformed'):archive.extract_tracks(fixture(tmp_path,value=value))


def plan_for(raw):
    tag='v2026.11.01-planes-readsb-prod-0';name=tag+'.tar.aa';repository='adsblol/globe_history_2026'
    url=f'https://github.com/{repository}/releases/download/{tag}/{name}'
    return dict(repository=repository,tag=tag,total_bytes=len(raw),assets=[dict(name=name,url=url,size_bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())])


def test_budget_cache(tmp_path,monkeypatch):
    raw=b'example';plan=plan_for(raw);calls=[]
    def get(url):calls.append(url);return io.BytesIO(raw)
    monkeypatch.setattr(archive,'_get',get)
    with pytest.raises(ValueError,match='budget'):archive.download_release(plan,tmp_path,max_bytes=1)
    assert not calls
    paths=archive.download_release(plan,tmp_path)
    assert paths[0].read_bytes()==raw
    assert archive.download_release(plan,tmp_path)==paths
    assert len(calls)==1
    paths[0].write_bytes(b'corrupt')
    with pytest.raises(ValueError,match='integrity'):archive.download_release(plan,tmp_path)


def test_bad_download(tmp_path,monkeypatch):
    monkeypatch.setattr(archive,'_get',lambda _:io.BytesIO(b'WRONG!!'))
    with pytest.raises(ValueError,match='integrity'):archive.download_release(plan_for(b'example'),tmp_path)
    assert not list(tmp_path.rglob('*.aa'))
    assert not list(tmp_path.rglob('*.part'))


def test_discovery(monkeypatch):
    plan=plan_for(b'example');a=plan['assets'][0];visited=[]
    def metadata(url):
        visited.append(url)
        if url.endswith('PREFERRED_RELEASES.txt'):return a['url']+'\n'
        return json.dumps({'assets':[{'browser_download_url':a['url'],'name':a['name'],'size':a['size_bytes'],'digest':'sha256:'+a['sha256']}]})
    monkeypatch.setattr(archive,'_metadata',metadata)
    found=archive.discover_release('2026-11-01')
    assert found['total_bytes']==7
    assert found['assets']==plan['assets']
    assert 'globe_history_2026' in visited[0]
    assert '/releases/tags/' in visited[1]
