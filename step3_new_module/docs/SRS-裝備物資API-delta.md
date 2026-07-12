# SRS 差異說明 — 中心裝備物資 API（相對於範本 SRS）

> 本文只寫「與範本 `SRS-CRUD後端標準` 不同的部分」。範本已有的通則（分層、統一封裝、
> camelCase 契約、啟動自動遷移＋冪等 seed、單機教學前提）一律沿用，不重述。
> 對應實作：`step3_new_module/solution-api/`（參考解，與本文同源）。

## 1. 新資源：裝備物資（equipment item）

| 項目 | 範本（人員 member） | 本模組（裝備 equipment） |
|------|------|------|
| 資源路由 | `api/template/members` | `api/equipment/items` |
| 主鍵格式 | `M-###` | `E-###` |
| 資料表 | `template_member` | `equipment_item` |
| 開發 DB | `ai_crud_template` | `ai_crud_equipment` |
| 測試 DB | `ai_crud_template_test` | `ai_crud_equipment_test` |
| 種子筆數 | 24（M-001~M-024） | 24（E-001~E-024，逐欄對齊前端 `useEquipmentItems.ts`） |
| 額外鍵 | 無 | **品項編碼 `code`**（後端產生、唯一）——範本無此概念 |

兩模組在同一個 API 內**共存**（Members 範本原封不動、Equipment 為新增），對照前端課
`template` 與 `equipment` 並存的作法。

## 2. 欄位表（EquipmentItemResult，契約 14 欄，camelCase）

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | string | 系統產生 | `E-###`（SEQUENCE） |
| code | string | 系統產生 | 品項編碼 `{類別碼}-{項目碼}-{流水3碼}`，唯一 |
| categoryKey | string | ✔ | 分類 value，∈ 10 類 |
| name | string | ✔ | 項目名（一般分類選單值；「其他」自填） |
| qty | int | ✔ | 數量，≥ 0 |
| unit | string | ✔ | 單位 |
| spec1 | string | ✔ | 規格說明 |
| keeper | string? | 選填 | 保管人 |
| keeperPhone | string? | 選填 | 保管人電話（填了才驗格式） |
| locationName | string? | 選填 | 存放地點 |
| status | string | ✔ | `normal` / `maintenance` / `scrapped` |
| purchaseDate | date? | 選填 | 採購日期（可 null，不可晚於今天） |
| specNote | string? | 選填 | 備註 |
| updatedAt | date | 系統產生 | 最後更新日（本地時區） |

`EquipmentItemRequest` = 上表扣除 `id` / `code` / `updatedAt`（三者皆後端產生，body 帶了也被忽略）。

## 3. 驗證規則表（逐欄對齊前端 `pages/equipment/crud/[id].vue`）

| 欄位 | 規則 | 來源（前端） | 錯誤訊息（繁中） |
|------|------|------|------|
| categoryKey | 必填 + ∈ 10 類 | `{ required }` + 分類選單 | 請選擇分類／分類不在允許清單中 |
| name | 必填（≤50） | `{ required }` | 請選擇或輸入項目 |
| qty | 必填 + ≥ 0（整數） | `typeof !== number` / `< 0` | 請輸入數量／數量不可小於 0 |
| unit | 必填 | `{ required }` | 請輸入單位 |
| spec1 | 必填 | `{ required }` | 請輸入規格說明 |
| status | 必填 + ∈ 3 狀態 | `{ required }` + 狀態選單 | 請選擇狀態 |
| keeper | 選填 | 無驗證 | — |
| keeperPhone | 選填；非空才驗手機/市話格式 | `KEEPER_PHONE_PATTERN` | 電話格式錯誤（手機 09xxxxxxxx 或市話 0X-XXXXXXXX） |
| locationName | 選填 | 無驗證 | — |
| purchaseDate | 選填；非 null 不可晚於今天 | `purchaseDate > today` | 採購日期不可晚於今天 |
| specNote | 選填 | 無驗證 | — |

電話 pattern 逐字取自前端：`^(09\d{8}|0\d{1,2}-?\d{6,8})$`。

## 4. 行為契約（同範本，僅列差異點）

- 五路由行為與狀態碼與範本一致：`GET/POST /api/equipment/items`、`GET/PUT/DELETE /api/equipment/items/{id}`
  → 201+Location／200／404／204／400（camelCase 驗證鍵）／ModelResult 封裝（DELETE 無封裝）。
- **新增行為**：`code` 由後端於「新增／分類或項目變更時」產生（見 SDD-delta §6 六題裁決）。

## 5. 已知限制（教學前提）

- 分頁／篩選／排序在前端做，API 回全量（課堂資料量 < 1000 筆前提）。
- 分類字典不建表；`name` 不驗證是否屬於該分類的標準項目（「其他」可自填）。
- 「同前綴 MAX+1」取號在真併發下可能撞號；單寫入者為明文假設，唯一索引為最後防線。
