<#
.SYNOPSIS
  驗證「換 composable 內部實作，呼叫端一行不改」這件事是真的。

.DESCRIPTION
  「呼叫端不用改」不是一句口號，它有可機器判定的定義：
    **對外匯出的東西，一個字都沒變。**

  本腳本分兩關，兩關都過才 PASS（exit 0），任一項不過就 FAIL（exit 1）。

  第 1 關｜before 是不是前端課真的在用的那一份
    比對前端課 repo 的
      step6_survey\solution\survey-app\composables\useSurveyResponses.ts
    與 seam\useSurveyResponses.before.ts，要逐字相同
    （只忽略換行符號 CRLF／LF 與檔頭 BOM 的差異）。
    找不到前端課 repo 時：預設標 SKIP（沒上過前端課也能做）；加 -Strict 就算 FAIL。
    你用 -Before 指定自己的檔、又沒指定 -FrontendRepo／-FrontendFile 時，這一關自動略過。

  第 2 關｜after 的對外介面有沒有跟 before 一模一樣
    1. 所有 export 出去的名字
    2. 每個 export type／interface 的完整定義（含欄位型別與單選值）
    3. SurveyResponse 契約欄位（名稱: 型別，就是跟後端共用的那 10 欄）
    4. 每個 export const 的值（下拉選項、字數上限）
    5. 每個 export function 的簽章
    6. useSurveyResponses() 回傳的 key（呼叫端 destructure 用的）
    7. 回傳的每個值長什麼樣（async function 的簽章；computed／ref 的種類）
    8. 接縫註解：before 一定要有 TODO，after 一定不能還留著
  比對前會先拿掉註解、把連續空白縮成一格，所以只改註解不會誤判。

.PARAMETER FrontendRepo
  前端課 repo 的資料夾。預設：本腳本所在資料夾往上兩層的 AI_CRUD_Workshop_Frontend_EASY
  （也就是跟後端課 repo 放在同一層）。

.PARAMETER FrontendFile
  直接指定前端真檔的路徑（優先於 -FrontendRepo）。

.PARAMETER Before
  接後端「之前」的 composable。預設 seam\useSurveyResponses.before.ts。

.PARAMETER After
  接後端「之後」的 composable。預設 seam\useSurveyResponses.after.ts。

.PARAMETER Strict
  找不到前端真檔時算 FAIL（預設是 SKIP）。給講師／維護者用。

.EXAMPLE
  # 預設：前端課 repo 跟後端課 repo 放在同一層
  powershell -ExecutionPolicy Bypass -File .\step6_survey_api\verify-seam.ps1

.EXAMPLE
  # 前端課 repo 放在別的地方
  powershell -ExecutionPolicy Bypass -File .\step6_survey_api\verify-seam.ps1 -FrontendRepo D:\code\AI_CRUD_Workshop_Frontend_EASY

.EXAMPLE
  # 驗你自己前端專案裡真正的那兩版（第 1 關自動略過）
  .\step6_survey_api\verify-seam.ps1 -Before ..\my-survey-app\useSurveyResponses.ts.orig `
                                     -After  ..\my-survey-app\composables\useSurveyResponses.ts
#>
[CmdletBinding()]
param(
    [string]$FrontendRepo,
    [string]$FrontendFile,
    [string]$Before,
    [string]$After,
    [switch]$Strict
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }

$FrontendRelPath = 'step6_survey\solution\survey-app\composables\useSurveyResponses.ts'
$userGaveBefore   = $PSBoundParameters.ContainsKey('Before')
$userGaveFrontend = $PSBoundParameters.ContainsKey('FrontendRepo') -or $PSBoundParameters.ContainsKey('FrontendFile')

function Get-FullPath {
    param([string]$Path)
    if ([System.IO.Path]::IsPathRooted($Path)) { return [System.IO.Path]::GetFullPath($Path) }
    return [System.IO.Path]::GetFullPath((Join-Path (Get-Location).ProviderPath $Path))
}

if (-not $FrontendRepo) { $FrontendRepo = Join-Path $PSScriptRoot '..\..\AI_CRUD_Workshop_Frontend_EASY' }
if (-not $FrontendFile) { $FrontendFile = Join-Path $FrontendRepo $FrontendRelPath }
if (-not $Before)       { $Before = Join-Path $PSScriptRoot 'seam\useSurveyResponses.before.ts' }
if (-not $After)        { $After  = Join-Path $PSScriptRoot 'seam\useSurveyResponses.after.ts' }

$FrontendFile = Get-FullPath $FrontendFile
$Before       = Get-FullPath $Before
$After        = Get-FullPath $After

foreach ($p in @($Before, $After)) {
    if (-not (Test-Path -LiteralPath $p -PathType Leaf)) {
        Write-Host "FAIL: 找不到檔案 $p" -ForegroundColor Red
        exit 1
    }
}

# ── 讀檔與前處理 ─────────────────────────────────────────────

# 用 .NET 讀 UTF-8（PS 5.1 的 Get-Content 預設用 ANSI 解碼，中文會壞）；去 BOM、CRLF 一律轉 LF
function Read-Src {
    param([string]$Path)
    $text = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
    $text = $text.TrimStart([char]0xFEFF)
    return ($text -replace "`r`n", "`n")
}

