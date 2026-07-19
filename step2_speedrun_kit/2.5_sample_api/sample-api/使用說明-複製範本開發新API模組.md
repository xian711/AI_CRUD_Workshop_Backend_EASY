# 使用說明 — 複製 sample-api 開發新 API 模組

> 對象：要用本範本開新 CRUD 後端模組的工程師（含新進人員）。
> 目標：讀完後，你能把 sample-api 複製成一個全新、符合規範、可跑可測的 API 模組骨架。
> 性質：操作手冊。全程以虛構的「**訪視紀錄 VisitRecord**」模組為例（與前端課的複製說明同一個例子）。
>
> 搭配閱讀：`CODE-RULES-api-本專案.md`（細則）、`contract-conventions-summary.md`（契約慣例）、`docs/baseline/`（SRS/SDD，工作區自包含複本）。本文只講「怎麼做」。

---

## 0. 心法：複製區 vs 共用區

範本的檔案分兩類。**決定哪些複製改名、哪些直接共用，是整件事的核心。**

> 判準（背下來）：**與「這個實體長什麼樣子」有關 → 複製改名；與實體無關的通用機制 → 共用。**

| 檔案 | 動作 | 為什麼 |
|------|:---:|------|
| `Controllers/MembersController.cs` | **複製改名** | 綁定實體的路由與端點 |
| `Services/IMemberService.cs` ＋ `MemberService.cs` | **複製改名** | 綁定實體的商業邏輯、SEQUENCE 名、404 訊息 |
| `Entities/Member.cs` | **複製改名** | 實體欄位定義 |
| `Models/MemberRequest.cs` ＋ `MemberResult.cs` | **複製改名** | 實體的驗證規則與回應形狀 |
| `Mapping/MemberMapper.cs` | **複製改名** | 實體的映射設定 |
| `Constants/MemberEnums.cs` | **複製改名** | 實體的允許值字面量 |
| `Data/DbSeeder.cs` ＋ `SeedData.cs` | **複製改名／改寫** | 實體的種子資料 |
| `Common/ModelResult.cs` | **直接共用** | 通用回應封裝，沒有一行提到「人員」 |
| `Common/ApiResultExtensions.cs` | **直接共用** | 通用狀態碼分流 |
| `Common/GlobalExceptionHandler.cs` | **直接共用** | 通用 500 處理 |
| `Program.cs` 樣式 | **共用（增量修改）** | 只加你的 DI 註冊行，不動其他段落 |
| `Data/AppDbContext.cs` | **共用（增量修改）** | 加你的 DbSet、SEQUENCE、CHECK；snake_case 轉換等機制不動 |

## 1. 改名對照表（全域）

| 範本 | 新模組（例） | 出現位置 |
|------|--------|---------|
| `api/template/members`（路由） | `api/visit-records` | Controller `[Route]` |
| `Member`（型別前綴） | `VisitRecord` | Entity、DTO、Service、Mapper、Controller |
| `template_member`（表名） | `visit_record` | DbContext `ToTable`、CHECK 名 |
| `template_member_seq`（SEQUENCE） | `visit_record_seq` | DbContext 常數、Seeder |
| `M-`（id 前綴） | `V-` | Service 取號、種子 |
| `ai_crud_template`（DB 名） | `ai_crud_visit`（自訂） | `appsettings.Development.json` |
| 人員（訊息文字） | 訪視紀錄 | ErrorMessage、404 訊息、XML 註解 |

## 2. 完整步驟

### 步驟 1 — 複製整包並改連線字串

```powershell
# 複製整個 sample-api 成新專案（在 sample-api 上一層執行）
Copy-Item -Recurse .\sample-api .\visit-api

# 改開發連線字串的 DB 名（開 appsettings.Development.json）
# "Database=ai_crud_template" → "Database=ai_crud_visit"
# 測試庫由 CustomWebAppFactory 導出（DB 名 + "_test"），一併確認
```

> DB 名用小寫 snake_case（PostgreSQL 慣例，免加引號）。**測試庫名必須以 `_test` 結尾**，否則測試夾具的防呆會拒跑。

### 步驟 2 — 五類檔案複製改名

PowerShell 指令（於新專案 `src/CrudTemplate.Api/` 下；bash 使用者把 `Copy-Item` 換 `cp` 即可）：

```powershell
# ① Controller
Copy-Item Controllers\MembersController.cs Controllers\VisitRecordsController.cs
# ② Service ＋ 介面
Copy-Item Services\IMemberService.cs Services\IVisitRecordService.cs
Copy-Item Services\MemberService.cs  Services\VisitRecordService.cs
# ③ Entity
Copy-Item Entities\Member.cs Entities\VisitRecord.cs
# ④ DTOs
Copy-Item Models\MemberRequest.cs Models\VisitRecordRequest.cs
Copy-Item Models\MemberResult.cs  Models\VisitRecordResult.cs
# ⑤ Mapper（另加常數檔）
Copy-Item Mapping\MemberMapper.cs Mapping\VisitRecordMapper.cs
Copy-Item Constants\MemberEnums.cs Constants\VisitRecordEnums.cs
```

