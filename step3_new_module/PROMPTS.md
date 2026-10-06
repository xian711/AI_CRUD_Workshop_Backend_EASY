# Step 3｜Prompt 包（複製即用）

這一頁的 prompt 都可以整段複製貼上。用 **Agent 模式**跟 AI 對話（它需要能自己讀檔、改檔、跑指令）。

順序：

1. 做 3.0 準備工作區。
2. 貼【起手 prompt】。
3. AI 出選擇題，你一題一題回答。
4. AI 照最小樣板交出 SRS-delta、設計文件-delta、UML 圖和任務清單，你確認。
5. 你說「開工」，AI 逐項寫程式、每做完一個回報一行。
6. 最後貼【收工檢查 prompt】。

> **前提**：先完成下面的 3.0，把範本 API 複製成 `my-equipment-api`，並在該資料夾開 Agent——Agent 工作目錄＝`my-equipment-api` 專案根目錄，以下 prompt 提到的檔案都在這個根目錄（或其子目錄）內。

---

## 3.0 準備工作區指令

在**工作坊根目錄**（`AI_CRUD_Workshop_Backend_EASY\`）開 PowerShell 執行：

```powershell
# 1. 複製範本 API 成你自己的工作專案（harness 四件在範本根目錄，會一起帶走）
Copy-Item -Recurse step2_speedrun_kit\2.5_sample_api\sample-api step3_new_module\my-equipment-api

# 2. 把 PRD 和最小樣板放進專案（AI 才讀得到需求和交件格式）——不複製任何答案檔
Copy-Item step3_new_module\PRD-中心裝備物資-後端.md step3_new_module\my-equipment-api\
Copy-Item step3_new_module\SRS-設計文件-最小樣板.md step3_new_module\my-equipment-api\

# 3. 進入專案資料夾，在「這個資料夾」開 AI Agent（工作目錄＝專案根目錄）
cd step3_new_module\my-equipment-api
```

> **只複製 PRD 和最小樣板，別的都不要搬。** `step3_new_module\solution-api\`（參考解）、`step3_new_module\docs\`（參考解的文件）與 `instructor\`（範圍答案）都不進工作區——答案在手邊，釐清練習就沒了。

> 複製完確認 harness 四件有跟著過來：`my-equipment-api` 根目錄看得到 `CLAUDE.md`、`CODE-RULES-api-本專案.md`、`contract-conventions-summary.md`、`使用說明-複製範本開發新API模組.md`，外加給 Codex 用的 `AGENTS.md`（少了就回頭檢查步驟 1 的來源路徑）。

---

## 【起手 prompt】

> 複製下面四行貼給 AI。庫名、build 零警告、不准刪測試這些鐵律，已經寫在 `CLAUDE.md` 和 PRD 第 6 節，AI 會自己讀，prompt 不用重講。

```
用 .NET CRUD 範本（人員 API）做新模組「中心裝備物資」的後端 API，走規格驅動開發（SDD）：先文件，再程式。
先讀 CLAUDE.md、AGENTS.md 指到的 harness 規則檔，和 PRD-中心裝備物資-後端.md，先不要寫程式。
PRD 第 5 節的待釐清點和其他沒寫清楚的地方，用選擇題逐題問我，每題標出建議和一句理由。
我拍板後，照 SRS-設計文件-最小樣板.md 產出 SRS-delta、設計文件-delta、UML 圖和任務清單；等我說「開工」才寫程式，每做完一個回報一行。
```

> **模型怎麼選：** 文件階段（選擇題、SRS、設計文件、圖）用 **Opus 5.5**、effort High（effort＝讓 AI 想得多深的設定）。說「開工」前，把模型切成 **Sonnet 5.5**——有 harness 和範本，寫程式不用最貴的模型。

---

## 【釐清階段】AI 會問你什麼

貼完起手 prompt，AI 會用選擇題問你 PRD 第 5 節的六題，可能再多問幾題（追加題）。**長相示範**如下（只是格式示範，不是答案；完整六題與參考答案在講師版 `SCOPE-後端課堂範圍決策.md`，講師在你答完後發放）：

```
Q1. 品項編碼 code（如 IT-LAP-001）由誰產生？
  (a) 前端算好傳給後端
  (b) 後端產生，前端只做預覽
  (c) 資料庫 trigger 產生
