import json
from pathlib import Path
import numpy as np
import pytest
from doppler_lab.workflow import default_job,validate_events,check_job,settings,main,write_report

def event():return {'times_s':[1,2,3],'frequencies_hz':[100,90,80],'raw_frequencies_hz':[101,91,81]}

def test_init_measured_selection_and_missing_inputs(tmp_path):
    source=tmp_path/'source.json';source.write_text(json.dumps({'source':{'name':'mine.mp3'},'events':[event(),{**event(),'times_s':[10,11,12]}]}))
    assert main(['init',str(source),'--output',str(tmp_path/'job'),'--events','2'])==0
    config=json.loads((tmp_path/'job/job.json').read_text());assert config['events'][0]['times_s']==[10,11,12]
    assert config['events'][0]['frequencies_hz']==[101,91,81]
    assert config['recording_start_utc'] is None
    assert check_job(config,tmp_path)['ready'] is False
    with pytest.raises(SystemExit):main(['init',str(source),'--output',str(tmp_path/'job')])

def test_validation_clock_and_bounds():
    assert len(validate_events(event()))==1
    with pytest.raises(ValueError):validate_events({'events':[{**event(),'times_s':[1,1,3]}]})
    job=default_job([event()]);job['recording_start_utc']='2026-01-01T00:00:00Z';job['search'].update(bounds={'lat_min':49,'lat_max':49.01,'lon_min':-123,'lon_max':-122.99},time_range_s=2.5,time_step_s=2)
    assert settings(job)[4]==[-2.5,-2.,0.,2.,2.5]
    job['recording_start_utc']='2026-01-01T00:00:00'
    with pytest.raises(ValueError):settings(job)
    job['recording_start_utc']='2026-01-01T00:00:00Z';job['search']['max_evaluations']=20001
    with pytest.raises(ValueError):settings(job)

def test_archive_dispatch_budget(monkeypatch,tmp_path):
    from doppler_lab import archive
    seen={}
    def extract(parts,**kwargs):seen.update(kwargs);return {'tracks':[]}
    monkeypatch.setattr(archive,'extract_tracks',extract)
    assert main(['archive-extract','x.tar.aa','--start','2026-01-01T00:00:00Z','--end','2026-01-01T01:00:00Z','--output',str(tmp_path/'tracks.json'),'--max-mb','10'])==0
    assert seen['max_bytes']==10*1024**2
    assert 'max_archive_bytes' not in seen

def test_report_no_match_and_escape(tmp_path):
    p=tmp_path/'report.html';write_report(p,{'solution':{'best':None,'warnings':['<script>bad</script>']}})
    text=p.read_text();assert 'No valid match' in text;assert '<script>bad' not in text


def test_init_accepts_top_level_event_array(tmp_path):
    source=tmp_path/'array.json';source.write_text(json.dumps([event()]))
    assert main(['init',str(source),'--output',str(tmp_path/'array-job')])==0
    job=json.loads((tmp_path/'array-job/job.json').read_text())
    assert len(job['events'])==1 and job['source']['curves_sha256']


def test_archive_index_dispatch(monkeypatch,tmp_path):
    from doppler_lab import archive
    seen={}
    def index(parts,output,**kwargs):
        seen.update(kwargs);return {'tracks':2,'points':100}
    monkeypatch.setattr(archive,'write_tracks_jsonl',index)
    part=tmp_path/'day.tar.aa';part.write_bytes(b'fixture')
    output=tmp_path/'tracks.jsonl'
    assert main(['archive-index',str(part),'--date','2026-09-08','--output',str(output)])==0
    assert seen['end_utc']-seen['start_utc']==86400
    assert seen['bbox']==(20,55,-130,-60)
    manifest=json.loads(Path(str(output)+'.manifest.json').read_text())
    assert manifest['date_utc']=='2026-09-08' and manifest['archive_parts'][0]['sha256']


def test_day_search_requires_no_clock_or_bounds(monkeypatch,tmp_path):
    import sys,types
    from doppler_lab.workflow import run_day_job
    called={}
    def search(events,tracks_path,**kwargs):
        called.update(kwargs)
        assert events[0]['frequencies_hz'].tolist()==[101,91,81]
        return {'best':None,'warnings':['No candidate in bounded shortlist.'],'coverage':{'date_utc':kwargs['date_utc']},'work':{'pairs':0}}
    monkeypatch.setitem(sys.modules,'doppler_lab.day_search',types.SimpleNamespace(search_unknown_clock=search))
    job=default_job([event(),{**event(),'times_s':[10,11,12]}]);job['archive']['date']='2026-09-08'
    config=tmp_path/'job.json';config.write_text(json.dumps(job));tracks=tmp_path/'tracks.jsonl';tracks.write_text('{}\n')
    result=run_day_job(config,tracks,max_curve_fits=25)
    assert called['date_utc']=='2026-09-08' and called['max_curve_fits']==25
    assert result['solution']['best'] is None
    report=(tmp_path/'day-results/report.html').read_text()
    assert 'Search coverage' in report and 'No valid match in the evaluated candidates' in report
    assert (tmp_path/'day-results/curves.csv').is_file()
