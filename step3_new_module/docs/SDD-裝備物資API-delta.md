# SDD 差異說明 — 中心裝備物資 API（相對於範本 SDD）

> 只寫與範本 `SDD-CRUD後端標準-v1.6` 不同之處。分層架構、Mapperly、統一封裝、
> 例外分類（D11）、SEQUENCE 取號、snake_case 命名轉換等通則沿用不重述。
> 對應實作：`step3_new_module/solution-api/`（與本文同源）。

## 1. 狀態碼矩陣（含 equipment 列）

| 操作 | 路由 | 成功 | 失敗 | 封裝 |
|------|------|------|------|------|
| 查全部 | `GET /api/equipment/items` | 200 | 500（未預期例外） | ModelResult\<List\> |
| 查單筆 | `GET /api/equipment/items/{id}` | 200 | 404（查無） | ModelResult\<T\> |
| 新增 | `POST /api/equipment/items` | 201 + Location | 400（驗證）／500 | ModelResult\<T\> |
| 更新 | `PUT /api/equipment/items/{id}` | 200 | 404／400 | ModelResult\<T\> |
| 刪除 | `DELETE /api/equipment/items/{id}` | 204（無主體） | 404 | 無（一致性唯一例外） |

驗證失敗（400）錯誤鍵一律 camelCase（沿用範本 `InvalidModelStateResponseFactory`）；
實測範例：`qty` → `{"errors":{"qty":["數量不可小於 0"]}}`。

## 2. 資料表綱要 `equipment_item`（snake_case）

| 欄位 | 型別 | 約束 |
|------|------|------|
| id | varchar(10) | PK |
| code | varchar(20) | NOT NULL，唯一索引 `ux_equipment_item_code` |
| category_key | varchar(20) | NOT NULL，CHECK `ck_equipment_item_category_key`（10 類 IN） |
| name | varchar(50) | NOT NULL |
| qty | integer | NOT NULL |
| unit | varchar(10) | NOT NULL |
| spec1 | varchar(200) | NOT NULL |
| keeper | varchar(50) | NULL |
| keeper_phone | varchar(20) | NULL |
| location_name | varchar(100) | NULL |
| status | varchar(12) | NOT NULL，CHECK `ck_equipment_item_status`（normal/maintenance/scrapped IN） |
| purchase_date | date | NULL |
| spec_note | varchar(500) | NULL |
| updated_at | date | NOT NULL |

- SEQUENCE `equipment_item_seq`（起 25，遞增 1）——供 `id` 取號。
- Migration：`20260712070056_AddEquipmentModule`（`dotnet ef migrations add --output-dir Data/Migrations` 產生）。
- CHECK 的 SQL 由 `Constants/EquipmentEnums.cs` 常數陣列組出，與 DTO `[AllowedValues]` 共用字面值，杜絕漂移。

## 3. 六題 SCOPE 裁決落地方式

| # | 裁決 | 落地位置 | 實作要點 |
|---|------|------|------|
| Q1 | **code 後端產生**（偏離範本 D6 單一 SEQUENCE） | `EquipmentService.NextCodeAsync` + `AppDbContext`（唯一索引） | 「每前綴各自計數」單一 SEQUENCE 做不到 → 改「同前綴掃 MAX+1」；唯一索引 `ux_equipment_item_code` 為最後防線 |
| Q2 | **id 沿用範本 D6** | `EquipmentService.NextSequenceValueAsync` + SEQUENCE | `equipment_item_seq` 起 25 → `E-{n:D3}`；種子顯式 id，seed 後 RESTART 25 |
| Q3 | **硬刪除** | `EquipmentService.Delete` | `Remove` + 204／404，與範本 D5/D9 一致 |
| Q4 | **分頁/篩選/排序前端做** | `GetAll` 回全量（id 升冪） | 記入 SRS-delta 限制 |
| Q5 | **分類不建表** | `EquipmentEnums`（常數 + 兩份字典） | `categoryKey ∈ 10 類` 以常數驗證；`name` 不驗標準項目 |
| Q6 | **purchaseDate 可 null、選填欄** | `EquipmentItemRequest`（nullable + Validate） | 選填空白→null；purchaseDate 非 null 不晚於今天 |

