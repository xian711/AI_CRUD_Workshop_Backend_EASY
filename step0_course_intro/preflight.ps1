<#
  preflight.ps1
  AI CRUD 工作坊 Backend EASY 版 — 開課前置檢查
  PowerShell 5.1 相容（不使用 && / || 等 PS7+ 語法）
#>

$results = @()

function Add-Result {
    param(
        [string]$Name,
        [bool]$Pass,
        [string]$Detail,
        [string]$FixHint,
        [bool]$Warn = $false
    )
    $script:results += [PSCustomObject]@{
        Name    = $Name
        Pass    = $Pass
        Detail  = $Detail
        FixHint = $FixHint
        Warn    = $Warn
    }
}

Write-Host "===== AI CRUD 工作坊 Backend EASY 版 — 前置檢查 =====" -ForegroundColor Cyan
Write-Host ""

# 1. .NET SDK >= 10（FAIL 級）
try {
    $sdkLines = dotnet --list-sdks 2>$null
    if ($LASTEXITCODE -eq 0 -and $sdkLines) {
        $maxMajor = 0
        foreach ($line in $sdkLines) {
            $m = [regex]::Match($line, '^\s*(\d+)\.')
            if ($m.Success) {
                $major = [int]$m.Groups[1].Value
                if ($major -gt $maxMajor) { $maxMajor = $major }
            }
        }
        if ($maxMajor -ge 10) {
            Add-Result -Name ".NET SDK >= 10" -Pass $true -Detail "偵測到最高主版本 $maxMajor（$([string]::Join('、', @($sdkLines | ForEach-Object { ($_ -split ' ')[0] }))))" -FixHint ""
        } else {
            Add-Result -Name ".NET SDK >= 10" -Pass $false -Detail "最高主版本為 $maxMajor（需 >= 10）" -FixHint "請安裝 .NET SDK 10 以上版本：https://dotnet.microsoft.com/download"
        }
    } else {
        Add-Result -Name ".NET SDK >= 10" -Pass $false -Detail "找不到 dotnet 指令或無已安裝 SDK" -FixHint "請安裝 .NET SDK 10 以上版本：https://dotnet.microsoft.com/download"
    }
} catch {
    Add-Result -Name ".NET SDK >= 10" -Pass $false -Detail "檢查失敗：$($_.Exception.Message)" -FixHint "請安裝 .NET SDK 10 以上版本：https://dotnet.microsoft.com/download"
}

# 2. PostgreSQL 5432 可連（TCP）（FAIL 級）
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $async = $tcp.BeginConnect('localhost', 5432, $null, $null)
    $ok = $async.AsyncWaitHandle.WaitOne(3000, $false)
    if ($ok -and $tcp.Connected) {
        $tcp.EndConnect($async)
        Add-Result -Name "PostgreSQL 5432 可連" -Pass $true -Detail "localhost:5432 TCP 連線成功" -FixHint ""
    } else {
        Add-Result -Name "PostgreSQL 5432 可連" -Pass $false -Detail "無法在 3 秒內連上 localhost:5432" -FixHint "請確認 PostgreSQL 服務已啟動（服務管理員找 postgresql-x64-*），或確認埠號為 5432"
    }
    $tcp.Close()
} catch {
    Add-Result -Name "PostgreSQL 5432 可連" -Pass $false -Detail "連線失敗：$($_.Exception.Message)" -FixHint "請確認 PostgreSQL 服務已啟動並在 5432 埠監聽"
}

