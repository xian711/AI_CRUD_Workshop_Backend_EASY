# CODE-RULES-api（sample-api 後端程式與資料表規範）

> 用途：本專案（CRUD 後端標準範本）的**實際**程式規則，供 AI 改後端碼前對照、review 對照。
> **取代** harness 樣板取自原單位範本（SQL Server / Dapper / AutoMapper）的預設值。對應樣板：`aspnet-api-ai-harness-v5/harness/CODE-RULES-api.md`。
> 提煉自 `SDD-CRUD後端標準-v1.6.md` 與 `SRS-CRUD後端標準-v1.2.md`（工作區自包含複本在 `docs/baseline/`）。純前端工作不必讀本檔。

## C# / ASP.NET Core

| 項目 | 本專案規範 |
|---|---|
| 目標框架 | **.NET 10**（`net10.0`）；`Nullable` enable、`ImplicitUsings` enable |
| 分層 | Controller 只驗證與轉發，商業邏輯全在 Service（介面 `IMemberService`）；Entity / DTO / Mapper 分資料夾（`Entities` / `Models` / `Mapping`），依賴單向：Controller → IService → Service → AppDbContext |
| Controller | 繼承 `ControllerBase` ＋ `[ApiController]`；**primary constructor 注入**（`MembersController(IMemberService memberService)`）；`[Produces("application/json")]` |
| 路由 | `[Route("api/template/members")]`（全小寫）；action 用 `[HttpGet]` / `[HttpGet("{id}")]` / `[HttpPost]` / `[HttpPut("{id}")]` / `[HttpDelete("{id}")]` |
| Action 回傳 | `Task<IActionResult>`；成功走 `result.ToActionResult()`（200）或 `CreatedAtAction`（201）或 `NoContent()`（204）；失敗走 `result.ToActionResult(StatusCodes.Status404NotFound)`；每端點標 `[ProducesResponseType]` 列出各狀態碼 |
| 命名 | Class / Method PascalCase；參數 camelCase；私有欄位 `_camelCase`；非同步方法回 `Task`（本範本方法名未加 `Async` 後綴，沿用範本現況，複製時保持一致） |
| DTO | 請求 DTO `MemberRequest`：欄位標 `[Required(ErrorMessage="繁中")]` ＋ `[StringLength]`／`[RegularExpression]`；單欄允許值用 **`[AllowedValues]`**；系統欄位（id / updatedAt）**刻意不宣告**（body 帶了也被繫結忽略，BR-B-06） |
| 條件驗證 | 跨欄位／相依／選填欄非空才驗，放 `IValidatableObject.Validate()`（本範本四條：nationalId 依 idType、email 非空才驗、qualifications 規則、bloodType 非 null 才驗允許值）。注意：物件層級 `Validate()` 只在所有屬性層 DataAnnotations 通過後才跑 |
| 物件轉換 | 一律 **Mapperly**（`[Mapper] partial class MemberMapper`），編譯期產生映射碼、singleton 註冊；`ToEntity` / `Apply` 忽略 Id/UpdatedAt（`[MapperIgnoreTarget]`）。**不手寫逐欄賦值、不用 AutoMapper** |
| 例外 | Service **不做 blanket try/catch**（D11）：預期業務失敗回 `ModelResult{Success=false}`；未預期例外直接上拋 `GlobalExceptionHandler`（`IExceptionHandler` → ProblemDetails{ traceId }） |
| 回應封裝 | 一律 `ModelResult<T>`（`Success`/`Message`/`Data`）；DELETE 204 為唯一不套封裝的例外（D5） |
| 日期 | `DateOnly ↔ date` 欄位；`updatedAt` 用 `DateOnly.FromDateTime(DateTime.Now)`（本地時區），**嚴禁 `DateTime.UtcNow` / `toISOString` 類 UTC 轉換**（BR-B-08） |
| 註解 | XML `<summary>` 繁中，只寫「為什麼」；中英文間加半形空格；欄位選項與決策編號（D1/D11…）寫在 `<remarks>` |

## API 契約

| 項目 | 本專案規範 |
|---|---|
| Envelope | `{ "success": bool, "message": string, "data": T }`（沿用原單位範本慣例，D4）；前端取 `response.data` 為實體，`success===false` 以 `message` 顯示 |
| JSON 命名 | 一律 **camelCase**（ASP.NET 預設，D1）；驗證失敗 400 的 `errors` 鍵也轉 camelCase（`Program.cs` 的 `InvalidModelStateResponseFactory`） |
| 狀態碼 | GET 200／POST 201+`Location`／PUT 200／DELETE 204／查無 404／驗證失敗 400／未預期 500（詳見 `contract-conventions-summary.md` 矩陣） |
| 驗證失敗格式 | `ValidationProblemDetails`（`type`/`title`/`status`/`errors`/`traceId`），每欄繁中訊息 |
| 分頁/篩選/排序 | **本版不做**（GET 回全量，前端處理，課堂 <1000 筆前提）；query 參數保留擴充縫（FR-B-701），本版忽略未知 query |
| Swagger | 僅 Development 啟用（`app.Environment.IsDevelopment()`）；掃 XML 註解（`GenerateDocumentationFile`） |
| 認證 | 本版無 JWT（`UseAuthentication` 為空殼接縫）；secrets 走環境變數不落地 |