### 3.1 編碼取號偏離 D6 的記錄（Q1 教學點）

範本 D6：主鍵用單一 SEQUENCE。裝備 `code` 的流水是「**每前綴各自計數**」（`IT-LAP-001`、
`PW-GEN-001` 各自從 001 起），單一 SEQUENCE 無法表達。故 `code` 改用「同前綴掃現有最大流水 +1」，
與 `id` 取號**在同一交易內**完成（`BeginTransactionAsync` → nextval + code 掃描 → SaveChanges → Commit）。
這是「同一慣例、不同需求要敢偏離並記錄」的示範。

### 3.2 併發限制

「同前綴 MAX+1」在真併發下兩個交易可能算出同一流水 → 唯一索引 `ux_equipment_item_code`
會讓後提交者觸發 DB 唯一性錯誤（未預期例外 → GlobalExceptionHandler 回 500，而非靜默重號）。
單機、單寫入者是本課堂明文前提；正式環境的重試/序列化隔離不在本範圍。

### 3.3 Update 的 keepCode 邏輯（對照前端）

`Update` 先算新前綴 `{類別碼}-{項目碼}-`：
- 原 `code` 以新前綴開頭（分類/項目未變）→ **保留原 code**；
- 否則（分類或項目變了）→ 於新前綴 `NextCodeAsync` 重算。
整段包在交易內（重算需掃 MAX）。與前端 `useEquipmentItems.ts` 的 `keepCode` 判斷一致。

## 4. null / 空字串正規化決策（自行裁決，記錄於此）

**決策：選填字串欄位（keeper / keeperPhone / locationName / specNote）空字串或純空白一律正規化為 `null`；
`purchaseDate` 空字串 → `null`（DateOnly?）。**

- 落地：DTO setter（仿範本 `BloodType` 自包含正規化），DB 欄位為 nullable。
- 種子一致性：前端 SEED 的空字串選填欄，在 DB 存 `null`（非空字串）——與 DTO 正規化同源，
  避免「入庫格式」與「請求格式」兩套。前端 adapter 顯示時把 `null` 還原為空字串。
- 取捨：與範本 `Email`/`Note` 存空字串的作法不同；本模組選填欄較多、語意上「未填＝null」更直觀，
  且與唯一 nullable 日期 `purchaseDate` 的處理一致，故整批採 null 正規化。

## 5. 種子（EquipmentSeedData，24 筆）

- 逐欄對齊前端 `useEquipmentItems.ts` 的 `SEED`：id `E-001~E-024`、`code` 逐字相同、內容相同。
- 狀態分佈（實測）：`normal` 19、`maintenance` 3（E-002/E-007/E-022）、`scrapped` 2（E-005/E-016）
  ——以前端 SEED 為準（BRIEF 摘要的「20/2/2」為約估，實資料為 19/3/2）。
- 前端 `EquipmentItem` 無 `updatedAt`，種子統一補固定基準日 `2026-07-11`（顯性、決定性）。
- 冪等：`equipment_item` 表空才植入（與 Members 各自獨立判斷）；seed 後 `ALTER SEQUENCE ... RESTART WITH 25`。

## 6. 測試（新增，不動既有 49 條）

| 檔案 | 內容 | 測試數（含 Theory 展開） |
|------|------|------|
| `Unit/EquipmentMapperTests.cs` | ToResult 14 欄齊、ToEntity 忽略 id/code/updatedAt、選填→null | 3 |
| `Unit/EquipmentValidationTests.cs` | 必填缺、qty 越界/省略、分類非法、狀態非法、電話格式、日期未來、選填空白→null | 23 |
| `Integration/EquipmentApiTests.cs` | GET 24／單筆／404、POST 201+id+code+Location、400 camelCase、同前綴流水遞增、PUT 保留/重算、PUT 404、DELETE 204→404、DELETE 404、body 帶 id/code 被忽略 | 14 |

整合測試沿用既有 `DatabaseFixture`（庫名 `_test` 防呆 + loopback 防呆自動保護），
與 Members 共用 `[Collection("Api")]`（同一 fixture、序列執行，取號不互相干擾）。

**實測總數：49（既有）＋ 40（本模組）＝ 89，全綠。**