```

每題 AI 會附建議和一句理由——那是它當場的判斷，你可以採納也可以不採納。直接回「Q1 選 b、Q2 選 a…」就好。每一題想一下**為什麼**，課後跟講師的答案比對。

---

## 【收工檢查 prompt】

AI 說做完之後，先讓它自己跑一輪證據，你再動手驗：

```
做完的話，依序執行並回報每一步的實際輸出，不要只說「應該會過」：
1. dotnet build：0 警告 0 錯誤。
2. dotnet test：恰好幾條、幾條通過（對照 docs/TASKS.md）。
3. dotnet run（port 5080）：swagger 上有五條 equipment 路由。
4. 對照 PRD 第 7 節驗收條件，逐條回報過或不過。
任何一步紅了就停下回報，不要降低驗證標準。
```

然後**換你親自驗**（AI 說的不算，親眼看到才算）。開另一個 PowerShell 視窗：

```powershell
# --- 驗收 1：swagger 五路由各打一次 ---
# 先確認 API 有跑（在 my-equipment-api 資料夾）：
#   dotnet run --project src\CrudTemplate.Api --urls http://localhost:5080
# 瀏覽器開 http://localhost:5080/swagger，五條路由各執行一次：
#   GET /api/equipment/items          → 200，24 筆
#   GET /api/equipment/items/E-001    → 200；改打 E-999 → 404
#   POST /api/equipment/items         → 201＋Location，code/id 由後端產生
#   PUT /api/equipment/items/{id}     → 200；不存在的 id → 404
#   DELETE /api/equipment/items/{id}  → 204；再刪一次 → 404

# --- 驗收 2：測試全綠（在 my-equipment-api 資料夾） ---
dotnet test

# --- 驗收 3：psql 直查資料庫，親眼看到 24 筆 ---
# psql 預設不在 PATH，用絕對路徑（版號依你安裝的為準）：
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d ai_crud_equipment -c "SELECT count(*) FROM equipment_item;"
# 應回 24（驗收時新增／刪除過，數字會不同——重點是「資料真的在資料庫裡」）
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d ai_crud_equipment -c "SELECT id, code, name, qty FROM equipment_item ORDER BY id LIMIT 5;"
```

> 密碼輸入 `12345`（課堂 DEMO 連線；`postgres/12345` **僅限本機教室 DEMO，不得沿用公司／正式環境**，正式環境改用環境變數 `PGPASSWORD`／`ConnectionStrings__Default` 帶密碼）。最後一招最重要：**資料在 PostgreSQL 裡查得到，才叫真的持久化**。

---

## 【常見歪樓對照表】

| 狀況 | 怎麼回 |
|------|--------|
| **AI 沒提問就直接動工**（開始建 Entity、改檔案） | 「停，先不要寫程式、不要建檔案。先用選擇題逐題問我 PRD 第 5 節的六題，我拍板後再產出文件和任務清單，等我說『開工』。」 |
| **AI 想幫分類字典建資料表** | 「字典建不建表是我要裁決的題目。請列成選擇題（建表 vs 程式常數，各有什麼取捨）讓我選。」 |
| **AI 想改範本正本**（`docs/baseline/` 的 SRS、設計文件） | 「範本正本不准改。差異一律寫進 docs/ 的 SRS-delta 和設計文件-delta。」 |
| **文件少段落、沒有圖** | 「照 SRS-設計文件-最小樣板.md 補齊：SRS-delta 四段、設計文件-delta 四段、DIAGRAMS 四張圖。補完再停下等我。」 |
| **AI 測試紅了想刪測試或放寬斷言** | 「不准刪測試、不准放寬斷言。先回報哪條紅、原因是程式錯還是測試錯，等我裁決。」 |
| **AI 一次倒出全部程式碼在對話裡** | 「不要貼程式碼在對話裡，直接寫進專案檔案，每完成一個任務回報一行。」 |

---

## 【修正 prompt 範本】

驗收發現問題時，用「看到／期望／只改這個」三段式。一次只提一個問題。

```
我用 swagger 打【POST /api/equipment/items】時看到【回傳的 code 是空字串】，
我期望【code 由後端依「類別碼-項目碼-流水3碼」規則產生，例如 IT-LAP-003】。
請只修這一個問題，改完告訴我動了哪個檔，並重跑受影響的測試；文件有影響就一起改。
```

兩次修不好就換個說法重新描述（給具體的輸入與輸出），別在同一串繼續盧。
