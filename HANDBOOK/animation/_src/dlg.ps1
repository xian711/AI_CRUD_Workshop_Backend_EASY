param([string]$Out = '', [switch]$Cancel, [switch]$Ok, [int]$W = 1500, [int]$H = 1000, [string]$Path = '')
# 找到 VS Code 的「開啟資料夾」原生對話框：縮成固定大小、截圖、列出元件位置；-Ok 按「選取資料夾」、-Cancel 按「取消」
[Console]::OutputEncoding = [Text.Encoding]::UTF8
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes, System.Drawing
Add-Type @"
using System; using System.Runtime.InteropServices;
public class U {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr h, int x, int y, int w, int hh, bool r);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
}
"@
[U]::SetProcessDPIAware() | Out-Null
$A = [System.Windows.Automation.AutomationElement]
$TS = [System.Windows.Automation.TreeScope]
$root = $A::RootElement
$cond = New-Object System.Windows.Automation.PropertyCondition($A::ClassNameProperty, '#32770')
$dlg = $null
for ($i = 0; $i -lt 30 -and -not $dlg; $i++) {
  foreach ($d in $root.FindAll($TS::Descendants, $cond)) { if ($d.Current.Name -match '開啟資料夾|Open Folder') { $dlg = $d; break } }
  if (-not $dlg) { Start-Sleep -Milliseconds 300 }
}
if (-not $dlg) { 'NO DIALOG'; exit 1 }
function RectOf($e) { $r = $e.Current.BoundingRectangle; $d = $dlg.Current.BoundingRectangle; return '{0},{1},{2},{3}' -f [int]($r.X - $d.X), [int]($r.Y - $d.Y), [int]$r.Width, [int]$r.Height }
if ($Out) {
  [U]::MoveWindow([IntPtr]$dlg.Current.NativeWindowHandle, 200, 150, $W, $H, $true) | Out-Null
  Start-Sleep -Milliseconds 900
  $r = $dlg.Current.BoundingRectangle
  $bmp = New-Object System.Drawing.Bitmap([int]$r.Width, [int]$r.Height)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CopyFromScreen([int]$r.X, [int]$r.Y, 0, 0, $bmp.Size)
  $bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
  "size {0},{1}" -f [int]$r.Width, [int]$r.Height
  $tree = $dlg.FindFirst($TS::Descendants, (New-Object System.Windows.Automation.PropertyCondition($A::ControlTypeProperty, [System.Windows.Automation.ControlType]::Tree)))
  foreach ($e in $dlg.FindAll($TS::Descendants, [System.Windows.Automation.Condition]::TrueCondition)) {
    $n = $e.Current.Name; $t = $e.Current.ControlType.ProgrammaticName
    if ($n -match '選取資料夾|取消|AI_CRUD_Workshop_Frontend_EASY|my-equipment-app|step3_new_module|HANDBOOK' -or ($t -match 'Edit' -and $n -match '資料夾')) { "el [$t] '$n' " + (RectOf $e) }
  }
}
function Click($name) {
  foreach ($e in $dlg.FindAll($TS::Descendants, [System.Windows.Automation.Condition]::TrueCondition)) {
    if ($e.Current.Name -like "$name*" -and $e.Current.ControlType.ProgrammaticName -match 'Button') {
      try { $e.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke(); "clicked " + $e.Current.Name; return } catch { "invoke failed " + $e.Current.Name }
    }
  }
  "no button $name"
}
if ($Path) {
  foreach ($e in $dlg.FindAll($TS::Descendants, (New-Object System.Windows.Automation.PropertyCondition($A::ControlTypeProperty, [System.Windows.Automation.ControlType]::Edit)))) {
    if ($e.Current.Name -match '資料夾') { $e.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern).SetValue($Path); 'set path'; break }
  }
}
if ($Cancel) { [U]::PostMessage([IntPtr]$dlg.Current.NativeWindowHandle, 0x111, [IntPtr]2, [IntPtr]0) | Out-Null; 'sent IDCANCEL' }
if ($Ok) { [U]::PostMessage([IntPtr]$dlg.Current.NativeWindowHandle, 0x111, [IntPtr]1, [IntPtr]0) | Out-Null; 'sent IDOK' }
