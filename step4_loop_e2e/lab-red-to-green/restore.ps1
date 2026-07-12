<#
.SYNOPSIS
    紅→綠 LOOP 練習：把 inject-bug.ps1 注入的 bug 還原。
.DESCRIPTION
    從本資料夾的 .lab-backup\ 取回原檔，覆蓋回被測 API，然後刪掉備份。
    若備份不存在（沒注入過或已還原），會提示如何確認乾淨（本專案不是 git repo，不用 git checkout）。

    在 lab-red-to-green 目錄執行（預設綁「學生工作區 my-equipment-api」，須與 inject-bug 一致）：
      powershell -ExecutionPolicy Bypass -File .\restore.ps1
    若注入時用了 -ApiDir／-UseCheckpoint，還原也要帶同一個對象：
      powershell -ExecutionPolicy Bypass -File .\restore.ps1 -ApiDir D:\path\to\my-equipment-api
      powershell -ExecutionPolicy Bypass -File .\restore.ps1 -UseCheckpoint
.PARAMETER ApiDir
    被測後端 API 專案根目錄。省略時預設綁 ..\..\step3_new_module\my-equipment-api。
.PARAMETER UseCheckpoint
    未指定 -ApiDir 時，改綁官方參考解 ..\..\step3_new_module\solution-api。
#>
param(
    [string] $ApiDir,
    [switch] $UseCheckpoint
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$labDir     = $PSScriptRoot
$StudentApiDir    = [System.IO.Path]::GetFullPath((Join-Path $labDir '..\..\step3_new_module\my-equipment-api'))
$CheckpointApiDir = [System.IO.Path]::GetFullPath((Join-Path $labDir '..\..\step3_new_module\solution-api'))
if ($ApiDir) {
    $ApiDir = [System.IO.Path]::GetFullPath($ApiDir)
} elseif ($UseCheckpoint) {
    $ApiDir = $CheckpointApiDir
} else {
    $ApiDir = $StudentApiDir
}
$targetFile = [System.IO.Path]::GetFullPath((Join-Path $ApiDir 'src\CrudTemplate.Api\Models\EquipmentItemRequest.cs'))
$backupDir  = Join-Path $labDir '.lab-backup'
$backupFile = Join-Path $backupDir 'EquipmentItemRequest.cs'

try {
    Write-Host '=== 還原練習 bug ===' -ForegroundColor Cyan
    Write-Host "  還原對象（resolved）：$ApiDir" -ForegroundColor Gray

    if (-not [System.IO.File]::Exists($backupFile)) {
        Write-Host 'SKIP：找不到備份（.lab-backup\EquipmentItemRequest.cs）——可能沒注入過，或已經還原過了。' -ForegroundColor Yellow
        Write-Host '      本專案不是 git repo，無法用 git checkout 還原。確認乾淨的方式：' -ForegroundColor Yellow
        Write-Host "      打開 $targetFile，確認 Qty 上方那行 [Range(0, int.MaxValue, ...)] 未被註解即為乾淨。" -ForegroundColor Gray
        exit 0
    }

    [System.IO.File]::Copy($backupFile, $targetFile, $true)
    # File.Copy 會沿用備份檔的舊時間戳 → dotnet 的「增量建置」會誤判來源沒變、跳過重建，
    # 導致 restore 後 dotnet test 仍跑到「注入時建好的舊 DLL」而假紅。把寫入時間戳更新為現在，強制重建。
    (Get-Item -LiteralPath $targetFile).LastWriteTime = Get-Date
    [System.IO.File]::Delete($backupFile)
    if ((Get-ChildItem -LiteralPath $backupDir -Force | Measure-Object).Count -eq 0) {
        Remove-Item -LiteralPath $backupDir -Force
    }

    Write-Host 'DONE：已從備份還原 EquipmentItemRequest.cs，並清除備份。' -ForegroundColor Green
    Write-Host ''
    Write-Host '下一步：再跑一次後端測試，確認回到全綠：' -ForegroundColor Cyan
    Write-Host "  cd `"$ApiDir`"" -ForegroundColor Gray
    Write-Host '  dotnet test --filter "FullyQualifiedName~EquipmentValidationTests"' -ForegroundColor Gray
    exit 0
}
catch {
    Write-Host ("FAIL：非預期錯誤：{0}" -f $_.Exception.Message) -ForegroundColor Red
    exit 1
}
