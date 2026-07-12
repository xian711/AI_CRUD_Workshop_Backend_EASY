# 公司導入建議與常見問題

## 導入節奏

| 階段 | 做法 |
|---|---|
| 第一週 | 每人選一個熟悉 API，用 API Mode 產 SDD / Mock / TDD；不要求 merge |
| 第二週 | 選一個低風險 CRUD 頁（或 UI 雛形），用 CRUD / UI Mode 產 UI Spec 與草稿，review 是否符合 Design System |
| 第一個月 | 補齊 `CODE-RULES-api.md` / `CODE-RULES-ui.md`、`design-system-summary.md`、error code 表、共用 DTO / 分頁格式 |
| 第二個月 | 把常見 pattern 收進 Harness；建團隊共用 SPEC 範本；選 1–2 個真實小功能試導入；開始累積 `LESSONS.md` |
| 第三個月 | 建正式使用規範；`/review-loop` 納入 code review 流程；評估擴充到報表、權限、批次匯入 |

## 導入前要補的公司化內容

| 檔案 | 要補的內容 |
|---|---|
| `harness/SPEC.md` | 本次需求（含 FR / BR / TC 編號） |
| `harness/CODE-RULES-api.md` / `CODE-RULES-ui.md` | 把原單位範本預設值改成公司規範、補 TODO |
| `modules/crud-ui/design-system-summary.md` | 公司 Design System 元件與 token 摘要 |
| `templates/*` | 公司 API 格式、測試資料、測試框架慣例 |
| `.claude/settings.local.json` | 依 `templates/settings-allowlist-sample.md` 建最小授權 |

## 常見問題

**Q1：CRUD 或 UI 雛形要不要另建一套 Harness？**
不用。一套主流程三個 mode（API / CRUD / UI），CRUD UI 是可插拔模組——省 token、規則一致。

**Q2：可以用在 React / Vue / Angular 嗎？**
可以。框架差異只在 `design-system-summary.md` 補：元件庫、表單 / 表格元件、Dialog、Toast、API service 寫法、資料夾結構。

**Q3：AI 可以直接寫後端程式嗎？**
可以，但順序是 SPEC → Mock → TDD → 測試草稿 → 實作草稿。跳過規格的程式視為範圍外（鐵律 1）。

**Q4：AI 產出不準怎麼辦？**
不要重問一大段。用 fix loop：「依 HARNESS.md 只修正目前失敗或不符規格的部分，不要重寫全部。」

**Q5：為什麼最多 fix 2 次？**
超過 2 次通常代表規格不清、環境問題或方向錯誤。此時停下讓工程師判斷（AI 應以選擇題詢問），避免燒 token。

**Q6：怎麼說服資深工程師？**
這套不是要大家相信 AI，剛好相反：用規格、測試與審查閘門**限制** AI，讓它只能在可 review、可驗證、可修正的範圍內工作。每條規則的踩坑出處見 `case-studies.md`。
