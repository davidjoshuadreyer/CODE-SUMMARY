"""Create a source-only portable workspace from the repository copy."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1] / 'comp139e'
workspace = root / 'workspace'
with ZipFile(root / 'COMP139E-workspace.zip', 'w', ZIP_DEFLATED) as archive:
    for p in sorted(workspace.rglob('*')):
        if not p.is_file():
            continue
        rel = p.relative_to(workspace)
        if any(part in {'build', '__pycache__', 'node_modules', '.git'} for part in rel.parts):
            continue
        if p.suffix.lower() in {'.exe', '.obj', '.o', '.pdb', '.ilk', '.pyc'}:
            continue
        if str(rel).replace('\\', '/') == 'labs/lab04/output.txt':
            continue
        if rel.parts[:2] == ('tutorials', 'output') and p.name != 'README.md':
            continue
        archive.write(p, 'COMP139E/' + rel.as_posix())
print('Packaged COMP139E-workspace.zip with source, references, build tasks, and local dashboard.')
