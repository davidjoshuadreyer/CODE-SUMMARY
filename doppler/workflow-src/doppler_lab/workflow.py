"""Reproducible local orchestration. Network access is explicit, never part of fitting."""
from __future__ import annotations
import argparse, csv, hashlib, html, json, math, platform, sys
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
from .workbench import dump_json, parse_utc, format_utc
from .flights import load_tracks, candidate_grid

VERSION = '2026-11-02.1'

def read_json(path, max_bytes=64*1024**2):
    path=Path(path)
    if path.stat().st_size>max_bytes: raise ValueError(f'{path.name} exceeds {max_bytes//1024**2} MiB')
    return json.loads(path.read_text())

def sha256(path):
    digest=hashlib.sha256()
    with Path(path).open('rb') as stream:
        for block in iter(lambda:stream.read(1024**2),b''): digest.update(block)
    return digest.hexdigest()

def write_json(path, value):
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(dump_json(value)+'\n')

def validate_events(data):
    events=(data.get('events',[data] if 'times_s' in data else []) if isinstance(data,dict) else data)
    if not isinstance(events,list) or not 1<=len(events)<=20: raise ValueError('Provide 1–20 measured events.')
    result=[]
    for index,event in enumerate(events,1):
        t=np.asarray(event.get('times_s',[]),dtype=float)
        f=np.asarray(event.get('raw_frequencies_hz',event.get('frequencies_hz',[])),dtype=float)
        if t.ndim!=1 or f.shape!=t.shape or not 3<=len(t)<=20000 or not np.isfinite(t).all() or not np.isfinite(f).all() or np.any(np.diff(t)<=0) or np.any(t<0) or np.any(f<=0):
            raise ValueError(f'Event {index}: require 3–20000 increasing nonnegative times and finite positive measured frequencies.')
        result.append({**event,'times_s':t,'frequencies_hz':f,'flight_id':event.get('flight_id') or 'auto'})
    return result

def default_job(events, source=None):
    return {'schema_version':1,'workflow_version':VERSION,'events':events,'source':source or {},
        'recording_start_utc':None,'tracks':['tracks.json'],
        'search':{'bounds':None,'spacing_m':1000,'elevation_m':0,'sound_speed_m_s':343,
            'time_range_s':60,'time_step_s':10,'max_grid_points':250,'max_evaluations':4000,'max_refinements':8},
        'archive':{'date':None,'flight_ids':[],'max_download_mb':256},
        'reference_location':None,
        'notes':['Fill recording_start_utc with a timezone and receiver search bounds before running.',
                 'Times refer to the original recording. Location is not inferred from file creation time.',
                 'Reference location is evaluated only after fitting; it is not used by the solver.']}

def settings(job):
    value=job.get('recording_start_utc')
    if value is None: raise ValueError('Missing recording_start_utc: supply the original recording UTC start, or approximate start plus the shared time search range.')
    if not isinstance(value,str): raise ValueError('recording_start_utc must be ISO 8601 with Z or a timezone offset.')
    epoch=parse_utc(value); search=job.get('search',{}); bounds=search.get('bounds')
    if not isinstance(bounds,dict) or any(k not in bounds for k in ['lat_min','lat_max','lon_min','lon_max']):
        raise ValueError('Missing receiver search bounds: lat_min, lat_max, lon_min, lon_max.')
    values=[bounds[k] for k in ['lat_min','lat_max','lon_min','lon_max']]
    if any(isinstance(v,bool) or not isinstance(v,(int,float)) or not math.isfinite(v) for v in values): raise ValueError('Search bounds must be finite numeric degrees.')
    if not (-90<=bounds['lat_min']<=bounds['lat_max']<=90 and -180<=bounds['lon_min']<=bounds['lon_max']<=180): raise ValueError('Invalid WGS84 search bounds. Split dateline-crossing regions.')
    def number(key,default,lo,hi):
        value=search.get(key,default)
        if isinstance(value,bool) or not isinstance(value,(int,float)) or not math.isfinite(value) or not lo<=value<=hi: raise ValueError(f'{key} must be finite in [{lo}, {hi}].')
        return value
    spacing=number('spacing_m',1000,25,1000000);height=number('elevation_m',0,-1000,10000)
    sound=number('sound_speed_m_s',343,250,400);span=number('time_range_s',60,0,43200);step=number('time_step_s',10,.1,43200)
    count=math.floor(span/step)
    if count>100: raise ValueError('Use at most 201 coarse clock offsets; increase time_step_s.')
    # Endpoints are always evaluated, including a noninteger range/step ratio.
    offsets=sorted(set([float(k*step) for k in range(-count,count+1)]+[-span,0.,span]))
    max_grid=int(number('max_grid_points',250,1,2500));max_eval=int(number('max_evaluations',4000,1,20000))
    candidates=candidate_grid(bounds['lat_min'],bounds['lat_max'],bounds['lon_min'],bounds['lon_max'],spacing,height,max_points=max_grid)
    return epoch,search,bounds,candidates,offsets,sound,max_eval

