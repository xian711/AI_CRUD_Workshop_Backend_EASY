# CLAUDE.md — sample-api 專案憲法

> 這是 sample-api（CRUD 後端標準範本示範專案）的鐵律。AI 每次對話自動讀，一行一條，照做即符合規範。
> 細則見同資料夾 `CODE-RULES-api-本專案.md`；契約慣例見 `contract-conventions-summary.md`；複製開發見 `使用說明-複製範本開發新API模組.md`。

## 這是什麼專案

- 人員 CRUD 標準範本 API，可獨立跑：`cd src/CrudTemplate.Api → dotnet run --urls http://localhost:5080 → http://localhost:5080/swagger`。
- 路由 `api/template/members`；首次啟動自動建庫＋跑 migration＋灌 24 筆種子（M-001~M-024）。
- 用途：複製改名即成新 CRUD 模組 API；範本正本不要改壞。

## 技術棧鎖定（禁換、禁升版）

- **.NET 10** + ASP.NET Core Web API + **EF Core 10（Npgsql / PostgreSQL provider）** + **Mapperly**（物件映射）+ **xUnit**（測試）。
- 資料庫用 **PostgreSQL**（開發庫 `ai_crud_template`／測試庫 `ai_crud_template_test`）；連線字串在 `appsettings.Development.json`，可用環境變數 `ConnectionStrings__Default` 覆蓋。
- 不准擅自換 provider（如 SQL Server）、換映射套件（如 AutoMapper）、加新套件或升版；Mapperly 漏映射警告已設為編譯錯誤（見 csproj），別為了消警告亂關。

## 程式規則（10 條）

1. **Controller 薄委派**：只做「呼叫 Service → `result.ToActionResult(失敗碼)`」；禁止在 Controller 查詢資料庫、組路徑、寫商業判斷（if/迴圈）。
2. **商業邏輯全在 Service**：`MembersController → IMemberService → MemberService → AppDbContext`，依賴單向向右；Service 用建構子注入，禁止靜態 service locator。
3. **DTO 驗證用 DataAnnotations ＋ IValidatableObject**：單欄允許值用 `[AllowedValues]`；跨欄位／條件規則（如證號依證件類別、選填欄非空才驗）放 `IValidatableObject.Validate()`。驗證失敗由框架自動回 400，不進 Service。
4. **回應一律 `ModelResult<T>` 封裝**（`{ success, message, data }`）；**唯一例外＝DELETE 成功回 204 無主體**（HTTP 語意，D5）。
5. **JSON 契約 camelCase、DB 欄位 snake_case**：兩者由 DbContext 命名轉換＋Mapperly 自動銜接，不手寫逐欄改名。錯誤訊息的欄位鍵也是 camelCase。
6. **Service 不准 blanket try/catch**（D11）：只把「預期的業務失敗」（查無資料）轉成 `ModelResult{ Success=false }`（Controller 映射 404）；未預期例外（DB 斷線等）**不捕捉、直接上拋**給 `GlobalExceptionHandler` 回 500。全包 try/catch 會把基礎設施故障誤映成 404。
7. **改綱要一律走 EF migration，禁止手改 DB**：加欄位／改型別／加約束都 `dotnet ef migrations add <名稱>`，不改既有 migration、只新增；啟動時 `Database.Migrate()` 自動套用。
8. **新功能必附測試，且禁止刪測試或放寬斷言充數**：驗證規則加單元測試、端點加整合測試（打 `ai_crud_template_test`）；不得為了讓紅燈變綠而砍掉斷言或改成寬鬆比對。
9. **對外錯誤訊息一律繁體中文**：`ErrorMessage`、404／商業失敗、500 一般化訊息皆繁中；例外細節（`ex.Message`／堆疊／連線字串）只進伺服器日誌，永不外露。
10. **完成前必跑 `dotnet build` ＋ `dotnet test` 全綠**（在 `sample-api` 根目錄）：build 須 0 error、0 warning（Mapperly 警告視同錯誤），test 49 條全綠才算完成，再回報。

## 契約要點（詳見 contract-conventions-summary.md）

- 狀態碼：GET 200／POST 201+Location／PUT 200／DELETE 204／查無 404／驗證失敗 400／未預期 500。
- id 由後端 SEQUENCE 產生（`M-###`，交易內取號）；`updatedAt` 後端本地時區寫入（禁 UtcNow / toISOString）；日期用 `DateOnly ↔ date`。
- id / updatedAt 不宣告在 `MemberRequest`：body 帶了也被忽略，杜絕竄改。

## 開發流程

- 改完自己在 `sample-api` 跑 `dotnet build` ＋ `dotnet test` 確認全綠，再回報。
- 回報格式精簡：只列 changed files、驗證結果（build/test）、下一步；一次 summary 20 行內。
- 回覆用台灣白話繁中，不用大陸用語（呼叫/預設/資料庫/元件/使用者/程式碼/介面/回饋）。
- 只在 blocker 問人，用選擇題（2–4 選項、標建議）；不發明欄位與商業規則。

> 完整細則見 `CODE-RULES-api-本專案.md`。Codex 使用者見 `AGENTS.md`（內容指向本檔）。
