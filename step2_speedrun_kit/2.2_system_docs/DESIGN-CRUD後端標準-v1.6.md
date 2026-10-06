# 設計文件 — CRUD 後端標準範本（Template CRUD Backend）v1.6

| 項目 | 內容 |
|------|------|
| 文件版本 | v1.6 |
| 日期 | 2026-07-11 |
| 對應 SRS | `SRS-CRUD後端標準-v1.2.md` |
| 技術棧 | .NET 10、ASP.NET Core Web API、EF Core 10（**Npgsql PostgreSQL provider**）、Mapperly、xUnit + WebApplicationFactory |
| 落點 | 範本原始專案的 `sample-api/` |
| 基底慣例 | 原單位 .NET API 範本（分層、ModelResult、Mapperly、DataAnnotations、GlobalExceptionHandler） |

> 規格驅動開發（SDD：先文件、再程式）：本文件為實作契約，實作者須嚴格照做。所有偏離原單位範本慣例之處集中於第 11 章「決策與偏離紀錄」。

---

## 0.b v1.6 Contract v2 修訂紀錄（新增選填欄位 bloodType）

本版將 **`bloodType`（血型）** 補進後端全鏈路（DTO / Entity / migration / seed / 驗證 / 測試）。此欄源自**前端課的 Lab 成品**，本版把兩門課的契約對齊：後端主動涵蓋前端 Lab 會新增的欄位，讓 Lab 成品前端在 api mode 下血型不再遺失。相對 v1.5 的重點變更：

- **選填（nullable）**：`bloodType` 為 `string?`，允許 null。**理由＝跨課相容**：baseline 前端不送此欄，若必填會使 baseline 銜接直接 400；選填讓 baseline 與 Lab 成品前端同時相容（見第 11 章 D14b）。
- **§3.2**：POST/GET JSON 範例補 `bloodType`。
- **§4.1**：資料表新增 `blood_type text NULL` ＋ `ck_template_member_blood_type` CHECK（值 ∈ {A,B,AB,O}，NULL 自然放行）。
- **§5**：新增 BR-B-11（bloodType 選填、非空才驗允許值，仿 email 選填模式）；`IValidatableObject.Validate()` 由三條增為四條。
- **§9.2/§9.3**：新增 UB 系列單元測試與 IB1-IB3 整合測試。
- **Migration**：新增 `AddBloodTypeContractV2`（只加欄位＋CHECK，不回填舊列）。既有 dev 庫升級後既有 24 列 `blood_type` 為 NULL 屬正常；要取得含血型的種子須跑 `reset_workshop_data.sql` 後重啟 API 重植。
- 對外 API 契約其餘部分（路由、狀態碼、M-### 行為）不變；v1.5 保留於原始範本包的 `docs/` 供對照（不隨本課發佈）。

---

## 0. v1.5 遷移修訂紀錄（SQL Server → PostgreSQL）

本版將資料層由 SQL Server Express 全面抽換為 **PostgreSQL 17 以上（18.4 實測）**。對外 API 契約（路由、JSON 形狀、
狀態碼、M-### 行為、24 筆種子）**一位元未變**——遷移純屬實作層抽換。相對 v1.4 的重點變更：

- **D2 修訂**：資料庫由 SQL Server Express 改為 PostgreSQL；provider 換為 `Npgsql.EntityFrameworkCore.PostgreSQL`（見第 11 章 D2、§11 註）。
- **§4.2 SEQUENCE**：主鍵取值由 `NEXT VALUE FOR seq` 改為 PostgreSQL 的 `nextval('seq')`（回傳 bigint，`Convert.ToInt32` 收斂）。SQL Server「NEXT VALUE FOR 不得進子查詢」的限制不再適用，仍以原生 `DbCommand` 掛當前交易執行。
- **§4.3 qualifications**：由 SQL Server 的單一 `nvarchar(max)` JSON 欄位改為 PostgreSQL 原生陣列 `text[]`（default `'{}'`），round-trip 語意不變（取捨見 §4.3）。
- **CHECK constraint**：移除 `N''` unicode 前綴（PostgreSQL 一律 UTF-8）；`nvarchar(n)` 對應 `character varying(n)`。
- **測試隔離**：測試庫更名 `ai_crud_template_test`（小寫 snake_case），`_Test` 結尾防呆改為 `_test`；新增 PostgreSQL 連線池獵區處置（`EnsureDeleted` 前 `NpgsqlConnection.ClearAllPools()`，見 §9.1）。
- 完整逐版差異見 §13 修訂紀錄 v1.5 列。v1.4（SQL Server 版）保留於原始範本包的 `docs/` 供對照（不隨本課發佈）。

---

## 1. Solution 與資料夾結構

