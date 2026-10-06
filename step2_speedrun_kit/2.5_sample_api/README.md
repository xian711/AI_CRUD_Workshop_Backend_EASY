# 2.5 Sample API — CRUD 後端標準範本正本

> 這是一個可獨立跑的最小 .NET 10 Web API：**人員管理 CRUD 範例**（清單／單筆／新增／更新／刪除）＋ PostgreSQL ＋ 49 條測試。
> 它就是「範本正本」——複製改名即成你的新模組 API。

## 這是什麼

- 路由 `api/template/members`，port **5080**，Swagger 在 `/swagger`（僅 Development）。
- 首次啟動自動建庫（`ai_crud_template`）＋跑 migration＋灌 24 筆種子（M-001~M-024）。
- 技術棧：.NET 10 + ASP.NET Core + EF Core 10（Npgsql / PostgreSQL）+ Mapperly + xUnit。
- 專案根目錄已內建 harness 四件（`CLAUDE.md`／`CODE-RULES-api-本專案.md`／`contract-conventions-summary.md`／`使用說明-複製範本開發新API模組.md`）＋ `AGENTS.md`，複製時一起帶走。

## 跟 2.1 的關係

**2.1_play_template 的所有操作（跑起來、Swagger 玩 CRUD、`dotnet test`、重置資料）都在這一包裡做。** 2.1 是「怎麼玩」的說明，這裡是「玩的東西」。第一次上手照 2.1 的步驟走即可。

```powershell
# 啟動（於 sample-api 根）
cd src\CrudTemplate.Api
dotnet run --urls http://localhost:5080
# 開 http://localhost:5080/swagger

# 測試（於 sample-api 根）
dotnet test
```

## 資料夾導覽

```
sample-api/
├─ CrudTemplate.sln                 方案檔
├─ CLAUDE.md / AGENTS.md / ...       harness 四件＋AGENTS（AI 規則，複製時帶走）
├─ SETUP.md                          環境設定與啟動、常見問題
├─ dotnet-tools.json                 local tool manifest（含 dotnet-ef）
├─ src/CrudTemplate.Api/
│  ├─ Program.cs                     組合根：DI 註冊、中介軟體順序、啟動遷移+seed
│  ├─ appsettings.Development.json   開發連線字串（可被環境變數覆蓋）
│  ├─ Controllers/                   薄委派控制器（MembersController）
│  ├─ Services/                      商業邏輯層（IMemberService / MemberService）
│  ├─ Data/                          DbContext、DbSeeder、SeedData、Migrations
│  ├─ Entities/                      資料表對應實體（Member → template_member）
│  ├─ Models/                        請求/回應 DTO（MemberRequest / MemberResult）
│  ├─ Mapping/                       Mapperly 映射（MemberMapper）
│  ├─ Common/                        共用：ModelResult、ApiResultExtensions、GlobalExceptionHandler
│  └─ Constants/                     允許值常數（MemberEnums，DTO 與 DB CHECK 共用）
└─ tests/CrudTemplate.Api.Tests/
   ├─ Unit/                          驗證規則、Mapperly 映射單元測試
   ├─ Integration/                   WebApplicationFactory 端到端整合測試（打 ai_crud_template_test）
   └─ http/                          members.http 手動驗證腳本
```

| 資料夾 | 一句話 |
|---|---|
| `Controllers` | 只做「呼叫 Service → 對映狀態碼」，不寫商業邏輯 |
| `Services` | 商業邏輯全在這：取號、產 id/updatedAt、查無回失敗 |
| `Data` | 資料庫上下文、種子、綱要遷移，snake_case 命名轉換與 CHECK/SEQUENCE 都在 DbContext |
| `Entities` | 對應資料表的類別（PascalCase 屬性 ↔ snake_case 欄位） |
| `Models` | 對外的請求/回應形狀（camelCase），驗證規則寫在 Request DTO |
| `Mapping` | Mapperly 編譯期產生映射碼，不手寫逐欄賦值 |
| `Common` | 跨模組共用機制（回應封裝、狀態碼分流、全域例外）——複製新模組時**不改** |
| `Constants` | 允許值字面量單一來源，DTO `[AllowedValues]` 與 DB CHECK 共用防漂移 |

## 更多

- 環境設定、連線字串、常見問題：`SETUP.md`
- 規格文件：`../2.2_system_docs/`（SRS v1.2、設計文件 DESIGN v1.6）
- 架構視覺化與 psql 三招：`../2.4_architecture_db/`
- 複製開新模組：根目錄 `使用說明-複製範本開發新API模組.md`

> 種子為虛構測試資料（24 筆），非真實個資。前端把記憶體 mock 換成打這支 API，資料就永久保存。
