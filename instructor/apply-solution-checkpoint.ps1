<#
.SYNOPSIS
    講師救援：把「裝備物資模組」參考解一次套用到學員的 my-equipment-api，
    並自動驗收回到 solution baseline（89 tests／ai_crud_equipment DB）。
.DESCRIPTION
    用途（見 GUIDE 時間軸）：課堂進行到約 85 分鐘、學員的 API 還跑不起來時，
    用這支腳本把 step3 參考解 solution-api 的 Equipment 模組關鍵檔「複製覆蓋」到學員專案，
    讓大家回到同一個可跑基準點，繼續往 step4 全鏈路走。

    做了什麼：
      - 【原始碼】複製「新增檔」（Equipment 的 Entities / Constants / Models / Mapping /
        Services / Controllers / SeedData / Migration）到學員專案對應位置；
        覆蓋「改動檔」（Program.cs 註冊、AppDbContext 的 DbSet/設定、DbSeeder 呼叫、
        Migration 快照 ModelSnapshot、appsettings.Development.json 連線字串）。
      - 【測試】複製 Equipment 單元／整合測試（新增），並覆蓋整合測試 factory
        CustomWebAppFactory.cs（改用 ai_crud_equipment_test）。
      - 【文件】把 SRS-delta／SDD-delta／TASKS 複製進學員專案 docs\（供三路驗收比對）。
      - 覆蓋前一律把學員原檔備份到 <Target>\.checkpoint-backup\（保留相對路徑結構，
        只在第一次備份，重複執行 apply 不會覆蓋掉「套用前的原始檔」），可用
        restore-checkpoint.ps1 對稱還原。
      - 套用完成後自動執行 dotnet build／dotnet test／啟動 API 驗 GET 筆數／psql 驗
        DB 名稱，印出實測結果，方便講師與學員當場核對是否回到 solution baseline。

    前提：學員專案沿用範本命名空間 CrudTemplate.Api（工作坊複製範本時不改名），
          否則複製過去的檔案命名空間會對不上、無法編譯。

    用法（在本資料夾或任意位置皆可，路徑用絕對或相對都行）：
      powershell -ExecutionPolicy Bypass -File .\apply-solution-checkpoint.ps1 -Target D:\path\to\my-equipment-api
      # 若想跳過套用後自動驗收（例如趕時間）：
      powershell -ExecutionPolicy Bypass -File .\apply-solution-checkpoint.ps1 -Target D:\path\to\my-equipment-api -SkipVerify

    -Target 指向學員專案「根目錄」（底下應有 src\CrudTemplate.Api\ 與 tests\CrudTemplate.Api.Tests\）。
.NOTES
    只寫入 -Target 底下的檔案與備份；不動 step3 參考解（來源唯讀）。
    與 restore-checkpoint.ps1 的檔案清單須保持對稱：改這支腳本的 $apiFiles／$testFiles／
    $docFiles 時，restore-checkpoint.ps1 也要同步更新。
