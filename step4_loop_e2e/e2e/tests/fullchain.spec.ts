/**
 * 中心裝備物資 CRUD — 後端 EASY 版｜全鏈路 E2E（6 條）
 * ════════════════════════════════════════════════════════════════
 * 目標站點：fullchain-app 的「API 模式」（NUXT_PUBLIC_USE_API=true），
 *   http://localhost:3199/equipment/crud —— 前端 dev server 經 devProxy 把
 *   /api/equipment 轉發到真後端 .NET API（:5080），資料落在 PostgreSQL 的 _e2e 庫。
 *
 * ▓ 這一課的靈魂＝「持久化」，與前端 mock 課最大的差別：
 *   mock 課：reload 會把資料重置回 24 筆種子（記憶體）。
 *   本課：新增／編輯／刪除都真的寫進資料庫——reload 之後改動「仍在」，才是真的接上後端。
 *   多條測試因此故意「用 reload 當試金石」，並在 E6 直接打 API 拿鐵證。
 *
 * ▓ 全鏈路測試「不」在每條之間重置資料庫（那是 mock 思維）。
 *   資料庫由 run-e2e.ps1 於「每輪」重建成乾淨 24 筆；本檔內測試依宣告順序（workers=1）
 *   在同一個庫上累加，故：E1 斷言「恰好 24」（首條、DB 剛建好），其餘一律「動態讀當前筆數
 *   再比對增減」，不寫死絕對值——這樣多條累加也不會互相污染。
 *
 * selector 依據：實跑 probe 抓過真實 DOM 才寫（與前端課同一套頁面元件）——
 *   - 篩選/表單下拉是 Nuxt UI USelectMenu（headless combobox）：點觸發鈕開清單、role=option 定位。
 *   - 表單欄位外框帶 data-field（EquipmentFormField），內含 input/textarea。
 *   - 「其他」分類時「項目」欄改為文字 UInput（非下拉）。
 *   - 品項編碼欄唯讀，值為前端即時預覽；真正落庫的 code 以後端回傳為準（E6 打 API 驗）。
 *   - 刪除確認是 AppConfirmModal：role=alertdialog、確認鈕「刪除」。
 */
import { test, expect, type Page, type Locator } from '@playwright/test'

const LIST = '/equipment/crud'
const API = '/api/equipment/items' // 經 3199 devProxy → 後端 5080

// ── 共用工具 ──────────────────────────────────────────────────

/** 讀工具列「共 N 筆」的目前筆數（filteredRows.length）；持久化課一律動態讀、不寫死。 */
async function readCount(page: Page): Promise<number> {
  // 先等表格出現＝資料已從後端載入（避免讀到 API 模式「載入中」那一瞬的空狀態「共 0 筆」）
  await expect(page.locator('table')).toBeVisible()
  const txt = (await page.getByText(/^共 \d+ 筆$/).first().innerText()).trim()
  const m = txt.match(/共 (\d+) 筆/)
  if (!m) throw new Error(`讀不到「共 N 筆」：實得「${txt}」`)
  return Number(m[1])
}

/** USelectMenu（headless combobox）：點觸發鈕 → 點 role=option 選項 */
async function pickOption(page: Page, field: Locator, optionName: string) {
  await field.locator('button').first().click()
  await page.getByRole('option', { name: optionName, exact: true }).click()
}

/** 桌機表格第一列 */
function firstRow(page: Page): Locator {
  return page.locator('table tbody tr').first()
}

/** 讀第一列「項目」欄的品項編碼（該欄 font-mono 那個 div＝編碼） */
async function firstRowCode(page: Page): Promise<string> {
  return (await firstRow(page).locator('td').nth(1).locator('div').last().innerText()).trim()
}

/** 用關鍵字（比對名稱＋編碼）在列表過濾出剛動過的那一筆 */
async function searchBy(page: Page, keyword: string) {
  await page.getByPlaceholder('項目名稱／編碼').fill(keyword)
}

// ── E1 清單載入（Read）──────────────────────────────────────────
// 觀念：資料來自 PostgreSQL（API 模式），不是前端 mock。首條、DB 剛建好 → 恰好 24 筆。
test('E1 清單載入：API 模式顯示表格與「共 24 筆」（資料來自 PostgreSQL）', async ({ page }) => {
  await page.goto(LIST)
  await expect(page.getByText('共 24 筆', { exact: true })).toBeVisible()
  const table = page.locator('table')
  await expect(table).toBeVisible()
  // 任取一個穩定種子名，證明表格真有資料
  await expect(table.getByText('筆記型電腦').first()).toBeVisible()
  await page.screenshot({ path: 'screenshots/01_list.png', fullPage: true })
})

