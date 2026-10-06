# SRS — CRUD 後端標準範本（Template CRUD Backend）v1.2

| 項目 | 內容 |
|------|------|
| 文件版本 | v1.2（v1.1 → v1.2：Contract v2 新增選填欄位 bloodType，欄位源自前端課 Lab、跨課契約對齊；新增 BR-B-11，§2 契約欄由 17 增為 18） |
| 日期 | 2026-07-11 |
| 狀態 | 已核准（供設計文件 DESIGN／實作使用） |
| 範圍 | 後端 REST API（.NET 10 + EF Core 10 + PostgreSQL），為既有前端 CRUD 標準範本補齊 PUT/DELETE 完整 CRUD |
| 對應前端 | 範本原始專案的 `sample-app`（Nuxt 3，17 欄位人員管理，資料層已預留 RESTful 接縫） |
| 後端基底慣例 | 原單位的 .NET API 範本，本文件明列相容與偏離處 |
| 落點 | 範本原始專案的 `sample-api/` |

---

## 1. 目的與定位

本模組**不是業務功能**，而是「可執行的後端開發標準」，與前端 CRUD 標準範本配對成兩門課程：

1. **教育訓練教材**：學員以一個完整、乾淨、可跑的後端 CRUD 範例，學會 .NET API 標準做法（分層、映射、驗證、測試）。
2. **新模組開發起點**：複製本範本改名即得符合規範的骨架。
3. **前後端接軌示範**：前端資料層 `useTemplateMembers.ts` 的 5 個接縫端點草案，由本後端實作；前端把記憶體 mock 換成 `useFetch` 即接上。

### 1.1 設計原則（約束所有 FR）

- **對齊前端契約**：JSON 契約採 camelCase、枚舉用中文字面值，最小化前端變更（見設計文件決策紀錄）。
- **相容原單位範本慣例**：分層、Mapperly、`ModelResult<T>`、GlobalExceptionHandler、DataAnnotations、xUnit 整合測試。
- **補齊 CRUD 缺口**：原單位範本僅有 GET 與一支 POST upsert，本範本補齊 GET 單筆 / POST 新增 / PUT 全量更新 / DELETE。
- **教學顯性**：SQL SEQUENCE 產生主鍵、primitive collection 存 JSON、本地時區日期組裝等皆為教學點，顯性優於聰明。

---

## 2. 示範實體：人員（TemplateMember）

與前端 `TemplateMember` 型別對齊（18 個持久欄位，含 Contract v2 新增的選填 `bloodType`）；`positionTitle` 為前端由 `positionCode` 導出之衍生值，**後端不儲存、不回傳**（BR-B-05）。

| 欄位（camelCase） | 型別 | 必填 | 說明 |
|------|------|:---:|------|
| id | string（`M-001`） | 系統 | 主鍵，後端 SEQUENCE 產生 |
| name | string | ✅ | 姓名 |
| gender | `'男' \| '女'` | ✅ | 中文枚舉 |
| birthDate | string（YYYY-MM-DD） | ✅ | 出生日期 |
| idType | `'身分證' \| '居留證' \| '護照'` | ✅ | 證件類別（相依驗證關鍵） |
| nationalId | string | ✅ | 證號，格式依 idType |
| phone | string | ✅ | 行動電話 `09xxxxxxxx` |
| email | string | — | 選填，填了須合法 |
| residenceCounty | string | ✅ | 居住縣市 |
| residenceTownship | string | ✅ | 居住鄉鎮區 |
| residenceAddress | string | ✅ | 居住地址 |
| groupName | string | ✅ | 編組 |
| positionCode | `'director' \| 'deputy' \| 'leader' \| 'member'` | ✅ | 職務代碼 |
| qualifications | string[] | — | 多值資格（存 JSON 欄位） |
| status | `'在職' \| '停用'` | ✅ | 狀態 |
| note | string | — | 備註 |
| bloodType | `'A' \| 'B' \| 'AB' \| 'O' \| null` | — | **選填（Contract v2）**，欄位源自前端課 Lab；空字串/空白正規化為 null，填了須為四血型之一（BR-B-11） |
| updatedAt | string（YYYY-MM-DD） | 系統 | 稽核欄位，後端本地時區寫入 |

種子資料：與前端相同的 **24 筆虛構資料**（冪等 seed），id 為 `M-001`~`M-024`。

---

## 3. Use Cases（UC-B）

