# BUILD LOG — AI CRUD Workshop Backend EASY

> 講師與維護者查閱用的建置與品質總帳。只記錄實測過的事實；沒驗證的一律標「未驗證」，不打假綠燈。

## 1. 課程定位

一句話主線：**把上一堂前端課的裝備物資模組 mock（記憶體假資料）接上真的 .NET API 與 PostgreSQL**。

- 本課是 `AI_CRUD_Workshop_Frontend_EASY` 的**續集**；沒上過前端課也能上，step4 附現成前端成品。
- 總時間 **120 分鐘是目標句，不是承諾句**——尚無真人 dry run 數據（詳見第 5 節 Gate）。

## 2. 技術基準與實測證據

以下項目都是**真跑過**的，可標 PASS。

| 驗證項目 | 結果 | 實測數字 |
|---|---|---|
| preflight | PASS | 8 PASS＋2 WARN，exit 0 |
| sample-api build | PASS | 0 warning／0 error |
| sample-api test | PASS | 49 passed／0 failed／0 skipped |
| solution-api build | PASS | 0 warning／0 error |
| solution-api test | PASS | **89 passed**（Members 49＋Equipment 40）／0 failed／0 skipped |
| CRUD 狀態碼 | PASS | POST 201＋Location、PUT 200、DELETE 204、刪後 GET 404；驗證失敗回 400，errors 為 camelCase |
| PostgreSQL 持久化 | PASS | psql 實測 `SELECT count(*)` = 24（種子筆數） |
| 後端 LOOP（lab-red-to-green） | PASS | 基準 23/23 → 注入 EV4 → 1 fail／22 pass → restore → 回到 23/23 |
| 全鏈路 E2E | PASS | 瀏覽器→Nuxt→API→PostgreSQL，**6/6** passed，exit 0 |

證據來源：`COURSE_REVIEW_TEACHER_STUDENT.md` 第 3 節實跑紀錄，及本輪 G0 修正後複測。

## 3. 契約與關鍵決策

| 項目 | 內容 |
|---|---|
| API 埠 | 5080（範本正本與參考解共用，一次只跑一個） |
| 前端埠 | 手動展示模式 3100（可加 `--port 3199` 對齊）；一鍵 E2E 模式固定 3199 |
| DB 三庫 | `ai_crud_equipment`（開發）、`ai_crud_equipment_test`（整合測試）、`ai_crud_equipment_e2e`（一鍵 E2E，尾碼 `_e2e` 才准 DROP，防呆） |
| id／code 產生 | 後端產生：`id` 用 SEQUENCE 產出 `E-###`；`code` 為同前綴 `MAX+1`（不同於範本 SEQUENCE，逼出「每前綴各自計數」的偏離決策，需記入 SDD-delta） |
| 種子資料 | 24 筆 |
| SCOPE 六題裁決 | 見 `instructor/SCOPE-後端課堂範圍決策.md`（本檔為講師總帳，只摘要有六題裁決文件，不覆述答案本文；學生教材已淨空，見第 4 節 P1-3） |

## 4. 品質審查與 G0 修正

### 4.1 審查結論摘要

`COURSE_REVIEW_TEACHER_STUDENT.md`（2026-07-12，教師／學生雙角色審查）結論：**P0 0 項、P1 7 項、P2 7 項**。判定「技術基準可跑，但目前只適合內部小班試教，不建議直接正式對外開課」；最大風險不在程式，而在 Step4 評量鏈固定驗證官方 `solution-api`，未驗證學生 Step3 產出，可能造成「假綠」。

本輪已針對 P1 逐項處理並實測驗證，如下表。

### 4.2 P1 處置與實測證據