# 拿掉 /* */ 與 // 註解（// 前面要是行首或空白，避免誤砍 'http://' 這類字串）
function Remove-Comments {
    param([string]$Src)
    $s = [regex]::Replace($Src, '(?s)/\*.*?\*/', '')
    $s = [regex]::Replace($s, '(?m)(^|[ \t])//[^\n]*', '$1')
    return $s
}

function Get-Normalized {
    param([string]$Text)
    return (($Text -replace '\s+', ' ').Trim()).TrimEnd(';').Trim()
}

function Get-BracketDepth {
    param([string]$Text)
    return ([regex]::Matches($Text, '[\{\[\(]')).Count - ([regex]::Matches($Text, '[\}\]\)]')).Count
}

# 抓所有頂層 export 宣告。回傳 [pscustomobject]@{ Kind; Name; Text }
#   function：只取簽章（到函式本體的 { 之前）
#   其他：取完整宣告（用括號深度判斷宣告在哪一行結束）
function Get-ExportDecls {
    param([string]$Src)
    $lines = $Src -split "`n"
    $decls = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $m = [regex]::Match($lines[$i], '^export\s+(?:declare\s+)?(type|interface|const|let|enum|class|async\s+function|function)\s+([A-Za-z0-9_$]+)')
        if (-not $m.Success) { continue }
        $kind = $m.Groups[1].Value -replace '\s+', ' '
        $name = $m.Groups[2].Value
        $buf  = $lines[$i]
        $j    = $i

        if ($kind -like '*function') {
            $sigPattern = '^(export\s+(?:async\s+)?function\s+[A-Za-z0-9_$]+\s*(?:<[^>]*>)?\s*\([^)]*\)\s*(?::\s*[^{]+?)?)\s*\{'
            while (-not [regex]::IsMatch($buf, $sigPattern) -and ($j + 1) -lt $lines.Count) {
                $j++
                $buf += "`n" + $lines[$j]
            }
            $sig = [regex]::Match($buf, $sigPattern)
            $text = if ($sig.Success) { $sig.Groups[1].Value } else { $buf }
        }
        else {
            $depth = Get-BracketDepth $buf
            while (($j + 1) -lt $lines.Count) {
                $next = $lines[$j + 1].Trim()
                $tail = $buf.TrimEnd()
                $continues = ($depth -gt 0) -or
                             $next.StartsWith('|') -or $next.StartsWith('&') -or
                             $tail.EndsWith('=') -or $tail.EndsWith('|') -or $tail.EndsWith('&')
                if (-not $continues) { break }
                $j++
                $buf   += "`n" + $lines[$j]
                $depth += Get-BracketDepth $lines[$j]
            }
            $text = $buf
        }
        $decls += [pscustomobject]@{ Kind = $kind; Name = $name; Text = (Get-Normalized $text) }
        $i = $j
    }
    return $decls
}

function Get-ContractFields {
    param([string]$Src)
    $m = [regex]::Match($Src, '(?ms)^export\s+interface\s+SurveyResponse\s*\{(.*?)^\}')
    if (-not $m.Success) { return @() }
    $fields = [regex]::Matches($m.Groups[1].Value, '(?m)^\s*([A-Za-z0-9_]+)(\??)\s*:\s*(.+?)\s*[;,]?\s*$') |
              ForEach-Object { '{0}{1}: {2}' -f $_.Groups[1].Value, $_.Groups[2].Value, (Get-Normalized $_.Groups[3].Value) }
    return @($fields)
}