```
sample-api/
├─ CrudTemplate.sln                          方案檔（.NET 10）
├─ appsettings.json                          基礎組態（無祕密，僅預設值）
├─ src/
│  └─ CrudTemplate.Api/
│     ├─ CrudTemplate.Api.csproj             主專案（net10.0）
│     ├─ Program.cs                          組合根：DI 註冊、中介軟體順序、啟動遷移+seed
│     ├─ appsettings.Development.json         開發連線字串（可被環境變數覆蓋；學員替換）
│     ├─ Controllers/
│     │  └─ MembersController.cs             薄委派；路由 /api/template/members；狀態碼分流
│     ├─ Services/
│     │  ├─ IMemberService.cs                人員服務介面（CRUD 五方法）
│     │  └─ MemberService.cs                 商業邏輯；try/catch → ModelResult；id/updatedAt 產生
│     ├─ Data/
│     │  ├─ AppDbContext.cs                  EF Core DbContext；snake_case 命名轉換；CHECK/SEQUENCE 設定
│     │  ├─ DbSeeder.cs                      冪等 seed：空表才植入 24 筆虛構資料
│     │  ├─ SeedData.cs                      24 筆種子字面量（對齊前端 SEED）
│     │  └─ Migrations/                      EF Core Migrations（InitialCreate 等）
│     ├─ Entities/
│     │  └─ Member.cs                        資料表 template_member 對應實體（含 qualifications primitive collection）
│     ├─ Models/
│     │  ├─ MemberRequest.cs                 請求 DTO；DataAnnotations + IValidatableObject（idType 相依驗證）
│     │  └─ MemberResult.cs                 回應 DTO（camelCase，對齊前端 TemplateMember）
│     ├─ Mapping/
│     │  └─ MemberMapper.cs                  Mapperly [Mapper] partial；Request→Entity、Entity→Result
│     ├─ Common/
│     │  ├─ ModelResult.cs                   統一回應封裝（沿用原單位範本）
│     │  ├─ ApiResultExtensions.cs           ToActionResult()（含 failureStatusCode 分流）
│     │  └─ GlobalExceptionHandler.cs        IExceptionHandler → ProblemDetails{ traceId }
│     └─ Constants/
│        └─ MemberEnums.cs                   枚舉字面值 + 職務中繼資料（對齊前端常數）
└─ tests/
   └─ CrudTemplate.Api.Tests/
      ├─ CrudTemplate.Api.Tests.csproj       測試專案（xUnit）
      ├─ Unit/
      │  ├─ MemberValidationTests.cs         DTO 驗證單元測試（證號/電話/email）
      │  └─ MemberMapperTests.cs             Mapperly 映射單元測試
      ├─ Integration/
      │  ├─ CustomWebAppFactory.cs           WebApplicationFactory；指向 ai_crud_template_test；每輪重建
      │  └─ MembersApiTests.cs               端到端整合測試（五端點 + 失敗路徑）
      └─ http/
         └─ members.http                     手動驗證腳本（原單位範本慣例）
```

---

## 2. 分層規則與依賴方向

```
MembersController ──► IMemberService ──► MemberService ──► AppDbContext ──► PostgreSQL
    （薄）                （抽象）          （商業邏輯）        （EF Core）
     │                                        │
  HTTP 契約                              ModelResult<T>
  狀態碼分流                             Mapperly 映射
```

- **依賴方向單向向右**；上層只依賴下層的介面。禁止 Controller 直接觸及 `AppDbContext`。
- **Controller**：僅「委派 Service + `result.ToActionResult(failureStatusCode)`」。禁止查詢/組路徑/商業判斷。
- **Service**：**只把「預期的業務結果」轉成 `ModelResult` 失敗**（如查無資料回 404 訊息）；**未預期例外（DB 斷線等）不得捕捉，直接上拋**給 GlobalExceptionHandler 回 500——blanket try/catch 會讓基礎設施故障被 `failureStatusCode` 誤映成 404（決策 D11，偏離原單位範本「全包 try/catch」措辭）。日誌用訊息範本＋具名占位符；對外訊息不夾帶 `ex.Message`。
- **介面注入**：`IMemberService` 建構子注入，利於替換與測試。只用建構子注入，無靜態 service locator。

---

## 3. 完整 API 契約

基底路徑 `/api/template/members`；所有 JSON **camelCase**；成功主體以 `ModelResult<T>` 封裝（204 除外，見下）。

### 3.1 回應封裝與前端解包約定

```jsonc
// ModelResult<T>
{ "success": true, "message": "", "data": { /* T */ } }
```

**前端解包約定**：前端 `useFetch` 取 `response.data` 作為實體；`success === false` 時以 `message` 顯示錯誤。此為前端接縫相對記憶體 mock 需新增的**唯一一層 unwrap**（見第 11 章決策 D4）。

### 3.2 端點與 JSON 範例

**GET `/api/template/members`** — 全量清單（id 升冪）
```jsonc
// 200
{ "success": true, "message": "", "data": [
  { "id": "M-001", "name": "陳建豪", "gender": "男", "birthDate": "1975-03-12",
    "idType": "身分證", "nationalId": "V123456789", "phone": "0912345678", "email": "chenjh@example.tw",
    "residenceCounty": "臺東縣", "residenceTownship": "臺東市", "residenceAddress": "中華路一段120號",
    "groupName": "協作中心", "positionCode": "director", "qualifications": ["防災士","無線電執照"],
    "status": "在職", "note": "協作中心主任", "bloodType": "O", "updatedAt": "2026-07-05" }
] }
```

**GET `/api/template/members/{id}`** — 單筆
```jsonc
// 200 → { "success": true, "message": "", "data": { /* MemberResult 同上單筆 */ } }
// 404 → { "success": false, "message": "找不到人員 M-999", "data": null }
```

**POST `/api/template/members`** — 新增（body 不含 id/updatedAt）
```jsonc
// Request（MemberRequest）
{ "name": "新人員", "gender": "女", "birthDate": "1990-01-01", "idType": "身分證",
  "nationalId": "A223456789", "phone": "0911222333", "email": "",
  "residenceCounty": "臺東縣", "residenceTownship": "臺東市", "residenceAddress": "某路1號",
  "groupName": "搶救組", "positionCode": "member", "qualifications": ["防災士"],
  "status": "在職", "note": "", "bloodType": "AB" }
//   bloodType 為選填（Contract v2）：省略、null、空字串皆合法（正規化為 null）；填了須 ∈ {A,B,AB,O}
// 201  Location: /api/template/members/M-025
//   → { "success": true, "message": "", "data": { "id":"M-025", ..., "bloodType":"AB", "updatedAt":"2026-07-11" } }
// 400  → ValidationProblemDetails（見 3.4）
```

