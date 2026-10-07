# PRD — 中心裝備物資（後端持久化）

> 這份 PRD 從**前端課的成品**逆向整理而來，作為後端工作坊「用 .NET CRUD 標準範本＋AI harness 把假資料變真資料」的題目規格。
> 一切以前端型別與驗證規則的實際行為為準；標示「**待釐清**」者，是刻意留給你在課堂上跟 AI 拍板的決策點——PRD 不給答案。

---

## 1. 這份題目的來龍去脈

上一堂（前端 EASY）你已經做出「中心裝備物資」模組：一張列表、一份新增／編輯表單、24 筆種子資料。但那些資料是**前端記憶體裡的假資料**——`useEquipmentItems.ts` 用一個 module-level `ref` 存著，F5 重新整理、或換一台電腦，資料就回到原點。

這堂課要把它**變成真的**：生一支 .NET API＋一張 PostgreSQL 資料表，讓前端那個 `useFetch('/api/equipment/items')` 的接縫真的接上後端，資料永久保存。

| 項目 | 說明 |
|------|------|
| 使用者 | 沿用前端課設定：公所協作中心的裝備物資管理人員 |
| 這堂課要生什麼 | 一支 CRUD API（五條路由）＋一張資料表（`equipment_item`）＋24 筆種子 |
| 憑什麼生 | 現成的 .NET CRUD 標準範本（人員 CRUD，port 5080）＋ AI harness（規則檔）＋這份 PRD |
| 前端怎麼接 | 前端 composable 早就預留 `useFetch` 接縫，欄位名就是契約；後端只要照契約回資料，前端切一個旗標就接上 |

> **核心觀念：後端不是重新發明需求，是「服從前端已經定好的契約」。** 前端的型別欄位叫什麼、哪些必填，後端就照著做；欄位名一個都不能改，改了前端就接不上。

---

## 2. 目標與範圍

### 2.1 目標

把裝備物資模組從「前端 mock」升級為「前端 ＋ 真後端 ＋ 資料庫」，做到：

1. 五條 CRUD 路由可用（列表、單筆、新增、更新、刪除），行為與人員範本一致。
2. 資料落地 PostgreSQL，重啟不消失。
3. 種子 24 筆與前端 mock **逐欄一致**（同 code、同內容），前端切過來看到的資料不變。
4. 建置與測試全綠。

### 2.2 範圍內

- `equipment_item` 資料表（PostgreSQL，snake_case 欄名）。
- CRUD API：`GET/POST /api/equipment/items`、`GET/PUT/DELETE /api/equipment/items/{id}`。
- 24 筆種子資料。
- 對應的單元＋整合測試。

### 2.3 範圍外（本課不做）

| 項目 | 為什麼不做 |
|------|-----------|
| 認證授權 | 範本本來就無認證，單機教學用 |
| 分頁／篩選／排序的後端實作 | 見第 5 節待釐清項——原則上比照前端課「前端做」的裁決，但要你確認 |
| 借用／歸還、維保提醒、照片、匯入匯出 | 前端課就已排除，不是 CRUD 骨架 |
| 前端程式改動 | 前端成品已備妥雙模式，切旗標即可，不在本課動它 |

---

## 3. 契約依據＝前端型別（凍結，不可改欄名）

契約來源：前端成品 `composables/useEquipmentItems.ts` 的 `EquipmentItem` 介面（13 欄），必／選填以表單頁 `pages/equipment/crud/[id].vue` 的驗證規則為證據。

### 3.1 欄位表

