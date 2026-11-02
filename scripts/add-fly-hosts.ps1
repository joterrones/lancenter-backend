# Ejecutar como Administrador para que el navegador resuelva fly.dev en redes con DNS filtrado.
# La app Android ya no depende de esto (usa IP fijada en OkHttp).

$hostsPath = "$env:WINDIR\System32\drivers\etc\hosts"
$entry = "66.241.125.4 lancenter-backend.fly.dev"
$content = Get-Content $hostsPath -Raw -ErrorAction Stop
if ($content -match "lancenter-backend\.fly\.dev") {
    Write-Host "Ya existe la entrada en hosts."
} else {
    Add-Content -Path $hostsPath -Value "`r`n$entry"
    Write-Host "Agregado: $entry"
}
ipconfig /flushdns | Out-Null
Write-Host "DNS cache limpiado. Prueba https://lancenter-backend.fly.dev/health"