**PUT `/api/template/members/{id}`** — 全量更新（body 同 MemberRequest；id/updatedAt 忽略）
```jsonc
// 200 → { "success": true, "message": "", "data": { /* 更新後，updatedAt 已刷新 */ } }
// 404 → { "success": false, "message": "找不到人員 M-999", "data": null }
// 400 → ValidationProblemDetails
```

**DELETE `/api/template/members/{id}`** — hard delete
```
// 204 No Content（無主體）
// 404 → { "success": false, "message": "找不到人員 M-999", "data": null }
```

### 3.3 狀態碼矩陣

| 端點 | 200 | 201 | 204 | 400 | 404 | 409 | 500 |
|------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| GET 清單 | ✅ | | | | | | ✅ |
| GET 單筆 | ✅ | | | | ✅ | | ✅ |
| POST 新增 | | ✅ | | ✅ | | ◻ | ✅ |
| PUT 更新 | ✅ | | | ✅ | ✅ | ◻ | ✅ |
| DELETE | | | ✅ | | ✅ | ◻ | ✅ |

- ✅＝本版會回；◻＝契約保留但本版不發出（409 為未來樂觀併發預留）；500 一律經 GlobalExceptionHandler。
- 成功但無內容（DELETE）用 **204**，刻意不套 ModelResult 封裝（無主體）；此為封裝一致性的唯一例外，見第 11 章 D5。

### 3.4 驗證失敗（400）格式（ASP.NET `[ApiController]` 自動 + IValidatableObject）

```jsonc
{ "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "phone": ["行動電話格式須為 09 開頭共 10 碼"],
    "nationalId": ["身分證字號格式錯誤（範例 A123456789）"]
  },
  "traceId": "..." }
```

實作註記：ASP.NET 預設 errors 鍵為 PascalCase 屬性名，實作以 `InvalidModelStateResponseFactory` 轉 camelCase（對齊 D1）並補 `traceId`；SEQUENCE 取值以原生 `DbCommand.ExecuteScalarAsync` 執行 PostgreSQL 的 `SELECT nextval('template_member_seq')` 並掛入當前交易（`nextval` 回 bigint，`Convert.ToInt32` 收斂），BR-B-07 語意不變。

---

## 4. 資料庫綱要

### 4.1 資料表 `template_member`

DbContext 以命名轉換將 PascalCase 屬性映射為 snake_case 欄位（對齊原單位範本）。CHECK constraint 的 SQL 由 `MemberEnums` 常數組出（與 DTO 驗證同一字面值來源，防漂移；Codex 實作審 M4）。PostgreSQL 一律 UTF-8，CHECK 字面值不需 `N''` 前綴。

| DTO（camelCase） | DB 欄位（snake_case） | 型別 | 約束 |
|------|------|------|------|
| id | id | character varying(10) | **PK**，`M-###` |
| name | name | character varying(50) | NOT NULL |
| gender | gender | character varying(2) | NOT NULL, CHECK IN ('男', '女') |
| birthDate | birth_date | date | NOT NULL |
| idType | id_type | character varying(10) | NOT NULL, CHECK IN ('身分證', '居留證', '護照') |
| nationalId | national_id | character varying(20) | NOT NULL |
| phone | phone | character varying(10) | NOT NULL |
| email | email | character varying(100) | NULL |
| residenceCounty | residence_county | character varying(10) | NOT NULL |
| residenceTownship | residence_township | character varying(10) | NOT NULL |
| residenceAddress | residence_address | character varying(100) | NOT NULL |
| groupName | group_name | character varying(20) | NOT NULL |
| positionCode | position_code | character varying(20) | NOT NULL, CHECK IN ('director','deputy','leader','member') |
| qualifications | qualifications | text[] | NOT NULL, DEFAULT `'{}'`，**原生陣列**（EF primitive collection） |
| status | status | character varying(4) | NOT NULL, CHECK IN ('在職', '停用') |
| note | note | character varying(500) | NULL |
| bloodType | blood_type | text | **NULL（選填，Contract v2）**, CHECK IN ('A','B','AB','O')（NULL 自然放行） |
| updatedAt | updated_at | date | NOT NULL |

- **日期型別**：`birthDate` / `updatedAt` 用 `DateOnly` ↔ `date` 欄位。`DateOnly` 無時區概念，序列化即 `yyyy-MM-dd`，天然避開 UTC 位移陷阱（呼應 BR-B-08）。本範本無 `timestamp`/`timestamptz` 欄位，故無 Npgsql UTC 時間戳陷阱。
- **字串比較**：PostgreSQL 預設區分大小寫（有別於 SQL Server 預設不分大小寫）。本範本服務層無 `LIKE`/搜尋，行為不受影響；未來加伺服器端篩選時需自行處理大小寫。
- **索引**：本版僅 PK。`status` / `group_name` 篩選索引待伺服器端篩選啟用時再加（backlog）。

### 4.2 SEQUENCE（主鍵產生）

```sql
CREATE SEQUENCE template_member_seq AS integer START WITH 25 INCREMENT BY 1;  -- 25：24 筆種子之後
```
- 新增時服務層取 `SELECT nextval('template_member_seq')`，格式化為 `M-{n:D3}`（三位補零；破千自然變 M-1000）。`nextval` 回傳 bigint，以 `Convert.ToInt32` 收斂為 int。
- 語意精確（Codex 審查 C3 修正措辭）：SEQUENCE 保證併發下**唯一且遞增，但允許缺號**——rollback、失敗與快取都會消耗號碼且不退回，號碼不代表提交順序。取代前端 `nextId()`「掃最大值 +1」的競態問題。此為教學點（BR-B-07）。
- PostgreSQL 註記：`nextval` 為函式，可直接出現在 `SELECT` 中，無 SQL Server「不得進衍生資料表/子查詢」的限制；本範本仍以原生 `DbCommand` 執行並掛當前交易，維持取號與寫入同一交易語意。