| # | 欄名（前端契約） | 型別 | 必／選填 | 說明 |
|---|---|---|:---:|---|
| 1 | `id` | string（如 `E-001`） | 系統 | 主鍵，後端產生（見待釐清 Q2） |
| 2 | `code` | string（如 `IT-LAP-001`） | 系統 | 品項編碼，後端產生（見待釐清 Q1） |
| 3 | `categoryKey` | string | **必填** | 分類 value，須 ∈ 10 大分類（見第 4 節） |
| 4 | `name` | string | **必填** | 項目名稱 |
| 5 | `qty` | number（int） | **必填** | 數量，≥ 0 |
| 6 | `unit` | string | **必填** | 單位，如 台／件／箱 |
| 7 | `spec1` | string | **必填** | 規格說明 |
| 8 | `keeper` | string | 選填 | 保管人姓名 |
| 9 | `keeperPhone` | string | 選填 | 保管人電話（前端有填才驗格式） |
| 10 | `locationName` | string | 選填 | 存放地點（單一文字欄） |
| 11 | `status` | enum | **必填** | `normal`／`maintenance`／`scrapped`，預設 `normal` |
| 12 | `purchaseDate` | string（`YYYY-MM-DD`） | 選填 | 採購日期，可空（見待釐清 Q6） |
| 13 | `specNote` | string | 選填 | 備註 |

### 3.2 必／選填的判定依據（重要）

**別用猜的，去讀前端的驗證規則。** 證據在 `pages/equipment/crud/[id].vue`：

- `rulesFor()` 函式（約 349–358 行）列了 `required: true` 的欄位：`categoryKey`、`name`、`unit`、`spec1`、`status`。
- `save()` 函式（約 377–384 行）在驗證引擎外另檢查 `qty`（非數字或 < 0 報錯）與 `purchaseDate`（晚於今天報錯，但**空值放行**）。
- 其餘欄位（`keeper`、`keeperPhone`、`locationName`、`purchaseDate`、`specNote`）沒有 `required`，即為選填；`keeperPhone` 只有「填了才驗格式」的 pattern。

歸納：**必填 6 欄** = `categoryKey`、`name`、`qty`、`unit`、`spec1`、`status`；**選填 5 欄** = `keeper`、`keeperPhone`、`locationName`、`purchaseDate`、`specNote`；**系統產生 2 欄** = `id`、`code`。

> 逐欄的後端驗證對照（哪欄設 `[Required]`、哪欄 nullable、CHECK 約束）留給 AI 在設計文件-delta（`DESIGN-裝備物資API-delta.md`）裡寫清楚，並以本節為證據。

### 3.3 回應與請求形狀（比照人員範本慣例）

- 回應資料（Result）：上表 13 欄，外加一個 `updatedAt`（比照範本 D12 的異動時間戳），一律 camelCase。
- 請求資料（Request）：Result 扣掉 `id`、`code`、`updatedAt`（因為這三個都不由使用者輸入）。
- 封裝：成功回應與查無（404）沿用範本 `ModelResult` / `ModelResult<T>`；`DELETE` 成功回 204 無主體；驗證失敗 400 與未預期錯誤 500 照範本的錯誤格式（ValidationProblemDetails、全域例外處理），不包 `ModelResult`。
- 狀態碼：新增 201＋Location、查無 404、刪除成功 204、驗證失敗 400（錯誤鍵 camelCase）。

---

## 4. 分類字典與編碼規則（描述，不含實作決策）

前端有兩份字典，後端產編碼時會用到。**這兩份字典的內容以前端 `useEquipmentItems.ts` 為準**，一字不差搬過來：

### 4.1 10 大分類（類別碼 2 碼）

| 分類 value | 類別碼 | 中文 label |
|-----------|:---:|-----------|
| ICT | IT | 資通訊設備 |
| POWER | PW | 供電及照明設備 |
| STORAGE | ST | 儲物設備 |
| OFFICE | OF | 事務用品 |
| PPE | PP | 個人防護裝備 |
| SHELTER_SUPPLY | SH | 支援避難收容設施 |
| EMFOOD | EF | 自用緊急物資 |
| MEDICAL | MD | 醫療及衛生用品 |
| DECON | DC | 清消及過濾設備 |
| OTHER | OT | 其他 |

### 4.2 編碼規則（`code`）

- 格式：`{類別2碼}-{項目3碼}-{流水3碼}`，例：`IT-LAP-001`。
- 類別碼取自上表；項目碼取自前端 `ITEM_CODE_MAP`（項目名 → 3 碼），查不到用 `OTH`；「OTHER」分類一律 `OTH`。
- 流水號：**同前綴各自從 001 遞增**（同一個 `IT-LAP-` 前綴下取現有最大流水 +1）。注意這不是「全表一個流水號」，是「每個前綴各數各的」。
- 課堂簡化版（沿用前端裁決）：允許同編碼多筆，不做「同編碼累加數量」那套特殊業務。

