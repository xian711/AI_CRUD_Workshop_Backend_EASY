// 用法：node send.mjs '<指令 JSON>'  或  node send.mjs @檔案.json（可以是指令陣列，會依序送出）[等幾秒=180]
import fs from 'node:fs'
const Q = 'D:/AIWORK/pw-shots-tmp/crud-backend-2026-10-07/q'
const arg = process.argv[2]; const wait = Number(process.argv[3] || 180)
let cmds = JSON.parse(arg.startsWith('@') ? fs.readFileSync(arg.slice(1), 'utf8') : arg)
if (!Array.isArray(cmds)) cmds = [cmds]
for (const c of cmds) {
  const ids = fs.readdirSync(Q).filter(f => /^\d+\.json$/.test(f)).map(f => +f.slice(0, -5))
  const id = String((ids.length ? Math.max(...ids) : 0) + 1).padStart(3, '0')
  fs.writeFileSync(`${Q}/${id}.json`, JSON.stringify(c))
  const t0 = Date.now(); let r = null
  while (Date.now() - t0 < wait * 1000) { if (fs.existsSync(`${Q}/${id}.out.json`)) { r = JSON.parse(fs.readFileSync(`${Q}/${id}.out.json`, 'utf8')); break } await new Promise(z => setTimeout(z, 250)) }
  const tag = `${id} ${c.a}${c.name ? ' ' + c.name : ''}`
  if (!r) { console.log(tag, 'TIMEOUT'); process.exit(1) }
  let res = typeof r.res === 'string' ? r.res : JSON.stringify(r.res)
  if (res && res.length > 4000) res = res.slice(0, 4000) + `…(${res.length})`
  console.log(tag, r.ok ? 'ok' : 'ERR ' + r.err, res && res !== '"ok"' && res !== 'ok' ? res : '')
  if (!r.ok && !c.optional) process.exit(1)
}