# 取 useSurveyResponses() 的函式本體（用大括號深度找到對應的結尾）
function Get-ComposableBody {
    param([string]$Src)
    $m = [regex]::Match($Src, '(?m)^export\s+(?:async\s+)?function\s+useSurveyResponses\s*\([^)]*\)[^{]*\{')
    if (-not $m.Success) { return $null }
    $start = $m.Index + $m.Length
    $depth = 1
    for ($k = $start; $k -lt $Src.Length; $k++) {
        $ch = $Src[$k]
        if ($ch -eq '{') { $depth++ }
        elseif ($ch -eq '}') {
            $depth--
            if ($depth -eq 0) { return $Src.Substring($start, $k - $start) }
        }
    }
    return $Src.Substring($start)
}

# useSurveyResponses() 最後那個 return { ... }：回傳 [pscustomobject]@{ Key = 呼叫端看到的名字; Local = 內部變數名 }
#   { submit }            → Key=submit,  Local=submit
#   { records: responses } → Key=records, Local=responses
function Get-ReturnEntries {
    param([string]$Body)
    if ($null -eq $Body) { return @() }
    $ms = [regex]::Matches($Body, '(?m)^ {2}return\s*\{([^}]*)\}')
    if ($ms.Count -eq 0) { return @() }
    $entries = @()
    foreach ($part in ($ms[$ms.Count - 1].Groups[1].Value -split ',')) {
        $p = $part.Trim()
        if ($p -eq '') { continue }
        $kv = $p -split ':', 2
        $key = $kv[0].Trim()
        $local = if ($kv.Count -gt 1) { $kv[1].Trim() } else { $key }
        $entries += [pscustomobject]@{ Key = $key; Local = $local }
    }
    return $entries
}

# 回傳的每個值長什麼樣：function → 簽章；const／let → 用哪個函式建出來（computed、ref…）
function Get-MemberShapes {
    param([string]$Body, $Entries)
    $shapes = @()
    foreach ($e in @($Entries)) {
        $key = $e.Key
        $k = [regex]::Escape($e.Local)
        $fn = [regex]::Match($Body, '(?m)^ {2}(async\s+)?function\s+' + $k + '\s*\(([^)]*)\)\s*(?::\s*([^{]+?))?\s*\{')
        if ($fn.Success) {
            $async  = if ($fn.Groups[1].Success) { 'async ' } else { '' }
            $params = Get-Normalized $fn.Groups[2].Value
            $ret    = if ($fn.Groups[3].Success) { ': ' + (Get-Normalized $fn.Groups[3].Value) } else { '' }
            $shapes += "$async$key($params)$ret"
            continue
        }
        $cv = [regex]::Match($Body, '(?m)^ {2}(?:const|let)\s+' + $k + '\s*(?::\s*([^=]+?))?\s*=\s*([A-Za-z0-9_$.]+)')
        if ($cv.Success) {
            $annot = if ($cv.Groups[1].Success) { ': ' + (Get-Normalized $cv.Groups[1].Value) } else { '' }
            $shapes += "$key$annot = $($cv.Groups[2].Value)(...)"
            continue
        }
        $shapes += "${key}: （在 composable 裡找不到 $($e.Local) 的宣告）"
    }
    return @($shapes)
}

# ── 輸出工具 ─────────────────────────────────────────────────

$script:failed  = 0
$script:skipped = 0

function Write-Pass { param([string]$Msg) Write-Host "  [PASS] $Msg" -ForegroundColor Green }
function Write-Fail { param([string]$Msg) Write-Host "  [FAIL] $Msg" -ForegroundColor Red; $script:failed++ }
function Write-Skip { param([string]$Msg) Write-Host "  [SKIP] $Msg" -ForegroundColor Yellow; $script:skipped++ }
function Write-Detail { param([string]$Msg, [string]$Color = 'DarkGray') Write-Host "      $Msg" -ForegroundColor $Color }

