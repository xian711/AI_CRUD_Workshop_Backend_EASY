# CRUD 後端標準範本 — 環境設定與啟動說明

> **警語**：本範本為單機教學用——無認證授權、`postgres`/`12345` 為課堂 DEMO 連線（請替換為自己的），
> 不得直接部署對外環境。**僅限本機教室 DEMO，不得沿用公司／正式環境的帳密**；正式環境請改用第 2 節的環境變數 `ConnectionStrings__Default` 覆蓋，不要把真帳密寫進設定檔。

> **指令慣例**：除非另有註明，以下指令區塊的起始工作目錄皆為**本檔案所在 `sample-api/` 的上一層目錄**（本範本包正本即 repo 根目錄；若為課程工作坊複製件，通常是 `05_solution/`）。每個區塊若需要切換目錄會自帶 `cd`。

對應文件：範本的設計文件 `DESIGN-CRUD後端標準-v1.6.md`、需求規格 `SRS-CRUD後端標準-v1.2.md`（在工作坊 `step2_speedrun_kit/2.2_system_docs/`）；裝備物資模組的差異在 `step3_new_module/docs/`（`SRS-裝備物資API-delta.md`、`DESIGN-裝備物資API-delta.md`、`DIAGRAMS-裝備物資API.html`）。

## 1. 先決條件

| 項目 | 版本 / 說明 |
|------|------|
| .NET SDK | 10.0（本範本以 10.0.101 驗證） |
| PostgreSQL | 17 以上（本範本以 18.4 實測，本機執行個體 `localhost:5432`） |
| dotnet-ef | 已納入 local tool manifest（`dotnet tool restore` 即可取得，免全域安裝） |

啟動時會自動套用 Migrations 並建立資料表（`Database.Migrate()`）。**前提**：連線帳號需具備建庫權限
（`CREATEDB` 或超級使用者）——課堂用的 `postgres` 超級使用者即符合，資料庫不存在時會一併建立，**不需手動建庫**。
若使用不具 `CREATEDB` 的受限帳號，請先由 DBA 建好空資料庫（見 `04_database/create_workshop_db.sql`）再啟動。
（受限帳號 / OWNER / GRANT 角色分離屬雲端部署的正式作法，非本單機課堂範圍。）

### 1.1 確認 psql 可用（選用，用於手動驗證）

Windows 安裝的 PostgreSQL 預設不會把 `psql` 加入 PATH，路徑通常為
`C:\Program Files\PostgreSQL\18\bin\psql.exe`（版號依安裝而定，取最高版）。驗證連線：

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d postgres -c "SELECT version();"
```

## 2. 連線字串

開發連線字串位於 `src/CrudTemplate.Api/appsettings.Development.json`：

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=ai_crud_template;Username=postgres;Password=12345"
  }
}
```

- **學員替換**：把 `Host` / `Port` / `Username` / `Password` 改成自己的 PostgreSQL 連線。
- **環境變數覆蓋**（NFR-B-09，不改檔案）：設定 `ConnectionStrings__Default`（雙底線對應設定階層 `ConnectionStrings:Default`）即可覆蓋。

  Bash：
  ```bash
  export ConnectionStrings__Default="Host=localhost;Port=5432;Database=ai_crud_template;Username=postgres;Password=..."
  ```
  PowerShell：
  ```powershell
  $env:ConnectionStrings__Default = "Host=localhost;Port=5432;Database=ai_crud_template;Username=postgres;Password=..."
  ```

- 開發 DB：`ai_crud_template`；整合測試 DB：`ai_crud_template_test`（測試工廠固定指向，每輪重建）。
  測試連線字串可用環境變數 `CRUDTEMPLATE_TEST_CONNECTION` 整串覆蓋（多人/CI 隔離用）。
- PostgreSQL 資料庫名採小寫 snake_case（免加引號）；字串比較為區分大小寫（有別於 SQL Server 預設不分大小寫）。

## 3. 還原、建置、測試

```bash
cd sample-api
dotnet tool restore          # 取得 local dotnet-ef
dotnet build                 # 應為 0 Warning 0 Error（Mapperly RMG 警告已設為錯誤）
dotnet test                  # 單元 + 整合測試（整合測試會打 ai_crud_template_test）
```

> 整合測試每輪以 `EnsureDeleted → Migrate → Seed` 重建測試庫。PostgreSQL 會池化連線，
> 為避免 `DROP DATABASE` 撞上「database is being accessed by other users」，測試夾具在
> `EnsureDeleted()` 前會呼叫 `NpgsqlConnection.ClearAllPools()` 釋放連線（見 `CustomWebAppFactory.cs`）。
>
> **`ClearAllPools()` 的保證範圍**：只清「本測試進程」的連線池。若同時有其他程序連著測試庫
> （另一個 `dotnet test`、IDE 的資料庫工具、開著的 `psql` session），那些連線不受影響，
> `DROP DATABASE` 仍可能被擋。**單機、同一時間只跑一輪測試**是本範本的明文假設。

## 4. 啟動 API

```bash
cd sample-api/src/CrudTemplate.Api
dotnet run --urls http://localhost:5080
```

- 服務位址：`http://localhost:5080`
- API 基底路徑：`http://localhost:5080/api/template/members`
- Swagger UI（僅 Development）：`http://localhost:5080/swagger`
- 首次啟動會自動遷移 + 植入 24 筆種子資料（M-001 ~ M-024，冪等；重啟不重複植入）。

手動驗證腳本：`tests/CrudTemplate.Api.Tests/http/members.http`（VS / Rider / VS Code REST Client 可直接送出）。

## 5. 常見問題

| 症狀 | 排解 |
|------|------|
| 連不上 PostgreSQL（`Connection refused` / password authentication failed） | 確認 `postgresql-x64-18` 服務已啟動、`localhost:5432` 可連；帳密與連線字串一致（`Username`/`Password`）。 |
| Port 5080 被占用 | 改用其他 port：`dotnet run --urls http://localhost:5090`（並同步調整 `members.http` 的 `@host`）。 |
| 想重置開發資料 | 先 `dotnet tool restore`（取得 local dotnet-ef），再 `dotnet dotnet-ef database drop --force --project src/CrudTemplate.Api`（等同 `dotnet ef ...`，兩種寫法皆可；於 `sample-api` 目錄下執行，會刪開發庫 `ai_crud_template`），最後重新 `dotnet run` 即重建 + 重新植入 24 筆。加 `--dry-run` 可先看會刪哪個庫不實際刪。 |
| `dotnet ef` 找不到 | 先 `dotnet tool restore`（本範本以 local tool manifest 管理 dotnet-ef）。 |
| 整合測試失敗且訊息為連線問題 | 測試打 `ai_crud_template_test`；確認同一 PostgreSQL 可連、帳號有建庫權限（`Migrate` 會自動建測試庫）。 |
| psql 中文輸出亂碼 | Windows 中文 code page 下訊息可能亂碼，屬顯示問題不影響資料；必要時 `SET client_encoding TO 'UTF8';`。 |

## 6. 埠號

- 本範本 SETUP 與 `members.http` 皆使用 **5080**。若變更，兩處一併調整。
