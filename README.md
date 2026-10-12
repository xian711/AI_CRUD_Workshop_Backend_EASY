# AI CRUD 工作坊 — Backend EASY 版

> 一句話：**把假資料變真的**——2 小時學會用「CRUD 後端範本＋AI harness」，讓上一堂前端課的裝備物資模組接上真的 .NET API 與 PostgreSQL；課程目標是讓新模組的後端骨架（API＋資料表＋測試）在一小時內長出來（依 AI Agent 與網路情況而異）。

## 快速開始（學員）

```powershell
# 1. 前置檢查（.NET SDK、PostgreSQL、埠號、磁碟等 12 項）
cd step0_course_intro
.\preflight.ps1

# 2. 全數 PASS（含 WARN 也算通過）後，打開 START_HERE.md 開始上課
```

照 `step0 → step1 → step2 → step3 → step4 → step5` 順序走，每個資料夾都有 README 帶路，**不要跳步**。
step6 是**課後練習**，課堂不做。
想看圖文版完整流程：用瀏覽器開 [HANDBOOK/HANDBOOK.html](HANDBOOK/HANDBOOK.html)（雙擊即可，免安裝、免連網，有目錄與深淺色切換）。

> 想先看一遍 AI 怎麼做？用瀏覽器打開 **`HANDBOOK/animation/index.html`**：教學動畫（講課版），看 AI 照 harness、SDD（規格驅動開發：先文件、再程式；程式改了，文件跟著改）、LOOP、對抗審查把裝備物資接上 .NET API＋PostgreSQL，全程實拍（Windows 版，約 19 分鐘，有字幕和雙人預錄配音）。
>
> 要邊看邊做，打開 **`HANDBOOK/animation-hands/index.html`**：手把手版（跟著做），Step 0～5 每一步都示範點哪裡、貼哪一段、看到什麼就對了（54 段、約 28 分鐘；含 Step 4「回報前端、修好教材前端」的實拍）。

## 課程地圖

| 資料夾 | 內容 | 時間 |
|--------|------|:---:|
| [step0_course_intro/](step0_course_intro/) | 課程說明、前置檢查、大綱與預期效益 | 10 分 |
| [step1_why_harness/](step1_why_harness/) | 為什麼要 harness：同一句後端需求，有／沒有 harness 的產出對比 demo | 10 分 |
| [step2_speedrun_kit/](step2_speedrun_kit/) | 後端快速完工秘笈：玩範本 API → SRS／設計文件（DESIGN）→ harness 四件 → 分層架構＋DB 綱要 → 範本程式 | 35 分 |
| [step3_new_module/](step3_new_module/) | 複製範本開發新模組：真實 PRD → AI 釐清選擇題 → SRS-delta、設計文件-delta 和圖 → API／Migration／測試 → 驗收（規格驅動開發 SDD：先文件、再程式） | 40 分 |
| [step4_loop_e2e/](step4_loop_e2e/) | LOOP 工程：貼一個指令，AI 自己跑前後端全鏈路 E2E 修到綠，再開子代理對抗審查，交回報告 | 20 分 |
| [step5_wrapup/](step5_wrapup/) | 課程總結、評量量表（RUBRIC）、回去公司怎麼用 | 5 分 |
| [step6_survey_api/](step6_survey_api/) | **課後練習**：把前端課問卷那行 `// TODO: DEV 串接 POST /api/survey` 變成真的 API | 課後 |
| [HANDBOOK/](HANDBOOK/) | step-by-step 圖文學習手冊 | 課後自學 |
| [instructor/](instructor/) | 講師專用：時間軸手冊、SCOPE 答案、checkpoint 套用腳本（學員請勿先看） | 講師 |

> 總時間 120 分為**目標**，非承諾（尚無真人 dry run 數據）。

## 兩個可以跑的專案

| 專案 | 位置 | 怎麼跑 |
|------|------|--------|
| 範本正本（人員 CRUD API） | `step2_speedrun_kit/2.5_sample_api/sample-api/` | `dotnet run` → http://localhost:5080/swagger |
| 參考解（含裝備物資模組 API） | `step3_new_module/solution-api/` | 同上 → http://localhost:5080/swagger |

