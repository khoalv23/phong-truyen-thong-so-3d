$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..\..")
$port = 5174

while (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue) {
  $port++
}

$url = "http://127.0.0.1:$port/scene/scene-4/Chu_De_4.html"
Write-Host "Scene 4 is available at:"
Write-Host $url
Write-Host ""
Write-Host "Keep this window open while viewing the room."
Write-Host "Press Ctrl+C to stop the server."
Write-Host ""

python -m http.server $port --bind 127.0.0.1 --directory $repoRoot