然後逐檔把 `Member`→`VisitRecord`、`members`→`visit-records`、欄位換成新實體的欄位。改完把**舊的 Member 系列檔刪掉**（新模組不需要人員），或保留當對照（正式專案建議刪）。

改 `AppDbContext.cs`：
- `DbSet<VisitRecord> VisitRecords`
- SEQUENCE 常數改 `visit_record_seq`、`ToTable("visit_record", ...)`
- CHECK constraint 依新實體的允許值欄位（由 `VisitRecordEnums` 常數組出）

改 `Program.cs`（只加兩行、不動其他）：
- `builder.Services.AddSingleton<VisitRecordMapper>();`
- `builder.Services.AddScoped<IVisitRecordService, VisitRecordService>();`

### 步驟 3 — 重生 migration

範本既有的 Migrations 是「人員」的綱要，新模組要整組重生：

```powershell
# 於新專案根（有 .sln 那層）
Remove-Item -Recurse src\CrudTemplate.Api\Data\Migrations
dotnet tool restore
dotnet dotnet-ef migrations add InitialCreate --project src\CrudTemplate.Api
```

> 鐵律：之後每次改綱要都 `migrations add` 新增，**不改既有 migration、不手改 DB**。

### 步驟 4 — 改種子（Seed）

- `SeedData.cs`：換成新實體的種子字面量（**顯性字面量，不要用產生器**；檔頭標明虛構測試資料；涵蓋所有允許值組合）。
- `DbSeeder.cs`：id 前綴、SEQUENCE RESTART 值改成「種子筆數 + 1」（例：20 筆種子 → `RESTART WITH 21`，DbContext 的 `StartsAt` 也同步改）。

### 步驟 5 — 測試複製改名

```powershell
# 於 tests/CrudTemplate.Api.Tests/
Copy-Item Unit\MemberValidationTests.cs Unit\VisitRecordValidationTests.cs
Copy-Item Unit\MemberMapperTests.cs     Unit\VisitRecordMapperTests.cs
Copy-Item Integration\MembersApiTests.cs Integration\VisitRecordsApiTests.cs
# CustomWebAppFactory.cs 共用，只確認測試庫名以 _test 結尾
# http\members.http → http\visit-records.http（路由與範例 body 換掉）
```

斷言紀律照範本：清單斷「至少 N 筆」不斷「恰 N 筆」；POST 斷 id 格式不斷固定流水號。

### 步驟 6 — 驗收

```powershell
dotnet build     # 0 error 0 warning（Mapperly RMG 警告視同錯誤）
dotnet test      # 全綠
dotnet run --project src\CrudTemplate.Api --urls http://localhost:5080
# 開 http://localhost:5080/swagger，五端點各操作一次
```

全域搜尋殘留，把漏改的字串清乾淨：

```powershell
Get-ChildItem src -Recurse -File | Where-Object { $_.FullName -notmatch '\\(bin|obj)\\' } | Select-String -Pattern 'Member|template'
```

（`Select-String` 沒有 `-Recurse` 參數，要先用 `Get-ChildItem -Recurse` 展開檔案再接管線；濾掉 `bin`／`obj` 是為了排除建置產物的假命中。）

## 3. Windows 指令對照表

| 用途 | PowerShell | bash 等價 |
|------|------|------|
| 切目錄 | `cd sample-api`（同） | `cd sample-api` |
| 複製檔案 | `Copy-Item a.cs b.cs` | `cp a.cs b.cs` |
| 複製整資料夾 | `Copy-Item -Recurse src dst` | `cp -r src dst` |
| 建資料夾 | `New-Item -ItemType Directory -Force dir` | `mkdir -p dir` |
| 刪資料夾 | `Remove-Item -Recurse -Force dir` | `rm -rf dir` |
| 全文搜尋 | `Get-ChildItem src -Recurse -File \| Select-String -Pattern "Member"` | `grep -rn "Member" src` |

## 4. 常見坑

| 坑 | 說明 |
|---|---|
| 測試庫名沒帶 `_test` | 測試夾具防呆直接拋例外拒跑——這是保護你不誤刪開發庫，改名即可 |
| CHECK constraint SQL 與 migration 不一致 | CHECK SQL 由 Enums 常數組出，改常數後**必須**加新 migration，否則 EF 判定 model 已變更 |
| 忘了改 SEQUENCE 起點 | 種子 N 筆就要 `StartsAt(N+1)`＋seed 後 `RESTART WITH N+1`，否則新增撞主鍵 |
| Mapperly 編譯錯誤 RMGxxx | 目標型別有欄位沒被映射——通常是 DTO 與 Entity 欄位沒對齊，補欄位或加 `[MapperIgnoreTarget]`（僅限系統欄位） |
| 5080 被占 | 同一時間只跑一個 API；或換 port（`--urls http://localhost:5090`，`.http` 檔的 `@host` 同步改） |