# 3. psql 找得到（WARN 級）：先查 PATH，再掃 C:\Program Files\PostgreSQL\*\bin\psql.exe
$psqlPath = $null
try {
    $cmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($cmd) {
        $psqlPath = $cmd.Source
        Add-Result -Name "psql 找得到" -Pass $true -Detail "PATH 中找到 psql：$psqlPath" -FixHint ""
    } else {
        $candidates = @()
        if (Test-Path "C:\Program Files\PostgreSQL") {
            $candidates = @(Get-ChildItem -Path "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue | Sort-Object FullName -Descending)
        }
        if ($candidates.Count -gt 0) {
            $psqlPath = $candidates[0].FullName
            Add-Result -Name "psql 找得到" -Pass $true -Warn $true -Detail "PATH 沒有，但在安裝目錄找到：$psqlPath（教材凡用 psql 請用此絕對路徑）" -FixHint ""
        } else {
            Add-Result -Name "psql 找得到" -Pass $true -Warn $true -Detail "PATH 與 C:\Program Files\PostgreSQL\*\bin 都找不到 psql.exe" -FixHint "非必要工具；step2 手冊會教改用 pgAdmin 或連線字串驗證。若要裝，隨 PostgreSQL 一併安裝即可"
        }
    }
} catch {
    Add-Result -Name "psql 找得到" -Pass $true -Warn $true -Detail "檢查失敗：$($_.Exception.Message)" -FixHint ""
}

# 4. 資料庫帳密可登入（FAIL 級；psql 找不到時降為 WARN）
try {
    if ($psqlPath) {
        $oldPw = $env:PGPASSWORD
        $env:PGPASSWORD = '12345'
        $out = & $psqlPath -h localhost -p 5432 -U postgres -d postgres -t -A -c "SELECT 1;" 2>&1
        $exit = $LASTEXITCODE
        if ($oldPw) { $env:PGPASSWORD = $oldPw } else { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue }
        if ($exit -eq 0 -and ("$out" -match '1')) {
            Add-Result -Name "資料庫帳密可登入" -Pass $true -Detail "postgres/12345 登入成功（SELECT 1 回傳 1）" -FixHint ""
        } else {
            Add-Result -Name "資料庫帳密可登入" -Pass $false -Detail "以 postgres/12345 登入失敗：$("$out".Trim())" -FixHint "請確認帳號 postgres 密碼為 12345，或依 step2 手冊調整連線字串（appsettings）"
        }
    } else {
        Add-Result -Name "資料庫帳密可登入" -Pass $true -Warn $true -Detail "找不到 psql，無法自動驗證帳密；請改用 step2 手冊的方式（pgAdmin／連線字串）驗證 postgres/12345 可登入" -FixHint ""
    }
} catch {
    Add-Result -Name "資料庫帳密可登入" -Pass $false -Detail "驗證失敗：$($_.Exception.Message)" -FixHint "請確認 psql 可用且帳號 postgres 密碼為 12345"
}

# 5. port 5080 未被占用（FAIL 級；API 會用這個埠）
try {
    $portInUse = Get-NetTCPConnection -LocalPort 5080 -State Listen -ErrorAction SilentlyContinue
    if ($null -eq $portInUse -or @($portInUse).Count -eq 0) {
        Add-Result -Name "port 5080 未被占用" -Pass $true -Detail "port 5080 目前空閒（範本 API 與參考解 API 都用這個埠，一次跑一個）" -FixHint ""
    } else {
        Add-Result -Name "port 5080 未被占用" -Pass $false -Detail "port 5080 已被占用" -FixHint "請關閉占用 5080 的程式；可執行「Get-Process -Id (Get-NetTCPConnection -LocalPort 5080 -State Listen).OwningProcess」找出並結束該程序"
    }
} catch {
    Add-Result -Name "port 5080 未被占用" -Pass $true -Warn $true -Detail "無法用 Get-NetTCPConnection 檢查（略過，開課時請自行確認 port 5080 空閒）" -FixHint ""
}

# 6. port 3199 未被占用（WARN 級；step4 一鍵 E2E 的 run-e2e.ps1 用這個埠，不是 3100——3100 是前端課的埠，後端本課不使用）
try {
    $portInUse = Get-NetTCPConnection -LocalPort 3199 -State Listen -ErrorAction SilentlyContinue
    if ($null -eq $portInUse -or @($portInUse).Count -eq 0) {
        Add-Result -Name "port 3199 未被占用" -Pass $true -Detail "port 3199 目前空閒（step4 一鍵 E2E 的 run-e2e.ps1 會自管前端 fullchain-app 於這個埠）" -FixHint ""
    } else {
        Add-Result -Name "port 3199 未被占用" -Pass $true -Warn $true -Detail "port 3199 已被占用；step4 一鍵 E2E 串接前請釋放此埠（step0~step3 不受影響）" -FixHint "step4 前執行「Get-Process -Id (Get-NetTCPConnection -LocalPort 3199 -State Listen).OwningProcess」找出並結束占用程序"
    }
} catch {
    Add-Result -Name "port 3199 未被占用" -Pass $true -Warn $true -Detail "無法用 Get-NetTCPConnection 檢查（略過，step4 前請自行確認 port 3199 空閒）" -FixHint ""
}

# 7. Node >= 20 且 pnpm 存在（WARN 級；step4 前端銜接才需要）
try {
    $nodeOk = $false
    $nodeDetail = ""
    $nodeVersionRaw = node --version 2>$null
    if ($LASTEXITCODE -eq 0 -and $nodeVersionRaw) {
        $major = [int]($nodeVersionRaw.Trim().TrimStart('v').Split('.')[0])
        if ($major -ge 20) { $nodeOk = $true; $nodeDetail = "Node $($nodeVersionRaw.Trim())" }
        else { $nodeDetail = "Node $($nodeVersionRaw.Trim())（< 20）" }
    } else {
        $nodeDetail = "找不到 node"
    }
    $pnpmRaw = pnpm --version 2>$null
    $pnpmOk = ($LASTEXITCODE -eq 0 -and $pnpmRaw)
    $pnpmDetail = if ($pnpmOk) { "pnpm $($pnpmRaw.Trim())" } else { "找不到 pnpm" }
    if ($nodeOk -and $pnpmOk) {
        Add-Result -Name "Node >= 20 + pnpm" -Pass $true -Detail "$nodeDetail／$pnpmDetail" -FixHint ""
    } else {
        Add-Result -Name "Node >= 20 + pnpm" -Pass $true -Warn $true -Detail "$nodeDetail／$pnpmDetail；step4 全鏈路前端才需要，step0~step3 不受影響" -FixHint "step4 前安裝 Node 20+（https://nodejs.org/）並執行「npm install -g pnpm」"
    }
} catch {
    Add-Result -Name "Node >= 20 + pnpm" -Pass $true -Warn $true -Detail "檢查失敗：$($_.Exception.Message)；step4 前端銜接才需要" -FixHint ""
}

# 8. 磁碟剩餘空間 >= 2GB（FAIL 級；以腳本所在磁碟為準）
try {
    $scriptDrive = (Split-Path -Qualifier $PSScriptRoot).TrimEnd(':')
    $drive = Get-PSDrive -Name $scriptDrive -ErrorAction Stop
    $freeGB = [math]::Round($drive.Free / 1GB, 2)
    if ($freeGB -ge 2) {
        Add-Result -Name "磁碟剩餘空間 >= 2GB" -Pass $true -Detail "$scriptDrive`: 剩餘約 $freeGB GB" -FixHint ""
    } else {
        Add-Result -Name "磁碟剩餘空間 >= 2GB" -Pass $false -Detail "$scriptDrive`: 剩餘約 $freeGB GB（不足）" -FixHint "請清出至少 2GB 空間，還原 NuGet 套件與建置輸出需要空間"
    }
} catch {
    Add-Result -Name "磁碟剩餘空間 >= 2GB" -Pass $false -Detail "檢查失敗：$($_.Exception.Message)" -FixHint "請手動確認腳本所在磁碟至少有 2GB 剩餘空間"
}

# 9. ExecutionPolicy 可執行腳本（FAIL 級；只看生效原則）
try {
    $cuPolicy = Get-ExecutionPolicy -Scope CurrentUser
    $lmPolicy = Get-ExecutionPolicy -Scope LocalMachine
    $effectivePolicy = Get-ExecutionPolicy
    $blockedPolicies = @('Restricted', 'AllSigned')
    if ($blockedPolicies -contains $effectivePolicy) {
        Add-Result -Name "ExecutionPolicy 可執行腳本" -Pass $false -Detail "生效原則為 $effectivePolicy（CurrentUser=$cuPolicy／LocalMachine=$lmPolicy），會擋住腳本執行" -FixHint "請執行「Set-ExecutionPolicy -Scope CurrentUser RemoteSigned」後重跑 preflight.ps1"
    } else {
        Add-Result -Name "ExecutionPolicy 可執行腳本" -Pass $true -Detail "生效原則為 $effectivePolicy（CurrentUser=$cuPolicy／LocalMachine=$lmPolicy）" -FixHint ""
    }
} catch {
    Add-Result -Name "ExecutionPolicy 可執行腳本" -Pass $false -Detail "檢查失敗：$($_.Exception.Message)" -FixHint "請執行「Set-ExecutionPolicy -Scope CurrentUser RemoteSigned」後重跑 preflight.ps1"
}

# 10. AI Agent CLI（WARN 級）
try {
    $agentCandidates = @('claude', 'codex', 'cursor')
    $foundAgents = @()
    foreach ($agent in $agentCandidates) {
        if (Get-Command $agent -ErrorAction SilentlyContinue) {
            $foundAgents += $agent
        }
    }
    if ($foundAgents.Count -gt 0) {
        Add-Result -Name "AI Agent CLI" -Pass $true -Detail "偵測到：$($foundAgents -join '、')" -FixHint ""
    } else {
        Add-Result -Name "AI Agent CLI" -Pass $true -Warn $true -Detail "未偵測到常見 AI Agent CLI（claude／codex／cursor）；若用 IDE 內建 Agent（如 Cursor／Copilot）可忽略" -FixHint ""
    }
} catch {
    Add-Result -Name "AI Agent CLI" -Pass $true -Warn $true -Detail "無法偵測 AI Agent CLI；若用 IDE 內建 Agent（如 Cursor／Copilot）可忽略" -FixHint ""
}

# 11. step4 e2e 依賴就緒（WARN 級；一鍵 E2E 的 run-e2e.ps1 才需要，step0~step3 不受影響）
try {
    $e2eDir = Join-Path (Split-Path -Parent $PSScriptRoot) "step4_loop_e2e\e2e"
    if (-not (Test-Path -LiteralPath $e2eDir)) {
        Add-Result -Name "step4 e2e 依賴就緒" -Pass $true -Warn $true -Detail "找不到 step4_loop_e2e\e2e 資料夾，略過檢查" -FixHint ""
    } else {
        $nodeModulesPath  = Join-Path $e2eDir "node_modules"
        $playwrightBin    = Join-Path $e2eDir "node_modules\.bin\playwright.cmd"
        $hasNodeModules   = Test-Path -LiteralPath $nodeModulesPath
        $hasPlaywrightCli = Test-Path -LiteralPath $playwrightBin
        if ($hasNodeModules -and $hasPlaywrightCli) {
            Add-Result -Name "step4 e2e 依賴就緒" -Pass $true -Detail "node_modules 與 playwright CLI 都已就緒（$e2eDir）" -FixHint ""
        } else {
            Add-Result -Name "step4 e2e 依賴就緒" -Pass $true -Warn $true -Detail "node_modules 或 playwright CLI 尚未安裝（$e2eDir）；step0~step3 不受影響" -FixHint "step4 前於 step4_loop_e2e\e2e 執行「pnpm install」（或 npm install）安裝依賴"
        }
    }
} catch {
    Add-Result -Name "step4 e2e 依賴就緒" -Pass $true -Warn $true -Detail "檢查失敗：$($_.Exception.Message)；step4 前請自行確認 e2e 依賴已安裝" -FixHint ""
}

# 輸出清單
foreach ($r in $results) {
    if ($r.Warn) {
        Write-Host ("[WARN] {0} — {1}" -f $r.Name, $r.Detail) -ForegroundColor Yellow
        if ($r.FixHint) {
            Write-Host ("       建議：{0}" -f $r.FixHint) -ForegroundColor DarkYellow
        }
    } elseif ($r.Pass) {
        Write-Host ("[PASS] {0} — {1}" -f $r.Name, $r.Detail) -ForegroundColor Green
    } else {
        Write-Host ("[FAIL] {0} — {1}" -f $r.Name, $r.Detail) -ForegroundColor Red
        Write-Host ("       修復提示：{0}" -f $r.FixHint) -ForegroundColor Yellow
    }
}

Write-Host ""
$failCount = @($results | Where-Object { -not $_.Pass }).Count
$warnCount = @($results | Where-Object { $_.Warn }).Count

if ($failCount -eq 0) {
    if ($warnCount -gt 0) {
        Write-Host "前置檢查全數通過（含 $warnCount 項警告），可以開課！" -ForegroundColor Green
        Write-Host "（警告項多為 step4 全鏈路才需要的前端／埠號，step0~step3 不受影響）" -ForegroundColor DarkYellow
    } else {
        Write-Host "前置檢查全數通過，可以開課！" -ForegroundColor Green
    }
    exit 0
} else {
    Write-Host "有 $failCount 項檢查未通過，請依上方修復提示處理後重新執行 preflight.ps1。" -ForegroundColor Red
    exit 1
}

# 註：AI Agent 帳號額度／登入狀態無法自動檢查，開課前請講師人工確認（見 instructor/GUIDE.md）
