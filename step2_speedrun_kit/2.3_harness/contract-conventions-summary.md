# 契約慣例摘要（contract-conventions-summary）

> 一頁看懂 sample-api 對外契約的鐵律。前端接、AI 寫、review 對照，都以本頁為準。
> 這是後端版的「design-system-summary」：前端統一走 token，後端統一走這套契約慣例。
> 完整規格見 `../2.2_system_docs/SDD-CRUD後端標準-v1.6.md`。

## 1. 狀態碼矩陣

基底路徑 `/api/template/members`。

| 端點 | 200 | 201 | 204 | 400 | 404 | 500 |
|------|:--:|:--:|:--:|:--:|:--:|:--:|
| GET 清單 `/` | ✅ | | | | | ✅ |
| GET 單筆 `/{id}` | ✅ | | | | ✅ | ✅ |
| POST 新增 `/` | | ✅ | | ✅ | | ✅ |
| PUT 更新 `/{id}` | ✅ | | | ✅ | ✅ | ✅ |
| DELETE `/{id}` | | | ✅ | | ✅ | ✅ |

- **201** 帶 `Location: /api/template/members/M-025` 標頭。
- **400** ＝驗證失敗（`ValidationProblemDetails`）。**404** ＝查無資料（`ModelResult{success:false}`）。**500** 一律經 `GlobalExceptionHandler`。
- **204** 是全案唯一「成功但不套 `ModelResult` 封裝」的回應（HTTP 語意無主體，D5）。
- 409（唯一約束／樂觀併發衝突）契約保留但本版不發出（backlog）。

## 2. ModelResult JSON 形狀

成功回應一律以 `ModelResult<T>` 封裝（DELETE 204 除外）：

```jsonc
// 成功
{ "success": true,  "message": "",              "data": { /* 實體或陣列 */ } }
// 業務失敗（如 404 查無）
{ "success": false, "message": "找不到人員 M-999", "data": null }
```

- 前端解包約定：取 `response.data` 當實體；`success === false` 時以 `message` 顯示錯誤。這是前端相對記憶體 mock 需要多加的**唯一一層 unwrap**。
- `success` 預設 `true`，Service 進入業務失敗才設 `false`。

## 3. SEQUENCE 取號流程（id 怎麼來）

```
POST 進來
  → BeginTransaction（交易內）
  → SELECT nextval('template_member_seq')   -- 回 bigint，Convert.ToInt32 收斂
  → id = $"M-{n:D3}"                         -- 三位補零，破千自然變 M-1000
  → updatedAt = DateOnly.FromDateTime(DateTime.Now)  -- 本地時區，禁 UtcNow
  → Add + SaveChanges + Commit
```

- SEQUENCE `template_member_seq` 從 **25** 起（24 筆種子 M-001~M-024 之後）。
- 語意：**唯一且遞增，但允許缺號**（rollback／失敗／快取都消耗號碼不退回，號碼不代表提交順序）。取代前端「掃最大值 +1」的競態。
- `id` 與 `updatedAt` **不宣告在 `MemberRequest`**：body 帶了也被繫結忽略，杜絕外部竄改（BR-B-06）。

## 4. 驗證失敗（400）錯誤鍵 camelCase

```jsonc
{ "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "phone": ["行動電話格式須為 09 開頭共 10 碼"],
    "nationalId": ["身分證字號格式錯誤（範例 A123456789）"],
    "bloodType": ["血型只能是 A、B、AB 或 O"]
  },
  "traceId": "..." }
```

- 錯誤鍵一律 **camelCase**（`nationalId` 不是 `NationalId`），對齊前端欄位名；由 `Program.cs` 的 `InvalidModelStateResponseFactory` 統一轉換。
- 訊息一律**繁中**；`title` 與 JSON 繫結錯誤為框架英文（明文允許，NFR-B-05）。

## 5. D 決策六條精華（為什麼這樣設計）

| ID | 決策 | 一句話理由 |
|----|------|------|
| **D1** | JSON 契約 camelCase（DB 仍 snake_case） | 對齊前端型別，前端 `useFetch` 免逐欄改名 |
| **D4** | 回應統一 `ModelResult<T>` 封裝 | 沿用原單位範本；代價是前端多一層 `response.data` unwrap |
| **D5** | DELETE 成功回 204 無封裝 | HTTP 語意無主體；對齊前端 `remove()` 回 void |
| **D6** | id 用 SQL SEQUENCE 產生 | 交易安全、無併發競態，取代前端掃最大值+1 |
| **D9** | PUT 不做 upsert（不存在回 404） | 對齊前端 `update()` 找不到即拋錯語意 |
| **D11** | Service 不做 blanket try/catch | 分清「業務失敗→404」與「基礎設施故障→500」，別用一個布林同時代表兩者 |

> 延伸：D2（用 PostgreSQL）、D7（DateOnly↔date 避時區陷阱）、D10（positionTitle 不落 DB）、D14b（bloodType 選填＝跨課相容）。完整 14 條見 SDD 第 11 章。
