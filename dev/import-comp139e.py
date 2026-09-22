"""Import the portable COMP 139E setup, excluding builds and completed submissions.
Usage: python dev/import-comp139e.py PATH_TO_Template/COMP139E
"""
import importlib.util
import json
from pathlib import Path
import shutil
import sys

source = Path(sys.argv[1]).resolve()
site = Path(__file__).resolve().parents[1]
destination = site / 'comp139e/workspace'
allowed_roots = {'.vscode', 'dashboard', 'examples', 'labs', 'scripts', 'tutorials', 'reference'}
allowed_ext = {'.cpp', '.hpp', '.h', '.m', '.md', '.txt', '.csv', '.dat', '.html', '.css', '.js', '.cjs', '.json', '.py', '.ps1', '.cmake', '.in', '.pdf', '.jpg', '.jpeg', '.png', '.svg', '.tex', '.zip'}
copied = 0
for p in source.rglob('*'):
    if not p.is_file():
        continue
    rel = p.relative_to(source)
    if any(part in {'build', 'node_modules', '__pycache__', '.git', 'original-setup'} for part in rel.parts):
        continue
    if len(rel.parts) == 1:
        keep = p.name in {'main.cpp', 'CMakeLists.txt', 'README.md', '.gitignore'}
    else:
        keep = rel.parts[0] in allowed_roots and p.suffix.lower() in allowed_ext
    if not keep or (rel.parts[:2] == ('tutorials', 'output') and p.name != 'README.md'):
        continue
    target = destination / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(p, target)
    copied += 1
# Read the existing dashboard's discovery logic without starting its server.
spec = importlib.util.spec_from_file_location('comp139e_catalog', destination / 'dashboard/server.py')
module = importlib.util.module_from_spec(spec)
sys.dont_write_bytecode = True
spec.loader.exec_module(module)
programs = module.catalog()
for program in programs:
    program.pop('command', None)  # Local absolute executable paths are not public metadata.
    program.pop('built', None)
    program['files'] = list(dict.fromkeys([program['source'], *program['files']]))
    program['readme'] = f"labs/lab{int(program['id'].split(':')[1]):02}/README.md" if program['kind'] == 'labs' else ''
    if not all((destination / file).is_file() for file in program['files']):
        raise RuntimeError('Missing source dependency for ' + program['id'])
(site / 'comp139e/programs.json').write_text(json.dumps(programs, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Imported {copied} source/reference files and {len(programs)} library entries.')
with (destination / '.gitignore').open('a', encoding='utf-8') as ignore:
    ignore.write('\n__pycache__/\n*.pyc\n/tutorials/output/*.txt\n')