| ID | 名稱 | 對應前端 UC | HTTP | 主要流程 |
|----|------|:---:|------|------|
| UC-B-01 | 查詢全部人員 | UC-T-01 | GET `/api/template/members` | 回全量清單（排序/篩選由前端處理） |
| UC-B-02 | 查詢單筆人員 | UC-T-02 | GET `/api/template/members/{id}` | 存在回 200；不存在回 404 |
| UC-B-03 | 新增人員 | UC-T-03 | POST `/api/template/members` | 驗證 → 後端配 id/updatedAt → 201 + 新資源 |
| UC-B-04 | 更新人員 | UC-T-04 | PUT `/api/template/members/{id}` | 驗證 → 全量更新 → 刷新 updatedAt → 200 |
| UC-B-05 | 刪除人員 | UC-T-05 | DELETE `/api/template/members/{id}` | hard delete → 204；不存在回 404 |

> 前端 UC-T-06（匯出 CSV）為純前端行為，不需後端端點。

---

## 4. 功能需求（FR-B）

### 4.1 清單查詢（FR-B-10x）

- **FR-B-101** GET `/api/template/members` 回全量清單，狀態碼 200，主體為 `ModelResult<MemberResult[]>`（camelCase）。
- **FR-B-102** 清單以 `id` 升冪回傳，確保順序決定性；排序/篩選/分頁由前端負責（伺服器端為擴充縫，見 FR-B-70x）。
- **FR-B-103** 空表時回 200 + 空陣列（`data: []`），非 404。

### 4.2 單筆查詢（FR-B-20x）

- **FR-B-201** GET `/api/template/members/{id}` 存在時回 200 + `ModelResult<MemberResult>`。
- **FR-B-202** 查無資料回 404 + `ModelResult{ success:false, message }`（繁中訊息，不洩漏內部細節）。

### 4.3 新增（FR-B-30x）

- **FR-B-301** POST `/api/template/members`，request body 為 `MemberRequest`（不含 id/updatedAt；含亦忽略，BR-B-06）。
- **FR-B-302** 通過驗證後：後端以 SEQUENCE 產生 `id`（`M-###`）、以本地時區寫入 `updatedAt`，回 **201** + `Location` 標頭 + `ModelResult<MemberResult>`。
- **FR-B-303** 驗證失敗回 **400** + `ValidationProblemDetails`，含欄位級繁中錯誤訊息（NFR-B-03）。

### 4.4 更新（FR-B-40x）

- **FR-B-401** PUT `/api/template/members/{id}` 為**全量更新**：以 body 覆蓋既有資料（除 id 外全欄位），刷新 `updatedAt`，回 200 + `ModelResult<MemberResult>`。
- **FR-B-402** 路徑 `{id}` 為更新目標；body 中的 id/updatedAt 一律忽略（BR-B-06）。
- **FR-B-403** 目標不存在回 **404**（本範本 PUT 不做 upsert，對齊前端 `update()` 找不到即拋錯的語意）。
- **FR-B-404** 驗證失敗回 400（同 FR-B-303）。

### 4.5 刪除（FR-B-50x）

- **FR-B-501** DELETE `/api/template/members/{id}` 為 **hard delete**（對齊前端 `remove()`），成功回 **204 No Content**（無主體）。
- **FR-B-502** 目標不存在回 **404**。

### 4.6 資料庫與種子（FR-B-60x）

- **FR-B-601** 應用程式啟動時執行 `Database.Migrate()`，自動套用未套用之 Migrations（NFR-B-01）。
- **FR-B-602** 遷移後執行冪等 seed：資料表為空才植入 24 筆虛構資料；已有資料則跳過（NFR-B-02）。

### 4.7 擴充縫（FR-B-70x，本版僅預留）

- **FR-B-701** GET 清單須保留 query 參數擴充縫（如 `?status=&group=&keyword=&page=&pageSize=`），供未來伺服器端篩選/分頁；本版忽略未知 query 參數並回全量。
- **FR-B-702** 認證授權留 JWT 接縫（Controller/Service 以註解標示未來 `ClaimsPrincipal` 注入點），本版不啟用。

---

## 5. 業務規則（BR-B）

| ID | 規則 | 對齊前端 |
|----|------|:---:|
| BR-B-01 | 必填欄位見第 2 章「必填」欄；email 選填，但填了必須符合格式 | BR-T-01 |
| BR-B-02 | 證號依 idType：身分證 `^[A-Z][12]\d{8}$`；居留證/護照僅檢查非空與長度上限（≤20） | BR-T-02 |
| BR-B-03 | 行動電話格式 `^09\d{8}$` | BR-T-03 |
| BR-B-04 | 刪除為 hard delete；二次確認由前端負責，後端對不存在之 id 回 404（冪等對外語意） | BR-T-04 |
| BR-B-05 | positionTitle 由 positionCode 導出，後端不儲存、不回傳（前端導出） | BR-T-05 |
| BR-B-06 | id 與 updatedAt 由後端產生；輸入 body 不含此二欄，含亦忽略（防外部竄改，對齊原單位範本稽核欄位規則） | BR-T-06 |
| BR-B-07 | id 格式 `M-###`，由 SQL SEQUENCE 於交易內產生，保證唯一與遞增 | 擴充前端 `nextId()` |
| BR-B-08 | updatedAt 以**本地時區**手工組 `YYYY-MM-DD`，嚴禁 `toISOString()` 類 UTC 轉換 | 對齊前端 `todayString()` 鐵則 |
| BR-B-09 | 枚舉（gender/status/idType）中文字面值與前端一致，DB 以 character varying + CHECK constraint 落地 | 前端枚舉常數 |
| BR-B-10 | qualifications：省略或 null 正規化為空陣列；每項 trim 後非空白且 ≤30 字；最多 10 項；違反回 400 | 補前端未明文之規格 |
| BR-B-11 | bloodType（Contract v2）選填：省略/null/空字串/空白正規化為 null；非 null 時須 ∈ {A,B,AB,O}，違反回 400（錯誤鍵 camelCase `bloodType`）。**選填理由＝跨課相容**：baseline 前端不送此欄，必填會使銜接 400；選填讓 baseline 與 Lab 成品前端同時相容。DB 為 `text NULL`＋CHECK（NULL 放行） | 前端課 Lab 欄位，跨課契約對齊 |

