# AI CRUD Workshop Backend EASY－教師／學生雙角色審查報告

審查日期：2026-07-12  
審查範圍：`AI_CRUD_Workshop_Backend_EASY/` 教材、範本 API、參考解、PostgreSQL、LOOP、checkpoint 與全鏈路 E2E

## 1. 執行摘要

**結論：技術基準可跑，但目前只適合內部小班試教，不建議直接正式對外開課。**

正向結果很扎實：preflight 可正確檢查主要後端依賴；sample-api 建置零警告、49/49 測試全綠；solution-api 建置零警告、89/89 全綠；實際 CRUD 狀態碼、Location、驗證錯誤與 PostgreSQL 持久化皆符合契約；後端紅→綠 lab 與前後端全鏈路 E2E 都能成功執行。

目前最大風險不在程式，而在教學與評量鏈：Step 4 固定驗證官方 `solution-api`，沒有驗證學生 Step 3 產出的 `my-equipment-api`。因此學生作品即使做壞，官方解仍可能跑出 E2E 6/6，造成完成度「假綠」。此外，checkpoint 缺少 Equipment 測試與資料庫設定、學生教材直接揭露 SCOPE 答案、harness 指向不存在檔案、入口承諾的 HANDBOOK／BUILD_LOG 不存在。

問題分級：**P0 0 項、P1 7 項、P2 7 項**。

## 2. 雙角色方法

- 老師角色：審查學習目標、先備知識、120 分鐘可教性、評量有效性、講師救援、故障分流、文件一致性與開課 Gate。
- 學生角色：依 README／START_HERE 從 preflight、範本 CRUD、測試、reset、psql、Step 3 參考解、LOOP 到全鏈路 E2E 實際操作。

## 3. 實跑證據

| 驗證項目 | 結果 | 實際證據 |
|---|---|---|
| preflight | PASS | 8 PASS＋2 WARN，exit 0；.NET 10、PostgreSQL、帳密、5080、Node/pnpm、磁碟、ExecutionPolicy、Agent 均可用 |
| sample-api build | PASS | 0 warning／0 error |
| sample-api test | PASS | 49 passed／0 failed／0 skipped |
| solution-api build | PASS | 0 warning／0 error |
| solution-api test | PASS | 89 passed／0 failed／0 skipped |
| 範本 GET 清單 | PASS | 24 筆種子，M-001～M-024 |
| 範本 CRUD | PASS | POST 201＋Location、PUT 200、DELETE 204、刪後 GET 404 |
| 驗證失敗 | PASS | 非法電話／負數數量回 400，errors 為 camelCase 且訊息繁中 |
| reset／seed | PASS | 清空後 count 0；重啟 API 後回到 24 筆 |
| solution API 隔離 DB CRUD | PASS | 24→25→更新→刪除→24；psql 實際 count 24 |
| 後端 LOOP lab | PASS | 基準 23/23；注入後 EV4 1 fail／22 pass；重複注入 exit 1；restore 後 23/23 |
| 全鏈路 E2E | PASS | 瀏覽器→Nuxt→API→PostgreSQL，6 passed／0 failed／0 skipped，exit 0 |
| checkpoint build | 部分 PASS | 可 build、49 tests 綠；但沒有 Equipment tests，且仍連 `ai_crud_template` |
| Markdown 本地連結 | FAIL | 3 個失效：HANDBOOK 目錄、HANDBOOK.md、BUILD_LOG.md |

全鏈路六條實際涵蓋：資料庫清單、Create reload 持久化、後端編碼、Update reload、Delete reload、前端新增資料可由 API 查回。

## 4. 老師角色審查

### 4.1 值得保留

- 「把假資料變真的」主線清楚，前後端兩課銜接有感。
- 三個學習目標具體：辨識 harness、生成 API／migration／tests、完成後端 LOOP＋全鏈路。
- 範本 API 的分層、`ModelResult`、狀態碼、DataAnnotations、migration 與測試庫防呆具實務品質。
- 整合測試在 `EnsureDeleted` 前檢查資料庫尾碼 `_test` 且限制 localhost，避免誤刪遠端資料庫。
- 49／89 測試基準健康，build 0 warning 的完成定義明確。
- LOOP 注入的是實際後端驗證 bug，不是刻意寫壞 selector；備份、重複注入防呆與 restore 都有效。
- RUBRIC 100 分與三項不得為零的設計合理。
- `run-e2e.ps1` 自管隔離 DB、API、前端與 teardown，使用者體驗佳。

