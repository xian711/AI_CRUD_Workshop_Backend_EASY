// VS Code 實拍工具：用 Playwright 的 Electron 模式啟動一個「獨立設定」的 VS Code（不影響使用者平常的 VS Code）。
// 每拍一張就把元件位置（CSS px）寫進 meta.json，動畫的標註框會自動對準。
import fs from 'node:fs'
const { _electron, chromium } = await import('file:///D:/AIWORK/pw-shots-tmp/node_modules/playwright/index.mjs')

export const W = 'D:/AIWORK/pw-shots-tmp/crud-backend-2026-10-07'
export const RAW = W + '/raw'
fs.mkdirSync(RAW, { recursive: true })
const META = RAW + '/meta.json'
export const meta = fs.existsSync(META) ? JSON.parse(fs.readFileSync(META, 'utf8')) : {}
export const sleep = ms => new Promise(r => setTimeout(r, ms))

const BASE_SETTINGS = {
  'workbench.startupEditor': 'none', 'window.zoomLevel': 0, 'telemetry.telemetryLevel': 'off',
  'update.mode': 'none', 'extensions.autoUpdate': false, 'extensions.autoCheckUpdates': false,
  'extensions.ignoreRecommendations': true, 'workbench.tips.enabled': false,
  'workbench.welcomePage.walkthroughs.openOnInstall': false, 'workbench.secondarySideBar.defaultVisibility': 'hidden',
  'chat.disableAIFeatures': true, 'window.restoreWindows': 'none', 'files.hotExit': 'off',
  'editor.fontSize': 16, 'editor.minimap.enabled': false, 'editor.stickyScroll.enabled': false,
  'workbench.editor.empty.hint': 'hidden', 'breadcrumbs.enabled': false,
  'terminal.integrated.fontSize': 16, 'terminal.integrated.gpuAcceleration': 'off',
  'terminal.integrated.defaultProfile.windows': 'Windows PowerShell',
  'terminal.integrated.profiles.windows': { 'Windows PowerShell': { path: 'C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', args: ['-NoLogo', '-NoProfile'] } },
  'terminal.integrated.suggest.enabled': false, 'terminal.integrated.initialHint': false,
  'terminal.integrated.stickyScroll.enabled': false, 'terminal.integrated.enablePersistentSessions': false,
  'terminal.integrated.shellIntegration.decorationsEnabled': 'never',
  'git.openRepositoryInParentFolders': 'never', 'git.autoRepositoryDetection': false, 'scm.diffDecorations': 'none',
  'markdown.preview.fontSize': 16, 'claudeCode.hideOnboarding': true,
  'window.commandCenter': false, 'window.title': ' ', 'workbench.layoutControl.enabled': false, 'workbench.navigationControl.enabled': false,
}

// 拍攝用快捷鍵（Ctrl+Alt+Shift+F1～F10，不會跟一般快捷鍵撞到）
export const K = {
  copyLastOutput: 'Control+Alt+Shift+F1', termSelectAll: 'Control+Alt+Shift+F2', termCopy: 'Control+Alt+Shift+F3',
  maxPanel: 'Control+Alt+Shift+F4', termClear: 'Control+Alt+Shift+F5', mdPreview: 'Control+Alt+Shift+F6',
  newTerm: 'Control+Alt+Shift+F7', closeEditors: 'Control+Alt+Shift+F8', collapseExplorer: 'Control+Alt+Shift+F9',
  killTerm: 'Control+Alt+Shift+F10', focusExplorer: 'Control+Alt+Shift+F11', focusTerm: 'Control+Alt+Shift+F12',
}
const KEYBINDINGS = [
  ['ctrl+alt+shift+f1', 'workbench.action.terminal.copyLastCommandOutput'], ['ctrl+alt+shift+f2', 'workbench.action.terminal.selectAll'],
  ['ctrl+alt+shift+f3', 'workbench.action.terminal.copySelection'], ['ctrl+alt+shift+f4', 'workbench.action.toggleMaximizedPanel'],
  ['ctrl+alt+shift+f5', 'workbench.action.terminal.clear'], ['ctrl+alt+shift+f6', 'markdown.showPreview'],
  ['ctrl+alt+shift+f7', 'workbench.action.terminal.new'], ['ctrl+alt+shift+f8', 'workbench.action.closeAllEditors'],
  ['ctrl+alt+shift+f9', 'workbench.files.action.collapseExplorerFolders'], ['ctrl+alt+shift+f10', 'workbench.action.terminal.kill'],
  ['ctrl+alt+shift+f11', 'workbench.view.explorer'], ['ctrl+alt+shift+f12', 'workbench.action.terminal.focus'],
].map(([key, command]) => ({ key, command }))

