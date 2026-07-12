# ============================================================================
# reset-template-data.ps1 — 重置範本開發資料（PostgreSQL / ai_crud_template）
#
# 做什麼：把開發庫 ai_crud_template 的 template_member 清空、SEQUENCE 歸位到 25。
#   本腳本「只清不種」——清完後，下一次啟動 API（dotnet run）會看到空表，
#   由 DbSeeder 自動重新灌回 24 筆種子（M-001~M-024）。
#
# 玩完範本後跑這支，資料就回到乾淨的 24 筆起點。
#
# 注意：
#   - 跑之前先「停掉 API」（沒有 dotnet run 連著開發庫），否則清除會跟寫入打架。
#   - 清完「必須重啟一次 API」種子才會回來（DbSeeder 只在空表時植入）。
#   - 測試庫 ai_crud_template_test 不受影響（測試每輪自己重建）。
#   - postgres / 12345 是課堂 DEMO 連線，切勿部署對外。
#
# 用法（PowerShell）：
#   .\reset-template-data.ps1
#   然後重啟 API：cd ..\2.5_sample_api\sample-api\src\CrudTemplate.Api; dotnet run --urls http://localhost:5080
# ============================================================================

$ErrorActionPreference = 'Stop'

# ── 連線參數（DEMO 值，依你的環境調整）──────────────────────────────
$pgHost = 'localhost'
$pgPort = '5432'
$pgUser = 'postgres'
$pgPassword = '12345'
$pgDatabase = 'ai_crud_template'   # 開發庫（清這個；測試庫不碰）

# ── 1) 找 psql.exe 絕對路徑（Windows 安裝的 PostgreSQL 預設不在 PATH）──
#    掃 C:\Program Files\PostgreSQL\<版號>\bin\psql.exe，取版號最高的一個。
$psql = $null
$pgRoot = 'C:\Program Files\PostgreSQL'
if (Test-Path $pgRoot) {
    $candidate = Get-ChildItem $pgRoot -Directory |
        Sort-Object { [int]($_.Name -replace '\D', '0') } -Descending |
        ForEach-Object { Join-Path $_.FullName 'bin\psql.exe' } |
        Where-Object { Test-Path $_ } |
        Select-Object -First 1
    if ($candidate) { $psql = $candidate }
}
# 後備：若已在 PATH 就直接用 psql
if (-not $psql) {
    $inPath = Get-Command psql -ErrorAction SilentlyContinue
    if ($inPath) { $psql = $inPath.Source }
}
if (-not $psql) {
    Write-Error "找不到 psql.exe。請確認 PostgreSQL 已安裝於 $pgRoot，或把 psql 加入 PATH。"
    exit 1
}
Write-Host "使用 psql：$psql" -ForegroundColor Cyan

# ── 2) 交易內清空 + SEQUENCE 歸位（BEGIN...COMMIT 保證不會清一半）──
#    整包不種子；DELETE 全部（不假設 id 一定是 M-### 遞增格式），交由 DbSeeder 重植。
$sql = @'
\set ON_ERROR_STOP on
BEGIN;
DELETE FROM template_member;
ALTER SEQUENCE template_member_seq RESTART WITH 25;
COMMIT;
SELECT COUNT(*) AS member_count FROM template_member;
'@

$env:PGPASSWORD = $pgPassword
try {
    Write-Host "清除 $pgDatabase 的 template_member 並將 SEQUENCE 歸位到 25 ..." -ForegroundColor Yellow
    $sql | & $psql -U $pgUser -h $pgHost -p $pgPort -d $pgDatabase -v ON_ERROR_STOP=1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "psql 執行失敗（exit $LASTEXITCODE）。常見原因：5432 沒開、帳密不符、資料庫不存在（尚未啟動過 API）。"
        exit 1
    }
}
finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "資料已清空（現在 template_member = 0 筆）。" -ForegroundColor Green
Write-Host "接著重啟一次 API，DbSeeder 會自動重新灌回 24 筆種子：" -ForegroundColor Green
Write-Host "  cd ..\2.5_sample_api\sample-api\src\CrudTemplate.Api" -ForegroundColor Gray
Write-Host "  dotnet run --urls http://localhost:5080" -ForegroundColor Gray