### 4.2 教師判定

課程已具備可試教的技術產品，但評量不能證明學生作品正確。正式開課前必須先讓 Step 4 預設驗證學生自己的 API，checkpoint 也必須補成真正能回到 89 tests／equipment DB 的完整基準。

## 5. 學生角色旅程

| Step | 實際體驗 | 結果／摩擦 |
|---|---|---|
| 0 | preflight 約 3 秒 | 主要依賴檢查清楚；3100 busy 被警告，但正式 E2E 用 3199，實際不受影響 |
| 1 | A/B 教材可讀 | 易理解；總表 10 分、Step1 自稱 15 分 |
| 2 | 啟動範本、Swagger CRUD、49 tests、reset | 全部可重現；多人共用同一教材正本 build 可能遇 obj DLL 鎖檔，個人複本可避免 |
| 2 harness | 四件概念清楚 | 多個相對路徑指向不存在的 `2.2_system_docs` |
| 3 準備工作區 | Copy-Item 指令明確 | README 宣稱有 HARNESS.md／CODE-RULES-api.md，實際檔名與內容不同 |
| 3 釐清 | PRD 六個岔路很有教學價值 | README 與 PROMPTS 已直接公布答案，無法盲測需求判斷 |
| 3 生成 | 參考解 89 tests、API、DB 都可跑 | 從 blank 等 AI 完整生成未經真人 dry run |
| 4 LOOP | 紅→判因→修→綠可完整重現 | lab 固定修改官方 solution-api，不是學生作品 |
| 4 E2E | 一鍵 6/6，生命週期管理良好 | 同樣固定啟動官方 solution-api，學生 Step3 成果未被驗證 |
| 5 | RUBRIC 面向合理 | SCOPE 檔名寫錯；5 分鐘內提交五份證據不現實 |

## 6. P1－正式試教前應修正

### P1-1　Step 4 評量硬綁官方答案，學生作品可能假綠

證據：`step4_loop_e2e/run-e2e.ps1:30` 將 `$ApiDir` 固定為 `step3_new_module/solution-api`；`lab-red-to-green/inject-bug.ps1:27` 也固定修改同一參考解。

影響：學生 `my-equipment-api` 即使無法 build、API 契約錯誤或根本沒有 Equipment module，Step 4 仍可能由官方解跑出 6/6，RUBRIC 的 LOOP 與全鏈路分數失去可信度。

改善：

- `run-e2e.ps1` 與 lab 三腳本加入 `-ApiDir`。
- 正常教學預設／要求指定 `my-equipment-api`；官方 solution 只能用 `-UseCheckpoint` 明示 fallback。
- 執行開始與報告最後印出被測 API 的 resolved absolute path。
- 加負向驗證：故意破壞學生 API，確認 E2E 必紅。

### P1-2　Checkpoint 只救回程式片段，沒有救回完整評量基準

實際假學員複本套用結果：新增 11 檔、覆蓋 4 檔，build 成功，但只有原本 49 個 Member tests；Equipment test files 為 0，連線字串仍指向 `ai_crud_template`。

證據：`instructor/apply-solution-checkpoint.ps1:40-58` 只複製 API `src` 清單，未複製 Equipment tests、測試 factory、appsettings 或 delta 文件。

影響：checkpoint 後可能 API 能起，但資料落到範本 DB，`dotnet test` 的綠燈沒有驗 Equipment；講師手冊宣稱的三路驗收無法成立。

改善：checkpoint 至少同步：

- Equipment unit／integration tests 與測試 factory；
- Development DB 名稱 `ai_crud_equipment`、test DB `ai_crud_equipment_test`；
- 必要 delta 文件；
- 套用後自動或明確執行 build、預期測試數、API 24 筆、psql DB 名稱檢查。

