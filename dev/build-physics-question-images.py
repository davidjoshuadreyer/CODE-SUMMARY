"""Compatibility entry point for reviewed question and solution crops."""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).with_name('build-physics-midterm-crops.py')),run_name='__main__')