### 4.3 種子 24 筆

- 內容與前端 mock 逐欄一致：同 code、同 categoryKey、同 name、同數量、同保管人……。
- id 為 `E-001` ~ `E-024`；狀態分布：normal 多數、maintenance 3 筆（E-002、E-007、E-022）、scrapped 2 筆（E-005、E-016）——以前端 `SEED` 陣列的實際內容為準。
- 部分選填欄（保管人／電話／採購日／備註）在種子裡刻意留空，示範選填。

---

## 5. 待釐清（PRD 不給答案，請你在 3.2 跟 AI 拍板）

這份 PRD 刻意留白。下面每一條都是「做得出來、但怎麼做要人決定」的岔路。**AI 讀完 PRD 應該先用選擇題把這些攤開來問你**，你拍板後它才動工：

| # | 待釐清 | 為什麼是岔路 |
|---|--------|------------|
| Q1 | **`code`（IT-LAP-001）誰產生、怎麼保證不重複？** | 前端只做即時預覽，真正入庫的編碼該由誰算？同前綴的流水號怎麼在併發下不撞號？要不要加唯一索引？ |
| Q2 | **`id`（E-001）怎麼產？** | 範本用 SEQUENCE 產 `M-###`；這裡沿用還是另想辦法？種子的顯式 id 與之後新增的自動 id 怎麼銜接不打架？ |
| Q3 | **分類／項目字典要不要建資料表？** | 兩份字典（分類、項目碼）可以建表，也可以當程式常數。建表更「正規」，但課堂只有一張主表夠不夠？ |
| Q4 | **刪除是硬刪還是軟刪？** | DELETE 是真的刪掉一列，還是改個狀態旗標留著？兩種在正式環境各有理由。 |
| Q5 | **分頁／篩選／排序在後端做還是前端做？** | 資料量小的時候 API 可以直接回全量讓前端處理；量大就得後端分頁。這堂課該押哪邊？ |
| Q6 | **`purchaseDate` 可不可以是空的？資料庫要怎麼存？** | 前端允許空字串；後端該存 null 還是空字串？型別用可空的日期還是字串？空值誰負責正規化？ |

> **心法：PRD 給你「契約」與「現況」，不給你「這堂課怎麼實作」。** 看到留白不要慌，那正是 3.2 要你跟 AI 一題一題敲定的東西。答案（課堂裁決）由講師在你完成釐清問答後才發放。

---

## 6. 非功能需求

| 項目 | 要求 |
|------|------|
| 回應格式 | 沿用人員範本慣例：`ModelResult` 封裝、camelCase、狀態碼語意一致 |
| 資料量假設 | 課堂前提 < 1000 筆；此假設要記進設計文件-delta（影響 Q5 分頁的裁決） |
| 連線 | 開發庫 `ai_crud_equipment`、測試庫 `ai_crud_equipment_test`；port 5080（一次只跑一支 API） |
| 建置品質 | `dotnet build` 0 警告 0 錯誤、`dotnet test` 全綠；不得刪測試或放寬 assertion 來換綠燈 |
| 種子一致性 | 24 筆與前端 mock 逐欄一致，可交叉比對 |

---

## 7. 驗收條件

1. `GET /api/equipment/items` 回 24 筆，欄位為 camelCase、含 `updatedAt`。
2. `GET /api/equipment/items/E-001` 回單筆；不存在的 id 回 404。
3. `POST` 一筆合法資料回 201＋Location，且 `code`、`id` 由後端產生；缺必填欄回 400（錯誤鍵 camelCase）。
4. `PUT /api/equipment/items/{id}` 更新既有筆；不存在回 404。
5. `DELETE /api/equipment/items/{id}` 回 204；再次刪同一筆回 404。
6. psql 直查 `equipment_item` 表有 24 列，`code` 與前端種子一致。
7. `dotnet build`、`dotnet test` 全綠（測試數以 `docs/TASKS.md` 為準）。

---

*文件結束。*
