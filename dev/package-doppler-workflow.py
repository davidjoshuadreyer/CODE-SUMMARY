"""Build the public source bundle; excludes recordings, jobs, caches and virtualenvs."""
from pathlib import Path
import argparse,hashlib,json,zipfile
parser=argparse.ArgumentParser();parser.add_argument('--source',type=Path,default=Path(__file__).resolve().parents[2]/'doppler-lab');args=parser.parse_args()
site=Path(__file__).resolve().parents[1];out=site/'doppler/workflow-src';out.mkdir(parents=True,exist_ok=True)
files={f'doppler_lab/{name}.py':args.source/'doppler_lab'/f'{name}.py' for name in ['__init__','__main__','workflow','workflow_solver','archive','physics','flights','demo','workbench']}
files.update({'README.md':args.source/'WORKFLOW.md','requirements.txt':args.source/'requirements-workflow.txt','LICENSE':args.source/'WORKFLOW-LICENSE'})
for name in ['test_workflow','test_workflow_solver','test_archive','test_physics','test_flights']:
 files[f'tests/{name}.py']=args.source/'tests'/f'{name}.py'
manifest={}
for name,source in files.items():
 data=source.read_bytes();target=out/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data);manifest[name]=hashlib.sha256(data).hexdigest()
(out/'MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
with zipfile.ZipFile(site/'doppler/doppler-workflow.zip','w',compression=zipfile.ZIP_DEFLATED) as bundle:
 for name in sorted([*files,'MANIFEST.json']):
  info=zipfile.ZipInfo('doppler-workflow/'+name,date_time=(2026,11,2,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o644<<16;bundle.writestr(info,(out/name).read_bytes())
print(f'Packaged {len(files)} source/test files; no user recordings or jobs.')
