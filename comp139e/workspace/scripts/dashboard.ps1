param([int]$Port = 13900, [switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCommand) { throw 'Python is required to run the local course dashboard.' }
$dashboardArguments = @((Join-Path $projectRoot 'dashboard/server.py'), '--port', $Port)
if ($NoBrowser) { $dashboardArguments += '--no-browser' }
& $pythonCommand.Source @dashboardArguments