### P1-3　SCOPE 答案仍在學生路徑公開

證據：`step3_new_module/README.md:19` 說答案要等完成後才發，但 `:85-94` 直接列出六題完整拍板；`PROMPTS.md:68-75` 又示範 Q1 正解。

改善：學生版只保留六個問題面向與空白理由欄，不列建議或裁決；講師答案與連結只留 instructor guide，課後才發。

### P1-4　Harness 清單與檔案路徑不成立

證據：

- `step3 README:21,59` 宣稱根目錄有 `HARNESS.md`、`CODE-RULES-api.md`，實際不存在；真正檔名是 `CODE-RULES-api-本專案.md`，四件定義見 PROMPTS:28。
- sample-api 的 `AGENTS.md:9`、CODE-RULES、contract summary、複製說明都指 `../2.2_system_docs/`，在範本原位置已不存在，複製到 `my-equipment-api` 後更不可能成立。

影響：Agent 被要求讀缺檔，可能停止、猜規格或忽略 baseline SRS／SDD。

改善：統一「四件＋AGENTS」名稱；把必要 baseline SRS／SDD 複製進 sample-api 的 `docs/baseline/`，讓工作區自包含，或移除所有無法成立的相對引用。

### P1-5　講師手冊仍是 checkpoint 未完成時的舊稿

證據：`instructor/GUIDE.md:21-32` 仍寫腳本「尚未產出／待確認」；`:49` 將 preflight 描述成只驗少數項；`:62` 仍寫「驗證波產出後」。實際腳本已存在。

改善：以實測後行為重寫第二節，列出實際複製檔、限制、指令、預期 test count、DB 名稱與失敗回復方式；同步 10 項 preflight。

### P1-6　README 承諾的主要教材不存在

證據：根 README 連到 `HANDBOOK/HANDBOOK.md`、`HANDBOOK/`、`BUILD_LOG.md`，實體皆不存在；自動掃描得到 3 個失效連結。

改善：補齊並實際驗證 HANDBOOK MD／HTML／圖片與 BUILD_LOG，或在發佈前移除所有宣稱與連結。缺 HANDBOOK 時不應標「課後自學」。

### P1-7　舊 PID 清理可能誤殺無關程序

證據：`run-e2e.ps1:84-93` 讀到 `.run-pids` 後直接 `taskkill /PID ... /T /F`，未驗證 command path、process start time 或 port ownership。Windows PID 可重用。

改善：PID 檔記錄 PID、executable path、command line、start time；清理前全部吻合且仍占 5080／3199 才終止。不吻合只 WARN 並刪除過期記錄。

## 7. P2－教材與維護品質

1. **Preflight port 錯位**：檢查 3100，但正式 fullchain runner 使用 3199。本輪 3100 busy 出 WARN、E2E 仍成功；反之 3199 busy 不會被課前發現。
2. **Preflight 未涵蓋完整 Step 4 依賴**：缺 workspace writable、NuGet/npm registry、Chromium cache、e2e node_modules／playwright CLI。
3. **時數漂移**：總表 Step1 10 分，`step1_why_harness/README.md:14` 寫 15 分；Step5 5 分卻要求提交五份證據。
4. **RUBRIC SCOPE 檔名錯誤**：寫 `SCOPE-課堂範圍決策.md`，真檔為 `SCOPE-後端課堂範圍決策.md`。
5. **Lab 清潔檢查不可用**：README 最後使用 `git -C solution-api status`，但 Backend EASY 與 solution-api 都不是 Git repository，實跑會 fatal。應以備份消失＋目標 hash／規則字串復原判定。
6. **Step2 缺總入口**：根 README 說每個資料夾有 README，但 `step2_speedrun_kit/` 沒有 README，缺 2.1→2.5 導航與 Next 鏈結。
7. **根 README 的 fullchain 說明漂移**：寫前端 3100 且需自行啟 API；正式 runner 自管 API／DB／前端並用 3199。應清楚分成「手動展示模式」與「一鍵 E2E 模式」。

補充風險：教材將 PostgreSQL 超級使用者 `postgres/12345` 直接寫入設定，限本機一次性教室尚可，但必須醒目標示「只限本機 DEMO、不得沿用公司／正式環境」，並提供環境變數做法。