/** 啟動 VS Code。folder 可省略（空視窗）。 */
export async function launch({ folder, settings = {}, size = [1067, 600], dsf = 1.8, trust = true, userDir = W + '/vsc-user', extDir = W + '/vsc-ext', dropKeys = [] } = {}) {
  fs.mkdirSync(userDir + '/User', { recursive: true })
  fs.writeFileSync(userDir + '/User/settings.json', JSON.stringify({ ...BASE_SETTINGS, ...settings }, null, 1))
  fs.writeFileSync(userDir + '/User/keybindings.json', JSON.stringify(KEYBINDINGS.filter(k => !dropKeys.includes(k.key)), null, 1))
  const env = {}
  for (const [k, v] of Object.entries(process.env)) if (!/^(ELECTRON_|VSCODE_|CHROME_CRASHPAD|CLAUDE|ANTHROPIC)/i.test(k)) env[k] = v
  const args = ['--user-data-dir=' + userDir, '--extensions-dir=' + extDir, '--locale=zh-tw',
    '--force-device-scale-factor=' + dsf, '--skip-welcome', '--skip-release-notes', '--disable-features=CalculateNativeWinOcclusion', '--new-window']
  if (!trust) args.push('--disable-workspace-trust')
  if (folder) args.push(folder)
  const app = await _electron.launch({ executablePath: process.env.VSCODE_EXE || (process.env.LOCALAPPDATA + '/Programs/Microsoft VS Code/Code.exe'), env, args, timeout: 90000 })
  const win = await app.firstWindow()
  await win.waitForLoadState('domcontentloaded')
  await sizeWin(app, size)
  await sleep(2500)
  return { app, win }
}

export async function sizeWin(app, [w, h]) {
  await app.evaluate(({ BrowserWindow }, [w, h]) => {
    for (const b of BrowserWindow.getAllWindows()) { if (!b.isVisible()) continue; if (b.isFullScreen()) b.setFullScreen(false); if (b.isMaximized()) b.unmaximize(); b.setContentSize(w, h); b.setPosition(30, 30) }
  }, [w, h])
}

/** 目前的工作台頁面（code -r 換資料夾後會換成新的 page） */
export async function workbench(app) {
  for (let i = 0; i < 40; i++) {
    const p = app.windows().find(p => !p.isClosed() && /workbench/.test(p.url()))
    if (p) return p
    await sleep(500)
  }
  throw new Error('no workbench page')
}

/** 取元件外框（CSS px）。sel 可以是選擇器字串、[選擇器,{hasText,nth}]、Locator，或直接 [x,y,w,h] */
export async function box(p, sel, opt = {}) {
  let loc = typeof sel === 'string' ? p.locator(sel) : sel
  if (opt.hasText) loc = loc.filter({ hasText: opt.hasText })
  loc = loc.nth(opt.nth ?? 0)
  const r = await loc.boundingBox({ timeout: 2000 }).catch(() => null)
  return r ? [r.x, r.y, r.width, r.height].map(Math.round) : null
}

/** 拍一張並記錄標註框（座標：CSS px；meta 的 w/h 也是 CSS px） */
export async function shot(p, name, boxes = {}) {
  const vp = await p.evaluate(() => [innerWidth, innerHeight])
  const out = {}
  for (const [k, v] of Object.entries(boxes)) {
    if (v == null) out[k] = null
    else if (Array.isArray(v) && typeof v[0] === 'number') out[k] = v.map(Math.round)
    else if (Array.isArray(v)) out[k] = await box(p, v[0], v[1])
    else out[k] = await box(p, v)
  }
  await p.screenshot({ path: `${RAW}/${name}.png` })
  meta[name] = { w: vp[0], h: vp[1], boxes: out }
  fs.writeFileSync(META, JSON.stringify(meta, null, 1))
  const miss = Object.entries(out).filter(([, v]) => !v).map(([k]) => k)
  console.log('[shot]', name, vp.join('x'), miss.length ? `（找不到：${miss.join(', ')}）` : '')
}

