# step6｜Prompt 包（三段，照順序貼）

這一頁的 prompt 都可以整段複製貼上。用 **Agent 模式**跟 AI 對話（它要能自己讀檔、改檔、跑指令）。

順序：

1. 照 README 第三節「準備工作區」把檔案放好。
2. 在 `my-survey-api` 資料夾開 AI Agent，貼【第 1 段：起手】。
3. AI 出選擇題，你一題一題回答（SCOPE 六題，見 README 第五節）。
4. AI 照最小樣板交出 SRS-delta、設計文件-delta、圖和任務清單，你確認。
5. 把模型切成 Sonnet 5.5，貼【第 2 段：開工】。AI 逐項寫程式，每做完一個回報一行。
6. 在工作坊根目錄開一個新的 AI Agent，貼【第 3 段：LOOP】。AI 自己修到綠、自己開子代理挑錯，最後交回紀錄和報告。

> **貼之前先確認**：`my-survey-api` 根目錄看得到 `PRD-課程回饋問卷.md`、`useSurveyResponses.before.ts`、`SRS-設計文件-最小樣板.md` 三個檔（見 README 第三節）。
> 工作目錄要是 `my-survey-api` 專案根目錄，AI 才會自動讀到 `CLAUDE.md`。

**模型怎麼選：** 文件階段（選擇題、SRS、設計文件、圖）用 **Opus 5.5**、effort High（effort＝讓 AI 想得多深的設定）；說「開工」前切成 **Sonnet 5.5** 寫程式；LOOP 的對抗審查子代理用 **Opus 5.5**。

---

## 第 1 段：起手（在 `my-survey-api` 貼）

> 複製下面四行。技術棧、build 零警告、不准刪測試這些鐵律已經寫在 `CLAUDE.md`，AI 會自己讀，prompt 不用重講。

```
用 .NET CRUD 範本（人員 API）做「課程回饋問卷」的後端 API（POST／GET /api/survey），走規格驅動開發（SDD）：先文件，再程式。
先讀 CLAUDE.md、AGENTS.md 指到的 harness 規則檔、PRD-課程回饋問卷.md 和 useSurveyResponses.before.ts（前端現有的資料層：端點、欄位名、型別、中文單選值都以它為準），先不要寫程式。
這份 PRD 是寫給前端的，後端要決定的事它沒寫：用選擇題逐題問我，每題標出建議和一句理由。
我拍板後，照 SRS-設計文件-最小樣板.md 產出 docs/ 的 SRS-問卷API-delta.md、DESIGN-問卷API-delta.md、DIAGRAMS-問卷API.html 和 TASKS.md；等我說「開工」才寫程式，每做完一個回報一行。
```

**你應該看到：**

1. AI 先回 5～7 題選擇題，涵蓋 id 產生、時間戳、單選值存法、後端要不要重驗、清空／匯出誰做、GET 要不要保護與分頁。**它直接開始寫 Entity 的話，代表它沒照做——打斷它，重貼一次。**
2. 你答完，AI 交出四個檔。照 `SRS-設計文件-最小樣板.md` 核：SRS-delta 四段、設計文件-delta 四段、圖四張，缺一樣就退回。
3. 親自核 SRS-delta 第 1 段（裁決跟你說的一樣嗎）和第 3 段（範圍外）。**PRD 沒要求的東西，要是你點頭的，不是 AI 自己加的。**這就是 step1 第三項對照講的「多出來的東西」，harness 擋不住，要靠你在這裡擋。
4. 跟範本慣例不同的地方（例如 Q1 的 id 前綴、Q3 的存法），設計文件-delta 要寫明「偏離了什麼、為什麼」。

---

## 第 2 段：開工（同一個對話，先把模型切成 Sonnet 5.5）

```
文件我看過了，開工。照 docs/TASKS.md 逐項實作，每做完一個回報一行。
完成的定義（全部達成才算完成，不要提前回報）：
1. dotnet build 0 警告 0 錯誤；dotnet test 全綠，測試涵蓋：必填缺漏、單選值不在允許清單、rating 不在 1～5、字數上限（organization 30、suggestion 200）、正常送出、查全部（新的在最前面）。
2. POST /api/survey 回 201＋Location；驗證失敗回 400，errors 的鍵是 camelCase、訊息繁中。GET /api/survey 回 200，形狀是 ModelResult<List<T>>。
3. 端點、欄位名、型別、中文單選值都不准改，逐字對齊 useSurveyResponses.before.ts 的 SurveyResponse。回應剛好 10 欄：
   id, respondentName, organization, rating, bestSection, difficulty, adoptPlan, suggestion, willRecommend, submittedAt
   - rating 是數字 1～5；willRecommend 是字串「是」或「否」，不是 boolean。
   - respondentName、suggestion 是選填，沒填時是空字串 ""。
   - POST 的 body 是扣掉 id、submittedAt 的 8 欄；body 帶了 id、submittedAt 也要忽略。
4. 單選值用中文，逐字含半形空格。DTO 的 [AllowedValues] 寫中文，跟資料庫 CHECK 共用同一份常數（比照範本 MemberEnums.cs）：
   - bestSection：為什麼要 harness／範本與規矩／生成新模組／LOOP 驗證
   - difficulty：太簡單／剛好／太難
   - adoptPlan：寫 CODE-RULES／整理範本／PRD 流程／LOOP 驗證
   - willRecommend：是／否
   資料表用 text 或 varchar(n) 存中文（PostgreSQL 是 UTF-8，varchar(n) 算字數）。Q3 裁決改存英文 key 的話，對照表寫進設計文件-delta；API 進出一律是中文。
```