| 編號 | 問題 | 處置 | 實測證據 |
|---|---|---|---|
| P1-1 | Step4 評量硬綁官方答案，學生作品可能假綠 | `run-e2e.ps1`／lab 三腳本加 `-ApiDir`；預設綁學生 `my-equipment-api`，官方 `solution-api` 只能用 `-UseCheckpoint` 明示 fallback；開跑與結尾都印出被測 API 的 resolved 絕對路徑與被測 DB | 讀 `step4_loop_e2e/run-e2e.ps1` 確認：`$StudentApiDir` 為預設、`$UsingCheckpoint` 需顯式 `-UseCheckpoint` 才生效；找不到學生 API 時 exit 1 並提示。**負向測試**：故意弄壞學生 API 後跑 E2E，回報紅、exit 1（證明真的在驗學生作品，非官方解冒充） |
| P1-2 | checkpoint 只救回程式片段，救不回完整評量基準 | `apply-solution-checkpoint.ps1` 補齊 Equipment 單元／整合測試、測試 factory、DB 名稱改指 `ai_crud_equipment`／`ai_crud_equipment_test`、SRS/SDD-delta 與 TASKS 文件；套用後自動跑 build→test→GET 筆數→psql DB 名稱四項驗收 | 讀腳本確認 `$apiFiles`／`$testFiles`／`$docFiles` 清單齊全；套用假學員工作區後實測：**89 條全綠**、`GET /api/equipment/items` 回 24 筆、psql `current_database()` = `ai_crud_equipment`；`restore-checkpoint.ps1` 對稱還原，實測回到 49 條 |
| P1-3 | SCOPE 答案仍在學生路徑公開 | 學生路徑（`step3_new_module/README.md`、`PROMPTS.md`）淨空六題建議與裁決，只留問題面向與空白理由欄；答案只留 `instructor/SCOPE-後端課堂範圍決策.md` | grep 全文淨空確認：答案檔僅存在於 `instructor/` |
| P1-4 | harness 四件與相對路徑指向不存在檔案 | 統一檔名（`CODE-RULES-api-本專案.md` 等）；把必要 baseline SRS／SDD 複製進 `step2_speedrun_kit/2.5_sample_api/sample-api/docs/baseline/`，讓工作區自包含 | 確認 `sample-api/docs/baseline/SRS-CRUD後端標準-v1.2.md`、`SDD-CRUD後端標準-v1.6.md` 已存在；`AGENTS.md`、`CODE-RULES-api-本專案.md` 命名一致 |
| P1-5 | 講師 GUIDE 仍是 checkpoint 未完成時的舊稿 | 重寫 `instructor/GUIDE.md` 第二節，列出實際複製檔清單、限制、指令、預期 test count（89）、DB 名稱、失敗回復方式；preflight 段落同步成 11 項 | 讀 `instructor/GUIDE.md` 確認內容與 `apply-solution-checkpoint.ps1` 實際行為一致，不再是「尚未產出」舊稿 |
| P1-6 | README 承諾的 HANDBOOK／BUILD_LOG 不存在 | 本檔即 BUILD_LOG（已建立）；**HANDBOOK 尚未建立，補製中**——本輪寫作當下磁碟上仍無 `HANDBOOK/` 目錄，屬於未完成項，不在此宣稱已補齊 | `Test-Path HANDBOOK` = False（本輪確認） |
| P1-7 | 舊 PID 清理可能誤殺無關程序 | `run-e2e.ps1` 的 PID 記錄改記 `PID＋exe path＋command line＋start time`；清理前需身分（exe／啟動時間）吻合、且該程序樹仍佔用 5080／3199 才終止；不吻合只 WARN 並刪過期記錄 | 讀 `Save-StartedPid`／`Clear-StaleProcesses` 函式確認三種情況（PID 已不存在／PID 被重用成不同程序／身分吻合但已釋放埠）皆不誤殺，只終止身分與佔用埠都吻合者 |

### 4.3 P2 群（教材與維護品質，本輪一併處理）

| 編號 | 問題 | 現況 |
|---|---|---|
| P2-1 preflight 埠位錯位 | 已修正：`preflight.ps1` 第 6 項已改查 **3199**（一鍵 E2E 用埠），不是舊版誤查的 3100 |
| P2-2 preflight 未涵蓋 Step4 依賴 | 已補：第 11 項新增 `step4 e2e 依賴就緒`（node_modules／playwright CLI），preflight 現共 **11 項自動檢查** |
| P2-3 時數漂移 | 已對齊：`step1_why_harness/README.md` 現寫「10 分鐘」，與總表一致 |
| P2-4 RUBRIC SCOPE 檔名錯誤 | 已修正：`step5_wrapup/RUBRIC.md` 現指向正確檔名 `instructor/SCOPE-後端課堂範圍決策.md` |
| P2-5 lab 清潔檢查在非 git repo 會 fatal | 已修正：`step4_loop_e2e/lab-red-to-green/README.md` 明文註記 `my-equipment-api`／`solution-api` 都不是 git repo，改以「備份 `.lab-backup\` 是否消失」判定復原成功，不再用 `git status` |
| P2-6 Step2 缺總入口 README | **已修**：補上 `step2_speedrun_kit/README.md`（2.1～2.5 導覽表＋走完自評＋Next 鏈結）。BUILD_LOG 撰寫當下此檔尚缺、已如實標記，隨後補齊並經 `Test-Path` 確認存在 |
| P2-7 fullchain 說明漂移 | 已修正：根 `README.md` 已分「手動展示模式（3100，可 `--port 3199`）」與「一鍵 E2E 模式（固定 3199，自管 API／DB／前端）」兩段說明 |

補充風險（非分級項）：教材將 PostgreSQL 超級使用者 `postgres/12345` 直接寫入設定與腳本，`instructor/GUIDE.md` 故障分流表已標註「**僅限本機教室 DEMO，不得沿用公司／正式環境**」，正式環境建議改用環境變數 `ConnectionStrings__Default`／`PGPASSWORD`。

## 5. 已知限制與開課 Gate

- **資安**：`postgres/12345` 僅限本機教室 DEMO 使用，**不得**沿用到公司或正式環境。
- **G2 尚未達成**：需至少 3 位符合目標輪廓的真人，從 blank workspace 完整 dry run，並記錄各段 P50／P90 耗時、checkpoint 使用率、求助次數——這是需要真人執行的行動，**本輪尚未進行**，因此「120 分鐘完課」目前仍只是估算目標，非承諾。
- **目前定位**：G0（技術與教材缺陷）已修畢，**適合講師高度介入的內部小班試教**；正式對外開課前，仍需：
  - 補齊 G1 剩項（HANDBOOK 圖文手冊）；
  - 取得 G2 真人 dry run 數據，且確認「學生作品通過」不是由官方 solution 冒充。

## 6. 素材與環境

| 項目 | 版本／位置 |
|---|---|
| .NET SDK | 10.0.101 |
| PostgreSQL | 18，`localhost:5432`，帳密 `postgres/12345`（**僅限本機教室 DEMO**） |
| psql | `C:\Program Files\PostgreSQL\18\bin\psql.exe`（**不在 PATH**，需用絕對路徑或讓腳本自動掃描） |

---
教材由 Claude（Fable 5）多代理協作產出、Codex（GPT-5.6）對抗審查、實跑驗證後發佈。