/** 終端機目前看得到的每一列文字（DOM 渲染器；只看畫面上顯示中的那個終端機） */
export async function termRows(p) {
  return p.evaluate(() => {
    const rows = [...document.querySelectorAll('.xterm-rows')].find(e => e.offsetParent)
    return rows ? [...rows.children].map(e => e.textContent.replace(/ /g, ' ').replace(/\s+$/, '')) : []
  })
}
/** 終端機某一列文字的外框（符合 re 的第一列；last=true 取最後一列）。框的寬度＝文字實際寬度 */
export async function rowBox(p, re, { last = false } = {}) {
  return p.evaluate(([src, flags, last]) => {
    const re = new RegExp(src, flags)
    const rows = [...document.querySelectorAll('.xterm-rows')].find(e => e.offsetParent)
    if (!rows) return null
    const hits = [...rows.children].filter(r => re.test(r.textContent.replace(/ /g, ' ')))
    const r = last ? hits[hits.length - 1] : hits[0]
    if (!r) return null
    const rg = document.createRange(); rg.selectNodeContents(r); const b = rg.getBoundingClientRect()
    return [b.x, b.y, b.width, b.height].map(Math.round)
  }, [re.source, re.flags, last])
}
/** 等指令跑完：最後一列變回空白的 PowerShell 提示字元，且連續兩次不變 */
export async function waitPrompt(p, ms = 240000) {
  const t0 = Date.now(); let stable = 0, lastSig = ''
  while (Date.now() - t0 < ms) {
    const rows = (await termRows(p).catch(() => [])).filter(r => r.trim())
    // 提示字元太長會斷行：從最後一個「PS 」開頭的列接到底再判斷
    let i = rows.length - 1; while (i >= 0 && !rows[i].startsWith('PS ')) i--
    const last = i >= 0 ? rows.slice(i).join('') : ''
    const sig = rows.length + '|' + last
    if (/^PS [A-Za-z]:\\[^>]*>\s*$/.test(last) && sig === lastSig) { if (++stable >= 2) return rows } else stable = 0
    lastSig = sig
    await sleep(900)
  }
  throw new Error('waitPrompt timeout')
}
async function termRowsOld(p) {
  return p.$$eval('.terminal-wrapper.active .xterm-rows > div, .xterm-rows > div', els => els.map(e => e.textContent.replace(/\u00a0/g, ' ').replace(/\s+$/, '')))
}
/** 等終端機出現某段文字 */
export async function waitTerm(p, re, ms = 120000) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    const rows = await termRows(p).catch(() => [])
    if (rows.some(r => re.test(r))) return rows
    await sleep(700)
  }
  throw new Error('timeout waiting terminal: ' + re)
}
/** 在終端機打字（像真人一樣慢慢打），enter=true 就按 Enter */
export async function typeTerm(p, text, { enter = true, delay = 25 } = {}) {
  await p.keyboard.type(text, { delay })
  if (enter) await p.keyboard.press('Enter')
}
/** 把某段終端機文字換掉（遮個資用，例如使用者名稱） */
export async function maskTerm(p, from, to) {
  await p.$$eval('.xterm-rows span, .xterm-rows > div', (els, [f, t]) => els.forEach(e => { if (e.childElementCount === 0 && e.textContent.includes(f)) e.textContent = e.textContent.split(f).join(t) }), [from, to])
}
/** 讀／寫剪貼簿（Electron 主程序） */
export const clipRead = app => app.evaluate(({ clipboard }) => clipboard.readText())
export const clipWrite = (app, t) => app.evaluate(({ clipboard }, t) => clipboard.writeText(t), t)
/** 複製終端機全部內容（全選→複製→取消選取） */
export async function termText(app, p) {
  await p.keyboard.press(K.termSelectAll); await sleep(300)
  await p.keyboard.press(K.termCopy); await sleep(300)
  const t = await clipRead(app)
  await p.keyboard.press('Escape').catch(() => {})
  return t.replace(/\r/g, '')
}
/** 存終端機文字（給動畫的大字版終端機用） */
export function saveText(name, text) { fs.writeFileSync(`${RAW}/${name}.txt`, text, 'utf8'); console.log('[text]', name, text.split('\n').length, 'lines') }
/** 用 PowerShell 跑一段指令（拍攝流程外的準備工作） */
import { execFileSync } from 'node:child_process'
export function ps(cmd) { return execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', cmd], { encoding: 'utf8' }) }
export { chromium }
