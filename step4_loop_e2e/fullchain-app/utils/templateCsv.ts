/**
 * templateCsv — CSV 匯出工具（範本用）
 * ─────────────────────────────────────────────
 * 這個檔案在範本中的角色：
 *   把「資料列 → CSV 檔案下載」這件事收斂成一個純粹、可重用的函式，示範
 *   「欄位定義資料化（CsvColumn）」與「RFC 4180 跳脫」兩個常被忽略的細節。
 *
 * 對照 roster 現況：各頁自行拼接 CSV——無條件全包引號、列尾用 \n 而非 RFC 4180 的 \r\n、
 * 檔名以 toISOString() 取日期（UTC 換日陷阱），且同樣邏輯複製了三份。
 * 本工具以 RFC 4180 規則統一封裝（Clean Code：把易錯細節收斂在單一處）。
 *
 * 顯式匯入（審查修訂 A-9）：utils 不依賴 auto-import，使用端請
 *   import { exportCsv, type CsvColumn } from '~/utils/templateCsv'
 */

/** 一個欄位 = 標題 + 從資料列取值的存取器（資料化欄位定義，避免平行陣列易錯） */
export interface CsvColumn<T> {
  label: string
  value: (row: T) => string | number
}

const UTF8_BOM = '\uFEFF' // 顯式跳脫寫法：字面 BOM 是不可見字元，容易被編輯器或格式化工具無聲吃掉

/** 值含逗號、雙引號或換行時，依 RFC 4180 以雙引號包裹並將內部雙引號加倍 */
function escapeCsvValue(raw: string | number): string {
  const text = String(raw)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * 依欄位定義將資料列輸出為 CSV 檔並觸發瀏覽器下載。
 * 前置 UTF-8 BOM 讓 Excel 正確辨識中文編碼。
 */
export function exportCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]): void {
  const headerLine = columns.map(column => escapeCsvValue(column.label)).join(',')
  const bodyLines = rows.map(row =>
    columns.map(column => escapeCsvValue(column.value(row))).join(','),
  )
  const csv = [headerLine, ...bodyLines].join('\r\n')

  const blob = new Blob([UTF8_BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  // 先掛進 DOM 再 click：部分瀏覽器（如 Firefox）對游離節點的合成 click 不觸發下載
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
