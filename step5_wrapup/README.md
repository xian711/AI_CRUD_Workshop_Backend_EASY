# step5 — 課程總結與回去怎麼用

> 評量標準與提交格式見 [RUBRIC.md](RUBRIC.md)（六面向 100 分、70 分及格、需求釐清／API 契約／LOOP 三項不得為零）。

## 課程回顧

| Step | 帶走的觀念 |
|------|-----------|
| step1 為什麼要 harness | 同一句「幫我加一個 API」，有沒有附上 harness（CLAUDE.md 與 CODE-RULES 等規矩文件）產出差在「誰做決定」——現在的模型不給規矩也寫得出分層乾淨的程式；差的是回應格式、id 與編碼規則、欄位名、訊息語言照不照團隊與前端的契約。harness 管「怎麼寫」，不管「做多少」。 |
| step2 CRUD 快速完工秘笈 | 一個成熟後端模組拆開來看，就是「範本 API（骨架）＋系統文件（SRS／設計文件 DESIGN）＋後端 harness 四件（規矩）＋分層架構與 DB 綱要」四塊組合而成，缺一塊都會讓 AI 自由發揮出風險（例如亂建表、亂設交易邊界）。 |
| step3 複製範本開發新模組 | 開發新模組的正確順序是 **PRD → 讓 AI 提「需求釐清選擇題」→ 生成 SRS-delta、設計文件-delta 和圖 → 你說「開工」才生成 API 程式碼與 migration → 人工檢視反覆修正**，這就是規格驅動開發（SDD）：先文件、再程式；六題裁決（編碼規則、id 產生、刪除策略、分頁位置、字典要不要建表、選填欄）就是把「模糊需求」變成「可以動手的契約」的關鍵一步。 |
| step4 LOOP 工程 | 一個指令，AI 自己跑「改 → 跑 E2E → 再改」修到全綠，紅了自己判因（API bug？資料庫？測試本身？），再叫子代理對抗審查（先用 HTTP 實打 API、再用 Playwright 截圖；審查的模型比開發的高一級）——不用像帶新人那樣一問一答。最後交出紀錄（`LOOP-LOG.md`）、報告（`LOOP-REPORT.html`）、測試報告，文件同步（程式改了，文件跟著改）。收尾仍要有全鏈路 E2E（瀏覽器打到資料庫）和你的驗收，不能只靠 `dotnet test` 全綠就說做完了。 |

## 三道 Gate（這門課真正的記憶點）

五個 step、很多文件，不好記。回公司只要記三道 Gate——它同時就是你可以直接拿去用的 PR checklist：

| Gate | 要做什麼 | 必交證據 |
|---|---|---|
| **1. 規格 Gate** | PRD → 六題裁決 → SRS-delta、設計文件-delta、圖 → TASKS | 六題答案＋每題一句理由、SRS／設計文件各四段＋圖四張、任務清單 |
| **2. 程式 Gate** | 套 harness／範本，Entity→migration→DTO→Mapper→Service→Controller→seed→tests | build 0/0、測試全綠、Swagger 狀態碼、psql 資料 |
| **3. 交付 Gate** | 貼 LOOP prompt：AI 把你自己工作區的全鏈路 E2E 修到綠，再開子代理對抗審查 | `LOOP-REPORT.html`（每輪根因、審查發現）、`LOOP-LOG.md`、測試報告 6/6、E2E 被測 path 與 DB name、文件標「step4 LOOP 後」 |

逐項的評分標準與提交格式見 [RUBRIC.md](RUBRIC.md)。

## ⚠️ 這門課沒教到什麼（誠實講）

今天做出來的東西**不是 production-ready**。以下四條是刻意為了教學簡化的，回公司一定要補：

| 邊界 | 今天怎麼做 | 公司版該怎麼做 |
|---|---|---|
| 編碼併發 | `code` 用「同前綴 MAX+1 ＋唯一索引」，前提是**單一寫入者**；併發撞號會落到 500 | 改 per-prefix counter／advisory lock，或捕捉 unique violation 後有限重試回 409 |
| 帳密與認證 | `postgres/12345` 寫在設定裡，沒有 JWT | 改用環境變數帶密碼；加認證授權 |
| 資料量 | 全量 GET、前端分頁，假設 <1000 筆 | 訂一個啟用 server-side paging 的明確門檻 |
| harness 的能力邊界 | harness 管「**怎麼寫**」（分層、封裝、命名、驗證、測試紀律） | 它**不管「做多少」**——範圍要靠 SCOPE 六題管，不是靠 harness 擋 |

今天的成果，講得保守一點是「**可以進 code review、可以上測試環境**」，不是「敢上 production」。

## 回去公司怎麼用

### ① 把後端 harness 四件帶進你的專案

