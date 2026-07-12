<#
.SYNOPSIS
    中心裝備物資 全鏈路 E2E 一鍵跑（後端 EASY 版｜自管生命週期）。
.DESCRIPTION
    這支腳本「自己」把整條鏈路拉起來、跑完、再拆乾淨，不需要你另開視窗手動啟服務：
      1. 用 psql 冪等重建 e2e 專用資料庫 ai_crud_equipment_e2e（庫名尾碼 _e2e 才准 DROP，防呆）。
      2. 背景啟動後端 .NET API（:5080），連線字串以環境變數指向 _e2e 庫；
         輪詢 GET /api/equipment/items 到 200 且 24 筆（migrate＋seed 完成）。
      3. 背景啟動前端 fullchain-app（:3199，NUXT_PUBLIC_USE_API=true 走真後端）；
         輪詢 /equipment/crud 到 200 且含 App marker（確認是本 App 不是別的程式佔埠）。
      4. e2e 相依（node_modules＋playwright）就緒才跳過 npm install；chromium 冪等安裝。
      5. 跑 Playwright 6 條全鏈路測試，解析摘要，「恰好 6 條、無 failed/skipped/flaky」才綠。
      6. 無論成敗，teardown 只停「自己啟的」後端與前端（記 PID，taskkill /T 殺整棵樹），
         釋放 5080/3199；e2e 庫留著（下輪會重建）。dev 庫 ai_crud_equipment 全程不碰。

    在 step4_loop_e2e 目錄執行（預設綁「學生工作區 my-equipment-api」）：
      powershell -ExecutionPolicy Bypass -File .\run-e2e.ps1
    明確指定被測 API 專案：
      powershell -ExecutionPolicy Bypass -File .\run-e2e.ps1 -ApiDir D:\path\to\my-equipment-api
    走官方參考解 fallback（只證驗收與 LOOP，不證學生生成完整度）：
      powershell -ExecutionPolicy Bypass -File .\run-e2e.ps1 -UseCheckpoint

    Exit code：0 = 恰好 6 條全綠；1 = 任一 FAIL／服務拉不起來／找不到測試／非預期錯誤。
.PARAMETER ApiDir
    被測後端 API 專案根目錄（含 src\<專案名>\*.csproj）。省略時預設綁學生工作區
    ..\step3_new_module\my-equipment-api。
.PARAMETER UseCheckpoint
    未指定 -ApiDir 時，改綁官方參考解 ..\step3_new_module\solution-api 當 fallback，
    並在輸出明確標記「此結果只證驗收與 LOOP，不證學生生成完整度」。
.NOTES
    PowerShell 5.1 相容（無 && / 無三元）；原生指令一律過 Invoke-Native 避免 stderr 被誤判為終止錯誤。
#>
param(
    [string] $ApiDir,
    [switch] $UseCheckpoint
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ── 設定 ─────────────────────────────────────────────────────────
$Root      = $PSScriptRoot
$E2eDir    = Join-Path $Root 'e2e'
$FeDir     = Join-Path $Root 'fullchain-app'

# 被測 API 解析：預設綁「學生工作區 my-equipment-api」；官方參考解只在 -UseCheckpoint 時當 fallback。
$StudentApiDir    = [System.IO.Path]::GetFullPath((Join-Path $Root '..\step3_new_module\my-equipment-api'))
$CheckpointApiDir = [System.IO.Path]::GetFullPath((Join-Path $Root '..\step3_new_module\solution-api'))
$UsingCheckpoint  = $false
if ($ApiDir) {
    $ApiDir = [System.IO.Path]::GetFullPath($ApiDir)
} elseif ($UseCheckpoint) {
    $ApiDir = $CheckpointApiDir
    $UsingCheckpoint = $true
} else {
    $ApiDir = $StudentApiDir
}

if (-not (Test-Path -LiteralPath $ApiDir)) {
    if ($UsingCheckpoint) {
        Write-Host "FAIL：官方參考解（checkpoint fallback）不存在：$ApiDir" -ForegroundColor Red
    } else {
        Write-Host "FAIL：找不到被測 API 專案：$ApiDir" -ForegroundColor Red
        Write-Host '      預設綁的是學生工作區 my-equipment-api。請先完成 Step 3 產出它，' -ForegroundColor Yellow
        Write-Host '      或改用官方參考解 fallback：' -ForegroundColor Yellow
        Write-Host '        powershell -ExecutionPolicy Bypass -File .\run-e2e.ps1 -UseCheckpoint' -ForegroundColor Yellow
        Write-Host '      （-UseCheckpoint 的結果只證驗收與 LOOP，不證學生生成完整度）' -ForegroundColor DarkGray
        Write-Host '      也可用 -ApiDir 明確指定其他被測 API 專案路徑。' -ForegroundColor DarkGray
    }
    exit 1
}

# 被測 API 的 src 專案（相對 $ApiDir 解析，不寫死 solution-api；容納學生自訂結構）
$ApiProj = Join-Path $ApiDir 'src\CrudTemplate.Api'
if (-not (Test-Path -LiteralPath $ApiProj)) {
    $srcRoot = Join-Path $ApiDir 'src'
    $foundCsproj = $null
    if (Test-Path -LiteralPath $srcRoot) {
        $foundCsproj = Get-ChildItem -LiteralPath $srcRoot -Recurse -Filter *.csproj -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -notmatch '\\(obj|bin)\\' } | Select-Object -First 1
    }
    if ($foundCsproj) {
        $ApiProj = $foundCsproj.Directory.FullName
    } else {
        Write-Host "FAIL：在被測 API 底下找不到可執行的 src 專案（$srcRoot）。" -ForegroundColor Red
        Write-Host '      請確認學生 API 專案結構含 src\<專案名>\*.csproj。' -ForegroundColor Yellow
        exit 1
    }
}