function Compare-List {
    param([string]$Name, [string[]]$BeforeList, [string[]]$AfterList, [switch]$KeepOrder, [switch]$AllowEmpty)
    $b = @($BeforeList | Where-Object { $null -ne $_ })
    $a = @($AfterList  | Where-Object { $null -ne $_ })
    if ($b.Count -eq 0 -and $a.Count -eq 0) {
        # 這一類本來就可以沒有（例如沒有 export const）→ 兩邊都沒有就是相同；
        # 一定要有的（匯出名字、契約欄位、回傳 key）兩邊都抓不到 → 多半是檔案格式跟預期不同
        if ($AllowEmpty) { Write-Pass "${Name}：兩邊都沒有（0 項）" }
        else { Write-Fail "${Name}：兩邊都解析不到內容（檔案格式跟預期不同？）" }
        return
    }
    if (-not $KeepOrder) {
        $b = @($b | Sort-Object)
        $a = @($a | Sort-Object)
    }
    $onlyB = @($b | Where-Object { $a -cnotcontains $_ })
    $onlyA = @($a | Where-Object { $b -cnotcontains $_ })
    if ($onlyB.Count -eq 0 -and $onlyA.Count -eq 0 -and $b.Count -eq $a.Count) {
        Write-Pass ("{0}：{1} 項完全相同" -f $Name, $b.Count)
        foreach ($v in $b) { Write-Detail $v }
        return
    }
    Write-Fail ("{0}：有 {1} 處不同 —— 呼叫端可能要改" -f $Name, ($onlyB.Count + $onlyA.Count))
    foreach ($v in $onlyB) { Write-Detail "只有 before 有：$v" 'Yellow' }
    foreach ($v in $onlyA) { Write-Detail "只有 after 有 ：$v" 'Yellow' }
}

# ── 開始 ────────────────────────────────────────────────────

Write-Host ''
Write-Host '接縫驗證：換 composable 內部實作，呼叫端要一行都不用改' -ForegroundColor Cyan
Write-Host "  前端真檔 : $FrontendFile" -ForegroundColor DarkGray
Write-Host "  before   : $Before" -ForegroundColor DarkGray
Write-Host "  after    : $After"  -ForegroundColor DarkGray

$srcBefore = Read-Src $Before
$srcAfter  = Read-Src $After

# ── 第 1 關：前端真檔 ↔ before ───────────────────────────────
Write-Host ''
Write-Host '第 1 關｜before 是不是前端課真的在用的那一份' -ForegroundColor Cyan

if ($userGaveBefore -and -not $userGaveFrontend) {
    Write-Skip '你用 -Before 指定了自己的檔，不跟前端課的範例真檔比'
}
elseif (-not (Test-Path -LiteralPath $FrontendFile -PathType Leaf)) {
    $msg = "找不到前端真檔：$FrontendFile"
    if ($Strict) { Write-Fail "$msg（-Strict 模式視為失敗）" }
    else {
        Write-Skip "$msg"
        Write-Detail '沒上過前端課可以略過；有的話用 -FrontendRepo <前端課 repo 資料夾> 指過去'
    }
}
else {
    $srcFront = Read-Src $FrontendFile
    if ([string]::Equals($srcFront, $srcBefore, [System.StringComparison]::Ordinal)) {
        $lineCount = ($srcFront.TrimEnd("`n") -split "`n").Count
        Write-Pass "前端真檔與 before 逐字相同（$lineCount 行，忽略 CRLF／LF 與 BOM）"
    }
    else {
        $fl = $srcFront -split "`n"
        $bl = $srcBefore -split "`n"
        $max = [Math]::Max($fl.Count, $bl.Count)
        $at = -1
        for ($n = 0; $n -lt $max; $n++) {
            $x = if ($n -lt $fl.Count) { $fl[$n] } else { '（檔案已結束）' }
            $y = if ($n -lt $bl.Count) { $bl[$n] } else { '（檔案已結束）' }
            if (-not [string]::Equals($x, $y, [System.StringComparison]::Ordinal)) { $at = $n; break }
        }
        Write-Fail '前端真檔與 before 不一樣 —— 後端課拿來當契約的，不是前端真的在用的那一份'
        if ($at -ge 0) {
            Write-Detail ("第一處不同在第 {0} 行：" -f ($at + 1)) 'Yellow'
            Write-Detail ("前端真檔：{0}" -f $(if ($at -lt $fl.Count) { $fl[$at] } else { '（檔案已結束）' })) 'Yellow'
            Write-Detail ("before  ：{0}" -f $(if ($at -lt $bl.Count) { $bl[$at] } else { '（檔案已結束）' })) 'Yellow'
        }
        Write-Detail '修法：把前端真檔整份複製成 seam\useSurveyResponses.before.ts，再回頭對齊 after.ts' 'Yellow'
    }
}

