"""Check the downloadable Lab 5 solution against the supplied course files."""
from pathlib import Path
import subprocess, tempfile, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
PKG=ROOT/'comp139e/downloads/lab05-solution'
GIVEN=ROOT/'comp139e/workspace/reference/course/labs/files/DigitalController'

def rows(text):
    lines=text.strip().splitlines()
    assert lines[0]=='Y = [' and lines[-1]=='];'
    result=[list(map(float,line.split())) for line in lines[1:-1]]
    assert len(result)==50 and all(len(row)==2 for row in result)
    return result

with tempfile.TemporaryDirectory(prefix='comp-lab05-check-') as tmp:
    tmp=Path(tmp)
    files=['controllerMain.cpp','PID_Controller.cpp','Plant.cpp','ProportionalController.cpp']
    flags=['clang++','-std=c++17','-Wall','-Wextra','-pedantic-errors','-fsanitize=address,undefined']
    subprocess.run(flags+[str(PKG/f) for f in files]+['-o',str(tmp/'lab05')],check=True,capture_output=True)
    output=subprocess.check_output([str(tmp/'lab05')],text=True)
    assert rows(output)==rows((GIVEN/'proportionalOutput.txt').read_text()), 'Original main must still run proportional'
    # Activate only the instructor's existing lines in a temporary test copy.
    text=(PKG/'controllerMain.cpp').read_text()
    text=text.replace('//    PID_Controller pidController', '      PID_Controller pidController')
    text=text.replace('//    controller = &pidController', '      controller = &pidController')
    pidmain=tmp/'pidMain.cpp';pidmain.write_text(text)
    subprocess.run(flags+['-I',str(PKG),str(pidmain)]+[str(PKG/f) for f in files if f!='controllerMain.cpp']+['-o',str(tmp/'pid')],check=True,capture_output=True)
    output=subprocess.check_output([str(tmp/'pid')],text=True)
    actual=rows(output);expected=rows((GIVEN/'pidOutput.txt').read_text())
    assert actual==expected, 'PID output must match all 50 supplied rows at their displayed precision'
    assert rows((PKG/'pidOutput.txt').read_text())==actual
    assert output in (PKG/'plotResponse.m').read_text()
    for name in ['Controller.hpp','Plant.hpp','Plant.cpp','ProportionalController.hpp','ProportionalController.cpp','controllerMain.cpp','pidOutput.txt']:
        assert (PKG/name).read_bytes()==(GIVEN/name).read_bytes(), name+' changed'
    test=tmp/'test.cpp'
    test.write_text('''#include <cassert>
#include <cmath>
#include "PID_Controller.hpp"
bool near(double a,double b) { return std::abs(a-b)<1e-12; }
int main() {
    PID_Controller pid(0.5,25,2.5);
    Controller* base=&pid;
    assert(near(base->controlStep(0,1),1.502));
    assert(near(base->controlStep(0.2,1),1.1534));
    assert(near(base->controlStep(0.2,0.5),0.65366));
    PID_Controller fresh(0.5,25,2.5);
    assert(near(fresh.controlStep(0,1),1.502));
    PID_Controller zeroGain(0,25,2.5);
    assert(near(zeroGain.controlStep(0,2),2));
    assert(near(zeroGain.controlStep(0.5,3),3));
    PID_Controller zeroError(0.5,25,2.5);
    assert(near(zeroError.controlStep(0,0),0));
}
''')
    subprocess.run(flags+['-I',str(PKG),str(test),str(PKG/'PID_Controller.cpp'),'-o',str(tmp/'checks')],check=True,capture_output=True)
    subprocess.run([str(tmp/'checks')],check=True)
    xml=ET.parse(PKG/'Lab05.vcxproj')
    ns={'m':'http://schemas.microsoft.com/developer/msbuild/2003'}
    compiled=[n.attrib['Include'] for n in xml.findall('.//m:ClCompile',ns) if 'Include' in n.attrib]
    assert sorted(compiled)==sorted(files)
    assert not xml.findall('.//m:PlatformToolset',ns), 'Do not pin an unavailable toolset'
    assert sum('int main(' in (PKG/f).read_text() for f in compiled)==1
    for node in xml.findall('.//m:ClInclude',ns): assert (PKG/node.attrib['Include']).is_file()
print('PASS: 50 supplied output rows, PID state and formulas, independent objects, base-pointer dispatch, all six unchanged supplied C++ files, one-project manifest, MATLAB data.')