// ── E2 新增 → reload 仍在（持久化鐵證，Create + Persist）────────────
// 觀念：新增寫進資料庫；reload 後那一筆「仍在」＝真的落庫，不是記憶體 mock。
test('E2 新增品項後 reload：新增的那一筆在重新整理後仍然存在（持久化）', async ({ page }) => {
  await page.goto(LIST)
  const before = await readCount(page)

  // 進新增頁
  await page.getByRole('button', { name: '新增品項' }).click()
  await expect(page).toHaveURL(/\/equipment\/crud\/new/)

  // 分類 → 項目（連動下拉）
  await pickOption(page, page.locator('[data-field="categoryKey"]'), '供電及照明設備')
  await pickOption(page, page.locator('[data-field="name"]'), '發電機')

  // 記下前端即時預覽的編碼（PW-GEN-###）；此刻預覽＝落庫值（同前綴 MAX+1）
  const code = (await page.locator('[data-field="code"] input').inputValue()).trim()
  expect(code).toMatch(/^PW-GEN-\d{3}$/)

  await page.locator('[data-field="qty"] input').fill('5')
  await page.locator('[data-field="unit"] input').fill('台')
  await page.locator('[data-field="spec1"] textarea').fill('E2 全鏈路持久化測試｜汽油發電機 3kW')
  await page.screenshot({ path: 'screenshots/02_new_form_filled.png', fullPage: true })

  await page.getByRole('button', { name: '儲存' }).click()

  // 回列表、toast、筆數 +1
  await expect(page).toHaveURL(/\/equipment\/crud(\?|$)/)
  await expect(page.getByText('已新增品項')).toBeVisible()
  await expect(page.getByText(`共 ${before + 1} 筆`, { exact: true })).toBeVisible()
  await page.screenshot({ path: 'screenshots/03_after_create_list.png', fullPage: true })

  // ▓ 關鍵：整頁 reload（清空前端狀態，重新向後端 GET）——若是 mock 這裡會掉回種子；持久化則仍在
  await page.reload()
  await expect(page.getByText(`共 ${before + 1} 筆`, { exact: true })).toBeVisible()

  // 用剛才的編碼搜回這一筆，確認 reload 後仍查得到
  await searchBy(page, code)
  await expect(page.getByText('共 1 筆', { exact: true })).toBeVisible()
  await expect(page.locator('table').getByText(code, { exact: true })).toBeVisible()
  await expect(page.locator('table').getByText('發電機').first()).toBeVisible()
  await page.screenshot({ path: 'screenshots/04_after_reload_persisted.png', fullPage: true })
})

// ── E3 後端編碼格式（Create → 後端產碼）────────────────────────────
// 觀念：品項編碼由「後端」在交易內產生（前綴＋流水），前端只做預覽。驗其格式與前綴。
test('E3 新增後編碼格式：後端產生的 code 為「類別2碼-項目3碼-流水3碼」', async ({ page }) => {
  await page.goto(LIST)

  await page.getByRole('button', { name: '新增品項' }).click()
  await pickOption(page, page.locator('[data-field="categoryKey"]'), '資通訊設備')
  await pickOption(page, page.locator('[data-field="name"]'), '平板電腦')

  const preview = (await page.locator('[data-field="code"] input').inputValue()).trim()
  expect(preview).toMatch(/^IT-TAB-\d{3}$/) // 資通訊(IT)-平板電腦(TAB)-流水

  await page.locator('[data-field="qty"] input').fill('3')
  await page.locator('[data-field="unit"] input').fill('台')
  await page.locator('[data-field="spec1"] textarea').fill('E3 編碼格式驗證｜10 吋平板')
  await page.getByRole('button', { name: '儲存' }).click()
  await expect(page.getByText('已新增品項')).toBeVisible()

  // 在列表用前綴查回，讀「項目」欄實際顯示的編碼，斷言整體格式（兩碼-三碼-三碼）
  await searchBy(page, 'IT-TAB-')
  const shownCode = (await firstRow(page).locator('td').nth(1).locator('div').last().innerText()).trim()
  expect(shownCode).toMatch(/^[A-Z]{2}-[A-Z]{3}-\d{3}$/)
  expect(shownCode.startsWith('IT-TAB-')).toBeTruthy()
})

