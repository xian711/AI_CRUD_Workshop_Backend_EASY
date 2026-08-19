<#
.SYNOPSIS
  掃描教材 Markdown，擋下「學生會直接複製、但實跑會失敗」的指令。

.DESCRIPTION
  這支腳本只檢查「可機器判定的命令語意錯誤」，不檢查文意。
  規則來自 2026-07-15 評估報告 P1-1／P2-2 實測到的真實失敗案例。
  指令類規則（Scope='command'）只比對學生會整段複製的內容——圍籬 code block 內每行、
  行內反引號 code span——因此解說文字提到指令名稱不會被誤判。
  埠號類規則（Scope='line'）比對整行，因為散文中的裸 URL 也會被照著開。
  任一規則命中即 exit 1，適合掛 CI。

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\verify-doc-commands.ps1
#>
[CmdletBinding()]
param(
    # 掃描根目錄，預設為腳本所在目錄
    [string]$Root
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# 注意：param() 預設值裡的 $PSScriptRoot 會解析成 profile 目錄而非腳本目錄，必須在主體取值
if (-not $Root) { $Root = $PSScriptRoot }

# 只掃 git 追蹤的 .md：避免掃到 gitignore 的學生工作區與 node_modules
Push-Location $Root
try {
    # core.quotepath=off + UTF8 console：否則中文檔名會變成 \344\275\277 escape 或亂碼
    # 不用 2>$null：PS 5.1 會把原生指令的 stderr 包成 NativeCommandError 而中斷
    $prevEncoding = [Console]::OutputEncoding
    try {
        [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
        $tracked = @(git -c core.quotepath=off ls-files '*.md')
    }
    finally {
        [Console]::OutputEncoding = $prevEncoding
    }
    if ($LASTEXITCODE -ne 0 -or $tracked.Count -eq 0) {
        Write-Host 'FAIL: 無法取得 git 追蹤的 Markdown 清單（此腳本需在 git repo 內執行）' -ForegroundColor Red
        exit 1
    }
}
finally {
    Pop-Location
}

# 若有教材刻意記錄「錯誤示範原文」，把檔名加進這裡，否則永遠紅燈
# （2026-08-19：原本排除的 EVALUATION_REPORT_2026-07-15.md 已併入 BUILD_LOG.md，新檔不含錯誤示範原文）
$excluded = @()

$files = $tracked |
    Where-Object { $excluded -notcontains (Split-Path $_ -Leaf) } |
    ForEach-Object { Join-Path $Root $_ } |
    Where-Object { Test-Path -LiteralPath $_ }

# 規則只驗「學生會整段複製的指令」，因此比對對象是「單一指令字串」：
# 圍籬 code block 的每一行，或行內反引號 code span 的內容。
# 這樣解說文字裡分開出現的 `Select-String` 與 `-Recurse` 不會被誤判為壞指令。
$rules = @(
    @{
        Name  = 'Select-String -Recurse'
        Why   = 'Select-String 沒有 -Recurse 參數，實跑會拋「找不到參數 Recurse」'
        Fix   = "Get-ChildItem <dir> -Recurse -File | Select-String -Pattern '...'"
        Scope = 'command'
        # 語意判定：-Recurse 出現在最後一個 Select-String 之後，才是傳給 Select-String 的錯誤參數。
        # Get-ChildItem -Recurse | Select-String 是正確的，不能誤殺。
        Test = {
            param($cmd)
            $i = $cmd.LastIndexOf('Select-String')
            $i -ge 0 -and $cmd.IndexOf('-Recurse', $i) -ge 0
        }
    },
    @{
        Name  = 'dotnet run --project src（缺專案資料夾）'
        Why   = 'src 底下沒有 csproj，實跑會回「找不到要執行的專案」'
        Fix   = 'dotnet run --project src\CrudTemplate.Api --urls http://localhost:5080'
        Scope = 'command'
        Test = {
            param($cmd)
            $cmd -match 'dotnet run --project src(?![\\/\w])'
        }
    },
    @{
        Name  = '前端埠號 3000／3001'
        Why   = '本工作坊前端固定 3100（fullchain-app/nuxt.config.ts devServer.port），照抄 3000 會連不到'
        Fix   = 'localhost:3100'
        # 這條連散文也要查：正文裡的裸 URL <http://localhost:3000/...> 同樣會被學生照著開
        Scope = 'line'
        Test = {
            param($cmd)
            $cmd -match 'localhost:300[01]'
        }
    }
)

# 從一行 Markdown 取出比對對象。
# 預設只取「學生會整段複製的指令」；Scope='line' 的規則則比對整行（涵蓋散文中的裸 URL）。
function Get-CommandSpans {
    param([string]$Line, [bool]$InFence, [string]$Scope)

    if ($Scope -eq 'line') { return @($Line) }
    if ($InFence) { return @($Line) }

    # 行內 code span：`...`
    $spans = [regex]::Matches($Line, '`([^`]+)`') | ForEach-Object { $_.Groups[1].Value }
    return @($spans)
}

$violations = @()

foreach ($file in $files) {
    # 必須指定 -Encoding UTF8：PS 5.1 預設用 ANSI 解 UTF-8，中文位元組會吃掉換行，
    # 導致行數與行號全錯（實測同一檔 132 行 vs 正確 157 行）
    $lines = @(Get-Content -LiteralPath $file -Encoding UTF8)
    $inFence = $false

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]

        if ($line -match '^\s*```') {
            $inFence = -not $inFence
            continue
        }

        foreach ($rule in $rules) {
            foreach ($cmd in (Get-CommandSpans -Line $line -InFence $inFence -Scope $rule.Scope)) {
                if (& $rule.Test $cmd) {
                    $violations += [pscustomobject]@{
                        File = (Resolve-Path -LiteralPath $file -Relative)
                        Line = $i + 1
                        Rule = $rule.Name
                        Text = $cmd.Trim()
                        Why  = $rule.Why
                        Fix  = $rule.Fix
                    }
                }
            }
        }
    }
}

Write-Host ''
Write-Host "掃描 $($files.Count) 份教材 Markdown，$($rules.Count) 條指令規則" -ForegroundColor Cyan
Write-Host ''

if ($violations.Count -eq 0) {
    Write-Host 'PASS：教材中沒有已知的失效指令' -ForegroundColor Green
    exit 0
}

foreach ($group in $violations | Group-Object Rule) {
    Write-Host "FAIL [$($group.Name)]  $($group.Count) 處" -ForegroundColor Red
    Write-Host "  原因：$($group.Group[0].Why)" -ForegroundColor Gray
    Write-Host "  改用：$($group.Group[0].Fix)" -ForegroundColor Gray
    foreach ($v in $group.Group) {
        Write-Host "    $($v.File):$($v.Line)" -ForegroundColor Yellow
        Write-Host "      $($v.Text)" -ForegroundColor DarkGray
    }
    Write-Host ''
}

Write-Host "共 $($violations.Count) 處失效指令，請修正後重跑" -ForegroundColor Red
exit 1