def check_job(job, folder):
    events=validate_events(job.get('events',[]));issues=[]
    if not job.get('search',{}).get('bounds'):issues.append('Missing receiver search bounds: lat_min, lat_max, lon_min, lon_max.')
    info={'events':len(events),'event_intervals_s':[[float(e['times_s'][0]),float(e['times_s'][-1])] for e in events]}
    try:
        epoch,search,bounds,candidates,offsets,sound,max_eval=settings(job)
        info.update(recording_start_utc=format_utc(epoch),grid_points=len(candidates),clock_offsets=len(offsets))
    except (ValueError,TypeError) as exc: issues.append(str(exc))
    paths=job.get('tracks',[])
    if not isinstance(paths,list) or not paths: issues.append('No track files configured.')
    else:
        for path in paths:
            if not isinstance(path,str) or not (Path(folder)/path).is_file():issues.append(f'Missing track file: {path}')
    issues=list(dict.fromkeys(issues))
    info.update(ready=not issues,issues=issues)
    return info

def load_job_tracks(job, folder):
    tracks=[];evidence=[]
    for name in job.get('tracks',[]):
        path=(Path(folder)/name).resolve();tracks.extend(load_tracks(path));evidence.append({'file':str(path),'sha256':sha256(path)})
    if not tracks: raise ValueError('No tracks loaded. Extract the archive or configure normalized track files first.')
    if len(tracks)>100 or sum(len(t['times_utc']) for t in tracks)>500000: raise ValueError('Limit the selected tracks to 100 aircraft and 500000 points.')
    if len({t['flight_id'] for t in tracks})!=len(tracks): raise ValueError('Duplicate flight IDs across files; merge their chronological points before fitting.')
    return tracks,evidence

def run_job(config_path, output_dir=None):
    from .workflow_solver import solve_workflow
    path=Path(config_path).resolve();job=read_json(path);events=validate_events(job['events'])
    epoch,search,bounds,candidates,offsets,sound,max_eval=settings(job)
    tracks,evidence=load_job_tracks(job,path.parent)
    print(f'Matching {len(events)} curves against {len(tracks)} tracks at {len(candidates)} locations × {len(offsets)} shared clock offsets.',flush=True)
    solution=solve_workflow(events,tracks,candidates,epoch,time_offsets_s=offsets,bounds=bounds,
        time_offset_bounds_s=[-search.get('time_range_s',60),search.get('time_range_s',60)],
        sound_speed_m_s=sound,max_refinements=int(search.get('max_refinements',8)),max_evaluations=max_eval)
    result={'schema_version':1,'workflow_version':VERSION,'created_utc':datetime.now(timezone.utc).isoformat(),
        'source':job.get('source',{}),'config_sha256':sha256(path),'track_files':evidence,
        'configuration':job,'runtime':{'python':platform.python_version(),'numpy':np.__version__},'solution':solution,
        'note':'Candidate fit, not verified location. No calibrated confidence or general accuracy claim.'}
    reference=job.get('reference_location');best=solution.get('best')
    if reference and best:
        observer=best['observer'];a,b=np.deg2rad([observer['latitude'],reference['latitude']]);dl=np.deg2rad(observer['longitude']-reference['longitude'])
        h=np.sin((a-b)/2)**2+np.cos(a)*np.cos(b)*np.sin(dl/2)**2
        result['reference_check']={'reference':reference,'distance_m':float(6371008.8*2*np.arcsin(np.sqrt(np.clip(h,0,1)))),'used_in_solver':False}
    out=Path(output_dir).resolve() if output_dir else path.parent/'results';out.mkdir(parents=True,exist_ok=True)
    write_json(out/'result.json',result)
    write_report(out/'report.html',result)
    with (out/'curves.csv').open('w',newline='') as stream:
        writer=csv.writer(stream);writer.writerow(['event','flight_id','recording_seconds','observed_hz','predicted_hz','residual_hz'])
        for i,event in enumerate((best or {}).get('per_event',[]),1):
            for t,observed,predicted in zip(event['times_s'],event['observed_frequencies_hz'],event['predicted_frequencies_hz']):writer.writerow([i,event['flight_id'],t,observed,predicted,float(observed-predicted)])
    print(f'Results: {out / "report.html"}',flush=True)
    return result