$LogDir    = Join-Path $Root '.run-logs'
$PidFile   = Join-Path $Root '.run-pids'

$BackendPort  = 5080
$FrontendPort = 3199
$Expected     = 6                          # baseline：恰好 6 條全綠才算過
$SeedCount    = 24                         # 種子筆數（migrate＋seed 完成的判準）
$AppMarker    = 'disaster-color-mode'      # fullchain-app 的 colorMode.storageKey 前綴，用來確認 3199 是本 App

$E2eDb   = 'ai_crud_equipment_e2e'         # e2e 專用庫（每輪重建）；尾碼 _e2e 才准 DROP
$PgHost  = 'localhost'
$PgPort  = 5432
$PgUser  = 'postgres'
$PgPass  = '12345'
$ConnE2e = "Host=$PgHost;Port=$PgPort;Database=$E2eDb;Username=$PgUser;Password=$PgPass"

# ── 原生指令包裝：本地 EAP=Continue，避免 PS5.1 把 stderr 文字誤判為終止錯誤 ──
function Invoke-Native {
    param([scriptblock] $Command, [ref] $ExitCode)
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $out = & $Command | ForEach-Object { $_.ToString() }
        $ExitCode.Value = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $prev
    }
    if ($out) { $out | ForEach-Object { Write-Host $_ } }
    return $out
}

# ── 找 psql（不在 PATH；掃常見安裝路徑）──
function Resolve-Psql {
    $cmd = Get-Command psql.exe -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    # 用 @() 強制成陣列，避免單一命中時退化為字串、[0] 取到第一個字元（'C'）
    $candidates = @(Get-ChildItem -Path 'C:\Program Files\PostgreSQL' -Directory -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending |
        ForEach-Object { Join-Path $_.FullName 'bin\psql.exe' } |
        Where-Object { Test-Path -LiteralPath $_ })
    if ($candidates.Count -gt 0) { return $candidates[0] }
    return $null
}

# ── 殺一棵進程樹（含子進程，釋放它佔的埠）──
function Stop-Tree {
    param([int] $ProcId)
    if (-not $ProcId) { return }
    $ec = 0
    Invoke-Native -Command { & taskkill /PID $ProcId /T /F 2>&1 } -ExitCode ([ref]$ec) | Out-Null
}