### 4.3 qualifications（primitive collection → text[]）

- 實體宣告 `public List<string> Qualifications { get; set; } = [];`
- `modelBuilder.Entity<Member>().PrimitiveCollection(e => e.Qualifications).HasColumnType("text[]").HasDefaultValueSql("'{}'")` 映射為 PostgreSQL 原生陣列欄位。
- **取捨（PG-7）**：PostgreSQL 提供原生陣列型別，Npgsql 對 `List<string>` 有原生 `text[]` 對應，語意較 JSON 字串更貼近「值陣列」，且免序列化/反序列化。故本版採 `text[]`（取代 v1.4 SQL Server 版的 `nvarchar(max)` JSON 欄位）。備援方案為 `jsonb`（若原生陣列與序列化/測試相衝），實測 round-trip（I12）通過，採用原生 `text[]`，未動用備援。
- 教學點：示範 EF Core 10 primitive collection 在 PostgreSQL 上落地為原生陣列，免關聯表（本範本 qualifications 無需查詢過濾）。

---

## 5. 驗證規則落地

請求 DTO `MemberRequest` 帶完整 DataAnnotations；**idType 相依證號驗證** DataAnnotations 做不到，指定以 `IValidatableObject.Validate()` 於 DTO 自身實作（隨模型繫結執行，失敗自動回 400 ValidationProblemDetails，無需進 Service）。

實作規定（消除機制模糊）：
- 單欄位「允許值」一律用 .NET 8+ 內建 `[AllowedValues("男", "女", ErrorMessage = "...")]`（gender/idType/positionCode/status 四欄），**不放** IValidatableObject。
- `IValidatableObject.Validate()` 放四條物件層級規則：① nationalId 依 idType 的相依驗證；② email 非空時才驗格式；③ qualifications 三規則（BR-B-10：≤10 項、每項 trim 後非空白且 ≤30 字）；④ bloodType 非 null 時須 ∈ {A,B,AB,O}（BR-B-11，Contract v2；setter 已將空字串/空白正規化為 null，仿 email 選填模式）。
- 注意框架行為：物件層級 `Validate()` 僅在所有屬性層級 DataAnnotations 通過後才執行——測試設計失敗案例時，一次只錯一個欄位。

| 欄位 | DataAnnotations | 前端對照 | 補充（IValidatableObject） |
|------|------|:---:|------|
| name | `[Required][StringLength(50)]` | BR-T-01 | — |
| gender | `[Required]`＋允許值 (男/女) | 枚舉 | 值不在集合 → 錯誤 |
| birthDate | `[Required]`（**`DateOnly?`**——非 nullable value type 的 [Required] 無效，省略欄位會默默變 0001-01-01；Codex 實作審 H1） | BR-T-01 | — |
| idType | `[Required]`＋允許值 | BR-T-02 | 值不在集合 → 錯誤 |
| nationalId | `[Required][StringLength(20)]` | BR-T-02 | **依 idType**：身分證比對 `^[A-Z][12]\d{8}$`；居留證/護照僅非空+長度 |
| phone | `[Required][RegularExpression(^09\d{8}$)]` | BR-T-03 | — |
| email | `[StringLength(100)]`＋（非空時）`[EmailAddress]` 等效檢查 | BR-T-01 | 選填；填了才驗格式（於 IValidatableObject 判空後驗） |
| residenceCounty/Township/Address | `[Required][StringLength]` | BR-T-01 | — |
| groupName | `[Required][StringLength(20)]` | BR-T-01 | — |
| positionCode | `[Required]`＋允許值 (director/deputy/leader/member) | 枚舉 | 值不在集合 → 錯誤 |
| qualifications | 非必填 | BR-T-01 | 省略或 JSON `null` 一律正規化為空陣列；每項 trim 後不得為空白、長度 ≤30；最多 10 項；違反回 400（可實作規格，Codex C7 補齊） |
| status | `[Required]`＋允許值 (在職/停用) | 枚舉 | 值不在集合 → 錯誤 |
| note | `[StringLength(500)]` | BR-T-01 | — |
| bloodType | 非必填（Contract v2） | 前端課 Lab 欄位 | 選填；setter 將空字串/空白正規化為 null；非 null 時須 ∈ {A,B,AB,O}（於 IValidatableObject 驗，仿 email 模式，BR-B-11）；錯誤鍵為 camelCase `bloodType` |

> **id / updatedAt 不在 MemberRequest**（BR-B-06）：DTO 根本不宣告此二屬性，body 帶了也被繫結忽略，杜絕竄改（對齊原單位範本稽核欄位規則 7）。

驗證訊息一律繁中（`ErrorMessage`）。集中允許值於 `Constants/MemberEnums.cs`，DTO 與 DB CHECK 共用同一份字面值來源，避免漂移。

---

## 6. Mapperly 映射策略

`MemberMapper`：`[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Target)]` partial class，singleton 註冊、建構子注入。

| 方法 | 方向 | 說明 |
|------|------|------|
| `ToEntity(MemberRequest req)` | Request → Entity | 建立新實體；`Id` / `UpdatedAt` 標 `[MapperIgnoreTarget]`（服務層設值） |
| `Apply(MemberRequest req, Member entity)` | Request → 既有 Entity | 更新用；同樣忽略 Id/UpdatedAt |
| `ToResult(Member entity)` | Entity → Result | 回應映射；`MemberResult` 無 positionTitle，故 Entity 不需該欄（BR-B-05 自然滿足） |

