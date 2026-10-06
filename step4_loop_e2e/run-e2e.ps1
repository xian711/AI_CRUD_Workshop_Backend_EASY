<#
.SYNOPSIS
    中心裝備物資 全鏈路 E2E 一鍵跑（後端 EASY 版｜自管生命週期）。
.DESCRIPTION
    這支腳本「自己」把整條鏈路拉起來、跑完、再拆乾淨，不需要你另開視窗手動啟服務：
      0. 【意外修改偵測】開跑前先比對 E2E 測試檔（fullchain.spec.ts、playwright.config.ts）的
         SHA-256 與 tests.sha256 基準，不符就拒絕執行（此時還沒碰資料庫、沒啟任何服務）。
         這是 fail-closed：基準檔不見了、被清空、格式壞掉、少項、多項、重複、
         hash 不是 64 位十六進位——任何一種都判 FAIL，絕不因為「讀不到東西」就放行。
         老實說清楚它擋得住什麼：它擋得住「改了測試卻忘了同步基準」，
         也擋得住多數順手放寬斷言的情況；但它擋不住「有寫入權限、且刻意連基準一起重算」的人，
         因為腳本、測試、基準都在同一份學員可寫的副本裡。
         要真的防蓄意作弊，可信基準與評測器必須放在學員改不到的地方（講師端／CI）。
         講師正當改了測試後，跑 tools\update-e2e-hash.ps1（或 .sh）重算基準。
      1. 用 psql 冪等重建 e2e 專用資料庫 ai_crud_equipment_e2e（庫名尾碼 _e2e 才准 DROP，防呆）。
      2. 背景啟動後端 .NET API（:5080），連線字串以環境變數指向 _e2e 庫；
         輪詢 GET /api/equipment/items 到 200 且 24 筆（migrate＋seed 完成）。
      3. 背景啟動前端 fullchain-app（:3199，NUXT_PUBLIC_USE_API=true 走真後端）；
         輪詢 /equipment/crud 到 200 且含 App marker（確認是本 App 不是別的程式佔埠）。
      4. e2e 相依（node_modules＋playwright）就緒才跳過 npm install；chromium 冪等安裝。
      5. 跑 Playwright 6 條全鏈路測試，解析摘要，「恰好 6 條、無 failed/skipped/flaky」才綠。
         測試報告在 e2e/playwright-report/index.html（每跑一次自動重寫，用瀏覽器開）。
      6. 無論成敗，teardown 只停「自己啟的」後端與前端（記 PID，taskkill /T 殺整棵樹），
         釋放 5080/3199；e2e 庫留著（下輪會重建）。dev 庫 ai_crud_equipment 全程不碰。

    在 step4_loop_e2e 目錄執行（預設綁「學生工作區 my-equipment-api」）：
      powershell -ExecutionPolicy Bypass -File .\run-e2e.ps1
    明確指定被測 API 專案：
      powershell -ExecutionPolicy Bypass -File .\run-e2e.ps1 -ApiDir D:\path\to\my-equipment-api
    走官方參考解 fallback（只證驗收與 LOOP，不證學生生成完整度）：
      powershell -ExecutionPolicy Bypass -File .\run-e2e.ps1 -UseCheckpoint
    沿用已經啟動的服務（LOOP 用；不另開一套，避免撞埠、鎖 bin、兩個前端搶 .nuxt）：
      powershell -ExecutionPolicy Bypass -File .\run-e2e.ps1 -ReuseRunning
      （或先設 $env:E2E_REUSE = '1'，效果一樣）

    網址與埠：預設 API http://localhost:5080、前端 http://localhost:3199。
    要換就設環境變數 API_URL、BASE_URL（不要改這支腳本）。自己啟動和沿用都看這兩個值；
    跑 Playwright 時也把 BASE_URL 交給 playwright.config.ts。

    -ReuseRunning 怎麼判斷（API 與前端各自判斷）：
      - API_URL 的 GET /api/equipment/items 有回 200：沿用，不重建資料庫、不自己啟動、跑完也不關。
        沿用前還要過兩關，不過就 FAIL、不跑測試：
          a. 占用 API 埠的程式要在被測 API 資料夾（-ApiDir／預設 my-equipment-api）底下——綠燈要屬於被測的那一份。
          b. 資料剛好 24 筆——E1 要「恰好 24 筆」。不是 24 筆就請先停掉那個 API，讓本腳本自己重建 _e2e 庫、自己啟動。
        注意：沿用的 API 連哪個庫，E2E 的新增、刪除就寫進哪個庫。
      - BASE_URL 的 /equipment/crud 有回 200 且是本 App：沿用，不自己啟動、跑完也不關。
      - 沒回應的那一個：照原本流程自己啟動，跑完只關自己啟動的。
      - 不管沿用哪一個，跑測試前都確認「前端轉發到的 API」回得出剛建好的 24 筆。

    Exit code：0 = 恰好 6 條全綠；1 = 測試檔與基準不符／任一 FAIL／服務拉不起來／找不到測試／非預期錯誤。
