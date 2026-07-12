# CODE-RULES-api（後端程式與資料表規範）

一行一條。預設值取自原單位範本（見文末），公司導入時可改；API / CRUD 後端改碼前必讀，review 的 Coherence 對照本檔。**純 UI 工作不必讀本檔。**

## C# / ASP.NET

| 項目 | 規範 |
|---|---|
| 分層 | Controller 只做驗證與轉發，業務邏輯全在 Service（介面放 IServices）；Entity 與 DTO 分專案／分資料夾 |
| Controller | 繼承 `ControllerBase`＋`[ApiController]`；primary constructor 注入；依用途分資料夾（External / Internal / TV），命名空間供 Swagger 分組 |
| 路由 | 全站小寫＋kebab-case；`[Route("[controller]")]`、action 用 `[HttpPost("notifications")]` |
| Action | 回傳 `Task<IActionResult>`，依 `result.Success` 分流 `Ok/BadRequest/Unauthorized`；標 `[ProducesResponseType]` |
| 命名 | Class / Method PascalCase；參數 camelCase；私有欄位 `_camelCase`；async 加 `Async` 後綴 |
| DTO | 請求欄位標 `[Required(ErrorMessage=...)]`＋`[StringLength]`；系統填入欄位 `[JsonIgnore]`，不由前端傳入 |
| 物件轉換 | 一律 AutoMapper `mapper.Map(dto, entity)`，不手寫逐欄位賦值 |
| 例外 | 不吞例外；統一走錯誤處理 middleware |
| 日誌 | API 進出用 log filter；敏感欄位（Password 等）遮蔽，不入 log |
| 註解 | XML `<summary>` 中文；只寫「為什麼」；中英文之間加半形空格；欄位選項寫在 `<remarks>` |

## API

| 項目 | 規範 |
|---|---|
| Envelope | 沿用專案既有格式（原單位範本為 `{Success, Message, Data}`），**不得混用**；新專案無既有格式時預設 `{success, data, error}` 並記 Assumption |
| 錯誤碼 | `VALIDATION_ERROR` / `FORBIDDEN` / `NOT_FOUND` / `TODO 補公司碼表` |
| 分頁 | `page`（預設 1）、`pageSize`（預設 20、max 100） |
| 日期 | `yyyy-MM-dd`；含時間 `yyyy-MM-dd HH:mm` |
| Swagger | dev 環境或開關（`Enable_Swagger`）才開；依命名空間分組多文件；掃描各專案 XML 註解 |
| 驗證 | JWT Bearer；跨系統另支援 `X-API-Key`；secrets 全在環境設定，不落地 |

## 資料表（SQL Server / PostgreSQL）

| 項目 | 規範 |
|---|---|
| 表名 / 欄位 | 小蛇形（`work_order_m`）；C# 端 `[Table]` / `[Column]` 明確標註並指定型別；Dapper 開 `MatchNamesWithUnderscores` |
| 主鍵 / 外鍵 | `id` 或明確複合主鍵；外鍵 `{table}_id` |
| 審計欄位 | 集中在 `BaseEntity`：`cre_id / cre_date / upd_id / upd_date`，`[Required]`＋`[JsonIgnore]` |
| 多租戶 | 用區分欄位（如 `comp_id`、`port`）＋`[Required]`，不用多連線字串 |
| DB 存取 | 走團隊封裝 Repository（如 `IAdvanceRespository<TContext>`），不直接操作 DbContext |
| Migration | 檔名 `yyyyMMddHHmmss_描述`；不改既有 migration，只新增；未經要求不動 schema |
| 索引命名 | `IX_{table}_{cols}`；唯一鍵 `UQ_{table}_{cols}` |
| 帳號 | 查詢型服務用唯讀帳號（GRANT SELECT） |

## 範本檔案（照著這個寫，位於原單位範本專案）

範本僅供對照，不列入 loop 必讀；路徑不存在或不可讀時，依上方表格規範即可，不標 blocker。

| 類型 | 範本 |
|---|---|
| Controller | `Project/Project.API/Controllers/External/AlertController.cs` |
| Service + Repository | `Project/Project.Kernel.API/Services/AlertService.cs` |
| 請求 DTO | `Project/Project.Shared.Models/Fui/AlertRequest.cs` |
| 資料表實體＋審計基類 | `Project/Project.Database/Entities/ExampleT.cs`、`BaseEntity.cs` |
| .http 測試 | `Project/Project.API/Tests/external/alert.http`（環境檔 `Tests/http-client.env.json`） |
| Swagger 多文件設定 | `Project/Project.API/Program.cs` |
