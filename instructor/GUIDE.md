# 講師手冊 — AI CRUD Workshop Backend（EASY）

> 這份是講師專用。學員版路徑不要放這份，也不要放 `SCOPE-後端課堂範圍決策.md`（step3 答案）
> 與 `SCOPE-問卷API範圍決策.md`（step6 課後練習答案）。

## 一、120 分鐘時間軸

前提：.NET SDK、PostgreSQL、psql、AI Agent 登入已於**課前**完成（見第四節）。每段都要盯「可觀察產出」，沒產出就別往下走。「120 分鐘完課」是目標句，不是承諾句——尚無真人 dry run 數據（見第五節 Gate）。

| 時間 | 段落 | 活動 | 可觀察產出 |
|---:|---|---|---|
| 0–10 | step0 課程介紹 | 目標、規則、`preflight.ps1` | preflight exit 0 截圖（.NET／PostgreSQL／5432／5080／psql 全綠） |
| 10–20 | step1 為何要 harness | 後端版 harness A/B 對比 demo（三項：回應格式／業務規則與訊息／多做的東西） | 每組說得出三項差異，**並說得出「哪幾件事沒 harness 那版自己就做對了」**——這題答不出來代表他還停在「有 harness 比較漂亮」的誤解 |
| 20–55 | step2 speedrun kit | 玩範本 API：跑起來、swagger CRUD、測試 49 綠、重置資料；讀系統文件、harness 四件、分層＋DB 綱要 | C/R/U/D/測試/重置 checklist 打勾；能口頭說明分層與 `ModelResult` 封裝 |
| 55–95 | step3 新模組 | 只讀 PRD → 六題釐清裁決 → AI 出 SRS-delta、設計文件-delta、圖＋任務清單 → 說「開工」逐任務實作 → 三路驗收 | 六題答案＋每題一句理由；swagger 五路由＋psql 24 列 |
| 95–115 | step4 全鏈路 LOOP | 學員貼一個 LOOP prompt：AI 自己跑 run-e2e 修到 6 條綠，再開子代理對抗審查（HTTP 實打＋Playwright 截圖）；有空再做 lab 紅→綠練習 | `loop/LOOP-REPORT.html`、`LOOP-LOG.md`、`playwright-report`、文件標「step4 LOOP 後」 |
| 115–120 | step5 收尾 | RUBRIC 自評、Exit ticket | 一句帶回公司的導入做法 |

> **step3 是全課核心（40 分）。** 若要讓每位學員都等 AI 從空白生成完整實作，時間會爆——用第二節的 checkpoint 政策控場。
> **段落細分建議**：step3 內部 ~10 分讀 PRD＋釐清、~5 分審 delta＋任務清單、~20 分實作、~5 分三路驗收。實作段是最容易拖的，盯緊。

## 二、checkpoint 政策（腳本已備妥：`apply-solution-checkpoint.ps1`／`restore-checkpoint.ps1`）

- **判斷點在第 ~85 分鐘**（step3 實作段尾）。若學員到這時**還沒有一支跑得起來的 API**（任務清單還沒開工、生成卡住、或生成品質差到修不動），別讓全班等——直接套參考解，讓大家跟上三路驗收與 step4 的 LOOP。
- 兩支腳本都在本 `instructor/` 資料夾，路徑用絕對或相對都行：

```powershell
# 套用：在 instructor\ 資料夾執行，-Target 指學員專案根目錄
.\apply-solution-checkpoint.ps1 -Target ..\step3_new_module\my-equipment-api
# 若想跳過套用後自動驗收（例如趕時間）：
.\apply-solution-checkpoint.ps1 -Target ..\step3_new_module\my-equipment-api -SkipVerify

# 復原（回到套用前的學員原檔，例如套錯 Target 或想比較學員自己原本寫的版本）：
.\restore-checkpoint.ps1 -Target ..\step3_new_module\my-equipment-api
```

