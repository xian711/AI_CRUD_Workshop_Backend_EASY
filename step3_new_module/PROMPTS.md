# Step 3｜Prompt 包（複製即用）

這一頁的 prompt 都可以整段複製貼上。用 **Agent 模式**跟 AI 對話（它需要能自己讀檔、改檔、跑指令）。

順序：先做 3.0 準備工作區 → 貼【起手 prompt】→ AI 出選擇題你回答 → AI 出 SRS-delta／SDD-delta 與任務清單你確認 → 實作中盯進度 → 最後貼【收工檢查 prompt】。

> **前提**：先完成 README 的 [3.0 準備工作區](README.md)，把範本 API 複製成 `my-equipment-api` 並在該資料夾開 Agent——Agent 工作目錄＝`my-equipment-api` 專案根目錄，以下 prompt 提到的檔案都在這個根目錄（或其子目錄）內。

---

## 3.0 準備工作區指令

在**工作坊根目錄**（`AI_CRUD_Workshop_Backend_EASY\`）開 PowerShell 執行：

```powershell
# 1. 複製範本 API 成你自己的工作專案（harness 四件在範本根目錄，會一起帶走）
Copy-Item -Recurse step2_speedrun_kit\2.5_sample_api\sample-api step3_new_module\my-equipment-api

# 2. 只把 PRD 放進專案（AI 才讀得到需求）——不複製任何答案檔
Copy-Item step3_new_module\PRD-中心裝備物資-後端.md step3_new_module\my-equipment-api\

# 3. 進入專案資料夾，在「這個資料夾」開 AI Agent（工作目錄＝專案根目錄）
cd step3_new_module\my-equipment-api
```

> **只複製 PRD，別的都不要搬。** `solution-api\`（參考解）與 `..\instructor\`（範圍答案）都不進工作區——答案在手邊，釐清練習就沒了。

> 複製完可先確認 harness 四件有跟著過來：`my-equipment-api` 根目錄應該看得到 `CLAUDE.md`、`CODE-RULES-api-本專案.md`、`contract-conventions-summary.md`、`使用說明-複製範本開發新API模組.md`，外加給 Codex 用的 `AGENTS.md`（少了就回頭檢查步驟 1 的來源路徑）。

---

## 【起手 prompt】

> 複製下面整段貼給 AI。這一段最重要，它同時交代了「先讀什麼、先別做什麼、要怎麼問、做完長什麼樣」。

```
你是本專案的後端工程師。我們要用現成的 .NET CRUD 標準範本（人員 CRUD），開發一個新模組「中心裝備物資」的後端 API，讓前端課做出來的裝備物資模組從 mock 變成真資料。

請先「依序」讀完以下文件（皆在專案根目錄），讀完再動作：
1. CLAUDE.md（專案憲法、所有規則的入口；它會指名要你接著讀的 harness 規則檔）
2. AGENTS.md（代理工作方式與工作流程約定）
3. CLAUDE.md／AGENTS.md 指向的其餘 harness 規則檔（六條鐵律、後端 CODE-RULES：分層、命名、驗證、測試等，檔名以根目錄實際為準）
4. PRD-中心裝備物資-後端.md（本模組需求：契約欄位表、編碼規則、種子要求——注意它第 5 節刻意留了待釐清的空白）

【重要】讀完後「先不要寫任何程式、不要建任何檔案」。PRD 刻意不給實作決策（例如編碼誰產生、id 怎麼產、刪除策略、分頁在哪做），這些需要我裁決。

所以請你先做一件事：**以「選擇題」的形式，向我提出 5 到 7 題需求釐清問題。**
- 每題 2 到 4 個選項；
- 每題標出你「建議的選項」並附一句理由；
- 至少涵蓋 PRD 第 5 節列的待釐清點：code 編碼誰產生與唯一性、id 怎麼產、分類字典要不要建表、刪除策略（硬刪／軟刪）、分頁篩選排序在哪做、purchaseDate 可否為空與存法。

等我逐題選完，你再輸出：
(a) SRS-delta 與 SDD-delta（寫進 docs/，只記「與人員範本的差異」，不要改動範本的 SRS/SDD 正本）；
(b) 任務清單（T1、T2… 編號），然後停下來等我確認，我說「開工」你才開始。

實作順序照範本分層：Entity → migration → DTO（Request/Result）→ Mapper → Service → Controller → seed（24 筆，與 PRD 第 4.3 節一致）→ 測試。

