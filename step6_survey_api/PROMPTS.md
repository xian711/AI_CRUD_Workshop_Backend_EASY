# step6 起手 prompt（三段，照順序貼）

> **在哪裡貼**：`step6_survey_api/my-survey-api/` 資料夾底下開 AI Agent（要能讀檔改檔），
> 工作目錄就是那個專案根目錄——這樣 AI 才會自動讀到 `CLAUDE.md`。
> **貼之前先確認**：`PRD-課程回饋問卷.md` 已經複製進那個資料夾了。

---

## 第 1 段：先問問題，不要寫程式

```
你是這個 .NET CRUD 專案的後端工程師。

先讀這些檔（不要跳過，也不要只讀一部分）：
- CLAUDE.md（專案憲法：技術棧鎖定、10 條程式規則、契約要點）
- CODE-RULES-api-本專案.md（程式與資料表細則）
- contract-conventions-summary.md（狀態碼矩陣、ModelResult、SEQUENCE、D 決策）
- docs/baseline/SRS-CRUD後端標準-v1.2.md 與 SDD-CRUD後端標準-v1.6.md（範本規格）
- PRD-課程回饋問卷.md（本次需求）

任務背景：
PRD 是「寫給前端」的，前端已經做好了，資料存在瀏覽器 localStorage，
資料層留了一行 `// TODO: DEV 串接 POST /api/survey`。
現在要把那一行變成真的：做出 POST /api/survey 與 GET /api/survey。

端點名稱是凍結的契約，必須逐字使用 /api/survey，不准改成 /api/survey/responses
或任何你覺得比較漂亮的寫法——因為前端那一行已經那樣寫了。

【現在請你做的事，只有這一件】
這份 PRD 是寫給前端的，所以有些後端必須決定的事它沒有寫。
請列出 5～7 題「需求釐清選擇題」問我，每題 2～4 個選項、標明你建議哪一個並說明理由。

【嚴格禁止】
- 不准開始寫任何程式碼、Entity、migration 或測試。
- 不准自己替我決定，然後才「順便告訴我」。
- 不准發明 PRD 裡沒有的欄位或商業規則。
- 出完題就停下來等我回答。
```

**你應該看到**：AI 回你 5～7 題選擇題，涵蓋 id 產生、時間戳、選項值存法、後端要不要重驗、
清空／匯出誰做、GET 要不要保護分頁。**如果它直接開始寫 Entity，代表它沒讀規則——重貼一次。**

---

## 第 2 段：拍板之後，先出文件再出程式

```
我的裁決如下（每題附我的理由）：

Q1 <你的答案>：<理由>
Q2 <你的答案>：<理由>
Q3 <你的答案>：<理由>
Q4 <你的答案>：<理由>
Q5 <你的答案>：<理由>
Q6 <你的答案>：<理由>

【現在請你做的事】
1. 產出 docs/SRS-問卷API-delta.md：只寫「與範本 SRS 不同的部分」。
   範本已有的通則（分層、統一封裝、camelCase 契約、啟動自動遷移＋冪等 seed）不要重述。
2. 產出 docs/SDD-問卷API-delta.md：只寫與範本 SDD 不同之處。
   一定要包含：狀態碼矩陣（含 survey 列）、資料表綱要、以及
   **每一處「偏離範本慣例」的地方和偏離的理由**。
3. 產出 docs/TASKS.md：逐檔任務清單，每項標明檔名與大概在做什麼。

【嚴格禁止】
- 還是不准寫程式碼。先讓我看過文件與任務清單。
- 不准偷加我沒裁決的功能（例如統計端點、匯出端點、軟刪除）。
- 任務清單裡如果有 PRD 沒要求的東西，請單獨列在「建議但未經裁決」區塊，不要混進主清單。

出完三份文件就停下來等我說「開工」。
```

**你應該看到**：三份文件。**重點檢查「建議但未經裁決」區塊**——
這就是 step1 第三項對照講的「多出來的東西」，harness 擋不住，要靠你在這裡擋。

---

## 第 3 段：開工

```
文件我看過了，開工。照 docs/TASKS.md 逐項實作。

【完成的定義】（沒有全部達成就不算完成，不要提前回報）
1. dotnet build 零 warning 零 error（Mapperly 警告視同錯誤）。
2. dotnet test 全綠，且測試涵蓋：必填缺漏、選項值不在允許清單、字數上限、正常送出、查全部。
3. POST /api/survey 回 201 + Location；驗證失敗回 400 且 errors 為 camelCase、訊息繁中。
4. GET /api/survey 回 200，形狀是 ModelResult<List<T>>。
5. 回應欄位剛好 10 欄，camelCase，逐字對齊：
   id, name, org, satisfaction, bestSection, difficulty, adoptFirst, comment,
   wouldRecommend, submittedAt

【LOOP 規則（照 step4 學過的）】
- 紅了先判因：是測試本身寫錯、API bug、還是資料庫 bug？講清楚再修。
- 不准為了讓燈變綠而刪測試、放寬斷言、或改成寬鬆比對。
- 同一個問題連續修兩次還沒好，停下來報告，不要無限撞牆。

【回報格式】
只列 changed files、build/test 結果、下一步，20 行內。
```

---

## 常見歪樓與怎麼打斷

| 歪樓 | 你會看到 | 打斷的話 |
|---|---|---|
| 端點改名 | 生出 `/api/survey/responses` 或 `/api/surveys` | 「端點是凍結契約，前端那行 TODO 寫的是 `/api/survey`，請改回來。契約以已經存在的那一端為準。」 |
| 自己發明欄位 | 多了 `email`、`phone`、`rating` | 「PRD 第 3 節只有 8 個欄位，請刪掉 PRD 沒有的。不准發明需求。」 |
| 偷加端點 | 多了 `GET /api/survey/{id}`、`/api/survey/stats` | 「PRD 第 6 節明講範圍外。沒經過裁決的一律移除，要建議請列在單獨區塊。」 |
| 回應沒封裝 | 直接回 `List<SurveyResponse>` | 「回應一律 `ModelResult<T>` 封裝，見 `contract-conventions-summary.md`。唯一例外是 DELETE 204。」 |
| 錯誤訊息英文 | `"Org is required"` | 「對外訊息一律繁體中文，見 `CLAUDE.md` 第 9 條。」 |
| 假綠 | 測試改寬鬆、刪掉斷言 | 「把斷言改回去。測試變綠的唯一合法方式是修好 App，不是放寬測試。」 |
| 直接改資料庫 | 用 SQL 手動加欄位 | 「改綱要一律走 EF migration，見 `CLAUDE.md` 第 7 條。」 |

> **這張表跟 step3 的歪樓對照表是同一套心法**：AI 不是壞，是它沒有你的上下文。
> 規矩寫下來它就守；沒寫下來它就自己發明——這正是 step1 三項對照講的事。