- **`apply-solution-checkpoint.ps1` 實際會做的事**：
  - 【原始碼】複製 Equipment 模組新增檔（Entities／Constants／Models／Mapping／Services／Controllers／SeedData／Migration）到學員專案；覆蓋改動檔（`Program.cs` 註冊、`AppDbContext` 的 DbSet／設定、`DbSeeder`、Migration 快照 `AppDbContextModelSnapshot.cs`、`appsettings.Development.json` 連線字串改指 `ai_crud_equipment`）。
  - 【測試】新增 Equipment 單元／整合測試，並覆蓋整合測試 factory `CustomWebAppFactory.cs`（改連測試庫 `ai_crud_equipment_test`）。
  - 【文件】把 `SRS-delta`／`DESIGN-delta`／`DIAGRAMS-裝備物資API.html`／`TASKS.md` 複製進學員專案 `docs\`，供三路驗收比對。
  - 覆蓋前一律把學員原檔備份到 `<Target>\.checkpoint-backup\`（保留相對路徑結構，只在第一次備份，重複執行 apply 不會覆蓋掉「套用前」的原始檔）。
  - 除非加 `-SkipVerify`，套用完自動依序跑四項驗收，並**以機器可判定的方式 fail-closed**：`dotnet build -p:TreatWarningsAsErrors=true`（警告視為錯誤，用 exit code 判零警告零錯誤，不看語系相關的摘要字串）→ `dotnet test` 輸出 **TRX** 並解析與語系無關的 invariant counters（預期 passed=89／failed=0，可用 `-ExpectedTestCount` 覆蓋）→ 啟動 API 驗 `GET /api/equipment/items` 筆數（預期 24，可用 `-ExpectedRowCount` 覆蓋）→ 讀套用後 `appsettings.Development.json` 的 `Database=` 比對（預期 `ai_crud_equipment`，可用 `-ExpectedDbName` 覆蓋）並用 psql 確認該庫可連。**四項全過腳本才 `exit 0`；任一項無法解析／數量不符／失敗都 `exit 1`**（可用在 CI／講師快速判斷）。
  - 前提：學員專案沿用範本命名空間 `CrudTemplate.Api`（工作坊複製範本時不改名），否則複製過去的檔案命名空間對不上、無法編譯（腳本會自動嘗試偵測 `src\`／`tests\` 下的專案資料夾，唯一才自動採用）。
- **`restore-checkpoint.ps1`** 與 apply 對稱：把 `.checkpoint-backup\` 內備份的原始檔複製回學員專案對應位置，讓學員能回到套用前的樣子。
- 套完看腳本結尾的四項 `[PASS]／[FAIL]` 摘要與 exit code：`exit 0`＝四項全過、已回到 solution baseline；`exit 1`＝有 `[FAIL]`（見紅字那項），排查後重跑，未回到 baseline 前別急著往 step4 走。

## 二之二、step1 對照的維護責任（每換一代模型要重跑）

step1 的「有／沒有 harness」A/B 是**拿模型當下的能力當基準**，模型會進步，基準就會過期。

- **2026-08-19 已重跑一次**：原本 12 項對照，實跑後發現 8 項（分層、SQL 安全、帳密硬編碼、例外吞掉、狀態碼、Location、DTO 驗證、欄位命名）現在的模型自己就做對了，已刪除，收成 3 項。
- **課堂上請主動講這件事**：學員如果覺得「沒 harness 那版看起來也不錯」，那是**對的反應**，不要否認他。順著講「所以差別不在品質，在誰做決定」。
- **下次換模型時**：拿 `step1_why_harness/demo/PROMPT.md` 的版本 A 重跑一次，照 `step1_why_harness/README.md` 的計分表打分，把結果記進那份 README 的實測紀錄表，並更新 `COMPARE.html`。

## 三、故障分流表（五種）

| 狀況 | 現場處置 |
|---|---|
| **PostgreSQL 5432 沒開** | `Get-Service postgresql*` 看服務狀態；停著就 `Start-Service postgresql-x64-18`。連不上先用 SETUP 的 `SELECT version()` 絕對路徑 psql 測連線；帳密不符對照連線字串（postgres/12345——**僅限本機教室 DEMO，不得沿用公司／正式環境**，正式環境改用環境變數 `ConnectionStrings__Default`／`PGPASSWORD` 帶密碼）。 |
| **port 5080 被占** | `Get-NetTCPConnection -LocalPort 5080` 找 PID → `Stop-Process -Id <PID>`，再重跑；或改 `dotnet run --urls http://localhost:5090`（swagger、驗收指令同步改 port）。 |
| **migration 失敗** | 多半是連線字串沒改到 `ai_crud_equipment`、或帳號無建庫權限。先確認 appsettings.Development.json 已改庫名；再 `dotnet tool restore` 取得 local dotnet-ef；仍失敗就 drop 開發庫重來（`dotnet dotnet-ef database drop --force`）後重啟自動重建＋植入。 |
| **AI 額度用盡** | 停止讓該生等生成，直接套 checkpoint 進到三路驗收／step4 LOOP，課後再自行補生成練習。 |
| **AI 生成品質太差**（分層亂、封裝不對、測試紅一片修不動） | 到第 85 分鐘判斷點仍修不動就套 checkpoint，別讓全班陪一個人卡。課後把該生的生成當 step1 反面教材複盤——正好呼應「harness 收斂品質」的主題。 |