- `RequiredMappingStrategy.Target` 使 Result 有漏映射欄位時**編譯期警告**，錯誤提早。
- 不用 AutoMapper（15 版起商業授權）；Mapperly 為 MIT、零反射、F12 可看生成碼（教學點，沿用原單位範本理由）。

---

## 7. 錯誤處理流

```
請求 → [ApiController] 模型驗證 ─(失敗)→ 400 ValidationProblemDetails（含 IValidatableObject 結果）
        │(通過)
        ▼
   Controller → Service（不做 blanket try/catch）
        │成功 → ModelResult{Success=true,Data} → ToActionResult() → 200/201
        │預期商業失敗（找不到）→ ModelResult{Success=false,Message} → ToActionResult(404)
        │未預期例外（含 DB 故障）→ 直接上拋 → GlobalExceptionHandler → 500 ProblemDetails{ traceId }（不含 stack/ex.Message）
```

- `ToActionResult(failureStatusCode)`：`Success=true` 回 200（或由 Controller 明確改用 201/204）；`Success=false` 回指定失敗碼（找不到用 404）。
- GlobalExceptionHandler 以 `IExceptionHandler` 註冊於中介軟體最外層（`UseExceptionHandler`），記完整例外於伺服器日誌，對外只回 `traceId`。
- 中介軟體順序（Program.cs，顯式固定，沿用原單位範本）：`UseExceptionHandler` →（Dev）`UseSwagger/UI` → `UseAuthentication`（接縫，本版空殼）→ `UseAuthorization` → `MapControllers`。

---

## 8. Seed 流程

```
啟動 → app.Services 建 scope → db.Database.Migrate() → DbSeeder.Seed(db)
DbSeeder.Seed：
  if (db.Members.Any()) return;                 // 冪等：非空即跳過
  db.Members.AddRange(SeedData.Members);        // 24 筆，id = M-001..M-024
  db.Database.ExecuteSql(...ALTER SEQUENCE template_member_seq RESTART WITH 25);  // 確保後續新增從 M-025
  db.SaveChanges();
```

- `SeedData.Members` 為 24 筆字面量，欄位值對齊前端 `SEED`（顯性、非產生器）。
- 冪等保證：以「表是否為空」判定，重啟不重複植入、不報錯（NFR-B-02）。
- 適用邊界（誠實揭露）：seed 假設**單一應用實例啟動**；多實例同時冷啟有「都判定空表」的競態，教學範本不處理（正式部署應改用部署管線跑 migration/seed，見 §12）。

---

## 9. 測試計畫

測試框架 xUnit。整合測試以 `WebApplicationFactory` 打 **PostgreSQL 測試 DB `ai_crud_template_test`**。

### 9.1 測試 DB 生命週期

- `CustomWebAppFactory` **以 `ConfigureTestServices` 替換 `DbContextOptions<AppDbContext>`** 指向 `ai_crud_template_test`（可被環境變數 `CRUDTEMPLATE_TEST_CONNECTION` 覆蓋）。**禁止用 `ConfigureAppConfiguration` in-memory 覆蓋連線字串**——minimal hosting 下該覆蓋會被 `appsettings.Development.json` 反壓，測試靜默打到開發 DB（實測踩雷：測試全綠但每輪污染開發庫，靠 E2E 髒資料才揭發）。
- `EnsureDeleted` 前防呆：解析 **host 實際生效的連線**（`db.Database.GetDbConnection().Database`，不是「打算用的字串」），名稱必須以 `_test` 結尾，否則拋例外拒跑（防誤刪，Codex 實作審 H2 強化版）。
- **PostgreSQL 連線池獵區**：主機啟動已跑過 `Migrate()`/`Seed()`，連線池殘留對測試庫的實體連線，會讓 `EnsureDeleted()` 的 `DROP DATABASE` 撞上「database is being accessed by other users」。處置：`EnsureDeleted()` 前呼叫 `NpgsqlConnection.ClearAllPools()` 釋放池化連線（SQL Server 版無此問題）。以此保證 `dotnet test` 連跑兩次皆綠（第二次驗 EnsureDeleted→Migrate 冪等）。
- 每輪測試開始：`ClearAllPools()` → `EnsureDeleted()` → `Migrate()` → seed，保證乾淨已知狀態（每輪重建，對齊原單位範本整合測試策略）。
- 以 collection fixture 共用 factory，避免每個測試重建整庫（效能）；需要隔離的寫入測試各自建立/清資料。

### 9.2 單元測試

| # | 測項 | 對應 |
|---|------|------|
| U1 | 身分證證號合法（`A123456789`）通過、非法（缺碼/小寫）失敗 | BR-B-02 |
| U2 | 居留證/護照僅檢查非空與長度上限 | BR-B-02 |
| U3 | phone 非 `09xxxxxxxx` 失敗 | BR-B-03 |
| U4 | email 空字串通過；非空非法失敗 | BR-B-01 |
| U5 | gender/status/idType/positionCode 非允許值失敗 | BR-B-09 |
| U6 | Mapperly `ToResult` 欄位齊全且無 positionTitle | BR-B-05 |
| U7 | Mapperly `ToEntity` 忽略 Id/UpdatedAt | BR-B-06 |
| U8 | qualifications：null 正規化為空陣列；>10 項、空白項、單項 >30 字皆失敗 | BR-B-10 |
| UB | bloodType（Contract v2）：null 通過；空字串/空白正規化為 null 後通過；四個合法值（A/B/AB/O）通過；非法值（含小寫）失敗 | BR-B-11 |

### 9.3 整合測試