.PARAMETER ApiDir
    被測後端 API 專案根目錄（含 src\<專案名>\*.csproj）。省略時預設綁學生工作區
    ..\step3_new_module\my-equipment-api。
.PARAMETER UseCheckpoint
    未指定 -ApiDir 時，改綁官方參考解 ..\step3_new_module\solution-api 當 fallback，
    並在輸出明確標記「此結果只證驗收與 LOOP，不證學生生成完整度」。
.PARAMETER ReuseRunning
    API_URL／BASE_URL 上已經有服務在跑，就直接用，不自己啟動、跑完也不關。
    環境變數 E2E_REUSE=1 的效果一樣。判斷規則見上方 DESCRIPTION。
.NOTES
    PowerShell 5.1 相容（無 && / 無三元）；原生指令一律過 Invoke-Native 避免 stderr 被誤判為終止錯誤。
#>
param(
    [string] $ApiDir,
    [switch] $UseCheckpoint,
    [switch] $ReuseRunning
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ── 0. 意外修改偵測（開跑前第一關；fail-closed）──────────────────
# 放在最前面、放在 try 之外：此時還沒重建資料庫、沒啟任何服務，失敗直接 exit 1，
# 不會跑到 teardown，也不會動到上一輪留下的 .run-pids。
$HashManifest = Join-Path $PSScriptRoot 'tests.sha256'
# 基準檔必須「恰好」涵蓋這幾個檔：少一個、多一個、重複，都判 FAIL
$ProtectedFiles = @('e2e/tests/fullchain.spec.ts', 'e2e/playwright.config.ts')
# 重算基準的講師工具（訊息一律印絕對路徑，免得學員從不同目錄執行時對不上）
$UpdateHashPs1 = Join-Path $PSScriptRoot 'tools\update-e2e-hash.ps1'

# 內容雜湊：先去掉 CR，讓 CRLF / LF 的差異不影響結果（跨平台同一個值）
function Get-NormalizedSha256 {
    param([string] $Path)
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    $filtered = New-Object 'System.Collections.Generic.List[byte]'
    foreach ($b in $bytes) { if ($b -ne 13) { [void]$filtered.Add($b) } }
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try { $hash = $sha.ComputeHash($filtered.ToArray()) } finally { $sha.Dispose() }
    return (($hash | ForEach-Object { $_.ToString('x2') }) -join '')
}

Write-Host '檢查 E2E 測試檔與基準是否相符...' -ForegroundColor Cyan
$problems = @()
try {
    if (-not (Test-Path -LiteralPath $HashManifest)) {
        $problems += "找不到基準檔：$HashManifest"
    } else {
        $seen = @{}
        $lineNo = 0
        # 明確指定 UTF-8：PS 5.1 預設用系統編碼讀無 BOM 的檔，中文註解行會吞掉換行、行號對不上
        foreach ($line in (Get-Content -LiteralPath $HashManifest -Encoding UTF8)) {
            $lineNo++
            $trimmed = $line.Trim()
            if ($trimmed -eq '' -or $trimmed.StartsWith('#')) { continue }
            # 格式必須是「64 位十六進位 + 空白 + 路徑」，不合就 FAIL（不再默默跳過）
            # 收尾錨點 ＋ 路徑不得含空白＝「恰好兩欄」。
            # 少了這個，「<正確 hash>  e2e/tests/fullchain.spec.ts EXTRA」這種行會被當成合法格式。
            if ($trimmed -notmatch '^([0-9a-fA-F]{64})\s+(\S+)$') {
                $problems += "基準檔第 $lineNo 行格式不合（應恰為「64 位 hex ＋ 空白 ＋ 路徑」兩欄）：$trimmed"
                continue
            }
            $expectedHash = $Matches[1].ToLower()
            $rel = $Matches[2].Trim() -replace '\\', '/'
            if ($seen.ContainsKey($rel)) { $problems += "基準檔第 $lineNo 行：$rel 重複列出"; continue }
            $seen[$rel] = $expectedHash
            if ($ProtectedFiles -notcontains $rel) {
                $problems += "基準檔第 $lineNo 行：$rel 不在受保護清單內（多出來的項目）"
            }
        }
        # 少一項也不行——基準檔被清空或只留註解，會在這裡被抓到
        foreach ($rel in $ProtectedFiles) {
            if (-not $seen.ContainsKey($rel)) { $problems += "基準檔缺少必要項目：$rel" }
        }
        # 逐檔比對
        foreach ($rel in $ProtectedFiles) {
            if (-not $seen.ContainsKey($rel)) { continue }
            $full = Join-Path $PSScriptRoot ($rel -replace '/', '\')
            if (-not (Test-Path -LiteralPath $full)) { $problems += "$rel（檔案不見了）"; continue }
            if ((Get-NormalizedSha256 -Path $full) -ne $seen[$rel]) { $problems += "$rel（內容與基準不符）" }
        }
    }
} catch {
    # 檢查過程本身出錯（例如檔案被鎖、讀不到）也一律判 FAIL，不放行
    $problems += ("完整性檢查執行失敗：{0}" -f $_.Exception.Message)
}

if ($problems.Count -gt 0) {
    Write-Host 'FAIL：E2E 測試檔的完整性檢查沒過，拒絕執行。' -ForegroundColor Red
    foreach ($t in $problems) { Write-Host "  - $t" -ForegroundColor Red }
    Write-Host ''
    Write-Host '這一關在做的是「意外修改偵測」：確認你手上的測試，跟講師發出來的那一份是同一份。' -ForegroundColor Yellow
    Write-Host '要改被測的後端 API 請隨意；測試不要動。若你認為測試本身真的有問題，停下來回報，由人裁決。' -ForegroundColor Yellow
    Write-Host '（講師確定要改測試的話，改完跑這一支重算基準：）' -ForegroundColor Yellow
    Write-Host "  powershell -ExecutionPolicy Bypass -File `"$UpdateHashPs1`"" -ForegroundColor Yellow
    exit 1
}
Write-Host 'PASS：測試檔與基準相符。' -ForegroundColor Green

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

# 網址與埠：預設 5080／3199；用環境變數 API_URL、BASE_URL 換（不用改腳本）。只接受本機 http 網址。
function Resolve-LocalUrl {
    param([string] $Value, [string] $Default, [string] $Name)
    $raw = $Value
    if ([string]::IsNullOrWhiteSpace($raw)) { $raw = $Default }
    $uri = $null
    try { $uri = [System.Uri]($raw.Trim()) } catch { $uri = $null }
    $okHost = $false
    if ($uri -and $uri.IsAbsoluteUri) { $okHost = @('localhost', '127.0.0.1') -contains $uri.Host.ToLower() }
    if (-not $uri -or -not $uri.IsAbsoluteUri -or $uri.Scheme -ne 'http' -or -not $okHost) {
        Write-Host "FAIL：環境變數 $Name 的值不對：$Value" -ForegroundColor Red
        Write-Host "      要寫成本機網址，例如 $Default" -ForegroundColor Yellow
        exit 1
    }
    return $uri
}
$ApiUri       = Resolve-LocalUrl $env:API_URL  'http://localhost:5080' 'API_URL'
$BaseUri      = Resolve-LocalUrl $env:BASE_URL 'http://localhost:3199' 'BASE_URL'
$ApiUrl       = $ApiUri.GetLeftPart([System.UriPartial]::Authority)    # 例：http://localhost:5080
$BaseUrl      = $BaseUri.GetLeftPart([System.UriPartial]::Authority)   # 例：http://localhost:3199
$BackendPort  = $ApiUri.Port
$FrontendPort = $BaseUri.Port
$Reuse        = $ReuseRunning -or ($env:E2E_REUSE -eq '1')
$Expected     = 6                         # baseline：恰好 6 條全綠才算過
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

# ── 沿用已啟動服務用的小工具 ──────────────────────────────────────
# API 有沒有在跑：GET /api/equipment/items 回 200 且有 data 陣列。回傳筆數；沒回應回 -1。
function Get-ApiCount {
    param([string] $Origin)
    try {
        $r = Invoke-RestMethod -Uri "$Origin/api/equipment/items" -TimeoutSec 15
        if ($null -ne $r -and $null -ne $r.data) { return @($r.data).Count }
    } catch {}
    return -1
}

# 前端有沒有在跑：/equipment/crud 回 200 且含本 App 的 marker。
function Test-FrontendUp {
    param([string] $Origin)
    try {
        $resp = Invoke-WebRequest -Uri "$Origin/equipment/crud" -UseBasicParsing -TimeoutSec 5
        return ($resp.StatusCode -eq 200 -and ([string]$resp.Content).Contains($AppMarker))
    } catch {}
    return $false
}

# 占用某埠的程式：回傳 PID、exe 路徑、命令列（找不到 PID 回 $null）
function Get-PortOwnerInfo {
    param([int] $Port)
    $ownerPid = Get-PortOwnerPid $Port
    if ($ownerPid -eq 0) { return $null }
    $cim = Get-CimInstance Win32_Process -Filter "ProcessId=$ownerPid" -ErrorAction SilentlyContinue
    $exe = ''; $cmd = ''
    if ($cim) { $exe = [string]$cim.ExecutablePath; $cmd = [string]$cim.CommandLine }
    return [pscustomobject]@{ Pid = $ownerPid; Exe = $exe; Cmd = $cmd }
}

# 埠要空著才能自己啟動。上一輪殘留剛被清掉時，給它幾秒放掉埠。
function Assert-PortFree {
    param([int] $Port, [string] $What, [string] $EnvName)
    $free = Wait-Until -Name "port $Port" -TimeoutSec 10 -IntervalSec 1 -Test { (Get-PortOwnerPid $Port) -eq 0 }
    if ($free) { return }
    $o = Get-PortOwnerInfo $Port
    $who = '查不到是哪個程式'
    if ($o) { $who = "PID $($o.Pid)（$($o.Exe)）" }
    $hint = "加 -ReuseRunning 可以沿用已啟動的服務；不是你啟動的程式就不要關它，改設環境變數 $EnvName 換一個空的埠。"
    if ($Reuse) { $hint = "它沒有正常回應，不能沿用。不是你啟動的程式就不要關它，改設環境變數 $EnvName 換一個空的埠。" }
    throw "埠 $Port（$What）已經有程式在用：$who。無法自己啟動。$hint"
}

$backendProc  = $null
$frontendProc = $null
$reuseApi     = $false
$reuseFe      = $false
$apiOwner     = $null
$feOwner      = $null
# 會暫時改動的環境變數：先記下原值，teardown 時還原（不污染呼叫端 shell）
$prevBaseUrlEnv = $env:BASE_URL
$prevApiBaseEnv = $env:NUXT_PUBLIC_API_BASE

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
    Write-Host "  API 網址            ：$ApiUrl" -ForegroundColor Gray
    Write-Host "  前端網址            ：$BaseUrl" -ForegroundColor Gray
    if ($Reuse) { Write-Host '  模式                ：-ReuseRunning（已經在跑的服務就沿用）' -ForegroundColor Gray }

    # 防呆：只允許重建尾碼 _e2e 的庫，絕不誤動 dev 庫 ai_crud_equipment
    if (-not $E2eDb.EndsWith('_e2e')) { throw "拒絕操作非 _e2e 結尾的資料庫：$E2eDb" }

    if (-not (Test-Path -LiteralPath $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
    Clear-StaleProcesses

    # ── 沿用已啟動的服務（只在 -ReuseRunning／E2E_REUSE=1 時）──────────
    # API 與前端各自判斷：有回應就沿用（不啟動、跑完不關），沒回應就照原本流程自己啟動。
    if ($Reuse) {
        Write-Host "`n[沿用] 看 $ApiUrl 和 $BaseUrl 有沒有服務在跑…" -ForegroundColor Cyan
        $apiCount = Get-ApiCount $ApiUrl
        if ($apiCount -ge 0) {
            $apiOwner = Get-PortOwnerInfo $BackendPort
            # 第一關：綠燈要屬於被測的那一份——占用 API 埠的程式要在被測 API 資料夾底下
            $inApiDir = $false
            if ($apiOwner) {
                $dirPrefix = $ApiDir.TrimEnd('\') + '\'
                foreach ($s in @($apiOwner.Exe, $apiOwner.Cmd)) {
                    if ($s -and $s.IndexOf($dirPrefix, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) { $inApiDir = $true }
                }
            }
            if (-not $inApiDir) {
                $who = '查不到是哪個程式占用 API 埠'
                if ($apiOwner) { $who = "PID $($apiOwner.Pid)：$($apiOwner.Exe)" }
                throw "$ApiUrl 上的 API 不是被測 API 資料夾裡的程式（$who）。綠燈要屬於被測的那一份：$ApiDir。請停掉它，或用 -ApiDir 指定它的資料夾。"
            }
            # 第二關：E1 要「恰好 24 筆」，所以資料要是剛建好的
            if ($apiCount -ne $SeedCount) {
                throw "$ApiUrl 上的 API 現在有 $apiCount 筆，不是剛建好的 $SeedCount 筆。E1 要「恰好 $SeedCount 筆」，所以不能沿用。請停掉這個 API（PID $($apiOwner.Pid)）再跑：run-e2e 會自己重建 $E2eDb、自己啟動一個乾淨的 API。"
            }
            $reuseApi = $true
            Write-Host "      沿用 API：PID $($apiOwner.Pid)，$SeedCount 筆。不重建資料庫、不啟動、跑完不關。" -ForegroundColor Green
            Write-Host "      程式：$($apiOwner.Exe)" -ForegroundColor DarkGray
            Write-Host '      注意：E2E 會在這個 API 連的資料庫新增、刪除資料。' -ForegroundColor Yellow
        } else {
            Write-Host "      $ApiUrl 沒有 API 在跑：照原本流程自己啟動。" -ForegroundColor DarkGray
        }
        if (Test-FrontendUp $BaseUrl) {
            # 沿用的前端要是 API 模式：頁面設定裡 useApi:false＝mock 模式，測試會打不到後端
            $feHtml = ''
            try { $feHtml = [string](Invoke-WebRequest -Uri "$BaseUrl/equipment/crud" -UseBasicParsing -TimeoutSec 5).Content } catch {}
            if ($feHtml -match 'useApi:\s*false') {
                throw "$BaseUrl 上的前端是 mock 模式（useApi:false），不能沿用。前端要用 NUXT_PUBLIC_USE_API=true 啟動。"
            }
            $reuseFe = $true
            $feOwner = Get-PortOwnerInfo $FrontendPort
            $fePidText = '?'
            if ($feOwner) { $fePidText = $feOwner.Pid }
            Write-Host "      沿用前端：PID $fePidText（$BaseUrl 是本 App）。不啟動、跑完不關。" -ForegroundColor Green
        } else {
            Write-Host "      $BaseUrl 沒有本 App 在跑：照原本流程自己啟動。" -ForegroundColor DarkGray
        }
    }

    # 要自己啟動的服務，埠要先空著。兩個一起先查，免得起了 API 才發現前端的埠被占。
    if (-not $reuseApi) { Assert-PortFree $BackendPort 'API' 'API_URL' }
    if (-not $reuseFe)  { Assert-PortFree $FrontendPort '前端' 'BASE_URL' }

    # ── 1. 重建 e2e 資料庫 ─────────────────────────────────────────
    if ($reuseApi) {
        Write-Host "`n[1/5] 略過重建資料庫：沿用已啟動的 API，它連哪個庫就用哪個庫。" -ForegroundColor Cyan
    } else {
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
    }

    # ── 2. 啟動後端（指向 e2e 庫）並等待 migrate＋seed 完成 ──────────
    if ($reuseApi) {
        Write-Host "`n[2/5] 略過啟動後端：沿用 $ApiUrl。" -ForegroundColor Cyan
    } else {
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

        $beUrl = "$ApiUrl/api/equipment/items"
        $beReady = Wait-Until -Name 'backend' -TimeoutSec 180 -Test {
            if ($backendProc.HasExited) { throw "後端進程已退出（exit $($backendProc.ExitCode)），詳見 $beErr" }
            $r = Invoke-RestMethod -Uri $beUrl -TimeoutSec 5
            return ($null -ne $r.data -and $r.data.Count -ge $SeedCount)
        }
        if (-not $beReady) { throw "後端在 180 秒內未就緒（$beUrl 未回 $SeedCount 筆）。log：$beErr" }
        Write-Host "      OK：後端就緒，GET /api/equipment/items 回 $SeedCount 筆（migrate＋seed 完成）。" -ForegroundColor Green
    }

    # ── 3. 啟動前端 fullchain-app（API 模式）並等待就緒 ──────────────
    if ($reuseFe) {
        Write-Host "`n[3/5] 略過啟動前端：沿用 $BaseUrl。" -ForegroundColor Cyan
    } else {
        Write-Host "`n[3/5] 啟動前端 fullchain-app（:$FrontendPort，API 模式，轉發到 $ApiUrl）…" -ForegroundColor Cyan
        $env:NUXT_PUBLIC_USE_API  = 'true'
        $env:NUXT_PUBLIC_API_BASE = $ApiUrl      # devProxy 把 /api/equipment 轉到這裡（預設 http://localhost:5080）
        $feOut = Join-Path $LogDir 'frontend.out.log'
        $feErr = Join-Path $LogDir 'frontend.err.log'
        $frontendProc = Start-Process -FilePath 'pnpm' `
            -ArgumentList @('dev', '--port', "$FrontendPort") `
            -WorkingDirectory $FeDir -PassThru -WindowStyle Hidden `
            -RedirectStandardOutput $feOut -RedirectStandardError $feErr
        Save-StartedPid $frontendProc $FrontendPort
        Write-Host "      前端 PID=$($frontendProc.Id)，等待 dev server 就緒（首次含 nuxt build）…" -ForegroundColor DarkGray

        $feUrl = "$BaseUrl/equipment/crud"
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
    }

    # 前端轉發到的 API 要回得出剛建好的 24 筆。
    # 沿用前端時特別重要：它啟動時的 NUXT_PUBLIC_API_BASE 要等於 API_URL，測試才會打到同一個 API。
    $viaFe = Get-ApiCount $BaseUrl
    if ($viaFe -ne $SeedCount) {
        $got = "$viaFe 筆"
        if ($viaFe -lt 0) { $got = '沒有回應' }
        throw "前端 $BaseUrl 轉發 /api/equipment/items 的結果是 $got，不是剛建好的 $SeedCount 筆。前端啟動時的 NUXT_PUBLIC_API_BASE 要等於 API_URL（$ApiUrl）。"
    }
    Write-Host "      OK：前端轉發到的 API 回 $SeedCount 筆。" -ForegroundColor Green

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
    Write-Host "`n[5/5] 跑 Playwright（chromium，全鏈路 $Expected 條，前端 $BaseUrl）…" -ForegroundColor Cyan
    $env:BASE_URL = $BaseUrl                      # playwright.config.ts 的 baseURL 讀這個
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
    # teardown：只停自己啟的後端與前端（殺整棵樹釋放埠）；沿用的服務不關；e2e 庫留著，dev 庫全程未碰
    Write-Host "`n[teardown] 停止本次自己啟動的服務…" -ForegroundColor Cyan
    if ($frontendProc) { Stop-Tree $frontendProc.Id; Write-Host "      已停：前端 PID $($frontendProc.Id)（釋放 $FrontendPort）" -ForegroundColor DarkGray }
    if ($backendProc)  { Stop-Tree $backendProc.Id;  Write-Host "      已停：後端 PID $($backendProc.Id)（釋放 $BackendPort）" -ForegroundColor DarkGray }
    if ($reuseApi -and $apiOwner) { Write-Host "      沒關（沿用的）：API PID $($apiOwner.Pid)，$ApiUrl" -ForegroundColor Green }
    if ($reuseFe) {
        $fePidText = '?'
        if ($feOwner) { $fePidText = $feOwner.Pid }
        Write-Host "      沒關（沿用的）：前端 PID $fePidText，$BaseUrl" -ForegroundColor Green
    }
    Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
    # 清掉只在本行程用到的環境變數，避免污染呼叫端 shell
    Remove-Item Env:\ConnectionStrings__Default -ErrorAction SilentlyContinue
    Remove-Item Env:\NUXT_PUBLIC_USE_API -ErrorAction SilentlyContinue
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    if ($null -eq $prevBaseUrlEnv) { Remove-Item Env:\BASE_URL -ErrorAction SilentlyContinue } else { $env:BASE_URL = $prevBaseUrlEnv }
    if ($null -eq $prevApiBaseEnv) { Remove-Item Env:\NUXT_PUBLIC_API_BASE -ErrorAction SilentlyContinue } else { $env:NUXT_PUBLIC_API_BASE = $prevApiBaseEnv }
    Write-Host '[teardown] 完成。' -ForegroundColor DarkGray

    # 報告最後再印一次「這次到底綁了誰」，避免誤把官方解的綠當成學生作品的綠
    Write-Host ''
    Write-Host "本次被測 API：$ApiDir" -ForegroundColor Cyan
    if ($reuseApi -and $apiOwner) {
        Write-Host "  （沿用 $ApiUrl 上已啟動的 API：$($apiOwner.Exe)）" -ForegroundColor Cyan
        Write-Host '本次被測 DB ：沿用的 API 連的那個庫（run-e2e 沒有重建）' -ForegroundColor Cyan
    } else {
        Write-Host "本次被測 DB ：$E2eDb" -ForegroundColor Cyan
    }
    if ($UsingCheckpoint) {
        Write-Host '模式：官方參考解（checkpoint fallback）——只證驗收與 LOOP，不證學生生成完整度。' -ForegroundColor Yellow
    } else {
        Write-Host '模式：學生工作區（my-equipment-api / 指定的 -ApiDir）。' -ForegroundColor Green
    }
}

exit $script:ExitCode
