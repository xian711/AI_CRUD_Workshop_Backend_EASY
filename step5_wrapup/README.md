# step5 — 課程總結與回去怎麼用

> 評量標準與提交格式見 [RUBRIC.md](RUBRIC.md)（六面向 100 分、70 分及格、需求釐清／API 契約／LOOP 三項不得為零）。

## 課程回顧

| Step | 帶走的觀念 |
|------|-----------|
| step1 為什麼要 harness | 同一句「幫我加一個 API」，有沒有附上 harness（CLAUDE.md 與 CODE-RULES 等規矩文件）產出天差地遠——差的不是能不能動，是命名慣例、驗證邏輯、危險操作（例如直接刪表）有沒有守住團隊規矩。 |
| step2 CRUD 快速完工秘笈 | 一個成熟後端模組拆開來看，就是「範本 API（骨架）＋系統文件（SRS/SDD）＋後端 harness 四件（規矩）＋分層架構與 DB 綱要」四塊組合而成，缺一塊都會讓 AI 自由發揮出風險（例如亂建表、亂設交易邊界）。 |
| step3 複製範本開發新模組 | 開發新模組的正確順序是 **PRD → 讓 AI 提「需求釐清選擇題」→ 生成 SRS-delta/SDD-delta → 生成 API 程式碼與 migration → 人工檢視反覆修正**；六題裁決（編碼規則、id 產生、刪除策略、分頁位置、字典要不要建表、選填欄）就是把「模糊需求」變成「可以動手的契約」的關鍵一步。 |
| step4 加速技：LOOP 工程 | 不用每一步都盯著 AI，可以讓它自己跑「改 → 跑測試／跑 E2E → 再改」循環——而且你親手經歷過後端的「紅 → 判因（是 API bug 還是資料庫 bug 還是測試本身寫錯）→ 修 → 綠」；收尾一定要有全鏈路 E2E（瀏覽器打到資料庫）把關，不能只靠 `dotnet test` 全綠就說做完了。 |

## 回去公司怎麼用

### ① 把後端 harness 四件帶進你的專案

把 `CLAUDE.md`（專案憲法）、`CODE-RULES-api-本專案.md`（後端程式碼規則）、`contract-conventions-summary.md`（契約慣例摘要）、`使用說明-複製範本開發新API模組.md` 四份文件複製到你專案的**根目錄**（`step2_speedrun_kit/2.3_harness/` 有現成一套），內容改成你們公司自己的規則（命名慣例、分層邊界、狀態碼與封裝慣例、禁止事項、migration 審查流程）。用 Codex 就再放一份 `AGENTS.md` 指向 CLAUDE.md。這是 AI 生成的 API 「像同一個團隊寫的」的關鍵，不是靠 AI 自己猜。

### ② 把既有 API 整理成範本——複製區 vs 共用區

挑一個你們系統裡最成熟、最多人抄過的 CRUD API（例如某個主檔管理端點），拆成：
- **複製區**：跟這個實體有關的東西——Entity、Request/Result DTO、驗證規則、Controller 端點、對應的 migration。
- **共用區**：跟實體無關的通用邏輯——ModelResult 封裝、分頁／排序共用邏輯、統一錯誤處理、DbContext 基礎設定、測試共用 fixture。

新模組開發時，AI 只需要照著複製區的樣式「換個實體」，共用區完全不動——這就是 step2 範本 API 示範的拆法。

### ③ 新需求走「PRD → 釐清選擇題 → SRS/SDD → 生成 → LOOP 驗證」流程

拿到新需求先寫一頁 PRD（可以很簡陋），丟給 AI 配上 harness 與範本 API；AI 該先回你「需求釐清選擇題」（例如：id 誰產生？刪除是硬刪還是軟刪？分頁在前端還是後端？）而不是直接動手寫程式；選完題目再讓它出 SRS-delta/SDD-delta 與 API 程式碼＋migration＋測試；最後跑一輪 LOOP（改 → `dotnet test`／E2E → 再改）＋人工檢查 API 契約與資料庫實際內容收尾。

## 常見問題

| 問題 | 回答 |
|------|------|
| 我們不是用 .NET，怎麼辦？ | harness 方法不綁語言。四件（CLAUDE.md／CODE-RULES-api-本專案／契約慣例摘要／範本使用說明）換成你們技術棧的等價規則即可；「PRD → 釐清選擇題 → SRS/SDD → 生成 → LOOP」這個流程在任何後端語言都適用。 |
| 沒有 PostgreSQL，怎麼辦？ | 資料庫種類不是重點，重點是「有沒有把 schema、migration 策略、id 產生方式寫成明確規則」。換成 MySQL、SQL Server 一樣要回答今天六題裁決同樣的問題（id 怎麼產、刪除策略、字典要不要建表）。 |
| AI 生成的 migration 敢不敢直接上 production？ | 不敢，任何人寫的 migration 都一樣不能未審查直接上 production。AI 生成的 migration 一定要先在測試庫跑過、人工看過 SQL 內容（有沒有意外刪欄位、意外改型別），並且要有回滾腳本，這跟是不是 AI 寫的無關。 |
| 測試全綠就能上線嗎？ | 不能。`dotnet test` 全綠只代表「符合寫測試的人當初想到的情境」，還要有 API 契約（swagger／實際打 API）與資料庫查表（psql 實際看資料）雙重人工驗收，這就是 step4 LOOP 為什麼要求紅→綠證據加全鏈路 E2E 的原因。 |

## 前後端兩課合起來的全鏈路圖

前端這堂課做出來的裝備物資模組，接上這堂課的 API 之後，完整動線就是一行：**瀏覽器 → Nuxt（devProxy）→ .NET API → PostgreSQL**——資料不再是 F5 就消失的 mock，而是真正落地在資料庫裡的一筆一筆紀錄。

> 想深入研究完整版 harness（`aspnet-api-ai-harness-v5`），見 step2 的課後附錄。