| # | 測項 | 期望 | 對應 |
|---|------|------|------|
| I1 | GET 清單 | 200，**至少 24 筆**且含 M-001~M-024、id 升冪（不得斷言「恰 24 筆」——共用 factory 下寫入測試會增筆，避免測試間耦合） | FR-B-101/102 |
| I2 | GET 單筆存在 | 200，data.id 相符 | FR-B-201 |
| I3 | GET 單筆不存在 | 404，success=false，繁中 message | FR-B-202 |
| I4 | POST 合法 | 201，Location 標頭，回傳 id 符合 `^M-\d{3,}$` 且非請求前既有 id、updatedAt=今天（**不得斷言固定 M-025**——測試順序無關性，Codex C2；固定流水號只在手動 smoke 驗） | FR-B-301/302, BR-B-07/08 |
| I5 | POST 電話格式錯 | 400，errors 含 phone 繁中訊息 | FR-B-303, NFR-B-03 |
| I6 | POST 身分證證號錯 | 400，errors 含 nationalId | BR-B-02 |
| I7 | POST body 帶 id/updatedAt | 被忽略，後端自產 | BR-B-06 |
| I8 | PUT 合法 | 200，欄位更新、updatedAt 刷新 | FR-B-401 |
| I9 | PUT 不存在 | 404 | FR-B-403 |
| I10 | DELETE 存在 | 204，再 GET 該 id 回 404 | FR-B-501 |
| I11 | DELETE 不存在 | 404 | FR-B-502 |
| I12 | qualifications 陣列 round-trip | POST 後 GET 陣列一致（text[] 欄位） | §4.3 |
| I13 | 啟動遷移 + 冪等 seed | 重建後為 24 筆；再次 seed 不增筆數 | FR-B-601/602 |
| I14 | 觸發未攔截例外 | 500 ProblemDetails 含 traceId、不含 stack/ex.Message | NFR-B-04 |
| I15 | POST 省略 birthDate | 400，errors 含 birthDate（value type 必填漏洞回歸測試） | BR-B-01 |
| IB1 | POST 含血型（bloodType=AB） | 201，回應含 bloodType；再 GET 該筆 bloodType 一致（Contract v2 round-trip） | BR-B-11 |
| IB2 | POST 血型非法（bloodType=XYZ） | 400，errors 鍵為 camelCase `bloodType` | BR-B-11 |
| IB3 | POST 未帶 bloodType 鍵 | 201，回應 bloodType 為 null（選填，相容 baseline 前端） | BR-B-11 |

> 測試命名刻意避開 I16-I18（保留給學生 Lab 的 nationalId-409 三條，見 §12 backlog / 10_student）。Contract v2 新測試用 IB / UB 前綴。整合測試現況：I1-I15 ＋ IB1-IB3 ＝ 18 條；單元測試：U1-U8（含 U6/U7 mapper）＋ UB ＝ 31 條；`dotnet test` 全綠。

---

## 10. 原單位範本 12 條 DoD 相容對照

| # | DoD 規則 | 本範本 |
|---|------|------|
| 1 | Controller 薄委派 | 符合（§2） |
| 2 | Service 回 ModelResult、catch 不夾帶 ex.Message | 部分符合：ModelResult 沿用；但**不做 blanket try/catch**（未預期例外上拋，見 D11）——比原單位範本措辭更精確，避免 500 誤映 404 |
| 3 | 失敗不回 200、語意化失敗碼 | 符合（§3.3, ToActionResult 404） |
| 4 | 建構子注入、呼叫者資訊由 ClaimsPrincipal | 部分：DI 符合；ClaimsPrincipal 為 JWT 接縫，本版**不適用**（無認證） |
| 5 | 租戶隔離 WithCompanyAuth | **不適用**：單租戶教學範本，無 comp_id |
| 6 | 對外類授權 + 稽核 + 遮罩 | **不適用**：本範本為「給前端」類，非對外提供類 |
| 7 | 稽核欄位伺服器端設值、不從 body 綁定 | 符合：id/updatedAt 後端產生（§5, BR-B-06） |
| 8 | 祕密走環境變數 / 不入庫 | 符合：連線字串於 appsettings.Development.json（DEMO 值），可環境變數覆蓋（NFR-B-09） |
| 9 | 請求 DTO 完整 DataAnnotations、端點 `[ProducesResponseType]` | 符合（§5，Controller 標註各狀態碼） |
| 10 | 新組態強型別 Options + ValidateOnStart | **不適用**：本版無新增自訂 Options（僅連線字串） |
| 11 | 外部取得類 named HttpClient / UseMock / 短路 | **不適用**：無外部資料來源 |
| 12 | 補 .http 腳本 + xUnit（含失敗路徑） | 符合（§1 http/members.http, §9 含 400/404） |

---

## 11. 決策與偏離紀錄