## 8. 建議 120 分鐘流程

前提：.NET、PostgreSQL、NuGet、pnpm、Chromium、Agent 登入皆於課前完成；每位學員使用個人 workspace。

| 時間 | 活動 | 可觀察產出 |
|---:|---|---|
| 0–8 | 課程目標＋preflight | exit 0 與 DB 登入成功 |
| 8–18 | Step1 固定需求 A/B | 指出至少 3 個分層／契約／驗證差異 |
| 18–38 | 範本 Swagger CRUD | 200／201＋Location／204／400／404 |
| 38–48 | 49 tests＋reset／seed | 49/49、DB 回到 24 筆 |
| 48–58 | harness 四件＋架構／DB | 能說明複製區／共用區與 ModelResult |
| 58–70 | PRD 六題盲測裁決 | 六題答案＋每題理由 |
| 70–78 | delta／任務清單 review | 範圍可追溯、無偷加漏做 |
| 78–92 | AI 實作或 checkpoint | 學員 API 可 build／run |
| 92–102 | 三路驗收 | Swagger、tests、psql 都指向同一學員作品 |
| 102–112 | 學員 API 紅→綠 LOOP | 紅、根因、修法、綠四證據 |
| 112–118 | `-ApiDir my-equipment-api` 全鏈路 | 6/6 且輸出被測路徑 |
| 118–120 | Exit ticket | 回公司第一個導入行動 |

若不用 checkpoint、要求每位學員等待 AI 從 blank 完整生成，建議排 150–180 分鐘。

## 9. 評量修正版

原 RUBRIC 分配可保留，但每項證據須綁定同一個學生 workspace：

- 報告首頁印 `StudentProjectPath`、Git commit／檔案 hash、DB name。
- build／test／Swagger／psql／LOOP／E2E 全部必須使用該 path 與該 DB。
- 使用 checkpoint 者明確標記，不可把官方解的分數算成學生自行生成成果；可評「驗收與 LOOP」，不可評「生成完整度」。
- 測試數不要只寫 N，應有 manifest：Member tests 49＋Equipment tests 40＝solution baseline 89；若生成結果採不同合理測試顆粒，則改以必要 case ID coverage 驗收。

## 10. 改善優先順序

### G0－再次試教前必做

- Step 4 與 lab 支援並預設驗證 `my-equipment-api`。
- 補完整 checkpoint：DB 設定、Equipment tests、test factory 與驗證輸出。
- 從學生 README／PROMPTS 移除六題答案。
- 修正 harness 四件與所有不存在路徑。
- 更新 instructor GUIDE，移除未完成舊稿。
- 補 HANDBOOK／BUILD_LOG 或移除入口宣稱。
- 修正 stale PID 安全清理。

### G1－正式 dry run 前

- preflight 改查 3199 並補 Step4 依賴。
- 修時數、RUBRIC 檔名、lab 清潔檢查、Step2 導航與 fullchain 說明。
- 建立故意做壞的學生 API，確認 Step4 對它必紅、切官方 fallback 才綠。

### G2－正式開課 Gate

- 至少 3 位符合目標輪廓的真人從 blank workspace 完整操作。
- 記錄各段 P50／P90、checkpoint 使用率、求助次數、完整成果率。
- 僅在 P90 ≤ 120 分，且「學生作品通過」不是由官方 solution 冒充時，才正式對外開課。

## 11. 最終判定

- **程式品質**：通過；sample／solution／LOOP／fullchain 均有可信實跑證據。
- **教材完整性**：未通過；入口缺檔、規則路徑與講師文件有漂移。
- **評量有效性**：未通過；Step4 與 lab 尚未驗學生 Step3 產物。
- **目前適用**：講師高度介入的內部小班試教。
- **正式開課條件**：完成 G0／G1，並取得真人 dry run 數據。

這門課最值得保留的是「API 契約＋資料庫持久化＋後端 LOOP＋全鏈路」的完整工程主線；最優先要修的不是增加更多內容，而是確保每一盞綠燈都真的來自學生自己的作品。