def write_report(path,result):
    esc=lambda value:html.escape(str(value));solution=result['solution'];best=solution.get('best')
    content='<h1>Doppler flight-matching report</h1>'+('<p><strong>SYNTHETIC DEMONSTRATION — generated tones and flight tracks; not a real location result.</strong></p>' if result.get('source',{}).get('kind')=='synthetic' else '')+'<p>Observed frequencies compared with actual imported flight trajectories. Fit errors are not confidence probabilities.</p>'
    if not best:content+='<h2>No valid match in the evaluated candidates</h2><p>Inspect coverage, pruning thresholds and work limits in result.json. This does not prove the recording has no matching flights.</p>'
    else:
        o=best['observer'];content+=f'<h2>Best candidate: {o["latitude"]:.6f}, {o["longitude"]:.6f}</h2><p>Combined error: {best["rmse_hz"]:.3f} Hz · Recording start: {esc(format_utc(best["recording_start_utc"]))}</p>'
        if 'reference_check' in result:content+=f'<p>Distance to withheld reference: {result["reference_check"]["distance_m"]:.1f} m. Reference was not supplied to the solver.</p>'
        for i,event in enumerate(best['per_event'],1):
            t=np.asarray(event['times_s']);a=np.asarray(event['observed_frequencies_hz']);b=np.asarray(event['predicted_frequencies_hz']);lo=min(a.min(),b.min());hi=max(a.max(),b.max());padding=max(1.,(hi-lo)*.1);lo-=padding;hi+=padding
            x=lambda v:55+(v-t[0])/max(1e-9,t[-1]-t[0])*790
            y=lambda v:215-(v-lo)/(hi-lo)*180
            # Break lines across missing measured samples instead of implying support.
            dt=np.median(np.diff(t));segments=[];start=0
            for j in range(1,len(t)+1):
                if j==len(t) or t[j]-t[j-1]>3*dt:segments.append((start,j));start=j
            paths=''
            for values,color in [(a,'#9470c8'),(b,'#178678')]:
                for start,end in segments: paths+=f'<polyline fill="none" stroke="{color}" stroke-width="2" points="'+ ' '.join(f'{x(tt):.2f},{y(ff):.2f}' for tt,ff in zip(t[start:end],values[start:end]))+'"/>'
            content+=f'<section><h3>Event {i} · {esc(event["flight_id"])} · {event["rmse_hz"]:.3f} Hz</h3><p>{t[0]:.1f}–{t[-1]:.1f} seconds · fitted source tone {event["f0_hz"]:.2f} Hz</p><svg viewBox="0 0 900 260" role="img" aria-label="Measured and predicted frequency curves"><path d="M55 30V215H845" fill="none" stroke="#ccc"/>{paths}<text x="10" y="35">{hi:.0f} Hz</text><text x="10" y="215">{lo:.0f} Hz</text><text x="55" y="240">{t[0]:.1f} s</text><text x="795" y="240">{t[-1]:.1f} s</text></svg><p>Purple: measured · Teal: predicted from flight track</p></section>'
    warnings=list(dict.fromkeys(solution.get('warnings',[])+((best or {}).get('warnings',[]))))
    if solution.get('coverage'):
        content+='<h2>Search coverage</h2><pre style="white-space:pre-wrap">'+esc(json.dumps(solution['coverage'],indent=2))+'</pre>'
    if solution.get('work'):
        content+='<h2>Work performed</h2><pre style="white-space:pre-wrap">'+esc(json.dumps(solution['work'],indent=2))+'</pre>'
    content+='<h2>Checks and limitations</h2><ul>'+''.join('<li>'+esc(w)+'</li>' for w in warnings)+'</ul>'
    rows=solution.get('grid_candidates',[])[:10]
    if rows:
        content+='<h2>Coarse search alternatives</h2><table><tr><th>Latitude</th><th>Longitude</th><th>Recording start (UTC)</th><th>Error (Hz)</th></tr>'
        for row in rows:
            o=row.get('observer',row);start=format_utc(row['recording_start_utc']) if 'recording_start_utc' in row else 'Unavailable';content+=f'<tr><td>{o["latitude"]:.6f}</td><td>{o["longitude"]:.6f}</td><td>{esc(start)}</td><td>{row["score"]:.3f}</td></tr>'
        content+='</table>'
    content+='<p>Complete configuration, track hashes, assignments and diagnostics are in result.json. Frequency samples are in curves.csv.</p>'
    Path(path).write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Doppler matching report</title><style>body{max-width:1000px;margin:40px auto;padding:0 24px;font:16px/1.6 system-ui;color:#302d3d;background:#f8f7fb}section{background:white;padding:20px;border-radius:12px;margin:24px 0}svg{width:100%;font:12px system-ui}table{border-collapse:collapse}td,th{padding:8px 18px;border-bottom:1px solid #ddd;text-align:left}</style>'+content+'</html>')


def run_day_job(config_path, tracks_path, *, date_utc=None, output_dir=None, **limits):
    """Fit date-wide hypotheses without requiring a known receiver or clock."""
    from .day_search import search_unknown_clock
    path=Path(config_path).resolve();job=read_json(path)
    date_utc=date_utc or job.get('archive',{}).get('date')
    if not date_utc:raise ValueError('Provide --date YYYY-MM-DD or archive.date in the job.')
    events=validate_events(job['events'])
    out=Path(output_dir).resolve() if output_dir else path.parent/'day-results'
    out.mkdir(parents=True,exist_ok=True)
    solution=search_unknown_clock(events,Path(tracks_path).resolve(),date_utc=date_utc,output_dir=out,**limits)
    index_manifest=Path(str(tracks_path)+'.manifest.json')
    if not index_manifest.is_file():index_manifest=Path(tracks_path).parent/'extraction.json'
    if index_manifest.is_file():
        solution.setdefault('coverage',{})['index_provenance']=read_json(index_manifest)
    result={'schema_version':1,'workflow_version':VERSION,'created_utc':datetime.now(timezone.utc).isoformat(),
        'source':job.get('source',{}),'config_sha256':sha256(path),
        'track_files':[{'file':str(Path(tracks_path).resolve()),'sha256':sha256(tracks_path)}],
        'configuration':{'date_utc':date_utc,'limits':limits,'job':job},'solution':solution,
        'note':'Candidate fit, not verified location. Search pruning and compute limits can miss the true solution.'}
    write_json(out/'result.json',result);write_report(out/'report.html',result)
    with (out/'curves.csv').open('w',newline='') as stream:
        writer=csv.writer(stream);writer.writerow(['event','flight_id','recording_seconds','observed_hz','predicted_hz','residual_hz'])
        for i,event in enumerate((solution.get('best') or {}).get('per_event',[]),1):
            for t,a,b in zip(event['times_s'],event['observed_frequencies_hz'],event['predicted_frequencies_hz']):writer.writerow([i,event['flight_id'],t,a,b,float(a-b)])
    print(f'Results: {out / "report.html"}',flush=True)
    return result


def main(argv=None):
    parser=argparse.ArgumentParser(description='Local Doppler curves → historical tracks → bounded matching workflow')
    sub=parser.add_subparsers(dest='command',required=True)
    init=sub.add_parser('init',help='Prepare a job from exported measured curves');init.add_argument('curves');init.add_argument('--output',required=True);init.add_argument('--events',help='One-based event numbers, e.g. 1,3');init.add_argument('--recording-start');init.add_argument('--bounds',nargs=4,type=float,metavar=('SOUTH','NORTH','WEST','EAST'))
    check=sub.add_parser('check',help='Validate metadata and list missing inputs');check.add_argument('job')
    run=sub.add_parser('run',help='Run local matching; never downloads implicitly');run.add_argument('job');run.add_argument('--output')
    day=sub.add_parser('day-search',help='Search a UTC day with unknown recording clock and receiver');day.add_argument('job');day.add_argument('--tracks',required=True);day.add_argument('--date');day.add_argument('--output')
    day.add_argument('--max-hypotheses',type=int,default=1000000);day.add_argument('--max-pairs',type=int,default=20000);day.add_argument('--max-curve-fits',type=int,default=300);day.add_argument('--max-refinements',type=int,default=12)
    demo=sub.add_parser('demo',help='Run a labelled synthetic end-to-end workflow');demo.add_argument('--output',required=True)
    plan=sub.add_parser('archive-plan',help='Read release metadata without downloading aircraft data');plan.add_argument('--date',required=True);plan.add_argument('--output',required=True)
    fetch=sub.add_parser('archive-fetch',help='Download planned archive parts under an explicit byte budget');fetch.add_argument('plan');fetch.add_argument('--cache',required=True);fetch.add_argument('--max-mb',type=float,default=256)
    extract=sub.add_parser('archive-extract',help='Stream local archive parts into normalized tracks');extract.add_argument('parts',nargs='+');extract.add_argument('--output',required=True);extract.add_argument('--flight-id',action='append');extract.add_argument('--start',required=True);extract.add_argument('--end',required=True);extract.add_argument('--max-mb',type=float,default=4096)
    index=sub.add_parser('archive-index',help='Create a full-day JSONL index for aircraft intersecting 20–55N, 130–60W');index.add_argument('parts',nargs='+');index.add_argument('--date',required=True);index.add_argument('--output',required=True);index.add_argument('--max-mb',type=float,default=6144);index.add_argument('--max-points',type=int,default=100000000)
    args=parser.parse_args(argv)
    try:
        if args.command=='init':
            data=read_json(args.curves);events=validate_events(data)
            if args.events:
                indices=[int(v)-1 for v in args.events.split(',')]
                if len(set(indices))!=len(indices) or any(i<0 or i>=len(events) for i in indices):raise ValueError('Event numbers must be unique and within the exported event list.')
                events=[events[i] for i in indices]
            job=default_job(events,{**(data.get('source',{}) if isinstance(data,dict) else {}),'curves_sha256':sha256(args.curves)})
            if args.recording_start:parse_utc(args.recording_start);job['recording_start_utc']=args.recording_start;job['archive']['date']=format_utc(parse_utc(args.recording_start))[:10]
            if args.bounds:job['search']['bounds']=dict(zip(['lat_min','lat_max','lon_min','lon_max'],args.bounds))
            target=Path(args.output)/'job.json'
            if target.exists():raise ValueError(f'{target} exists; choose a new output folder to preserve the previous job.')
            write_json(target,job);print(f'Created {target}');print(dump_json(check_job(job,target.parent)))
        elif args.command=='check':
            path=Path(args.job);report=check_job(read_json(path),path.parent);print(dump_json(report));return 0 if report['ready'] else 2
        elif args.command=='run':run_job(args.job,args.output)
        elif args.command=='day-search':run_day_job(args.job,args.tracks,date_utc=args.date,output_dir=args.output,max_hypotheses=args.max_hypotheses,max_pairs=args.max_pairs,max_curve_fits=args.max_curve_fits,max_refinements=args.max_refinements)
        elif args.command=='demo':
            from .demo import make_demo
            demo=make_demo();folder=Path(args.output)
            if (folder/'job.json').exists():raise ValueError('Demo output already contains job.json; choose a fresh folder.')
            job=default_job([{**e,'flight_id':'auto'} for e in demo['events']],{'kind':'synthetic','note':demo['label']})
            job['recording_start_utc']=format_utc(demo['recording_start_utc']-2)
            job['search'].update(bounds={'lat_min':49.24,'lat_max':49.26,'lon_min':-123.115,'lon_max':-123.085},spacing_m=1000,time_range_s=4,time_step_s=2,max_evaluations=4000)
            job['reference_location']=demo['observer'];write_json(folder/'job.json',job);write_json(folder/'tracks.json',{'tracks':demo['tracks']});run_job(folder/'job.json')
        elif args.command=='archive-plan':
            from .archive import discover_release
            manifest=discover_release(args.date);write_json(args.output,manifest);print(dump_json(manifest))
        elif args.command=='archive-fetch':
            from .archive import download_release
            paths=download_release(read_json(args.plan),args.cache,max_bytes=int(args.max_mb*1024**2));print('\n'.join(str(p) for p in paths))
        elif args.command=='archive-extract':
            from .archive import extract_tracks
            data=extract_tracks(args.parts,flight_ids=args.flight_id,start_utc=parse_utc(args.start),end_utc=parse_utc(args.end),max_bytes=int(args.max_mb*1024**2))
            write_json(args.output,data);print(f'Wrote {len(data["tracks"])} tracks to {args.output}')
        elif args.command=='archive-index':
            from .archive import write_tracks_jsonl
            start=parse_utc(args.date+'T00:00:00Z')
            def progress(tracks,points,size):
                if tracks%1000==0:print(f'Indexed {tracks} tracks / {points} points / {size/1024**2:.0f} MiB',flush=True)
            summary=write_tracks_jsonl(args.parts,args.output,max_points=args.max_points,start_utc=start,end_utc=start+86400,bbox=(20,55,-130,-60),max_bytes=int(args.max_mb*1024**2),duplicate_time_policy='drop-all',on_progress=progress)
            summary.update(date_utc=args.date,selection_bbox=[20,55,-130,-60],duplicate_time_policy='drop-all',archive_parts=[{'file':str(Path(p).resolve()),'sha256':sha256(p)} for p in args.parts])
            write_json(str(args.output)+'.manifest.json',summary);print(dump_json(summary))
        return 0
    except (ValueError,KeyError,TypeError,OSError) as exc:
        parser.exit(2,f'Workflow stopped: {exc}\n')

if __name__=='__main__':raise SystemExit(main())
