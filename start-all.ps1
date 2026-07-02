$Root = $PSScriptRoot
$MVN  = "C:\Program Files\JetBrains\IntelliJ IDEA 2025.3\plugins\maven\lib\maven3\bin\mvn.cmd"

function Log($msg) { Write-Host "[LMS] $msg" -ForegroundColor Cyan }
function Ok($msg)  { Write-Host "[OK]  $msg" -ForegroundColor Green }
function Err($msg) { Write-Host "[ERR] $msg" -ForegroundColor Red }

Log "Поднимаем инфраструктуру (Postgres, MongoDB, Kafka, MinIO, Zipkin)..."
Push-Location "$Root\docker"
docker compose up -d --wait
if ($LASTEXITCODE -ne 0) { Err "docker compose failed"; Pop-Location; exit 1 }
Pop-Location
Ok "Инфраструктура готова."

Start-Sleep -Seconds 5

function Start-Service($name, $dir) {
    Log "Запускаем $name..."
    $logFile = "$Root\logs\$name.log"
    New-Item -ItemType Directory -Force -Path "$Root\logs" | Out-Null

    $proc = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c", "cd /d `"$dir`" && `"$MVN`" spring-boot:run > `"$logFile`" 2>&1" `
        -PassThru -WindowStyle Hidden
    return $proc
}

$services = @(
    @{ Name = "user-service";         Dir = "$Root\user-service" },
    @{ Name = "course-service";       Dir = "$Root\course-service" },
    @{ Name = "enrollment-service";   Dir = "$Root\enrollment-service" },
    @{ Name = "progress-service";     Dir = "$Root\progress-service" },
    @{ Name = "media-service";        Dir = "$Root\media-service" },
    @{ Name = "assessment-service";   Dir = "$Root\assessment-service" },
    @{ Name = "notification-service"; Dir = "$Root\notification-service" },
    @{ Name = "api-gateway";          Dir = "$Root\api-gateway" }
)

$procs = @()
foreach ($svc in $services) {
    $procs += Start-Service $svc.Name $svc.Dir
}

Log "Ждём поднятия сервисов (до 180 сек)..."

$checks = @(
    @{ Port = 8081; Label = "user-service" },
    @{ Port = 8082; Label = "course-service" },
    @{ Port = 8083; Label = "enrollment-service" },
    @{ Port = 8085; Label = "progress-service" },
    @{ Port = 8086; Label = "media-service" },
    @{ Port = 8087; Label = "assessment-service" },
    @{ Port = 8080; Label = "api-gateway" }
)

$deadline = (Get-Date).AddSeconds(180)
$ready = @{}

while ((Get-Date) -lt $deadline -and $ready.Count -lt $checks.Count) {
    Start-Sleep -Seconds 3
    foreach ($c in $checks) {
        if ($ready.ContainsKey($c.Port)) { continue }
        try {
            $r = Invoke-WebRequest -Uri "http://localhost:$($c.Port)/actuator/health" `
                 -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            if ($r.StatusCode -eq 200) {
                $ready[$c.Port] = $true
                Ok "$($c.Label) (:$($c.Port)) готов"
            }
        } catch { }
    }
}

if ($ready.Count -lt $checks.Count) {
    $missing = ($checks | Where-Object { -not $ready.ContainsKey($_.Port) } | ForEach-Object { $_.Label }) -join ", "
    Err "Не ответили вовремя: $missing"
    Err "Смотрите логи в $Root\logs\"
} else {
    Ok "Все бэкенд-сервисы запущены!"
}

Log "Запускаем Angular UI (http://localhost:4200)..."
Push-Location "$Root\lms-ui"
Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "npm start" `
    -WindowStyle Normal
Pop-Location

Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  LMS запущена!" -ForegroundColor Magenta
Write-Host "════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  UI:              http://localhost:4200"
Write-Host "  API Gateway:     http://localhost:8080"
Write-Host "  MinIO Console:   http://localhost:9001"
Write-Host "  Zipkin:          http://localhost:9411"
Write-Host "  Grafana:         http://localhost:3000"
Write-Host ""
Write-Host "  Тестовые пользователи (пароль: password):"
Write-Host "    admin1         — ROLE_ADMIN"
Write-Host "    instructor1    — ROLE_INSTRUCTOR"
Write-Host "    instructor2    — ROLE_INSTRUCTOR"
Write-Host "    instructor3    — ROLE_INSTRUCTOR"
Write-Host "    ivan.ivanov    — ROLE_STUDENT"
Write-Host "    anna.smirnova  — ROLE_STUDENT"
Write-Host "    sergey.volkov  — ROLE_STUDENT"
Write-Host "    kate.novikova  — ROLE_STUDENT"
Write-Host ""
Write-Host "  Логи сервисов: $Root\logs\"
Write-Host "════════════════════════════════════════════" -ForegroundColor Magenta