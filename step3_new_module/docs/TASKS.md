# 裝備物資 API — 任務清單（學員視角）

> 這是「照課程流程、用 AI＋範本＋harness」做出裝備物資模組時，AI 會產出的 task list 長相。
> 每檔行數為**參考解實測值**（`solution-api/`）；學員實作會有出入，以實跑為準。
> 前提：已複製範本 `sample-api` 為 `my-equipment-api`，連線字串改 `ai_crud_equipment`（測試 `ai_crud_equipment_test`）。

## A. 領域模型與常數

- [ ] **A1** `Entities/EquipmentItem.cs` — 13 欄 + `updatedAt`；選填欄 nullable；`purchaseDate` DateOnly?。（實測 60 行）
- [ ] **A2** `Constants/EquipmentEnums.cs` — 10 分類（value/類別碼/label）、`ItemCodeMap`（項目名→3 碼，查無→OTH）、狀態清單、`CodePrefixOf`。**逐字對齊前端 `useEquipmentItems.ts`**。（89 行）

## B. DTO 與映射

- [ ] **B1** `Models/EquipmentItemRequest.cs` — DataAnnotations + IValidatableObject；必填 categoryKey/name/qty/unit/spec1/status；qty `int?`+`[Range(0,..)]`；電話/日期條件驗證；中文訊息、camelCase 鍵。**驗證規則以前端 `[id].vue` 為準**。（122 行）
- [ ] **B2** `Models/EquipmentItemResult.cs` — 契約 14 欄（含 id/code/updatedAt）。（27 行）
- [ ] **B3** `Mapping/EquipmentMapper.cs` — Mapperly；忽略 id/code/updatedAt；`MapQty(int?→int)`。（37 行）

## C. 服務與控制器

- [ ] **C1** `Services/IEquipmentService.cs` — CRUD 五方法介面。（25 行）
- [ ] **C2** `Services/EquipmentService.cs` — id＝SEQUENCE→`E-{n:D3}`；code＝同前綴 MAX+1，與 id 同一交易；Update keepCode/重算；不做 blanket try/catch（D11）；NotFound 業務分類。（155 行）
- [ ] **C3** `Controllers/EquipmentItemsController.cs` — Route `api/equipment/items`，薄委派，狀態碼對映同範本。（70 行）

## D. 資料層與遷移

- [ ] **D1** `Data/AppDbContext.cs` 擴充 — `DbSet<EquipmentItem>` + SEQUENCE（起 25）+ 兩個 CHECK + 具名唯一索引 `ux_equipment_item_code`。（+約 40 行）
- [ ] **D2** `Data/EquipmentSeedData.cs` — 24 筆種子，**逐欄對齊前端 SEED**（E-001~E-024、code 同、內容同；空選填欄→null）。（51 行）
- [ ] **D3** `Data/DbSeeder.cs` 擴充 — 冪等植入（表空才植）+ seed 後 `ALTER SEQUENCE ... RESTART WITH 25`（與 Members 各自獨立）。（+約 40 行）
- [ ] **D4** 新 migration — `dotnet tool restore` 後 `dotnet ef migrations add AddEquipmentModule --output-dir Data/Migrations`（Npgsql 版本 pin 別動）。（61 行）
- [ ] **D5** `Program.cs` 註冊 — `AddSingleton<EquipmentMapper>` + `AddScoped<IEquipmentService, EquipmentService>`。（+2 行）

## E. 測試（新增，不動既有 49 條）

- [ ] **E1** `Unit/EquipmentMapperTests.cs`（實測 3 個，106 行）
- [ ] **E2** `Unit/EquipmentValidationTests.cs`（實測 23 個含 Theory，184 行）
- [ ] **E3** `Integration/EquipmentApiTests.cs`（實測 14 個，283 行）— 沿用 `DatabaseFixture`、`[Collection("Api")]`。

## F. 驗收

- [ ] **F1** `dotnet build -warnaserror` → 0 錯 0 警告。
- [ ] **F2** `dotnet test` → 全綠，**恰好 89**（49 + 40）。
- [ ] **F3** `dotnet run --urls http://localhost:5080` → Invoke-RestMethod 打五路由（GET 清單 24 筆、GET 單筆、POST 看 id/code、DELETE、404/400）。**跑完關程序、釋放 5080**。
- [ ] **F4** psql 直查 `ai_crud_equipment` 的 `equipment_item` 筆數 = 24。

> 參考解實測：build 0/0、test 89 全綠、五路由與 psql 皆通過（詳見 `../BUILD_LOG` 或 I1 回報）。
