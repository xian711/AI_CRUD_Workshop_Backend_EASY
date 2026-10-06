<#
.SYNOPSIS
    對稱還原 apply-solution-checkpoint.ps1：把學員專案復原成套用 checkpoint 之前的樣子。
.DESCRIPTION
    邏輯與 apply-solution-checkpoint.ps1 的檔案清單（$apiFiles／$testFiles／$docFiles）
    完全對稱：對每一個清單中的檔案，
      - 若 <Target>\.checkpoint-backup\ 底下有對應備份 → 代表 apply 當初「覆蓋」過
        學員原本就有的檔案，還原＝把備份檔複製回去。
      - 若沒有備份 → 代表 apply 當初是「新增」這個檔案（學員原本沒有），
        還原＝直接刪除這個檔案。
    還原完成後會刪除 .checkpoint-backup\ 目錄本身（除非 -KeepBackup）。

    用法：
      powershell -ExecutionPolicy Bypass -File .\restore-checkpoint.ps1 -Target D:\path\to\my-equipment-api

    -Target 指向學員專案「根目錄」（同一個曾傳給 apply-solution-checkpoint.ps1 -Target 的路徑）。
.NOTES
    只寫入／刪除 -Target 底下的檔案；不動 step3 參考解。
    這支腳本的檔案清單（$apiFiles／$testFiles／$docFiles）必須與
    apply-solution-checkpoint.ps1 保持逐項一致，否則還原會不完整或誤刪。