---

## 6. 非功能需求（NFR-B）

| ID | 需求 |
|----|------|
| NFR-B-01 | **啟動可遷移**：啟動時 `Database.Migrate()`，DB 不存在或落後時自動建立/升級綱要 |
| NFR-B-02 | **種子冪等**：重複啟動不會重複植入或報錯；空表才 seed |
| NFR-B-03 | **驗證錯誤回 400 帶欄位訊息**：`[ApiController]` 自動產生 `ValidationProblemDetails`，逐欄位列繁中訊息 |
| NFR-B-04 | **全域例外不洩漏內部**：未攔截例外經 GlobalExceptionHandler 回 500 + `ProblemDetails{ traceId }`，不含堆疊、`ex.Message` 或連線字串 |
| NFR-B-05 | **繁中錯誤訊息（界定範圍）**：應用層對外訊息（DataAnnotations/IValidatableObject 驗證訊息、404/商業失敗訊息、500 一般化訊息）為繁體中文；**框架層訊息（ValidationProblemDetails 之 title、JSON 模型繫結錯誤）明文允許為英文**——完整在地化列 backlog，不列為本版驗收條件 |
| NFR-B-06 | **分層與可測**：Controller 薄委派、只用建構子注入、每 Service 有介面；符合原單位範本分層 |
| NFR-B-07 | **契約 camelCase / DB snake_case**：JSON 契約 camelCase（ASP.NET 預設）；DB 欄位 snake_case（原單位範本慣例） |
| NFR-B-08 | **測試綠燈**：`dotnet build` 與 `dotnet test` 通過；含單元 + 整合測試（打 PostgreSQL 測試 DB） |
| NFR-B-09 | **連線字串可覆蓋**：開發連線字串於 `appsettings.Development.json`，可被環境變數覆蓋；學員須替換為自己的 PostgreSQL 連線 |

---

## 7. 範圍外（本版不做，backlog 誠實揭露）

| 項目 | 說明 / 未來接法 |
|------|------|
| 認證授權 | 留 JWT 接縫註解；原單位範本提示詞規則 4/5/6/7 之租戶隔離與呼叫方授權不適用（本範本為單租戶教學，無 comp_id） |
| 樂觀併發 | 不做版本欄位/If-Match；409 於契約中保留但本版不發出 |
| 伺服器端分頁/篩選/排序 | 前端現為 GET 全量 + 前端處理；僅預留 query 參數擴充縫（FR-B-701） |
| soft delete | 本版為 hard delete；soft delete（is_deleted 欄位）列 backlog |
| nationalId 唯一約束 → 409 | 前端無 409 處理 UI，契約對等優先；列 backlog 首位教學點（DB UNIQUE → 409 Conflict） |
| 訊息完整在地化 | 框架層英文訊息（繫結錯誤、ProblemDetails title）之在地化 |
| CSV 匯出 | 前端 UC-T-06 純前端行為，無後端端點 |
| 稽核人員欄位（CreId/UpdId） | 無認證故省略；僅保留 updatedAt 時間稽核 |

---

## 8. 驗收清單（QA 用）

- [ ] UC-B-01~05 五個端點皆可操作，狀態碼符合契約
- [ ] 每條 FR-B / BR-B / NFR-B 逐條檢核
- [ ] 啟動空 DB → 自動遷移 + 植入 24 筆；重啟不重複植入
- [ ] 證號依 idType 驗證（身分證合法/非法、居留證、護照三情境）
- [ ] POST/PUT 忽略 body 內 id/updatedAt，後端自產
- [ ] DELETE 後再 GET 該 id 回 404
- [ ] 驗證失敗回 400 帶欄位訊息；未攔截例外回 500 不洩漏內部
- [ ] `dotnet test` 全綠