其他鐵律：
- 連線字串：開發庫改用 ai_crud_equipment，整合測試庫改用 ai_crud_equipment_test（比照範本 appsettings 與測試工廠的位置改，不要動人員範本用的庫名以外的東西）。
- 完成前必須 dotnet build（0 警告 0 錯誤）與 dotnet test 全綠；不准刪測試、不准放寬 assertion 來換綠燈。
- 每完成一個任務回報「一行」進度；最終回覆控制在 10 行內：做了什麼、測試數、怎麼驗證。
```

---

## 【釐清階段】AI 會問你什麼

貼完起手 prompt，AI 應該回你 5-7 題選擇題，**長相示範**如下（這題只是示範格式，不是答案；完整六題與參考答案見講師版 `SCOPE-後端課堂範圍決策.md`，講師於你答完後發放）：

```
Q1. 品項編碼 code（如 IT-LAP-001）由誰產生？
  (a) 前端算好傳給後端
  (b) 後端產生，前端只做預覽
  (c) 資料庫 trigger 產生
```

AI 實際問你的時候，每題應該會附上它建議的選項與一句理由——那是 AI 當場的判斷，你可以採納也可以不採納，自己想清楚再拍板。你可以直接回「Q1 選 b、Q2 選 a…」。每一題想一下**為什麼**——課後講師會發答案讓你比對自己的裁決。

---

## 【收工檢查 prompt】

AI 說做完之後，先讓它自己跑一輪證據，你再動手驗。把這段貼給 AI：

```
開發完成的話，請依序執行並回報每一步的實際輸出（不要只說「應該會過」）：
1. dotnet build——確認 0 警告 0 錯誤。
2. dotnet test——回報「恰好幾條測試、幾條通過」。
3. 啟動 API（dotnet run，port 5080），確認 swagger 上有五條 equipment 路由。
4. 對照 PRD 第 7 節驗收條件逐條回報通過與否。
有任何一步紅的，先停下來回報，不要自行降級驗證標準。
```

然後**換你親自驗**（AI 說的不算，親眼看到才算）。開另一個 PowerShell 視窗：

```powershell
# --- 驗收 1：swagger 五路由各打一次 ---
# 先確認 API 有跑（在 my-equipment-api 資料夾）：
#   dotnet run --project src\CrudTemplate.Api --urls http://localhost:5080
# （若你改過專案資料夾名稱，路徑以你的實際結構為準）
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
# 應回 24（若你驗收時新增/刪除過，數字會不同——重點是「資料真的在資料庫裡」）
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d ai_crud_equipment -c "SELECT id, code, name, qty FROM equipment_item ORDER BY id LIMIT 5;"
```

> 密碼提示輸入 `12345`（課堂 DEMO 連線；`postgres/12345` **僅限本機教室 DEMO，不得沿用公司／正式環境**，正式環境請改用環境變數如 `PGPASSWORD`／`ConnectionStrings__Default` 帶密碼）。最後一招最重要：**資料在 PostgreSQL 裡查得到，才叫真的持久化**——這正是這堂課跟前端課最大的差別。

---

## 【常見歪樓對照表】

| 狀況 | 怎麼回 |
|------|--------|
| **AI 沒提問就直接動工**（開始建 Entity、改檔案） | 立刻打斷，貼：「停，先不要寫程式、不要建檔案。請先照起手 prompt 的要求，以選擇題形式向我提出 5-7 題釐清問題（每題附選項與建議），等我選完你才動工。」 |
| **AI 想幫分類字典建資料表**（equipment_category 表＋外鍵） | 這是釐清題之一，不要讓它自作主張。回：「分類字典建不建表是我要裁決的範圍題，請把它列成選擇題（建表 vs 程式常數，各有什麼取捨）讓我選，不要直接動工。」 |
| **AI 想改 SDD／SRS 正本**（動到範本的標準文件） | 回：「範本的 SRS/SDD 是標準正本，不可修改。裝備模組與範本的差異一律寫進 docs/ 下的 SRS-delta 與 SDD-delta，正本一個字都不要動。」 |
| **AI 測試紅了想刪測試或放寬 assertion** | 回：「不准刪測試、不准放寬 assertion。請先回報是哪條測試紅、紅的原因是程式錯還是測試錯，等我裁決。」 |
| **AI 一次倒出全部程式碼在對話裡** | 回：「不要把程式碼貼在對話裡，直接寫進專案檔案，每完成一個任務回報一行就好。」 |

---

## 【修正 prompt 範本】

驗收發現問題時，用「看到 / 期望 / 只改這個」三段式。一次只提一個問題。

```
我用 swagger 打【POST /api/equipment/items】時看到【回傳的 code 是空字串】，
我期望【code 由後端依「類別碼-項目碼-流水3碼」規則產生，例如 IT-LAP-003】。
請只修這一個問題，改完告訴我動了哪個檔，並重跑受影響的測試。
```

兩次修不好就重新描述問題（換個說法、給具體的輸入與輸出），別在同一串繼續盧。