| ID | 決策 / 偏離 | 理由 |
|----|------|------|
| D1 | JSON 契約 **camelCase**（偏離原單位範本 snake_case contract） | 前端接縫型別 `TemplateMember` 即 camelCase；採 ASP.NET 預設 camelCase 使前端 `useFetch` 免逐欄改名，最小化前端變更。DB 欄位仍 snake_case（原單位範本慣例），僅契約層偏離 |
| D2 | 資料庫用 **PostgreSQL**（v1.5 遷移；v1.4 為 SQL Server Express） | 對齊部署路線（下一輪 Cloud Run + Neon 皆 PostgreSQL）；教學上示範真實 RDBMS 的 SEQUENCE、CHECK、原生陣列欄位、Migrations。provider 換為 `Npgsql.EntityFrameworkCore.PostgreSQL`；SEQUENCE 取值改 `nextval`、qualifications 改 `text[]`、CHECK 去 `N''` 前綴（見 §0、§4） |
| D3 | 綱要用 **EF Core Migrations + 啟動 `Database.Migrate()`**（附冪等 seed） | 對齊 原單位正式專案；學員一鍵啟動即建庫植資料 |
| D4 | 回應統一 `ModelResult<T>` 封裝 | 沿用原單位範本；代價是前端需多一層 `response.data` unwrap（§3.1），此為前端接縫相對記憶體 mock 的唯一新增解包 |
| D5 | DELETE 成功回 **204 無封裝**（封裝一致性的唯一例外） | 204 依 HTTP 語意無主體；對齊前端 `remove()` 回 void。其餘成功回應仍套 ModelResult |
| D6 | id 用 **SQL SEQUENCE** 產生（取代前端掃最大值 +1） | 交易安全、無併發競態；教學點 |
| D7 | 日期欄位用 **DateOnly ↔ date** | 無時區概念，序列化即 `yyyy-MM-dd`，天然滿足 BR-B-08「禁 UTC 轉換」 |
| D8 | idType 相依證號驗證用 **IValidatableObject**（而非 service 層） | 隨模型繫結執行、失敗自動回 400 ValidationProblemDetails，與其他欄位驗證同一出口，Service 保持乾淨 |
| D9 | PUT **不做 upsert**（不存在回 404） | 對齊前端 `update()` 找不到即拋錯語意；原單位範本那支 POST upsert 屬 external-provider 情境，不套用於此「給前端」類 |
| D10 | positionTitle **不落 DB、不入回應** | 前端 `TemplateMember` 型別本無此欄，由前端 `positionTitleOf()` 導出（BR-B-05）；回應 DTO 與前端型別嚴格一致 |
| D11 | Service **不做 blanket try/catch**（採 Codex 獨立審查 C1） | 預期業務失敗才回 ModelResult failure；未預期例外上拋 GlobalExceptionHandler 回 500。避免單一布林同時表示 NotFound 與基礎設施故障、被 failureStatusCode 誤映 404 |
| D12 | updatedAt 維持 **DateOnly/YYYY-MM-DD**，定位改稱「更新日期」而非完整稽核欄位（Codex C4 部分採納） | 前端契約固定此欄為 YYYY-MM-DD 顯示欄位，改 timestamp 即破壞契約；同日多次更新不可觀測一事誠實列入 §12。時區＝伺服器本地時區（課堂假設臺灣） |
| D13 | **駁回** Codex C6「拆 TrainingDemo/ProductionStarter 兩 profile」；**backlog** C7 的 nationalId 唯一約束→409 | 教學範本以單一路徑降低認知負擔；正式化所需項目已於 §12 backlog 誠實列表＋複製警語。409 教學點需前端配套處理，列 backlog 首位 |
| D14b | **bloodType 選填（nullable），非必填**（Contract v2，§0.b） | 欄位源自前端課 Lab；**選填理由＝跨課相容**：baseline 前端不送此欄，若必填會使 baseline 銜接直接 400。選填讓 baseline 與 Lab 成品前端同時相容。setter 自包含正規化（空字串/空白→null，仿 qualifications）、驗證走 IValidatableObject（仿 email 選填模式），DB 為 `text NULL`＋CHECK（NULL 自然放行）。既有 dev 庫升級後舊列 blood_type 為 NULL 屬正常 |

> **§11 註（provider 抽換）**：v1.5 provider 由 `Microsoft.EntityFrameworkCore.SqlServer` 換為 `Npgsql.EntityFrameworkCore.PostgreSQL`（主專案與測試專案皆換）；`Microsoft.EntityFrameworkCore.Design` 保留供 Migrations。連線字串改 PostgreSQL 格式（`Host=...;Port=...;Database=...;Username=...;Password=...`）。Migration 三檔刪除重生（`InitialCreate`），生成物含 CHECK、`template_member_seq`（START 25）、`qualifications text[]`。以此案例作為 KM 教材（設計文件 delta 留痕：D2 修訂、§4.2/§4.3 對應）。

---

## 12. 已知限制與 backlog

| 項目 | 現況 | 未來接法 |
|------|------|------|
| 繁中訊息覆蓋範圍 | 繁中訊息涵蓋 DataAnnotations/IValidatableObject/404/500 一般化訊息；**JSON 模型繫結失敗（如 birthDate 傳空字串、型別不符）為框架預設英文訊息**（誠實揭露；前端送出前已驗證，實務影響低） | 需要時以自訂 `IProblemDetailsWriter` 或繫結錯誤攔截在地化 |
| 認證授權 | 無；`UseAuthentication` 為空殼、Controller/Service 留 JWT 接縫註解 | 導入 JWT 後由 Controller 傳 `ClaimsPrincipal` 入 Service |
| nationalId 唯一約束 | 無（前端 mock 亦未強制；前端無 409 處理 UI） | **backlog 首位教學點**：DB UNIQUE INDEX → 攔 `DbUpdateException`（Npgsql 的 `PostgresException.SqlState == "23505"`，並比對 constraint 名）回 409，前端補錯誤顯示（Codex C7 建議，D13 裁決） |
| updatedAt 觀測粒度 | DateOnly，同日多次更新值不變（僅「更新日期」，非完整稽核） | 需要時加 `row_updated_at (timestamptz)` 內部欄位，不進契約（D12） |
| 樂觀併發 | 無版本欄位；409 契約保留未發出 | 加 `xmin`/版本欄位 + `If-Match`，衝突回 409 |
| 啟動時自動 Migrate/seed | 教學便利設計；假設單一實例、開發權限（超級使用者可自動建庫） | 正式部署改部署管線跑 `dotnet ef migrations bundle`/script，關閉啟動 seed；受限帳號需先建空庫 |
| CORS | 未設定（開發期由 Nuxt devProxy 同源轉發，瀏覽器不跨源；審查 R3 發現） | 前端若改為瀏覽器直呼後端，須加 `AddCors` 白名單 |
| CancellationToken | Controller/Service/EF 查詢未傳遞（教學範本求精簡） | 正式化時全鏈路傳遞 `CancellationToken` |
| 測試 DB 隔離 | 固定名 `ai_crud_template_test`＋`_test` 結尾防呆＋`ClearAllPools` 釋放連線（單機課堂夠用） | CI/多人共用改 GUID 化 DB 名或 Testcontainers（PostgreSQL 容器） |
| 伺服器端分頁/篩選/排序 | GET 回全量，前端處理；query 參數保留未使用（FR-B-701） | 於 Service 依 query 加 `Where`/`Skip`/`Take`，補 status/group 索引；注意 PostgreSQL 字串比較區分大小寫 |
| soft delete | hard delete | 加 `is_deleted` 欄位 + 查詢過濾 |
| 稽核人員（CreId/UpdId） | 省略（無認證） | 有認證後由伺服器端設值 |
| 多租戶 | 單租戶 | 加 comp_id + `WithCompanyAuth()` 等效機制（fail-closed） |