## 資料表（PostgreSQL）

| 項目 | 本專案規範 |
|---|---|
| 表名 / 欄位 | 小蛇形（表 `template_member`）；C# PascalCase 屬性由 `AppDbContext` 的命名轉換自動轉 snake_case（`birthDate → birth_date`），CHECK constraint 內引用的欄位名須與轉換後一致 |
| 主鍵 | `id` 為 `character varying(10)`，格式 `M-###`；由 **SEQUENCE `template_member_seq`**（START 25）於交易內 `SELECT nextval(...)` 取號、格式化 `M-{n:D3}`（BR-B-07，D6）。**不用自增 identity、不掃最大值+1** |
| CHECK 約束 | 命名 `ck_template_member_{欄}`；SQL 由 `Constants/MemberEnums.cs` 常數陣列組出 `col IN ('a','b')`（與 DTO `[AllowedValues]` 共用同一份字面值來源，防漂移）。PostgreSQL 一律 UTF-8，中文字面值**不需 `N''` 前綴** |
| 多值欄位 | `qualifications` 用 EF Core 10 primitive collection → PostgreSQL 原生 `text[]`（`HasColumnType("text[]")` ＋ `HasDefaultValueSql("'{}'")`），免關聯表 |
| 選填欄位 | 可 null 欄（email / note / bloodType）在 DB 為 NULL；`bloodType` 為 `text NULL` ＋ CHECK（NULL 對 `IN(...)` 求值為 NULL、視為通過，自然放行） |
| Migration | `dotnet ef migrations add <描述>`（時間戳前綴自動產生）；**不改既有 migration、只新增**；未經要求不動綱要；啟動 `Database.Migrate()` 自動套用 |
| 索引 | 本版僅 PK；篩選索引（status / group_name）待伺服器端篩選啟用再加（backlog） |
| dotnet-ef | 以 local tool manifest 管理（`dotnet tool restore` 取得），免全域安裝 |

## 測試（xUnit + WebApplicationFactory）

| 項目 | 本專案規範 |
|---|---|
| 單元測試 | `Unit/`：驗證規則（`MemberValidationTests`）、Mapperly 映射（`MemberMapperTests`）；不碰 DB |
| 整合測試 | `Integration/`：`CustomWebAppFactory`（`WebApplicationFactory`）打**測試庫 `ai_crud_template_test`**；每輪 `ClearAllPools() → EnsureDeleted() → Migrate() → Seed` 重建 |
| 測試庫隔離 | 用 `ConfigureTestServices` 替換 `DbContextOptions`（**禁用 `ConfigureAppConfiguration` in-memory 覆蓋**——minimal hosting 下會被 Development 設定反壓、靜默打到開發庫）；`EnsureDeleted` 前防呆：host 實際生效的 DB 名須以 `_test` 結尾否則拒跑 |
| 斷言紀律 | I1 斷「至少 24 筆含 M-001~024」不斷「恰 24 筆」（共用 factory 下寫入測試會增筆）；I4 斷 id 格式 `^M-\d{3,}$` 不斷固定 `M-025`（測試順序無關性）。**禁止刪測試或放寬斷言充綠** |
| DoD | `dotnet build`（0 warning／Mapperly RMG 視同錯誤）＋ `dotnet test`（49 條全綠）；`.http` 手動腳本在 `tests/.../http/members.http` |

## 範本檔案（照著這個寫，位於 sample-api）

複製改名即成新 CRUD 模組 API。五類「複製改名」＋共用區見 `使用說明-複製範本開發新API模組.md`。

| 類型 | 範本檔 |
|---|---|
| Controller（薄委派） | `src/CrudTemplate.Api/Controllers/MembersController.cs` |
| Service ＋ 介面 | `src/CrudTemplate.Api/Services/MemberService.cs`、`IMemberService.cs` |
| Entity（實體） | `src/CrudTemplate.Api/Entities/Member.cs` |
| 請求 / 回應 DTO | `src/CrudTemplate.Api/Models/MemberRequest.cs`、`MemberResult.cs` |
| Mapperly 映射 | `src/CrudTemplate.Api/Mapping/MemberMapper.cs` |
| 允許值常數 | `src/CrudTemplate.Api/Constants/MemberEnums.cs` |
| DbContext / 種子 | `src/CrudTemplate.Api/Data/AppDbContext.cs`、`DbSeeder.cs`、`SeedData.cs` |
| **共用（禁複製、禁亂改）** | `Common/ModelResult.cs`、`ApiResultExtensions.cs`、`GlobalExceptionHandler.cs`、`Program.cs` 樣式 |
| 測試 | `tests/CrudTemplate.Api.Tests/Unit/*`、`Integration/*`、`http/members.http` |
