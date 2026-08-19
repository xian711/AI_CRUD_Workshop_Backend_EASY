# 同一句需求，兩種給法（後端版）

這個 demo 的重點：**需求一模一樣，唯一的差別是有沒有附上「規矩」（harness）。**

前端課你比過 HTML；這堂課比的是 **.NET API 程式碼**——同一句「幫我寫一個新增裝備的 API」，
有沒有附團隊規矩，**AI 的決定從哪裡來**。

> ⚠️ **不要期待版本 A 會寫得很爛。** 2026-08-19 實跑時，版本 A 自己就做出了分層、建構式注入、
> EF Core 參數化、DTO 驗證、201＋Location、全域例外處理——這些一項都不用教。
> 你要盯的是它**自己發明**了什麼：回應形狀、id 格式、欄位名稱、訊息語言、路由字串。

---

## 版本 A — 沒有 harness（只給一句話）

```
幫我用 .NET 寫一個「新增裝備」的 API，
欄位有分類、名稱、數量、單位、規格、保管人、狀態，存到 PostgreSQL。
```

就這樣。AI 收到後**每一個規格細節都只能自己決定**：回應包成什麼形狀、id 長什麼樣、
有沒有「品項編碼」這個概念、欄位叫 `Quantity` 還是 `qty`、錯誤訊息用中文還是英文、路由怎麼開。
它會做得很好——只是那些決定跟你們團隊沒關係。
產出 → `no-harness.cs`（2026-08-19 實跑，Claude Opus 5）

---

## 版本 B — 有 harness（同一句話 ＋ 團隊規矩）

同一句需求，後面多附一段節錄自專案 harness 的規則（`harness/CODE-RULES-api.md` ＋ 契約）：

```
幫我用 .NET 寫一個「新增裝備」的 API，
欄位有分類、名稱、數量、單位、規格、保管人、狀態，存到 PostgreSQL。

＝＝＝ 請遵守以下專案規則（節錄自 CODE-RULES-api.md ＋ 契約）＝＝＝

【分層】
- Controller 只做薄委派：驗證交框架、商業邏輯與資料存取一律在 Service。
- Controller / Service 一律用建構式注入拿相依（DbContext、Mapper），
  嚴禁在方法內 new DbContext() 或硬編碼連線字串。

【DTO 與驗證】
- 請求收斂到 EquipmentItemRequest DTO；用 DataAnnotations 宣告驗證
  （[Required]、[Range]、[AllowedValues]、[RegularExpression]）。
- DTO 刻意不宣告 id / code / updatedAt——這三個由後端產生，body 帶了也忽略。
- 驗證失敗由框架回 400 ValidationProblemDetails，錯誤鍵為 camelCase 欄位名。

【契約（凍結）】
- 路由：POST /api/equipment/items
- 必填：categoryKey、name、qty、unit、spec1、status
- 選填：keeper、keeperPhone、locationName、purchaseDate、specNote
- status ∈ normal / maintenance / scrapped
- qty 為 int，且 >= 0
- keeperPhone 選填，填了才驗（手機 09 開頭 10 碼或市話）
- 成功回 201 + Location 標頭指向新資源；回應用 ModelResult 封裝。

【編碼產生】
- code 由後端在同一交易內產生：格式「前綴-流水3碼」，同前綴取現有最大流水號 +1。
- code 前端只做預覽，最終以後端為準；code 欄加唯一索引。

【例外處理】
- 只把「預期的業務失敗」（如查無資料）轉成 ModelResult 失敗訊息；
- 未預期例外（DB 斷線等）不要 try/catch 吞掉，讓它上拋給 GlobalExceptionHandler 回 500。
- 對外訊息一律繁體中文、可安全外露，嚴禁把 ex.Message 直接回給前端。
```

產出 → `with-harness.cs`

---

> 兩份 .cs 都是「新增裝備」的 API，功能目標一樣、品質也都不差。
> 打開它們並排比較，你會發現差的不是「有沒有做出來」、也不是「寫得好不好」，
> 是「**這些決定是誰做的**」。
>
> ⚠️ **模型與日期不同，結果會不一樣**——你自己拿這兩版去跑，產出不會跟教材附的逐字一樣。
> 比的是「AI 自己決定了幾項」的落差，不是逐字輸出。計分方式見 `../README.md` 的「A/B 決定來源計分表」。
>
> ⚠️ **這個對照的基準會過期。** 模型越強，版本 A 自己做對的事就越多。
> 每換一代模型請重跑一次，並把結果記進 `../README.md` 的實測紀錄表。
