# Design Token Rules（token 檢查與修正）

CRUD UI 產出後必須通過本檢查。專案若沒有 token 系統，則檢查「不得硬編碼樣式值，一律用既有 CSS 變數 / 主題設定」。

## 三層架構（若採 COMP / SYS / REF）

```text
COMP → SYS → REF   唯一正確方向
COMP → REF         ❌ 跨層引用
COMP → hardcode    ❌ 硬編碼
SYS  → COMP        ❌ 向下引用
```

- 元件專屬樣式用 COMP token；通用語意（primary / success / surface）用 SYS token。
- 元件程式碼絕不直接引用 REF 層（原始色板）。

## 檢查規則

| 規則 | 等級 | 內容 | 檢查方式 |
|---|---|---|---|
| R001 | ❌ | 硬編碼色值 | 搜 `#hex`、`rgb(`、`rgba(`、`hsl(`；**排除 token 定義區（`:root{}`）與註解**，避免誤報 |
| R002 | ❌ | 元件直接引用 REF token | 搜 `var(--ui-ref-` |
| R003 | ❌ | 硬編碼間距 | style 內 `padding/margin/gap: <數字>`；utility class 裸數字（`p-4`、`gap-2`） |
| R004 | ❌ | `!important` 覆蓋 token | 搜 `!important` |
| W001 | ⚠️ | 可互動元件缺 focus-visible | 有 button / a / input / select 卻無 `focus-visible` 樣式 |

輸出：`檔案:行號`、違規內容、建議替換值、合規結果。

## 修正安全原則

- 只自動修正**有明確對應值**的違規（例如專案色票表中列明的 hex → 語意 token）。
- 對應關係不明的一律標「需手動確認」，**不自動改**。
- 移除 `!important` 後若樣式失效，也標手動處理。
- 修正完必須**重跑檢查**，直到乾淨或只剩手動項（驗證自帶回圈）。

## 檢查流程

```text
產出 UI → 跑檢查 → 有違規 → 修正（只改明確項）→ 重跑檢查 → 乾淨或只剩手動項 → 回報
```