---

## 13. 修訂紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0 | 2026-07-11 | 初版（Opus 起草）。定義 sample-api 結構、五端點契約、template_member 綱要、驗證/映射/錯誤處理/seed/測試計畫，及對前端契約與原單位範本慣例之決策與偏離 |
| v1.1 | 2026-07-11 | 設計審查修正（另一個 AI 獨立審查，審寫分離）：① I1 斷言改「至少 24 筆含 M-001~024」防測試間耦合；② 明定 `[AllowedValues]` 為單欄允許值機制、IValidatableObject 僅留兩條跨欄位規則、註記物件層級驗證僅在屬性驗證全過後執行；③ 誠實揭露 JSON 繫結錯誤為框架英文訊息（列入 §12 限制）。另裁決起草待決 5 點全數採預設（positionTitle 不落地、ModelResult 封裝＋前端 unwrap、驗證 regex 對齊前端、SEQUENCE 取代掃描+1、PUT 不 upsert） |
| v1.2 | 2026-07-11 | 併入 Codex CLI（gpt-5.6-sol）獨立審查裁決：採納 C1 例外分類（Service 不 blanket try/catch，D11）、C2 測試順序無關（I4 不斷言固定 M-025）、C3 SEQUENCE 措辭（唯一但允許缺號）＋seed 單實例假設、C7 qualifications 可實作規格；部分採納 C4（updatedAt 定位改「更新日期」，型別不動，D12）、C5（NFR-B-05 界定繁中範圍，見 SRS v1.1）；駁回 C6 雙 profile 拆分（D13）；nationalId 唯一→409 列 backlog 首位 |
| v1.3 | 2026-07-11 | 併入實作後對抗審查（Claude R3＋Codex 實作審）：birthDate 改 `DateOnly?`（value type 必填漏洞）＋I15 回歸測試、CHECK SQL 改由 MemberEnums 常數組出、測試 DB `_Test` 結尾防呆＋env 覆蓋、I9/I11 補驗 404 body、launchSettings 埠對齊 5080、CORS/CancellationToken/測試隔離列 backlog、§5 三條物件層級規則同步 |
| v1.4 | 2026-07-11 | **測試隔離重大修正**（E2E 髒資料揭發）：整合測試的組態覆蓋在 minimal hosting 下被 Development 設定反壓、實際打到開發 DB——改為 `ConfigureTestServices` 替換 DbContextOptions；`_Test` 防呆改查 host 實際生效連線。另補 §9.2 U8 列（BR-B-10，實作既有） |
| v1.5 | 2026-07-11 | **SQL Server → PostgreSQL 遷移**（D2 修訂）：provider 換 `Npgsql.EntityFrameworkCore.PostgreSQL`；SEQUENCE 取值 `NEXT VALUE FOR`→`nextval('seq')`（§3.4/§4.2）；qualifications `nvarchar(max)` JSON→原生 `text[]`（§4.3，取捨記錄，未動用 jsonb 備援）；CHECK 去 `N''` 前綴、`nvarchar(n)`→`character varying(n)`（§4.1）；測試庫更名 `ai_crud_template_test`、`_Test`→`_test` 防呆、新增連線池獵區處置 `NpgsqlConnection.ClearAllPools()`（§9.1）；nationalId 唯一→409 改 `PostgresException.SqlState=="23505"`（§12）。Migration 三檔刪除重生。對外 API 契約零變更；v1.4 保留供對照 |
| v1.6 | 2026-07-11 | **Contract v2：新增選填欄位 bloodType（血型）**（見 §0.b）。欄位源自前端課 Lab，跨課契約對齊：後端主動涵蓋前端 Lab 欄位，Lab 成品前端在 api mode 下血型不再遺失。`MemberRequest/MemberResult/Member` 皆加 `string? BloodType`；DTO setter 將空字串/空白正規化為 null，`Validate()` 增第四條（非 null 須 ∈ {A,B,AB,O}，錯誤鍵 camelCase `bloodType`，BR-B-11）；`§4.1` 新增 `blood_type text NULL` ＋ `ck_template_member_blood_type` CHECK；Migration `AddBloodTypeContractV2`（只加欄位＋CHECK，不回填舊列）；SeedData 24 筆補 deterministic 血型（O 8/A 7/B 6/AB 3）；新增 UB 單元測試與 IB1-IB3 整合測試（`dotnet test` 全綠，總 49 條）。選填理由＝跨課相容（baseline 前端不送此欄，必填會使銜接 400）。對外契約僅新增選填鍵，向後相容；v1.5 保留供對照 |