# ── 第 2 關：before ↔ after 的對外介面 ────────────────────────
Write-Host ''
Write-Host '第 2 關｜after 的對外介面有沒有跟 before 一模一樣' -ForegroundColor Cyan

$codeBefore = Remove-Comments $srcBefore
$codeAfter  = Remove-Comments $srcAfter

$declBefore = @(Get-ExportDecls $codeBefore)
$declAfter  = @(Get-ExportDecls $codeAfter)

function Select-Decl {
    param($Decls, [string[]]$Kinds)
    return @($Decls | Where-Object { $Kinds -contains $_.Kind } | ForEach-Object { $_.Text })
}

Compare-List -Name '1. 對外匯出的名字' `
    -BeforeList @($declBefore | ForEach-Object { "$($_.Kind) $($_.Name)" }) `
    -AfterList  @($declAfter  | ForEach-Object { "$($_.Kind) $($_.Name)" })

Compare-List -Name '2. export type／interface 的完整定義' -AllowEmpty `
    -BeforeList (Select-Decl $declBefore @('type', 'interface', 'enum')) `
    -AfterList  (Select-Decl $declAfter  @('type', 'interface', 'enum'))

Compare-List -Name '3. SurveyResponse 契約欄位（跟後端共用）' -KeepOrder `
    -BeforeList (Get-ContractFields $codeBefore) `
    -AfterList  (Get-ContractFields $codeAfter)

Compare-List -Name '4. export const 的值' -AllowEmpty `
    -BeforeList (Select-Decl $declBefore @('const', 'let')) `
    -AfterList  (Select-Decl $declAfter  @('const', 'let'))

Compare-List -Name '5. export function 的簽章' -AllowEmpty `
    -BeforeList (Select-Decl $declBefore @('function', 'async function')) `
    -AfterList  (Select-Decl $declAfter  @('function', 'async function'))

$bodyBefore = Get-ComposableBody $codeBefore
$bodyAfter  = Get-ComposableBody $codeAfter
$retBefore  = @(Get-ReturnEntries $bodyBefore)
$retAfter   = @(Get-ReturnEntries $bodyAfter)

Compare-List -Name '6. useSurveyResponses() 回傳的 key' `
    -BeforeList @($retBefore | ForEach-Object { $_.Key }) `
    -AfterList  @($retAfter  | ForEach-Object { $_.Key })

Compare-List -Name '7. 回傳的每個值長什麼樣' `
    -BeforeList $(if ($null -ne $bodyBefore) { Get-MemberShapes $bodyBefore $retBefore } else { @() }) `
    -AfterList  $(if ($null -ne $bodyAfter)  { Get-MemberShapes $bodyAfter  $retAfter  } else { @() })

# 8. 接縫本身：before 要有 TODO，after 要沒有（用原始碼比，註解也算）
$todo = 'TODO: DEV 串接 POST /api/survey'
if ($srcBefore.Contains($todo)) { Write-Pass "8a. before 版有接縫註解「$todo」" }
else { Write-Fail "8a. before 版找不到接縫註解「$todo」" }
if ($srcAfter.Contains($todo)) { Write-Fail '8b. after 版還留著 TODO —— 接縫沒有真的接上' }
else { Write-Pass '8b. after 版已經沒有 TODO，接縫真的接上了' }

# ── 結論 ────────────────────────────────────────────────────
Write-Host ''
if ($script:failed -gt 0) {
    Write-Host "FAIL：共 $($script:failed) 項檢查不通過。" -ForegroundColor Red
    Write-Host '第 1 關不過：before.ts 跟前端課真檔不一樣，請重新複製真檔。' -ForegroundColor Red
    Write-Host '第 2 關不過：這樣改下去，呼叫端（pages/survey/*.vue）會被迫跟著改；請把 after 的對外介面改回跟 before 一模一樣，只動函式內部。' -ForegroundColor Red
    exit 1
}

if ($script:skipped -gt 0) {
    Write-Host "PASS（有 $($script:skipped) 項略過，見上方 [SKIP]）：對外介面完全沒變，pages/survey/*.vue 一行都不用改。" -ForegroundColor Green
}
else {
    Write-Host 'PASS：before 就是前端課的真檔，after 的對外介面完全沒變，pages/survey/*.vue 一行都不用改。' -ForegroundColor Green
}
Write-Host '這就是「前端留接縫」不是空話的證據。' -ForegroundColor Green
exit 0