# ── 記 / 清 我們啟的服務（記 PID＋exe path＋command line＋start time；跨輪自我修復時防 Windows PID 重用誤殺）──
# 記錄格式：每行 tab 分隔 → PID <TAB> Port <TAB> StartTimeTicks <TAB> ExePath <TAB> CommandLine
function Save-StartedPid {
    param([System.Diagnostics.Process] $Proc, [int] $Port)
    if (-not $Proc) { return }
    $exe = ''; $cmd = ''; $ticks = 0
    $cim = Get-CimInstance Win32_Process -Filter "ProcessId=$($Proc.Id)" -ErrorAction SilentlyContinue
    if ($cim) {
        $exe = [string]$cim.ExecutablePath
        $cmd = [string]$cim.CommandLine
        if ($cim.CreationDate) { $ticks = ([datetime]$cim.CreationDate).Ticks }
    }
    if (-not $exe)    { try { $exe = [string]$Proc.Path } catch {} }
    if ($ticks -eq 0) { try { $ticks = $Proc.StartTime.Ticks } catch {} }
    $cmd = ($cmd -replace "[`r`n`t]", ' ')
    $rec = @($Proc.Id, $Port, $ticks, $exe, $cmd) -join "`t"
    Add-Content -LiteralPath $PidFile -Value $rec -Encoding UTF8
}

# 目標 PID 的整棵子孫 PID 集合（用來判斷埠是否仍由這棵樹佔用）
function Get-ProcessTreePids {
    param([int] $RootPid)
    $set = New-Object 'System.Collections.Generic.HashSet[int]'
    [void]$set.Add($RootPid)
    $all = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Select-Object ProcessId, ParentProcessId
    $grew = $true
    while ($grew) {
        $grew = $false
        foreach ($p in $all) {
            $parentPid = [int]$p.ParentProcessId
            $childPid  = [int]$p.ProcessId
            if ($set.Contains($parentPid) -and -not $set.Contains($childPid)) { [void]$set.Add($childPid); $grew = $true }
        }
    }
    return $set
}

# 某埠目前的 Listen 佔用者 PID（找不到回 0）
function Get-PortOwnerPid {
    param([int] $Port)
    try {
        $c = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($c) { return [int]$c.OwningProcess }
    } catch {}
    return 0
}

# 清殘留：逐筆核對 exe path 與 start time 吻合、且仍佔用 5080/3199 才 kill；不吻合只 WARN 並刪過期記錄。
function Clear-StaleProcesses {
    if (-not (Test-Path -LiteralPath $PidFile)) { return }
    Write-Host '偵測到上一輪殘留的 PID 記錄，逐筆核對身分後才清除（防 Windows PID 重用誤殺）…' -ForegroundColor DarkYellow
    $lines = Get-Content -LiteralPath $PidFile -ErrorAction SilentlyContinue
    foreach ($line in $lines) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        $f = $line -split "`t"
        if ($f.Count -lt 5) {
            Write-Host "  WARN：PID 記錄格式無法辨識（缺 exe／start time 欄位），為安全起見不終止：$line" -ForegroundColor Yellow
            continue
        }
        $recPid = 0; $recTicks = [long]0
        [void][int]::TryParse($f[0].Trim(), [ref]$recPid)
        [void][long]::TryParse($f[2].Trim(), [ref]$recTicks)
        $recExe = $f[3]
        if ($recPid -le 0) { Write-Host "  WARN：PID 記錄無效：$line" -ForegroundColor Yellow; continue }

        $cim = Get-CimInstance Win32_Process -Filter "ProcessId=$recPid" -ErrorAction SilentlyContinue
        if (-not $cim) {
            Write-Host "  略過：PID $recPid 已不存在（可能已結束或 PID 已被回收），刪除過期記錄。" -ForegroundColor DarkGray
            continue
        }
        $curExe   = [string]$cim.ExecutablePath
        $curTicks = [long]0
        if ($cim.CreationDate) { $curTicks = ([datetime]$cim.CreationDate).Ticks }
        if ($curExe -ne $recExe -or $curTicks -ne $recTicks) {
            Write-Host "  WARN：PID $recPid 現在是不同程序（exe／啟動時間不吻合），可能是 PID 被重用——不終止。" -ForegroundColor Yellow
            Write-Host "        記錄 exe：$recExe" -ForegroundColor DarkGray
            Write-Host "        目前 exe：$curExe" -ForegroundColor DarkGray
            continue
        }
        # 身分吻合，再確認它（或其子孫）仍佔用我們的埠，才終止
        $tree = Get-ProcessTreePids $recPid
        $owns = $false
        foreach ($port in @($BackendPort, $FrontendPort)) {
            $owner = Get-PortOwnerPid $port
            if ($owner -ne 0 -and $tree.Contains($owner)) { $owns = $true; break }
        }
        if ($owns) {
            Write-Host "  清除：PID $recPid 身分吻合且仍佔用 $BackendPort/$FrontendPort，終止整棵樹。" -ForegroundColor DarkYellow
            Stop-Tree $recPid
        } else {
            Write-Host "  WARN：PID $recPid 身分吻合但已不佔用 $BackendPort/$FrontendPort，未終止（刪除過期記錄）。" -ForegroundColor Yellow
        }
    }
    Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
}

