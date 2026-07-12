# 同一句需求，兩種給法（後端版）

這個 demo 的重點：**需求一模一樣，唯一的差別是有沒有附上「規矩」（harness）。**

前端課你比過 HTML；這堂課比的是 **.NET API 程式碼**——同一句「幫我寫一個新增裝備的 API」，
有沒有附團隊規矩，AI 生出來的東西差多少。

---

## 版本 A — 沒有 harness（只給一句話）

```
幫我用 .NET 寫一個「新增裝備」的 API，
欄位有分類、名稱、數量、單位、規格、保管人、狀態，存到 PostgreSQL。
```

就這樣。AI 收到後只能自由發揮：怎麼分層、怎麼驗證、怎麼回錯誤、
編碼誰產生、例外怎麼處理，全憑它當下高興。
產出 → `no-harness.cs`

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

> 兩份 .cs 都是「新增裝備」的 API，功能目標一樣。
> 打開它們並排比較，你會發現差的不是「有沒有做出來」，
> 是「像不像同一個資深後端寫的、能不能安全上線」。
>
> ⚠️ **模型與日期不同，結果會略異**——你自己拿這兩版去跑，產出不會跟教材附的逐字一樣。
> 比的是**違規數的趨勢**（沒 harness 明顯較多），不是逐字輸出。計分方式見 `../README.md` 的「A/B 違規計分表」。