// ── E4 編輯 → reload 仍在（Update + Persist）──────────────────────
// 觀念：改數量＋狀態並存回資料庫；reload 後新值「仍在」。
test('E4 編輯品項後 reload：改後的數量與狀態在重新整理後仍生效（持久化）', async ({ page }) => {
  const NEW_QTY = '77'
  await page.goto(LIST)
  await readCount(page)

  // 記下第一列編碼（只改數量／狀態，不動分類與項目 → 編碼保留，稍後據以查回）
  const code = await firstRowCode(page)

  await firstRow(page).locator('button[aria-label="編輯"]').click()
  await expect(page).toHaveURL(/\/equipment\/crud\/[^/]+\?.*mode=edit/)

  await page.locator('[data-field="qty"] input').fill(NEW_QTY)
  await pickOption(page, page.locator('[data-field="status"]'), '維修中')

  await page.getByRole('button', { name: '儲存' }).click()
  await expect(page).toHaveURL(/\/equipment\/crud(\?|$)/)
  await expect(page.getByText('已儲存變更')).toBeVisible()

  // reload 後用編碼查回，斷言新數量與新狀態仍在
  await page.reload()
  await searchBy(page, code)
  await expect(page.getByText('共 1 筆', { exact: true })).toBeVisible()
  const hit = firstRow(page)
  await expect(hit.getByText(code, { exact: true })).toBeVisible()
  await expect(hit.getByText(new RegExp(`${NEW_QTY}\\s`))).toBeVisible()
  await expect(hit.getByText('維修中')).toBeVisible()
})

// ── E5 刪除 → reload 消失（Delete + Persist）──────────────────────
// 觀念：刪除是硬刪除，真的從資料庫移除；reload 後那一筆「確實不見」。
test('E5 刪除品項後 reload：被刪的那一筆在重新整理後確實消失（持久化）', async ({ page }) => {
  await page.goto(LIST)
  const before = await readCount(page)

  const code = await firstRowCode(page)
  await expect(page.locator('table').getByText(code, { exact: true })).toBeVisible()

  // 桌機表格第一列刪除鈕（scope 到 table，避免命中手機卡片同名鈕）
  await firstRow(page).locator('button[aria-label="刪除"]').click()
  const dialog = page.getByRole('alertdialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('刪除品項')).toBeVisible()
  await dialog.getByRole('button', { name: '刪除', exact: true }).click()

  await expect(page.getByText(/已刪除/)).toBeVisible()
  await expect(page.getByText(`共 ${before - 1} 筆`, { exact: true })).toBeVisible()

  // reload 後用編碼搜尋，應查無（真的從 DB 刪掉，不是前端暫時隱藏）
  await page.reload()
  await searchBy(page, code)
  await expect(page.getByText('查無符合條件的品項')).toBeVisible()
  await expect(page.locator('table').getByText(code, { exact: true })).toHaveCount(0)
  await page.screenshot({ path: 'screenshots/05_after_delete_gone.png', fullPage: true })
})

// ── E6 直打 API 驗持久化（鐵證，Persist at API layer）────────────────
// 觀念：不只看畫面——用 APIRequestContext 直接 GET /api/equipment/items（經 3199 proxy 到後端），
//       確認「前端新增的那一筆」真的出現在後端 API 回應裡（＝真的進了 PostgreSQL）。
test('E6 直打 API：前端新增的品項出現在後端 GET 回應中（不只是畫面）', async ({ page, request }) => {
  await page.goto(LIST)

  // 用「其他」分類自填一個唯一品名，確保等下在 API 回應裡好認
  await page.getByRole('button', { name: '新增品項' }).click()
  await pickOption(page, page.locator('[data-field="categoryKey"]'), '其他')
  const uniqueName = `全鏈路見證-${Date.now()}`
  await page.locator('[data-field="name"] input').fill(uniqueName)
  const code = (await page.locator('[data-field="code"] input').inputValue()).trim()
  expect(code).toMatch(/^OT-OTH-\d{3}$/)

  await page.locator('[data-field="qty"] input').fill('9')
  await page.locator('[data-field="unit"] input').fill('組')
  await page.locator('[data-field="spec1"] textarea').fill('E6 API 持久化鐵證資料')
  await page.getByRole('button', { name: '儲存' }).click()
  await expect(page.getByText('已新增品項')).toBeVisible()

  // ▓ 鐵證：直接打後端 API（過 devProxy），在回應 JSON 裡找到剛新增的那一筆
  const res = await request.get(API)
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  const items = body.data as Array<{ code: string; name: string; qty: number }>
  expect(Array.isArray(items)).toBeTruthy()
  const found = items.find(it => it.name === uniqueName)
  expect(found, `API 回應中應含前端新增的「${uniqueName}」`).toBeTruthy()
  expect(found!.code).toBe(code) // 後端落庫的 code 與前端預覽一致（同前綴 MAX+1）
  expect(found!.qty).toBe(9)
})