**你應該看到**：AI 照任務清單一項一項做，每做完回報一行。做完先自己走一次 README 第六節的三路驗收。

---

## 第 3 段：LOOP（在工作坊根目錄貼）

> 開一個新的 AI Agent，工作目錄是工作坊根目錄（`AI_CRUD_Workshop_Backend_EASY\`）。
> 鐵律、埠、對抗審查、要交哪些檔，都寫在 `step4_loop_e2e/LOOP-規矩.md`（step6 的差別在第 7 節），AI 會自己讀，prompt 只要一句「照它做」。

```
你是 LOOP 工程師，照 step4_loop_e2e/LOOP-規矩.md 做（step6 的差別在第 7 節），自己跑完，中途不要問我。
受測：step6_survey_api/my-survey-api（API）。先在背景啟動它（埠被占就自己換），修到 dotnet build 0 警告、dotnet test 全綠。
全綠後開一個子代理做對抗審查：先用 HTTP 實打 POST／GET /api/survey 的 201／400／200，再跑 verify-seam.ps1，對照 PRD 和 useSurveyResponses.before.ts 挑問題，也挑測試的假綠。
最後照規矩交 LOOP-LOG.md、LOOP-REPORT.html，並更新 SRS-delta、設計文件-delta 和圖。
```

**你應該看到**：`step6_survey_api/my-survey-api/loop/` 裡有 `LOOP-LOG.md`（每輪的流水紀錄）和 `LOOP-REPORT.html`（給人看的報告，結論在最前面）。`docs/` 的三份文件有標「step6 LOOP 後」。

---

## 常見歪樓與怎麼打斷

| 歪樓 | 你會看到 | 打斷的話 |
|---|---|---|
| 端點改名 | 生出 `/api/survey/responses` 或 `/api/surveys` | 「端點是凍結契約，前端那行 TODO 寫的是 `/api/survey`，請改回來。契約以已經存在的那一端為準。」 |
| 自己發明欄位 | 多了 `email`、`phone`、`score` | 「PRD 第 3 節只有 8 個欄位，請刪掉 PRD 沒有的。不准發明需求。」 |
| 欄位改名 | 生出 `name`／`org`／`satisfaction`，或把 `willRecommend` 做成 boolean | 「欄位名與型別以 `useSurveyResponses.before.ts` 的 `SurveyResponse` 為準，逐字對齊。契約以已經存在的那一端為準。」 |
| 單選值換英文 | `[AllowedValues("too-easy", "just-right", "too-hard")]` | 「前端送來的就是中文『太簡單／剛好／太難』。`[AllowedValues]` 要寫中文，逐字含半形空格。」 |
| 偷加端點 | 多了 `GET /api/survey/{id}`、`/api/survey/stats` | 「PRD 第 6 節明講範圍外。沒經過裁決的一律移除，要建議請列在單獨區塊。」 |
| 文件少段落、沒有圖 | 只有 SRS-delta，或沒有 `DIAGRAMS-問卷API.html` | 「照 SRS-設計文件-最小樣板.md 補齊：SRS-delta 四段、設計文件-delta 四段、DIAGRAMS 四張圖。補完再停下等我。」 |
| 回應沒封裝 | 直接回 `List<SurveyResponse>` | 「回應一律 `ModelResult<T>` 封裝，見 `contract-conventions-summary.md`。唯一例外是 DELETE 204。」 |
| 錯誤訊息英文 | `"Organization is required"` | 「對外訊息一律繁體中文，見 `CLAUDE.md` 第 9 條。」 |
| 假綠 | 測試改寬鬆、刪掉斷言 | 「把斷言改回去。測試變綠的唯一合法方式是修好 App，不是放寬測試。」 |
| 直接改資料庫 | 用 SQL 手動加欄位 | 「改綱要一律走 EF migration，見 `CLAUDE.md` 第 7 條。」 |

> **這張表跟 step3 的歪樓對照表是同一套心法**：AI 不是壞，是它沒有你的上下文。
> 規矩寫下來它就守；沒寫下來它就自己發明——這正是 step1 三項對照講的事。