# ── 輪詢：反覆跑 $Test（回傳 $true 即就緒），逾時回 $false ──
function Wait-Until {
    param([string] $Name, [scriptblock] $Test, [int] $TimeoutSec = 150, [int] $IntervalSec = 3)
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        try { if (& $Test) { return $true } } catch {}
        Start-Sleep -Seconds $IntervalSec
    }
    return $false
}

$backendProc  = $null
$frontendProc = $null

try {
    Write-Host '=== 裝備物資 全鏈路 E2E（後端 EASY 版｜自管生命週期｜6 條）===' -ForegroundColor Cyan

    # 一眼看出綁的是誰：被測 API 的 resolved 絕對路徑 + 被測 DB
    if ($UsingCheckpoint) {
        Write-Host '【使用官方參考解（checkpoint fallback）——此結果只證驗收與 LOOP，不證學生生成完整度】' -ForegroundColor Yellow
    } else {
        Write-Host '【被測 API＝學生工作區（my-equipment-api / 指定的 -ApiDir）】' -ForegroundColor Green
    }
    Write-Host "  被測 API（resolved）：$ApiDir" -ForegroundColor Gray
    Write-Host "  src 專案            ：$ApiProj" -ForegroundColor DarkGray
    Write-Host "  被測 DB             ：$E2eDb" -ForegroundColor Gray

    # 防呆：只允許重建尾碼 _e2e 的庫，絕不誤動 dev 庫 ai_crud_equipment
    if (-not $E2eDb.EndsWith('_e2e')) { throw "拒絕操作非 _e2e 結尾的資料庫：$E2eDb" }

    if (-not (Test-Path -LiteralPath $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
    Clear-StaleProcesses

    # ── 1. 重建 e2e 資料庫 ─────────────────────────────────────────
    Write-Host "`n[1/5] 重建 e2e 資料庫 $E2eDb …" -ForegroundColor Cyan
    $psql = Resolve-Psql
    if (-not $psql) { throw '找不到 psql.exe（PATH 與 C:\Program Files\PostgreSQL\*\bin 都沒有）。' }
    Write-Host "      使用 psql：$psql" -ForegroundColor DarkGray
    $env:PGPASSWORD = $PgPass
    $psqlBase = @('-h', $PgHost, '-p', "$PgPort", '-U', $PgUser, '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-w')

    $sqlTerminate = "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$E2eDb' AND pid <> pg_backend_pid();"
    foreach ($sql in @($sqlTerminate, "DROP DATABASE IF EXISTS $E2eDb;", "CREATE DATABASE $E2eDb;")) {
        $ec = 0
        Invoke-Native -Command { & $psql @psqlBase -c $sql 2>&1 } -ExitCode ([ref]$ec) | Out-Null
        if ($ec -ne 0) { throw "psql 執行失敗（exit $ec）：$sql" }
    }
    Write-Host "      OK：$E2eDb 已重建（乾淨空庫，稍後由後端 migrate＋seed）。" -ForegroundColor Green

    # ── 2. 啟動後端（指向 e2e 庫）並等待 migrate＋seed 完成 ──────────
    Write-Host "`n[2/5] 啟動後端 .NET API（:$BackendPort，連 $E2eDb）…" -ForegroundColor Cyan
    $env:ConnectionStrings__Default = $ConnE2e
    $env:ASPNETCORE_ENVIRONMENT     = 'Development'
    $beOut = Join-Path $LogDir 'backend.out.log'
    $beErr = Join-Path $LogDir 'backend.err.log'
    $backendProc = Start-Process -FilePath 'dotnet' `
        -ArgumentList @('run', '--project', $ApiProj, '--no-launch-profile', '--urls', "http://localhost:$BackendPort") `
        -WorkingDirectory $ApiDir -PassThru -WindowStyle Hidden `
        -RedirectStandardOutput $beOut -RedirectStandardError $beErr
    Save-StartedPid $backendProc $BackendPort
    Write-Host "      後端 PID=$($backendProc.Id)，等待 API 就緒（首次含 build＋migrate＋seed，可能較久）…" -ForegroundColor DarkGray

    $beUrl = "http://localhost:$BackendPort/api/equipment/items"
    $beReady = Wait-Until -Name 'backend' -TimeoutSec 180 -Test {
        if ($backendProc.HasExited) { throw "後端進程已退出（exit $($backendProc.ExitCode)），詳見 $beErr" }
        $r = Invoke-RestMethod -Uri $beUrl -TimeoutSec 5
        return ($null -ne $r.data -and $r.data.Count -ge $SeedCount)
    }
    if (-not $beReady) { throw "後端在 180 秒內未就緒（$beUrl 未回 $SeedCount 筆）。log：$beErr" }
    Write-Host "      OK：後端就緒，GET /api/equipment/items 回 $SeedCount 筆（migrate＋seed 完成）。" -ForegroundColor Green

    # ── 3. 啟動前端 fullchain-app（API 模式）並等待就緒 ──────────────
    Write-Host "`n[3/5] 啟動前端 fullchain-app（:$FrontendPort，API 模式）…" -ForegroundColor Cyan
    $env:NUXT_PUBLIC_USE_API = 'true'
    $feOut = Join-Path $LogDir 'frontend.out.log'
    $feErr = Join-Path $LogDir 'frontend.err.log'
    $frontendProc = Start-Process -FilePath 'pnpm' `
        -ArgumentList @('dev', '--port', "$FrontendPort") `
        -WorkingDirectory $FeDir -PassThru -WindowStyle Hidden `
        -RedirectStandardOutput $feOut -RedirectStandardError $feErr
    Save-StartedPid $frontendProc $FrontendPort
    Write-Host "      前端 PID=$($frontendProc.Id)，等待 dev server 就緒（首次含 nuxt build）…" -ForegroundColor DarkGray

    $feUrl = "http://localhost:$FrontendPort/equipment/crud"
    $feReady = Wait-Until -Name 'frontend' -TimeoutSec 180 -Test {
        if ($frontendProc.HasExited) { throw "前端進程已退出（exit $($frontendProc.ExitCode)），詳見 $feErr" }
        $resp = Invoke-WebRequest -Uri $feUrl -UseBasicParsing -TimeoutSec 5
        if ($resp.StatusCode -ne 200) { return $false }
        if (-not ([string]$resp.Content).Contains($AppMarker)) {
            throw "$FrontendPort 埠有回應但不是本 App（找不到 marker『$AppMarker』，可能被別的程式佔用）。"
        }
        return $true
    }
    if (-not $feReady) { throw "前端在 180 秒內未就緒（$feUrl）。log：$feErr" }
    Write-Host "      OK：前端就緒，$feUrl 回 200 且確認為本 App。" -ForegroundColor Green

    # ── 4. e2e 相依 ────────────────────────────────────────────────
    Write-Host "`n[4/5] 準備 e2e 相依…" -ForegroundColor Cyan
    $depsReady = (Test-Path (Join-Path $E2eDir 'node_modules')) -and `
                 (Test-Path (Join-Path $E2eDir 'node_modules\.bin\playwright.cmd'))
    if (-not $depsReady) {
        Write-Host '      安裝 e2e 相依（npm install）…' -ForegroundColor DarkGray
        Push-Location $E2eDir
        try {
            $ec = 0
            Invoke-Native -Command { & npm install 2>&1 } -ExitCode ([ref]$ec) | Out-Null
            if ($ec -ne 0) { throw "npm install 失敗（$E2eDir）" }
        } finally { Pop-Location }
    } else {
        Write-Host '      node_modules 與 playwright 皆就緒，跳過 npm install。' -ForegroundColor DarkGray
    }
    Push-Location $E2eDir
    try {
        Write-Host '      確保 Playwright chromium 已安裝（冪等）…' -ForegroundColor DarkGray
        $bec = 0
        Invoke-Native -Command { & npx playwright install chromium 2>&1 } -ExitCode ([ref]$bec) | Out-Null
        if ($bec -ne 0) { throw "playwright install chromium 失敗（exit $bec）" }
    } finally { Pop-Location }

    # ── 5. 跑測試 ──────────────────────────────────────────────────
    Write-Host "`n[5/5] 跑 Playwright（chromium，全鏈路 $Expected 條）…" -ForegroundColor Cyan
    Push-Location $E2eDir
    $exit = 0
    try {
        $testOutput = Invoke-Native -Command { & npx playwright test 2>&1 } -ExitCode ([ref]$exit)
    } finally { Pop-Location }

    # 解析 list reporter 摘要（取最後一次匹配，避免測試 log 內含 "n passed" 誤判）
    $joined  = ($testOutput -join "`n")
    $noTests = ($joined -match 'No tests found')
    $passed = $null; $failed = $null; $skipped = 0; $flaky = 0
    $pm = [regex]::Matches($joined, '(\d+)\s+passed'); if ($pm.Count -gt 0) { $passed = [int]$pm[$pm.Count - 1].Groups[1].Value }
    $fm = [regex]::Matches($joined, '(\d+)\s+failed'); if ($fm.Count -gt 0) { $failed = [int]$fm[$fm.Count - 1].Groups[1].Value }
    if ($null -eq $failed -and $null -ne $passed) { $failed = 0 }
    $sm = [regex]::Matches($joined, '(\d+)\s+skipped'); if ($sm.Count -gt 0) { $skipped = [int]$sm[$sm.Count - 1].Groups[1].Value }
    $km = [regex]::Matches($joined, '(\d+)\s+flaky');   if ($km.Count -gt 0) { $flaky   = [int]$km[$km.Count - 1].Groups[1].Value }

    # 判定（不確定一律 FAIL，絕不假綠）：passed 必須「恰好等於」$Expected，且無 failed/skipped/flaky
    Write-Host ''
    $verdictPass = $false
    $reason = ''
    if ($noTests) { $reason = '找不到任何測試。' }
    elseif ($exit -ne 0) { $reason = "測試程序 exit code = $exit。" }
    elseif ($null -eq $passed) { $reason = 'exit 0 但抓不到 Playwright 摘要行（無法確認全綠）。' }
    elseif ($failed -ne 0) { $reason = "有 $failed 條紅。" }
    elseif ($skipped -ne 0) { $reason = "有 $skipped 條被略過（skipped）——未真正驗到，視為不過。" }
    elseif ($flaky -ne 0) { $reason = "有 $flaky 條 flaky（重試才過）——不穩定，視為不過。" }
    elseif ($passed -ne $Expected) { $reason = "綠了 $passed 條（應恰為 $Expected 條）。" }
    else { $verdictPass = $true }

    if ($verdictPass) {
        Write-Host "E2E 全綠：$passed 條 passed / $failed 條 failed / $skipped 條 skipped。" -ForegroundColor Green
        Write-Host "截圖已更新於：$($E2eDir)\screenshots\" -ForegroundColor DarkGray
        $script:ExitCode = 0
    } else {
        Write-Host "E2E FAIL：$reason" -ForegroundColor Red
        Write-Host "（失敗截圖見 $E2eDir\test-results\；服務 log 見 $LogDir）" -ForegroundColor DarkGray
        $script:ExitCode = 1
    }
}
catch {
    Write-Host ("FAIL：{0}" -f $_.Exception.Message) -ForegroundColor Red
    $script:ExitCode = 1
}
finally {
    # teardown：只停自己啟的後端與前端（殺整棵樹釋放埠）；e2e 庫留著，dev 庫全程未碰
    Write-Host "`n[teardown] 停止本次啟動的服務、釋放 $BackendPort / $FrontendPort …" -ForegroundColor Cyan
    if ($frontendProc) { Stop-Tree $frontendProc.Id }
    if ($backendProc)  { Stop-Tree $backendProc.Id }
    Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
    # 清掉只在本行程用到的環境變數，避免污染呼叫端 shell
    Remove-Item Env:\ConnectionStrings__Default -ErrorAction SilentlyContinue
    Remove-Item Env:\NUXT_PUBLIC_USE_API -ErrorAction SilentlyContinue
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    Write-Host '[teardown] 完成。' -ForegroundColor DarkGray

    # 報告最後再印一次「這次到底綁了誰」，避免誤把官方解的綠當成學生作品的綠
    Write-Host ''
    Write-Host "本次被測 API：$ApiDir" -ForegroundColor Cyan
    Write-Host "本次被測 DB ：$E2eDb" -ForegroundColor Cyan
    if ($UsingCheckpoint) {
        Write-Host '模式：官方參考解（checkpoint fallback）——只證驗收與 LOOP，不證學生生成完整度。' -ForegroundColor Yellow
    } else {
        Write-Host '模式：學生工作區（my-equipment-api / 指定的 -ApiDir）。' -ForegroundColor Green
    }
}

exit $script:ExitCode
