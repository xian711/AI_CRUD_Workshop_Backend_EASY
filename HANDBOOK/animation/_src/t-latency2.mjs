// 跳段與深連結的聲音延遲：mp3 下載一律延遲 1.5 秒；量「跳到新段落 → 真的出聲」要多久
// 用法：node t-latency2.mjs <anim.html>
const { chromium } = await import('file:///D:/AIWORK/pw-shots-tmp/node_modules/playwright/index.mjs')
const file = 'file:///' + process.argv[2].split('\\').join('/')
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] })
async function measure(label, setup, action) {
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 } })
  await p.route('**/*.mp3', async route => { await new Promise(r => setTimeout(r, 1500)); await route.continue() })
  await setup(p)
  const t0 = Date.now(); await action(p)
  let ms = null
  for (let i = 0; i < 300; i++) {
    const ok = await p.evaluate(() => { const a = window.__dbg().curAudio; return !!(a && !a.paused && a.currentTime > 0.05) })
    if (ok) { ms = Date.now() - t0; break }
    await p.waitForTimeout(20)
  }
  console.log(label.padEnd(28), ms == null ? 'NO SOUND' : ms + ' ms'); await p.close()
}
const start = async p => { const s = p.locator('#bStart'); if (await s.isVisible()) await s.click(); else await p.locator('#bPlay').click() }
// 1. 開頁等 10 秒（背景預載）→ 按開始
await measure('first sentence', async p => { await p.goto(file + '#s1-1'); await p.waitForTimeout(10000) }, start)
// 2. 播放中跳到第 20 段（目錄／下一段那種）
await measure('jump to s20 while playing', async p => { await p.goto(file + '#s1-1'); await p.waitForTimeout(10000); await start(p); await p.waitForTimeout(1500) },
  async p => { await p.evaluate(() => { location.hash = '#s20-1' }) })
// 3. 深連結直接開第 25 段 → 按開始
await measure('deep link s25 then start', async p => { await p.goto(file + '#s25-1'); await p.waitForTimeout(3000) }, start)
// 4. 播放中換速度
await measure('speed change', async p => { await p.goto(file + '#s2-1'); await p.waitForTimeout(8000); await start(p); await p.waitForTimeout(2000) },
  async p => { await p.selectOption('#speedSel', '1.25') })
await b.close()
