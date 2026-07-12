<#
.SYNOPSIS
    紅→綠 LOOP 練習：對後端參考解 solution-api 注入「一個可控真實 bug」。
.DESCRIPTION
    做法：把 DTO EquipmentItemRequest 的「數量下限」驗證（[Range(0, ...)]）註解掉。
    效果：qty = 負值（例如 -1 / -5）不再被攔下 → 後端單元測試
          EquipmentValidationTests.EV4_數量負值_失敗 會變紅（它就是在驗這個下限）。

    這是一個「真實的 App（後端驗證規則）bug」——不是把測試選擇器打錯，
    所以判因時要能認出「是後端規則被改壞，不是測試壞了、不是資料庫壞了」。

    安全機制：
      - 改檔前先把原檔完整備份到本資料夾的 .lab-backup\（byte 精準複製）。
      - 用「精準字串替換」，找不到目標字串就 exit 1（多半是已注入過，或檔案被改過）。
      - 維持原檔 UTF-8 無 BOM，不動其他任何檔。
      - 還原請跑 restore.ps1。

    在 lab-red-to-green 目錄執行（預設綁「學生工作區 my-equipment-api」）：
      powershell -ExecutionPolicy Bypass -File .\inject-bug.ps1
    指定被測 API 或走官方參考解 fallback：
      powershell -ExecutionPolicy Bypass -File .\inject-bug.ps1 -ApiDir D:\path\to\my-equipment-api
      powershell -ExecutionPolicy Bypass -File .\inject-bug.ps1 -UseCheckpoint
.PARAMETER ApiDir
    被測後端 API 專案根目錄。省略時預設綁 ..\..\step3_new_module\my-equipment-api。
.PARAMETER UseCheckpoint
    未指定 -ApiDir 時，改綁官方參考解 ..\..\step3_new_module\solution-api 當 fallback。
.NOTES
    只動被測 API 的 src\CrudTemplate.Api\Models\EquipmentItemRequest.cs。
#>
param(
    [string] $ApiDir,
    [switch] $UseCheckpoint
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$labDir     = $PSScriptRoot
# 被測 API 解析：預設綁學生工作區 my-equipment-api；官方參考解只在 -UseCheckpoint 時 fallback。
$StudentApiDir    = [System.IO.Path]::GetFullPath((Join-Path $labDir '..\..\step3_new_module\my-equipment-api'))
$CheckpointApiDir = [System.IO.Path]::GetFullPath((Join-Path $labDir '..\..\step3_new_module\solution-api'))
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
        Write-Host '      預設綁學生工作區 my-equipment-api。請先完成 Step 3，' -ForegroundColor Yellow
        Write-Host '      或用 -UseCheckpoint 走官方參考解 fallback，或用 -ApiDir 指定路徑。' -ForegroundColor Yellow
    }
    exit 1
}
$targetFile = [System.IO.Path]::GetFullPath((Join-Path $ApiDir 'src\CrudTemplate.Api\Models\EquipmentItemRequest.cs'))
$backupDir  = Join-Path $labDir '.lab-backup'
$backupFile = Join-Path $backupDir 'EquipmentItemRequest.cs'

# ── 精準字串替換：把 qty 下限驗證註解掉 ──
$target      = '    [Range(0, int.MaxValue, ErrorMessage = "數量不可小於 0")]'
$replacement = '    // [Range(0, int.MaxValue, ErrorMessage = "數量不可小於 0")] // ← LAB 注入：下限驗證被移除，EV4 會變紅'

try {
    Write-Host '=== 注入練習 bug：移除「數量下限（不可小於 0）」驗證 ===' -ForegroundColor Cyan
    if ($UsingCheckpoint) {
        Write-Host '【注入對象＝官方參考解（checkpoint fallback）】' -ForegroundColor Yellow
    } else {
        Write-Host '【注入對象＝學生工作區（my-equipment-api / 指定的 -ApiDir）】' -ForegroundColor Green
    }
    Write-Host "  被測 API（resolved）：$ApiDir" -ForegroundColor Gray

    if (-not [System.IO.File]::Exists($targetFile)) {
        Write-Host "FAIL：找不到目標檔：$targetFile" -ForegroundColor Red
        exit 1
    }

    $utf8 = [System.Text.Encoding]::UTF8
    $text = [System.IO.File]::ReadAllText($targetFile, $utf8)

    if (-not $text.Contains($target)) {
        if ($text.Contains($replacement)) {
            Write-Host 'SKIP：看起來已經注入過了（找不到原始的 [Range] 規則，卻找到被註解後的樣子）。' -ForegroundColor Yellow
            Write-Host '      要回到乾淨狀態請先跑：powershell -ExecutionPolicy Bypass -File .\restore.ps1' -ForegroundColor Yellow
        } else {
            Write-Host 'FAIL：找不到要替換的目標字串（qty 的 [Range] 那一行）。' -ForegroundColor Red
            Write-Host '      可能檔案已被改過，或已注入過。請確認 EquipmentItemRequest.cs 是乾淨參考解狀態。' -ForegroundColor Yellow
        }
        exit 1
    }

    if (-not (Test-Path -LiteralPath $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir | Out-Null
    }
    [System.IO.File]::Copy($targetFile, $backupFile, $true)

    # 精準替換並寫回（維持 UTF-8 無 BOM，與原檔一致）
    $patched = $text.Replace($target, $replacement)
    $noBom   = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($targetFile, $patched, $noBom)
    # 更新寫入時間戳，確保 dotnet 增量建置一定會重建（避免假紅／假綠）
    (Get-Item -LiteralPath $targetFile).LastWriteTime = Get-Date

    Write-Host 'DONE：已把「數量下限」驗證註解掉。' -ForegroundColor Green
    Write-Host "      原檔已備份到：$backupFile" -ForegroundColor DarkGray
    Write-Host ''
    Write-Host '下一步：' -ForegroundColor Cyan
    Write-Host '  1. 跑後端測試看它變紅（針對 Equipment 驗證測試，較快）：' -ForegroundColor Gray
    Write-Host "       cd `"$ApiDir`"" -ForegroundColor Gray
    Write-Host '       dotnet test --filter "FullyQualifiedName~EquipmentValidationTests"' -ForegroundColor Gray
    Write-Host '     預期 EV4（數量負值_失敗）會紅：拿掉下限後，qty=-1 竟通過驗證。' -ForegroundColor Gray
    Write-Host "  2. 練完還原：powershell -ExecutionPolicy Bypass -File .\restore.ps1$(if ($ApiDir -ne $StudentApiDir) { ' -ApiDir `"' + $ApiDir + '`"' })" -ForegroundColor Gray
    exit 0
}
catch {
    Write-Host ("FAIL：非預期錯誤：{0}" -f $_.Exception.Message) -ForegroundColor Red
    exit 1
}