把 `CLAUDE.md`（專案憲法）、`CODE-RULES-api-本專案.md`（後端程式碼規則）、`contract-conventions-summary.md`（契約慣例摘要）、`使用說明-複製範本開發新API模組.md` 四份文件複製到你專案的**根目錄**（現成一套在 `step2_speedrun_kit/2.5_sample_api/sample-api/` 的專案根目錄，那是全庫唯一的實檔），內容改成你們公司自己的規則（命名慣例、分層邊界、狀態碼與封裝慣例、禁止事項、migration 審查流程）。用 Codex 就再放一份 `AGENTS.md` 指向 CLAUDE.md。這是 AI 生成的 API 「像同一個團隊寫的」的關鍵，不是靠 AI 自己猜。

### ② 把既有 API 整理成範本——複製區 vs 共用區

挑一個你們系統裡最成熟、最多人抄過的 CRUD API（例如某個主檔管理端點），拆成：
- **複製區**：跟這個實體有關的東西——Entity、Request/Result DTO、驗證規則、Controller 端點、對應的 migration。
- **共用區**：跟實體無關的通用邏輯——ModelResult 封裝、分頁／排序共用邏輯、統一錯誤處理、DbContext 基礎設定、測試共用 fixture。

新模組開發時，AI 只需要照著複製區的樣式「換個實體」，共用區完全不動——這就是 step2 範本 API 示範的拆法。

### ③ 新需求走規格驅動開發（SDD）：PRD → 釐清選擇題 → SRS、設計文件和圖 → 生成 → LOOP 驗證

拿到新需求先寫一頁 PRD（可以很簡陋），丟給 AI 配上 harness 與範本 API；AI 該先回你「需求釐清選擇題」（例如：id 誰產生？刪除是硬刪還是軟刪？分頁在前端還是後端？）而不是直接動手寫程式；選完題目再讓它出 SRS-delta、設計文件-delta 和圖，你看懂了再說「開工」，讓它寫 API 程式碼＋migration＋測試；最後一個指令讓 AI 跑 LOOP（改 → `dotnet test`／E2E → 再改，全綠後開子代理對抗審查），程式改了文件跟著改；你看報告、親手檢查 API 契約與資料庫實際內容收尾。

## 常見問題

| 問題 | 回答 |
|------|------|
| 我們不是用 .NET，怎麼辦？ | harness 方法不綁語言。四件（CLAUDE.md／CODE-RULES-api-本專案／契約慣例摘要／範本使用說明）換成你們技術棧的等價規則即可；「PRD → 釐清選擇題 → SRS、設計文件 → 生成 → LOOP」這個流程在任何後端語言都適用。 |
| 沒有 PostgreSQL，怎麼辦？ | 資料庫種類不是重點，重點是「有沒有把 schema、migration 策略、id 產生方式寫成明確規則」。換成 MySQL、SQL Server 一樣要回答今天六題裁決同樣的問題（id 怎麼產、刪除策略、字典要不要建表）。 |
| AI 生成的 migration 敢不敢直接上 production？ | 不敢，任何人寫的 migration 都一樣不能未審查直接上 production。AI 生成的 migration 一定要先在測試庫跑過、人工看過 SQL 內容（有沒有意外刪欄位、意外改型別），並且要有回滾腳本，這跟是不是 AI 寫的無關。 |
| 測試全綠就能上線嗎？ | 不能。`dotnet test` 全綠只代表「符合寫測試的人當初想到的情境」，還要有 API 契約（swagger／實際打 API）與資料庫查表（psql 實際看資料）雙重人工驗收，這就是 step4 LOOP 為什麼要求紅→綠證據加全鏈路 E2E 的原因。 |

## 前後端兩課合起來的全鏈路圖

前端這堂課做出來的裝備物資模組，接上這堂課的 API 之後，完整動線就是一行：**瀏覽器 → Nuxt（devProxy）→ .NET API → PostgreSQL**——資料不再是 F5 就消失的 mock，而是真正落地在資料庫裡的一筆一筆紀錄。

## 課後練習：把那一行 TODO 變成真的

前端課的課後驗收題是做一份**課程回饋問卷**，資料存在瀏覽器，程式裡留了一行：

```ts
// TODO: DEV 串接 POST /api/survey
```

[step6_survey_api/](../step6_survey_api/) 就是把那一行變成真的。它跟 step3 的差別是：

- 需求**沿用前端課的同一份 PRD**，沒有為後端改寫過一個字——真實工作就是這樣。
- 端點名稱是**凍結的契約**（`POST /api/survey`、`GET /api/survey`），因為前端那一行已經那樣寫了。
- 驗收多一路：跑 `verify-seam.ps1` 證明**前端只換 composable 內部實作，頁面一行都不用改**。

沒上過前端課也能做——step6 附了接縫的 before／after 兩份 composable。

> 想深入研究完整版 harness（`aspnet-api-ai-harness-v5`），見 step2 的課後附錄。
