<#
.SYNOPSIS
  驗證「換 composable 內部實作，呼叫端一行不改」這件事是真的。

.DESCRIPTION
  「呼叫端不用改」不是一句口號，它有可機器判定的定義：
    **對外匯出的東西，一個字都沒變。**

  本腳本比對 seam/useSurveyResponses.before.ts 與 .after.ts 的四樣東西：
    1. 所有 export 出去的名字（type / interface / function）
    2. SurveyResponse 介面的欄位清單（跟後端共用的契約）
    3. composable 回傳物件的 key（呼叫端 destructure 用的）
    4. composable 內每個 function 的簽章（參數型別與回傳型別）
  只要有一項不同，呼叫端就可能要改 —— 直接 exit 1。

  另外檢查：before 一定要有 TODO 接縫，after 一定不能還留著。

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\verify-seam.ps1

.EXAMPLE
  # 驗證你自己前端專案裡真正的那兩版
  .\verify-seam.ps1 -Before ..\..\my-frontend\composables\useSurveyResponses.ts.orig `
                    -After  ..\..\my-frontend\composables\useSurveyResponses.ts
#>
[CmdletBinding()]
param(
    [string]$Before,
    [string]$After
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not $Before) { $Before = Join-Path $PSScriptRoot 'seam\useSurveyResponses.before.ts' }
if (-not $After)  { $After  = Join-Path $PSScriptRoot 'seam\useSurveyResponses.after.ts' }

foreach ($p in @($Before, $After)) {
    if (-not (Test-Path -LiteralPath $p)) {
        Write-Host "FAIL: 找不到檔案 $p" -ForegroundColor Red
        exit 1
    }
}

# PS 5.1 預設用 ANSI 解 UTF-8，中文會吃掉換行導致行數全錯，必須指定 -Encoding UTF8
function Read-Src { param([string]$Path) return (Get-Content -LiteralPath $Path -Encoding UTF8) -join "`n" }

function Get-Exports {
    param([string]$Src)
    $names = [regex]::Matches($Src, '(?m)^export\s+(?:type|interface|const|function)\s+([A-Za-z0-9_]+)') |
             ForEach-Object { $_.Groups[1].Value }
    return @($names | Sort-Object -Unique)
}

function Get-ContractFields {
    param([string]$Src)
    $m = [regex]::Match($Src, '(?ms)^export\s+interface\s+SurveyResponse\s*\{(.*?)^\}')
    if (-not $m.Success) { return @() }
    $fields = [regex]::Matches($m.Groups[1].Value, '(?m)^\s*([A-Za-z0-9_]+)\s*\??\s*:') |
              ForEach-Object { $_.Groups[1].Value }
    return @($fields | Sort-Object -Unique)
}

function Get-ReturnKeys {
    param([string]$Src)
    $m = [regex]::Match($Src, '(?ms)export\s+function\s+useSurveyResponses\s*\(\s*\).*?\n\s*return\s*\{([^}]*)\}')
    if (-not $m.Success) { return @() }
    $keys = $m.Groups[1].Value -split ',' |
            ForEach-Object { ($_ -replace '(?s):.*$', '').Trim() } |
            Where-Object { $_ -ne '' }
    return @($keys | Sort-Object -Unique)
}

function Get-Signatures {
    param([string]$Src)
    # 抓 composable 內的 `async function 名稱(參數): 回傳型別 {`，空白正規化後比對
    $sigs = [regex]::Matches($Src, '(?m)^\s{2}async\s+function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*:\s*([^{]+)\{') |
            ForEach-Object {
                $args_ = ($_.Groups[2].Value -replace '\s+', ' ').Trim()
                $ret   = ($_.Groups[3].Value -replace '\s+', ' ').Trim()
                "$($_.Groups[1].Value)($args_): $ret"
            }
    return @($sigs | Sort-Object -Unique)
}

$srcBefore = Read-Src $Before
$srcAfter  = Read-Src $After

$checks = @(
    @{ Name = '對外匯出的名字';            Before = (Get-Exports        $srcBefore); After = (Get-Exports        $srcAfter) }
    @{ Name = 'SurveyResponse 契約欄位';   Before = (Get-ContractFields $srcBefore); After = (Get-ContractFields $srcAfter) }
    @{ Name = 'composable 回傳的 key';     Before = (Get-ReturnKeys     $srcBefore); After = (Get-ReturnKeys     $srcAfter) }
    @{ Name = '每個 function 的簽章';      Before = (Get-Signatures     $srcBefore); After = (Get-Signatures     $srcAfter) }
)

Write-Host ''
Write-Host '接縫驗證：換 composable 內部實作，呼叫端要一行都不用改' -ForegroundColor Cyan
Write-Host "  before : $Before" -ForegroundColor DarkGray
Write-Host "  after  : $After"  -ForegroundColor DarkGray
Write-Host ''

$failed = 0

foreach ($c in $checks) {
    if ($c.Before.Count -eq 0 -and $c.After.Count -eq 0) {
        Write-Host ("  [FAIL] {0}：兩邊都解析不到內容（檔案格式跟預期不同？）" -f $c.Name) -ForegroundColor Red
        $failed++
        continue
    }
    $diff = Compare-Object -ReferenceObject $c.Before -DifferenceObject $c.After
    if ($diff) {
        Write-Host ("  [FAIL] {0}：有 {1} 處不同 —— 呼叫端可能要改" -f $c.Name, $diff.Count) -ForegroundColor Red
        foreach ($d in $diff) {
            $side = if ($d.SideIndicator -eq '<=') { '只有 before 有' } else { '只有 after 有' }
            Write-Host ("      {0}：{1}" -f $side, $d.InputObject) -ForegroundColor Yellow
        }
        $failed++
    }
    else {
        Write-Host ("  [PASS] {0}：{1} 項完全相同" -f $c.Name, $c.Before.Count) -ForegroundColor Green
        foreach ($v in $c.Before) { Write-Host ("      {0}" -f $v) -ForegroundColor DarkGray }
    }
}

# 接縫本身：before 要有 TODO，after 要沒有
$todo = 'TODO: DEV 串接 POST /api/survey'
if ($srcBefore -notlike "*$todo*") {
    Write-Host "  [FAIL] before 版找不到接縫註解「$todo」" -ForegroundColor Red
    $failed++
}
else {
    Write-Host '  [PASS] before 版有接縫註解' -ForegroundColor Green
}
if ($srcAfter -like "*$todo*") {
    Write-Host "  [FAIL] after 版還留著 TODO —— 接縫沒有真的接上" -ForegroundColor Red
    $failed++
}
else {
    Write-Host '  [PASS] after 版已經沒有 TODO，接縫真的接上了' -ForegroundColor Green
}

Write-Host ''
if ($failed -gt 0) {
    Write-Host "共 $failed 項檢查不通過：這樣改下去，呼叫端（pages/*.vue）會被迫跟著改。" -ForegroundColor Red
    Write-Host '請把 after 版的對外介面改回跟 before 一模一樣，只動 function 內部。' -ForegroundColor Red
    exit 1
}

Write-Host 'PASS：對外介面完全沒變，pages/survey/*.vue 一行都不用改。' -ForegroundColor Green
Write-Host '這就是「前端留接縫」不是空話的證據。' -ForegroundColor Green
exit 0