> 通用離線路線：課前已裝好 .NET SDK、PostgreSQL、dotnet-ef local tool；生成不可用時一律走 checkpoint，全程不連網也能跑三路驗收與 LOOP。

## 四、開課前人工檢查（自動化檢查做不到的）

`preflight.ps1` 已自動驗 12 項：.NET SDK ≥10、PostgreSQL 有裝有開（5432；連不上時分辨沒裝／沒開／埠號不對）、psql 找得到、資料庫帳密可登入（postgres/12345，**僅限本機教室 DEMO**）、port 5080 未占用、port 3199 未占用（一鍵 E2E 用）、Node≥20+pnpm、磁碟≥2GB、ExecutionPolicy、AI Agent CLI 偵測、step4 e2e 依賴（node_modules／playwright CLI）、Swagger 等 NuGet 套件拿得到（已下載或連得上 nuget.org）。以下是自動化檢查做不到、需**逐位學員**當面確認的項目：

- [ ] AI Agent（Claude／Codex／Cursor 等）已**登入**且可用（preflight 只驗 CLI 存在，驗不了登入狀態）。
- [ ] 帳號**額度足夠**跑完一輪生成（Entity→測試整套）。
- [ ] Agent 在**寫檔（Agent）模式**下能實際建立／修改專案檔案、能執行 `dotnet` 與 `psql`。
- [ ] 範本 API 能在該機 `dotnet run` 起來、`dotnet test` 49 綠（step2 已驗過就免重驗）。
- [ ] psql 絕對路徑確認（`C:\Program Files\PostgreSQL\18\bin\psql.exe`，版號依安裝而定，**不在 PATH**）。

## 五、正式開課 Gate（dry run）

> **至少 3 位目標輪廓學員完成完整 dry run**，記錄各段 P50／P90 實際耗時，才正式對外開課。
> 未達標只做內部小班試教，**不對外宣稱「120 分鐘」**（目前時間軸為估算，無真人數據）。

dry run 要一併驗證：`apply-solution-checkpoint.ps1` 真的能套用並讓 `dotnet test` 全綠（89 條）、psql 查到 `ai_crud_equipment` 24 列；`restore-checkpoint.ps1` 能對稱復原；step4 `run-e2e.ps1` 對學員自己的 `my-equipment-api`（而不只是官方 `solution-api`）跑出 6/6，前端切旗標後全鏈路確實通。

## 六、常見學員提問標準答覆

**「為什麼我的 AI 生成結果跟參考解不一樣？」**

> 正常，不代表錯。harness 約束的是**規則與骨架**（分層邊界、`ModelResult` 封裝、命名慣例、驗證規則、測試不放水），不是**逐行輸出**。只要規則沒違反、三路驗收都過（swagger 五路由、`dotnet test` 全綠、psql 24 列），命名或檔案切法跟 `solution-api` 有出入完全 OK。真正要抓的是「有沒有違反 CODE-RULES、驗收是否全過」，不是「跟參考解一不一樣」。

**「Q1 為什麼要偏離範本的 SEQUENCE？這樣不是違反 harness 嗎？」**

> 不違反。harness 要的是「決策有依據、偏離有記錄」，不是「永遠照抄範本」。範本 SEQUENCE 產不出「每前綴各自計數」的流水號，需求逼你偏離——只要把「為什麼偏離、偏離成什麼」寫進設計文件-delta（DESIGN），就是正確的工程判斷。這正是 step3 Q1 最想教的事。
