param([ValidateSet('Debug', 'Release')][string]$Configuration = 'Debug')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent

# Use CMake from PATH or discover the copy supplied with Visual Studio.
$cmakeCommand = Get-Command cmake -ErrorAction SilentlyContinue
$cmakePath = if ($cmakeCommand) { $cmakeCommand.Source } else { $null }
if (-not $cmakePath) {
    $vswherePath = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio/Installer/vswhere.exe'
    if (Test-Path -LiteralPath $vswherePath) {
        $installPath = & $vswherePath -latest -products '*' -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
        if ($installPath) {
            $candidate = Join-Path $installPath 'Common7/IDE/CommonExtensions/Microsoft/CMake/CMake/bin/cmake.exe'
            if (Test-Path -LiteralPath $candidate) { $cmakePath = $candidate }
        }
    }
}
if (-not $cmakePath) { throw 'Install CMake and a C++ compiler, or Visual Studio C++ Build Tools.' }
# Target the installed x64 C++ toolchain, including on ARM-based Windows laptops.
& $cmakePath -S $projectRoot -B (Join-Path $projectRoot 'build') -A x64
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& $cmakePath --build (Join-Path $projectRoot 'build') --config $Configuration --parallel
exit $LASTEXITCODE