#>
param(
    [Parameter(Mandatory = $true)]
    [string] $Target,

    [switch] $KeepBackup
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ── 檔案清單：須與 apply-solution-checkpoint.ps1 逐項對稱 ──

# 相對 src\CrudTemplate.Api\
$apiFiles = @(
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
    'Program.cs',
    'Data\AppDbContext.cs',
    'Data\DbSeeder.cs',
    'Data\Migrations\AppDbContextModelSnapshot.cs',
    'appsettings.Development.json'
)

# 相對 tests\CrudTemplate.Api.Tests\
$testFiles = @(
    'Unit\EquipmentMapperTests.cs',
    'Unit\EquipmentValidationTests.cs',
    'Integration\EquipmentApiTests.cs',
    'Integration\CustomWebAppFactory.cs'
)

# 相對 docs\
$docFiles = @(
    'SRS-裝備物資API-delta.md',
    'DESIGN-裝備物資API-delta.md',
    'DIAGRAMS-裝備物資API.html',
    'TASKS.md'
)

function Restore-CheckpointFileSet {
    param(
        [string] $SetLabel,
        [string] $DstRoot,
        [string[]] $RelFiles,
        [string] $BackupRoot,
        [hashtable] $ManifestEntries
    )

    $restored = 0
    $deleted  = 0
    $missing  = 0

    foreach ($rel in $RelFiles) {
        $dstFile = Join-Path $DstRoot $rel
        $bakFile = Join-Path $BackupRoot $rel
        # manifest 記錄的是 apply 當初「新增」的檔案（學員原本沒有）。
        # 優先信任 manifest：即使 .checkpoint-backup 底下剛好有同路徑檔案
        # （例如 apply 被重複執行過，見 apply-solution-checkpoint.ps1 的說明），
        # 只要 manifest 標記為「新增」，還原時一律刪除，不誤還原成 Equipment 版本。
        $isKnownAddition = $ManifestEntries.ContainsKey("$SetLabel|$rel")

        if ((Test-Path -LiteralPath $bakFile) -and -not $isKnownAddition) {
            # apply 當初覆蓋過既有檔 → 把備份還原回去
            $dstFileDir = Split-Path -Parent $dstFile
            if (-not (Test-Path -LiteralPath $dstFileDir)) {
                New-Item -ItemType Directory -Path $dstFileDir -Force | Out-Null
            }
            [System.IO.File]::Copy($bakFile, $dstFile, $true)
            Write-Host "  還原  [$SetLabel] $rel" -ForegroundColor Yellow
            $restored++
        } elseif (Test-Path -LiteralPath $dstFile) {
            # apply 當初是新增檔 → 直接刪除
            Remove-Item -LiteralPath $dstFile -Force
            Write-Host "  刪除  [$SetLabel] $rel" -ForegroundColor Green
            $deleted++
        } else {
            # 兩邊都沒有：可能從未套用過 checkpoint，或已經還原過
            Write-Host "  略過  [$SetLabel] $rel（無備份也無現存檔，可能尚未套用過）" -ForegroundColor DarkGray
            $missing++
        }
    }

    [PSCustomObject]@{ Restored = $restored; Deleted = $deleted; Missing = $missing }
}

try {
    Write-Host '=== 還原裝備物資模組參考解 checkpoint ===' -ForegroundColor Cyan

    $Target = [System.IO.Path]::GetFullPath($Target)
    if (-not (Test-Path -LiteralPath $Target)) {
        throw "找不到 -Target 目錄：$Target"
    }

    $backupRoot = Join-Path $Target '.checkpoint-backup'
    if (-not (Test-Path -LiteralPath $backupRoot)) {
        throw "找不到 .checkpoint-backup\（$backupRoot）。這個專案可能從未套用過 apply-solution-checkpoint.ps1，或備份已被手動刪除，無法還原。"
    }

    # ── 定位學員專案的 API 目錄（邏輯與 apply-solution-checkpoint.ps1 對稱）──
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
        } else {
            throw "在 $Target 底下找不到 src\CrudTemplate.Api（也無法唯一自動偵測 API 專案）。"
        }
    }

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
            throw "在 $Target 底下找不到 tests\CrudTemplate.Api.Tests（也無法唯一自動偵測測試專案）。"
        }
    }

    $dstDocsDir = Join-Path $Target 'docs'

    $backupApiRoot   = Join-Path $backupRoot 'src\CrudTemplate.Api'
    $backupTestsRoot = Join-Path $backupRoot 'tests\CrudTemplate.Api.Tests'
    $backupDocsRoot  = Join-Path $backupRoot 'docs'

    # 讀「新增檔」manifest（apply-solution-checkpoint.ps1 寫入）：這些相對路徑是
    # apply 當初「新增」出來的（學員原本沒有），還原時一律刪除，不受備份是否存在影響
    # （備份可能因重複執行 apply 而意外出現，見 apply 腳本內的說明）。
    $manifestFile = Join-Path $backupRoot '.added-manifest.txt'
    $manifestEntries = @{}
    if (Test-Path -LiteralPath $manifestFile) {
        Get-Content -LiteralPath $manifestFile | Where-Object { $_ } | ForEach-Object { $manifestEntries[$_] = $true }
    } else {
        Write-Host '      （找不到 .added-manifest.txt，退回舊邏輯：僅用備份是否存在判斷新增／覆蓋。）' -ForegroundColor DarkYellow
    }

    $rApi   = Restore-CheckpointFileSet -SetLabel 'src'  -DstRoot $dstApiDir   -RelFiles $apiFiles  -BackupRoot $backupApiRoot   -ManifestEntries $manifestEntries
    $rTests = Restore-CheckpointFileSet -SetLabel 'test' -DstRoot $dstTestsDir -RelFiles $testFiles -BackupRoot $backupTestsRoot -ManifestEntries $manifestEntries
    $rDocs  = Restore-CheckpointFileSet -SetLabel 'docs' -DstRoot $dstDocsDir  -RelFiles $docFiles  -BackupRoot $backupDocsRoot  -ManifestEntries $manifestEntries

    $restored = $rApi.Restored + $rTests.Restored + $rDocs.Restored
    $deleted  = $rApi.Deleted  + $rTests.Deleted  + $rDocs.Deleted
    $missing  = $rApi.Missing  + $rTests.Missing  + $rDocs.Missing

    Write-Host ''
    Write-Host "DONE：還原 $restored 檔、刪除 $deleted 檔（略過 $missing 檔，無備份也無現存檔）。" -ForegroundColor Green

    if ($KeepBackup) {
        Write-Host "      已保留 .checkpoint-backup\（-KeepBackup）。" -ForegroundColor DarkGray
    } else {
        Remove-Item -LiteralPath $backupRoot -Recurse -Force
        Write-Host '      已清除 .checkpoint-backup\。' -ForegroundColor DarkGray
    }

    Write-Host ''
    Write-Host '下一步：' -ForegroundColor Cyan
    Write-Host '  1. dotnet build（應與套用 checkpoint 前一致）' -ForegroundColor Gray
    Write-Host '  2. dotnet test（應回到範本基準，僅 Member 測試，49 個）' -ForegroundColor Gray
    Write-Host '  3. 若 docs\ 資料夾因此變空，可自行刪除該空資料夾（腳本不主動刪 docs\ 本身，只刪清單內的檔案）。' -ForegroundColor Gray
    exit 0
}
catch {
    Write-Host ("FAIL：{0}" -f $_.Exception.Message) -ForegroundColor Red
    exit 1
}