兩個 API 都用 **port 5080**，**一次只跑一個**。首跑會自動還原套件、建資料庫並 Migrate＋Seed。

> **為什麼參考解沒有 harness 四件？**
> `sample-api`（範本正本）的專案根目錄有 `CLAUDE.md`／`AGENTS.md`／`CODE-RULES-api-本專案.md`／
> `contract-conventions-summary.md`／`使用說明-複製範本開發新API模組.md`，複製開新模組時會一起帶走。
> **參考解 `solution-api` 刻意不放這五份**——它是拿來「跑起來看、對照結果」的，
> **不要在裡面開 AI Agent 工作**。你的 AI 該工作的地方是你自己的 `my-equipment-api`，
> 那裡的規則是從範本帶過去的。這也是為什麼 step4 的 `run-e2e.ps1` 預設驗你自己的作品，
> 官方解只能用 `-UseCheckpoint` 明示 fallback：**每一盞綠燈都必須來自你自己的作品。**

step4 另有一份**前端成品** `step4_loop_e2e/fullchain-app/`（裝備物資雙模式版 Nuxt）。跑全鏈路有兩種模式，**用途不同、埠號也不同**：

| 模式 | 怎麼跑 | 埠號 | 用途 |
|---|---|---|---|
| **手動展示模式** | 自己開兩個視窗：先 `dotnet run` 起 API（5080），再到 `fullchain-app` 設 `NUXT_PUBLIC_USE_API=true` 後 `pnpm dev`（預設 3100；要對齊下方一鍵模式的埠號可加 `--port 3199`） | 5080（API）＋前端預設 3100（可 `--port 3199`） | 課堂即時展示、手動點畫面驗證 |
| **一鍵 E2E 模式** | `step4_loop_e2e/run-e2e.ps1`：自己建 `_e2e` 專用資料庫、背景起 API、背景起前端（預設 3199，可用 `BASE_URL` 換）、跑完 6 條 Playwright 測試、無論成敗都 teardown 釋放埠 | 5080（API）＋3199（前端，固定） | 自動化驗收／LOOP 紅→綠，不用另開視窗手動啟服務 |

> 一鍵 E2E 模式的前端埠**預設 3199**（被占用就設 `BASE_URL` 換，API 用 `API_URL`），跟手動模式的預設埠 3100 不是同一個，兩者互不影響；加 `-ReuseRunning` 可以沿用已經開著的前端。

> 測試數量、種子筆數等實測值以 `step3_new_module/docs/` 文件與 step4 實跑為準，本 README 不預先寫死。

## 這門課的題目是真的

step3 的 PRD 是從**某防救災系統的真實頁面**（中心裝備物資）逆向整理的，帶著「原系統沒有刪除功能」「編碼要不要後端自動產生」這類真實缺口——所以你會學到最重要的一課：**先用選擇題釐清範圍（SCOPE 六題），再動工**。答案只放 `instructor/`，學員教材只出題不給答案。

## 與其他版本的關係

- **與前端 EASY 版的關係**：本課是 `AI_CRUD_Workshop_Frontend_EASY` 的**續集**。前端課把裝備物資模組做成 mock（記憶體假資料），本課把它接上真的 API 與資料庫。沒上過前端課也能上——step4 附現成前端成品。
  前端課的課後驗收題（課程回饋問卷）刻意留了一行 `// TODO: DEV 串接 POST /api/survey`，**本課的 [step6_survey_api/](step6_survey_api/) 就是把那一行變成真的**——需求沿用同一份 [PRD-課程回饋問卷.md](PRD-課程回饋問卷.md)，不另外寫。
- **與 Backend Live 版的關係**：本 EASY 版是 `AI_CRUD_Workshop_Backend_Live` 的簡化教學版：拿掉雙 Track 對照、完整 TDD 紅綠燈治理、QA mutation 等進階內容，聚焦「harness＋範本＝快速完工」一條主線。上完 EASY 想深入，再去 Live 版。

---
教材由 Claude 多代理協作產出、Codex 對抗審查、實跑驗證後發佈。建置紀錄見 [BUILD_LOG.md](BUILD_LOG.md)。
