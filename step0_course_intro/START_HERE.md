# START HERE — AI CRUD 工作坊 Backend EASY 版

## 這門課是什麼

一門 **2 小時**的實作工作坊，是前端 EASY 版的**續集**：把上一堂課做出來的「防救災裝備物資」模組**從假資料變成真的**。

上一堂課，你的裝備物資模組是記憶體 mock——按 F5 重整，剛新增的資料就消失了。這堂課，你會用「範本 + harness + AI」生出一支真的 **.NET API** 與 **PostgreSQL 資料表**，前端只要切一個開關，資料就永久保存進資料庫。

**課程目標：讓一個全新模組的後端骨架（API + 資料表 + 測試）在一小時內長出來**（依 AI Agent 與網路情況而異；實測時間數據將隨試教梯次更新）。

全程動手做，不是聽簡報。你會實際跑一支 .NET CRUD 範本 API、用 AI harness 生出裝備物資的後端，並用一輪 LOOP（紅→判因→修→綠）＋全鏈路 E2E 確認前後端真的接起來了。

## 這門課給誰上

會寫程式、想學「用 AI 快速生出一支有規矩的後端 API」的工程師。

- **上過前端 EASY 課的人最適合**——你已經有那個 mock 前端，這堂課直接把它接上真後端，前後呼應最有感。
- **沒上過也可以**——本課 step4 附一份**現成的前端成品**（裝備物資雙模式版），你不必寫任何前端，也能看到「切換開關 → 資料進資料庫」的完整效果。

**先備知識白話版**——你需要：

- 會用終端機（PowerShell）打指令。
- 對 REST API 有基本概念（GET／POST／PUT／DELETE、狀態碼大概在做什麼）。
- 看得懂 C# 或任一種後端語言的程式碼大意（不用會寫 .NET，看懂在做什麼即可）。

你**不需要**：.NET／EF Core／PostgreSQL 實作經驗、提示詞（prompt）撰寫經驗——課程會示範怎麼下指令、怎麼讀 AI 產出的東西。

## 上完你能做到什麼

1. **看得出「有 harness」和「沒 harness」的後端產出差在哪**，並知道差異從何而來（六條鐵律、範本、系統文件 SRS/SDD）。
2. **能複製一份 CRUD 後端範本，用 AI 生成一個新模組**的 SRS/SDD delta、API 程式、資料表 Migration 與測試，並看懂 AI 主動提出的「需求釐清選擇題」（例如「編碼誰產生？」「要不要建分類字典表？」）該怎麼回答。
3. **能設計並執行一輪後端 LOOP 驗證**（注入一個後端 bug → 測試變紅 → 判斷原因 → 修 → 綠），並跑一次前後端全鏈路 E2E，確認資料真的落地到 PostgreSQL。

> 以上是課程**目標**，不是保證每個人都能在課堂內全部達成——實際進度依個人基礎與 AI Agent 狀況而定。

## 課程大綱

總時間 **120 分鐘**（這是**目標**時間，非承諾；尚無真人 dry run 數據，實測將隨梯次更新）。

| Step | 內容 | 時間 |
|------|------|:---:|
| step0 | 課程說明、前置檢查 | 10 分 |
| step1 | 為什麼要 harness（同一句後端需求，有／沒有 harness 的產出對比 demo） | 10 分 |
| step2 | 後端快速完工秘笈（玩範本 API → SRS/SDD 系統文件 → harness 四件 → 分層架構＋DB 綱要 → 範本程式） | 35 分 |
| step3 | 複製範本開發新模組（真實 PRD → AI 生成 SRS/SDD delta／API／Migration／測試 → 反覆修正） | 40 分 |
| step4 | 加速技：後端 LOOP 工程（紅→判因→修→綠）＋前後端全鏈路 E2E | 20 分 |
| step5 | 課程總結、評量量表、回去公司怎麼用 | 5 分 |

## 進行方式

- 每個 step 都有自己的資料夾，資料夾裡有一份 `README.md`（或對應說明文件）帶你走完那一步。
- **請照順序 step0 → step1 → step2 → step3 → step4 → step5 走，不要跳步**——後面的 step 會用到前面 step 產出的範本與觀念。
- step2 內又分 2.1～2.5 五個子步驟，同樣照順序做。

## 課前準備（前一天做）

以下幾件事會吃掉不少等待時間，**課堂時間不含這些等待**，請在上課前一天先做完：

1. 跑 `preflight.ps1`（見下一節），把 `[FAIL]` 項目全部處理掉（`[WARN]` 多為 step4 才需要，可稍後再補）。
2. 確認 **PostgreSQL 已裝好、5432 埠可連、帳號 `postgres` 密碼 `12345` 可登入**——這是後端課的命脈，preflight 會自動幫你驗。**`postgres/12345` 僅限本機教室 DEMO，不得沿用公司／正式環境的帳密**；正式環境請改用環境變數帶密碼。
3. 先讓範本 API 跑一次：進 `step2_speedrun_kit/2.5_sample_api/sample-api/`，`dotnet run`（首次會還原 NuGet 套件、自動建資料庫並 Migrate＋Seed）。首跑最花時間，務必課前先跑。
4. 若要做 step4 全鏈路：`step4_loop_e2e/fullchain-app/` 先 `pnpm install` 一次，E2E 首跑會下載 Chromium（約 150MB），離線教室務必課前先跑。
5. 確認你的 AI Agent（Claude Code／Codex／Cursor 等）**已登入且有額度**——這項 preflight 無法自動檢查，要自己確認。

## 開始之前：先跑前置檢查

本資料夾內的 `preflight.ps1` 會檢查你的機器有沒有準備好，共 **11 項**（PASS／WARN／FAIL 三級，任一 FAIL 會擋住開課）：

| # | 檢查項 | 級別 | 說明 |
|:-:|--------|:---:|------|
| 1 | .NET SDK ≥ 10 | FAIL | 生後端與跑測試的命脈 |
| 2 | PostgreSQL 5432 可連 | FAIL | 資料要落地的地方 |
| 3 | psql 找得到 | WARN | 找不到會改用手冊方式驗，不擋開課 |
| 4 | 資料庫帳密可登入（postgres/12345） | FAIL | 用 psql 實跑 `SELECT 1` |
| 5 | port 5080 空 | FAIL | 範本 API 與參考解 API 都用這埠 |
| 6 | port 3199 空 | WARN | step4 一鍵 E2E 的 `run-e2e.ps1` 才需要（3199 不是 3100——3100 是前端課用的埠） |
| 7 | Node ≥ 20 ＋ pnpm | WARN | step4 前端銜接才需要 |
| 8 | 磁碟剩餘 ≥ 2GB | FAIL | 還原套件與建置輸出要空間 |
| 9 | ExecutionPolicy 可執行腳本 | FAIL | Restricted/AllSigned 會擋腳本 |
| 10 | AI Agent CLI（claude/codex/cursor） | WARN | 用 IDE 內建 Agent 可忽略 |
| 11 | step4 e2e 依賴就緒（node_modules／playwright CLI） | WARN | 一鍵 E2E 才需要，step0~step3 不受影響 |

```powershell
cd step0_course_intro
.\preflight.ps1
```

看到「前置檢查全數通過，可以開課！」（含 WARN 也算通過）再進入 step1。若有 `[FAIL]` 項目，照腳本印出的修復提示處理後重跑一次。

> psql 提醒：本機 psql **不在 PATH**，preflight 會自動去 `C:\Program Files\PostgreSQL\*\bin\` 找並印出絕對路徑。step2 之後凡是要用 psql 的地方，都用那個絕對路徑（或範例給的路徑）。
