# CLAUDE.md

遵守 `HARNESS.md` 六條鐵律：SDD first（範圍外預設移除）、誠實原則（不回假資料、mock 必標示）、審寫分離、驗證自帶回圈、越權即標記、互動式決策（問人用選擇題）。

## 路由（依需求載入，不預先讀規則檔）

| 需求 | 執行 |
|---|---|
| 後端 API | `/api-loop` |
| 後端＋CRUD 畫面 | `/crud-loop` |
| 純畫面雛形（無後端） | `/ui-loop` |
| 地圖 / GIS 前端 | 先載入 skill `gis-frontend`，再走 `/crud-loop` 或 `/ui-loop` |
| 接手既有系統（不是自己從零寫的） | 先照 `templates/intake-checklist.md` 盤點與補料，再走對應 loop |
| 功能段落收尾 | `/milestone-loop` |
| 完工審查（開新對話） | `/review-loop` |
| 接續上次進度（新對話續作） | 先讀 `harness/LOOP.md`（Next 欄）與 `harness/TASKS.md`，不重新規劃、直接延續 |

## 底線

- 回覆與 commit message 用**台灣慣用的白話繁體中文**：說人話、句子完整、一次就能看懂。
- 不用大陸用語：調用→呼叫、默認→預設、視頻→影片、數據庫→資料庫、組件→元件、用戶→使用者、代碼→程式碼、服務器→伺服器、接口→介面、反饋→回饋。
- 精簡＝刪掉不必要的內容，**不是**把句子壓縮到像文言文；寧可多幾個字，也不要讓人看兩遍。
- 只在 blocker 問人；不發明元件與商業規則。
- commit 由使用者主動要求才執行（`feat/fix/docs/style:` 前綴）。
- 各 command 已內含該情境的完整步驟與該讀的檔案清單；**勿為了「先了解」預讀 HARNESS.md、modules/、CODE-RULES-***。
