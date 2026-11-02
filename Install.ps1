# Creates "George's Calendar App" shortcuts on the Desktop and in the Start menu.
# Run:  powershell -ExecutionPolicy Bypass -File Install.ps1

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$script = Join-Path $here 'georges_calendar.pyw'
$icon = Join-Path $here 'assets\georges_calendar.ico'

# Use the real pythonw.exe (not the WindowsApps alias) so no console window appears.
$python = (& python -c "import sys; print(sys.executable)").Trim()
$pythonw = Join-Path (Split-Path $python) 'pythonw.exe'
if (-not (Test-Path $pythonw)) { throw "pythonw.exe not found next to $python" }

$name = "George's Calendar App.lnk"
$targets = @(
    (Join-Path ([Environment]::GetFolderPath('Desktop')) $name),
    (Join-Path ([Environment]::GetFolderPath('Programs')) $name)
)

$shell = New-Object -ComObject WScript.Shell
foreach ($path in $targets) {
    $lnk = $shell.CreateShortcut($path)
    $lnk.TargetPath = $pythonw
    $lnk.Arguments = "`"$script`""
    $lnk.WorkingDirectory = $here
    $lnk.IconLocation = "$icon,0"
    $lnk.Description = "George's Calendar App"
    $lnk.Save()
    Write-Host "Created $path"
}