#>
param(
    [Parameter(Mandatory = $true)]
    [string] $Target,

    [int] $ExpectedTestCount = 89,

    [switch] $SkipVerify
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ── 來源：step3 參考解（API 原始碼／測試／delta 文件）──
$scriptDir    = $PSScriptRoot
$step3Dir     = [System.IO.Path]::GetFullPath((Join-Path $scriptDir '..\step3_new_module'))
$srcApiDir    = Join-Path $step3Dir 'solution-api\src\CrudTemplate.Api'
$srcTestsDir  = Join-Path $step3Dir 'solution-api\tests\CrudTemplate.Api.Tests'
$srcDocsDir   = Join-Path $step3Dir 'docs'

# ── 要套用的檔案清單 ──
#   新增檔＝Equipment 模組本體；改動檔＝與既有共用檔整併後的版本（整檔覆蓋，最穩）。

# 相對 src\CrudTemplate.Api\
$apiFiles = @(
    # 新增：Equipment 模組本體
    'Constants\EquipmentEnums.cs',
    'Entities\EquipmentItem.cs',
    'Models\EquipmentItemRequest.cs',
    'Models\EquipmentItemResult.cs',
    'Mapping\EquipmentMapper.cs',
    'Services\IEquipmentService.cs',
    'Services\EquipmentService.cs',
    'Controllers\EquipmentItemsController.cs',
    'Data\EquipmentSeedData.cs',
    'Data\Migrations\20260712070056_AddEquipmentModule.cs',
    'Data\Migrations\20260712070056_AddEquipmentModule.Designer.cs',
    # 改動：與既有檔整併後的版本（整檔覆蓋）
    'Program.cs',
    'Data\AppDbContext.cs',
    'Data\DbSeeder.cs',
    'Data\Migrations\AppDbContextModelSnapshot.cs',
    # 改動：開發連線字串（Database=ai_crud_equipment，避免仍連 ai_crud_template）
    'appsettings.Development.json'
)

# 相對 tests\CrudTemplate.Api.Tests\
$testFiles = @(
    # 新增：Equipment 單元／整合測試
    'Unit\EquipmentMapperTests.cs',
    'Unit\EquipmentValidationTests.cs',
    'Integration\EquipmentApiTests.cs',
    # 改動：整合測試 factory（測試連線改為 ai_crud_equipment_test）
    'Integration\CustomWebAppFactory.cs'
)

# 相對 docs\（來源＝step3_new_module\docs\，不在 solution-api 底下）
$docFiles = @(
    'SRS-裝備物資API-delta.md',
    'SDD-裝備物資API-delta.md',
    'TASKS.md'
)

function Copy-CheckpointFileSet {
    param(
        [string] $SetLabel,
        [string] $SrcRoot,
        [string] $DstRoot,
        [string[]] $RelFiles,
        [string] $BackupRoot,
        [string] $ManifestFile
    )

    $added = 0
    $overwritten = 0

    # 「新增檔清單」manifest：記錄哪些檔案是 apply 第一次「新增」出來的（學員原本沒有）。
    # 目的：重複執行 apply 時，這些檔案在磁碟上已經存在（是上一輪套用留下的 Equipment 版本），
    # 若只靠「Test-Path 就備份」判斷，會誤把「Equipment 版本」當成「學員原始檔」備份起來，
    # 之後 restore 會誤判成「覆蓋過的既有檔」而還原回 Equipment 版本，而不是刪除——
    # 用 manifest 記住「這一路徑本來就是新增」，之後無論重跑幾次都不建立/不採信它的備份。
    $manifestEntries = @{}
    if (Test-Path -LiteralPath $ManifestFile) {
        Get-Content -LiteralPath $ManifestFile | Where-Object { $_ } | ForEach-Object { $manifestEntries[$_] = $true }
    }

    foreach ($rel in $RelFiles) {
        $srcFile = Join-Path $SrcRoot $rel
        if (-not (Test-Path -LiteralPath $srcFile)) {
            throw "來源缺檔（參考解不完整？）[$SetLabel]：$srcFile"
        }
        $dstFile = Join-Path $DstRoot $rel
        $dstFileDir = Split-Path -Parent $dstFile
        if (-not (Test-Path -LiteralPath $dstFileDir)) {
            New-Item -ItemType Directory -Path $dstFileDir -Force | Out-Null
        }

        $manifestKey = "$SetLabel|$rel"
        $isKnownAddition = $manifestEntries.ContainsKey($manifestKey)

        if ((Test-Path -LiteralPath $dstFile) -and -not $isKnownAddition) {
            # 學員原本就有這個檔（且從未被 apply 記錄為「新增」）→ 覆蓋前備份。
            # 只在第一次備份：重複執行 apply 時，若備份已存在就不再覆蓋，
            # 確保 .checkpoint-backup\ 內永遠是「套用前」的原始檔。
            $bakFile = Join-Path $BackupRoot $rel
            $bakDir  = Split-Path -Parent $bakFile
            if (-not (Test-Path -LiteralPath $bakDir)) { New-Item -ItemType Directory -Path $bakDir -Force | Out-Null }
            if (-not (Test-Path -LiteralPath $bakFile)) {
                [System.IO.File]::Copy($dstFile, $bakFile, $false)
            }
            [System.IO.File]::Copy($srcFile, $dstFile, $true)
            Write-Host "  覆蓋  [$SetLabel] $rel" -ForegroundColor Yellow
            $overwritten++
        } else {
            # 新增檔（或曾被記錄為新增、這次是重複套用）→ 直接複製，登記進 manifest，不建立備份。
            [System.IO.File]::Copy($srcFile, $dstFile, $true)
            if (-not $isKnownAddition) {
                Add-Content -LiteralPath $ManifestFile -Value $manifestKey -Encoding UTF8
            }
            Write-Host "  新增  [$SetLabel] $rel" -ForegroundColor Green
            $added++
        }
    }

    [PSCustomObject]@{ Added = $added; Overwritten = $overwritten }
}

try {
    Write-Host '=== 套用裝備物資模組參考解 checkpoint ===' -ForegroundColor Cyan

    foreach ($p in @($srcApiDir, $srcTestsDir, $srcDocsDir)) {
        if (-not (Test-Path -LiteralPath $p)) {
            throw "找不到來源目錄：$p"
        }
    }

    $Target = [System.IO.Path]::GetFullPath($Target)
    if (-not (Test-Path -LiteralPath $Target)) {
        throw "找不到 -Target 目錄：$Target"
    }

    # ── 定位學員專案的 API 目錄（優先 src\CrudTemplate.Api；否則自動偵測含 Program.cs 的單一專案）──
    $dstApiDir = Join-Path $Target 'src\CrudTemplate.Api'
    if (-not (Test-Path -LiteralPath $dstApiDir)) {
        $srcDir = Join-Path $Target 'src'
        $cand = @()
        if (Test-Path -LiteralPath $srcDir) {
            $cand = Get-ChildItem -LiteralPath $srcDir -Directory -ErrorAction SilentlyContinue |
                Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'Program.cs') }
        }
        if ($cand.Count -eq 1) {
            $dstApiDir = $cand[0].FullName
            Write-Host "      （自動偵測到學員 API 專案：$dstApiDir）" -ForegroundColor DarkYellow
            Write-Host '      注意：若其命名空間不是 CrudTemplate.Api，複製過去的檔案將無法編譯。' -ForegroundColor DarkYellow
        } else {
            throw "在 $Target 底下找不到 src\CrudTemplate.Api（也無法唯一自動偵測 API 專案）。請確認 -Target 指向學員專案根目錄。"
        }
    }

    # ── 定位學員專案的測試目錄（優先 tests\CrudTemplate.Api.Tests；否則自動偵測含 .csproj 的單一測試專案）──
    $dstTestsDir = Join-Path $Target 'tests\CrudTemplate.Api.Tests'
    if (-not (Test-Path -LiteralPath $dstTestsDir)) {
        $testsRoot = Join-Path $Target 'tests'
        $candT = @()
        if (Test-Path -LiteralPath $testsRoot) {
            $candT = Get-ChildItem -LiteralPath $testsRoot -Directory -ErrorAction SilentlyContinue |
                Where-Object { Get-ChildItem -LiteralPath $_.FullName -Filter '*.csproj' -ErrorAction SilentlyContinue }
        }
        if ($candT.Count -eq 1) {
            $dstTestsDir = $candT[0].FullName
            Write-Host "      （自動偵測到學員測試專案：$dstTestsDir）" -ForegroundColor DarkYellow
        } else {
            throw "在 $Target 底下找不到 tests\CrudTemplate.Api.Tests（也無法唯一自動偵測測試專案）。請確認 -Target 指向學員專案根目錄。"
        }
    }

    $dstDocsDir = Join-Path $Target 'docs'
    if (-not (Test-Path -LiteralPath $dstDocsDir)) {
        New-Item -ItemType Directory -Path $dstDocsDir -Force | Out-Null
    }

    $backupRoot = Join-Path $Target '.checkpoint-backup'
    if (-not (Test-Path -LiteralPath $backupRoot)) {
        New-Item -ItemType Directory -Path $backupRoot | Out-Null
    }
    # 備份內用同一組相對路徑分三個子資料夾，對應三個來源根，restore 才能精準對回去。
    $backupApiRoot   = Join-Path $backupRoot 'src\CrudTemplate.Api'
    $backupTestsRoot = Join-Path $backupRoot 'tests\CrudTemplate.Api.Tests'
    $backupDocsRoot  = Join-Path $backupRoot 'docs'
    # 新增檔 manifest：三個檔案集共用同一份，key 前綴 SetLabel 避免路徑碰撞。
    $manifestFile = Join-Path $backupRoot '.added-manifest.txt'
    if (-not (Test-Path -LiteralPath $manifestFile)) {
        New-Item -ItemType File -Path $manifestFile -Force | Out-Null
    }

    $rApi   = Copy-CheckpointFileSet -SetLabel 'src'  -SrcRoot $srcApiDir   -DstRoot $dstApiDir   -RelFiles $apiFiles  -BackupRoot $backupApiRoot   -ManifestFile $manifestFile
    $rTests = Copy-CheckpointFileSet -SetLabel 'test' -SrcRoot $srcTestsDir -DstRoot $dstTestsDir -RelFiles $testFiles -BackupRoot $backupTestsRoot -ManifestFile $manifestFile
    $rDocs  = Copy-CheckpointFileSet -SetLabel 'docs' -SrcRoot $srcDocsDir  -DstRoot $dstDocsDir  -RelFiles $docFiles  -BackupRoot $backupDocsRoot  -ManifestFile $manifestFile

    $added       = $rApi.Added + $rTests.Added + $rDocs.Added
    $overwritten = $rApi.Overwritten + $rTests.Overwritten + $rDocs.Overwritten

    Write-Host ''
    Write-Host "DONE：新增 $added 檔、覆蓋 $overwritten 檔（原檔已備份到 .checkpoint-backup\）。" -ForegroundColor Green
    Write-Host "      API 專案：$dstApiDir" -ForegroundColor DarkGray
    Write-Host "      測試專案：$dstTestsDir" -ForegroundColor DarkGray
    Write-Host "      Docs：$dstDocsDir" -ForegroundColor DarkGray

    if ($SkipVerify) {
        Write-Host ''
        Write-Host '（已指定 -SkipVerify，略過套用後自動驗收。）' -ForegroundColor DarkYellow
        Write-Host '下一步：' -ForegroundColor Cyan
        Write-Host '  1. dotnet build（預期 0 warning／0 error）' -ForegroundColor Gray
        Write-Host "  2. dotnet test（預期 $ExpectedTestCount 個測試全綠）" -ForegroundColor Gray
        Write-Host '  3. dotnet run --project src\CrudTemplate.Api，GET /api/equipment/items 應回 24 筆' -ForegroundColor Gray
        Write-Host '  4. 若要復原，跑 restore-checkpoint.ps1 -Target 同一目錄' -ForegroundColor Gray
        exit 0
    }

    # ══════════════════════════════════════════════════════════════
    # 套用後自動驗收：build → test → 啟動 API 驗 GET 筆數 → psql 驗 DB 名稱
    # ══════════════════════════════════════════════════════════════
    Write-Host ''
    Write-Host '=== 套用後自動驗收 ===' -ForegroundColor Cyan

    $slnFile = Get-ChildItem -LiteralPath $Target -Filter '*.sln' -ErrorAction SilentlyContinue | Select-Object -First 1
    $buildTarget = if ($slnFile) { $slnFile.FullName } else { $Target }

    # ── 1) dotnet build ──
    Write-Host ''
    Write-Host '[1/4] dotnet build' -ForegroundColor Cyan
    $buildOutput = & dotnet build $buildTarget 2>&1 | Out-String
    $buildExit = $LASTEXITCODE
    Write-Host $buildOutput
    # 解析 MSBuild 摘要行「X Warning(s)」「X Error(s)」的實際數字，
    # 不要只數「warning」「error」關鍵字出現次數（那樣連「0 Warning(s)」本身都會被誤算成 1 次）。
    $warnMatch = [regex]::Match($buildOutput, '(\d+)\s+Warning\(s\)')
    $errMatch  = [regex]::Match($buildOutput, '(\d+)\s+Error\(s\)')
    $warnCount = if ($warnMatch.Success) { [int]$warnMatch.Groups[1].Value } else { $null }
    $errCount  = if ($errMatch.Success)  { [int]$errMatch.Groups[1].Value }  else { $null }
    if ($buildExit -eq 0) {
        if ($warnCount -eq 0 -and $errCount -eq 0) {
            Write-Host "  build 結果：exit 0，$warnCount warning／$errCount error（符合 0 警告 0 錯誤）。" -ForegroundColor Green
        } else {
            Write-Host "  build 結果：exit 0，但摘要顯示 $warnCount warning／$errCount error（未達 0/0，請人工檢查上方輸出）。" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  build 結果：exit $buildExit（FAIL）。" -ForegroundColor Red
    }

    # ── 2) dotnet test ──
    Write-Host ''
    Write-Host '[2/4] dotnet test' -ForegroundColor Cyan
    $actualTestCount = $null
    $testExit = $null
    if ($buildExit -ne 0) {
        Write-Host '  略過（build 未成功）。' -ForegroundColor Yellow
    } else {
        $testOutput = & dotnet test $dstTestsDir 2>&1 | Out-String
        $testExit = $LASTEXITCODE
        Write-Host $testOutput
        # dotnet test 摘要格式如：Passed!  - Failed: 0, Passed: 89, Skipped: 0, Total: 89, Duration: ...
        $m = [regex]::Match($testOutput, 'Passed:\s*(\d+),\s*Skipped:\s*(\d+),\s*Total:\s*(\d+)')
        if ($m.Success) {
            $actualTestCount = [int]$m.Groups[1].Value
            $totalCount = [int]$m.Groups[3].Value
            if ($actualTestCount -eq $ExpectedTestCount -and $testExit -eq 0) {
                Write-Host "  測試結果：passed=$actualTestCount／total=$totalCount，符合預期 $ExpectedTestCount，exit 0。" -ForegroundColor Green
            } else {
                Write-Host "  測試結果：passed=$actualTestCount／total=$totalCount（預期 $ExpectedTestCount），exit $testExit。" -ForegroundColor Red
            }
        } else {
            Write-Host "  測試結果：無法從輸出解析測試摘要，請人工檢查上方輸出。exit $testExit" -ForegroundColor Yellow
        }
    }

    # ── 3) 啟動 API，驗 GET /api/equipment/items 筆數 ──
    Write-Host ''
    Write-Host '[3/4] 啟動 API 驗 GET /api/equipment/items 筆數（預期 24 筆）' -ForegroundColor Cyan
    $apiUrl = 'http://localhost:5080/api/equipment/items'
    $apiProc = $null
    try {
        $apiProc = Start-Process -FilePath 'dotnet' `
            -ArgumentList @('run', '--project', $dstApiDir, '--urls', 'http://localhost:5080') `
            -PassThru -WindowStyle Hidden `
            -RedirectStandardOutput (Join-Path $env:TEMP 'checkpoint-apply-api-stdout.log') `
            -RedirectStandardError  (Join-Path $env:TEMP 'checkpoint-apply-api-stderr.log')

        $ProgressPreference = 'SilentlyContinue'
        $ready = $false
        for ($i = 0; $i -lt 20; $i++) {
            Start-Sleep -Seconds 1
            try {
                $resp = Invoke-RestMethod -Uri $apiUrl -Method Get -TimeoutSec 3
                $ready = $true
                break
            } catch {
                continue
            }
        }
        if ($ready) {
            # 回應是 ModelResult<List<EquipmentItemResult>>（{ success, data: [...] }），
            # 實際筆數在 .data，不是頂層物件本身。
            $count = @($resp.data).Count
            if ($count -eq 24) {
                Write-Host "  GET 結果：$count 筆，符合預期 24 筆。" -ForegroundColor Green
            } else {
                Write-Host "  GET 結果：$count 筆（預期 24 筆）。" -ForegroundColor Red
            }
        } else {
            Write-Host '  API 20 秒內未就緒，略過 GET 驗證（請人工用 dotnet run 確認）。' -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  啟動 API 或呼叫 GET 失敗（略過此項）：$($_.Exception.Message)" -ForegroundColor Yellow
    } finally {
        if ($apiProc -and -not $apiProc.HasExited) {
            Stop-Process -Id $apiProc.Id -Force -ErrorAction SilentlyContinue
            Start-Sleep -Milliseconds 500
        }
    }

    # ── 4) psql 驗實際連的 DB 名稱 ──
    Write-Host ''
    Write-Host '[4/4] psql 驗開發連線實際 DB 名稱（預期 ai_crud_equipment）' -ForegroundColor Cyan
    $psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
    $psqlExe = if ($psqlCmd) { $psqlCmd.Source } else {
        # PATH 上常沒有 psql（本機常見安裝路徑做為後備，不需要使用者事先設定 PATH）。
        Get-ChildItem -Path 'C:\Program Files\PostgreSQL\*\bin\psql.exe' -ErrorAction SilentlyContinue |
            Sort-Object FullName -Descending | Select-Object -First 1 -ExpandProperty FullName
    }
    if (-not $psqlExe) {
        Write-Host '  找不到 psql，略過此項（請人工確認 appsettings.Development.json 的 Database=ai_crud_equipment）。' -ForegroundColor Yellow
    } else {
        try {
            $env:PGPASSWORD = '12345'
            $dbNameOutput = & $psqlExe -U postgres -h localhost -d ai_crud_equipment -t -c 'SELECT current_database();' 2>&1
            $dbName = ($dbNameOutput | Out-String).Trim()
            if ($dbName -eq 'ai_crud_equipment') {
                Write-Host "  psql 實際連線 DB：$dbName（符合預期）。" -ForegroundColor Green
            } else {
                Write-Host "  psql 輸出：$dbName（請人工確認是否為 ai_crud_equipment）。" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  psql 查詢失敗（略過此項）：$($_.Exception.Message)" -ForegroundColor Yellow
        } finally {
            Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
        }
    }

    Write-Host ''
    Write-Host '=== 驗收摘要 ===' -ForegroundColor Cyan
    Write-Host ("  build exit        : {0}" -f $buildExit)
    Write-Host ("  test exit          : {0}" -f $testExit)
    Write-Host ("  test passed/expect : {0}/{1}" -f $actualTestCount, $ExpectedTestCount)
    Write-Host ''
    Write-Host '下一步：' -ForegroundColor Cyan
    Write-Host '  若上面各項未達預期，可個別重跑對應指令排查；' -ForegroundColor Gray
    Write-Host '  若要復原成套用前的樣子，跑 restore-checkpoint.ps1 -Target 同一目錄。' -ForegroundColor Gray

    exit 0
}
catch {
    Write-Host ("FAIL：{0}" -f $_.Exception.Message) -ForegroundColor Red
    exit 1
}
