# fullchain-app 說明（step4 全鏈路前端成品）

這包是把前端課的成品 `AI_CRUD_Workshop_Frontend_EASY\step3_new_module\solution-app`
整包複製過來，再幫 **裝備物資（equipment）模組**加上「API 模式」，做成雙模式：

- **mock 模式（預設）**：資料在記憶體，F5 就重置。前端課離線可跑、既有 e2e 依賴這個模式。資料行為沒動；只有表單多了字數上限和「數量只收整數」兩條檢查（2026-10 回報前端修正，見下表最後兩列）。
- **API 模式**：切一個開關，改打學員自己做的 .NET 後端 + PostgreSQL，資料永久保存。

範本示範模組（template / 人員）本來就已經是雙模式，這次沿用它的樣式，只把 equipment 補齊。

## 與前端課 solution-app 的差異清單

| 檔案 | 改了什麼 | 為什麼 |
| --- | --- | --- |
| `nuxt.config.ts` | `nitro.devProxy` 新增一條 `'/api/equipment' → ${apiOrigin}/api/equipment`（比照既有 `/api/template`） | dev 期把 equipment 的 API 請求轉發到 .NET 後端（預設 `http://localhost:5080`），避開瀏覽器 CORS。mock 模式不會有請求走這條，閒置無害。 |
| `composables/useEquipmentItems.ts` | 新增 API 分支（雙模式）：`useApi` 旗標、`ensureLoaded`、`fromDto` / `toRequestBody`、`unwrap` / `messageFromError` / `statusOf`、本地快取增量維護。**mock 分支原封不動保留。** | 讓學員後端做完後，前端切開關就接上真資料。樣式完全比照 `useTemplateMembers.ts`，呼叫端（`pages/equipment/crud/*.vue`）一行都不用改（後來 2026-10 回報前端修正才動了 `[id].vue`，見最後兩列）。 |
| `composables/useEquipmentItems.ts` | **2026-10 回報前端修正**：新增 `EQUIPMENT_TEXT_LIMITS`（各文字欄字數上限）、`EQUIPMENT_QTY_MAX`（數量上限＝整數型別上限）、`EquipmentApiError`（帶回後端 400 的 `errors`：欄位名→繁中訊息）；API 分支的 `create` / `update` 失敗時改丟 `EquipmentApiError`。mock 分支沒動。 | 後端擋下的錯，頁面才知道是哪一欄；字數上限跟後端課堂裁決（名稱 50、單位 10、規格 200、保管人 50、電話 20、存放地點 100、備註 500）同一組數字。 |
| `pages/equipment/crud/[id].vue` | **2026-10 回報前端修正**：① 各文字欄加字數上限規則（訊息跟後端一字不差）；② 數量只收整數、不可超過上限；③ `save()` 接住失敗：後端 400 在對應欄位顯示紅字並聚焦，其他失敗只跳訊息，兩種都留在原頁、不清掉已填內容；④ 保管人、存放地點、備註三欄補上紅字的位置。 | 修正前：品名超過 50 字或數量打 1.5，按儲存被後端擋下，前端沒接住，整頁變「500 新增品項失敗」，填的內容全不見。這是 2026-10-11 實拍 Step 4 LOOP 時子代理挑到的（手冊 Step 4 ⑧）；修法也是請 AI 照「回報前端的三件事」做、子代理再審一次。 |
| `FULLCHAIN_NOTES.md` | 本檔（新增） | 記錄這包與前端課的差異、怎麼切模式。 |

> 根目錄前端 harness 檔（`CLAUDE.md`、`AGENTS.md`、`CODE-RULES-ui-本專案.md`、`SETUP.md`）隨複製帶過來，未修改。
> 前端課原本還附一份「複製範本開發新模組」的操作手冊，本課用不到（那是教怎麼開新**前端**模組的，且埠號寫法已過期），2026-08-19 已移除。

## 怎麼切 API 模式

模式開關讀 `runtimeConfig.public.useApi`（`nuxt.config.ts` 預設 `false` = mock）。用環境變數覆蓋即可：

```powershell
# API 模式（打真後端）——先確定後端已在 5080 跑起來
$env:NUXT_PUBLIC_USE_API = 'true'
pnpm dev            # 預設 3100；本機 3100 被佔用時改 pnpm dev --port 3199

# 換後端位址（非 5080）
$env:NUXT_PUBLIC_API_BASE = 'http://localhost:5080'   # devProxy 轉發目標
```

不設 `NUXT_PUBLIC_USE_API` 就是 mock 模式（前端課的行為）。

## devProxy 動線（一行圖）

```
瀏覽器 $fetch('/api/equipment/items')  →  Nuxt dev server (3100/3199)  ──devProxy──▶  .NET API http://localhost:5080/api/equipment/items  →  PostgreSQL
```

（mock 模式下這條線完全不啟用，資料全在前端記憶體。）

## 契約對齊重點（凍結）

- API base：`/api/equipment/items`；`GET/POST` 清單、`GET/PUT/DELETE /{id}`；ModelResult 封裝、DELETE 無封裝。
- 回應欄位（14 欄，camelCase）：id, code, categoryKey, name, qty, unit, spec1, keeper, keeperPhone, locationName, status, purchaseDate, specNote, updatedAt。
- 送出欄位：上述扣除 id / code / updatedAt。

### purchaseDate 的處理

- **收（fromDto）**：後端 `DateOnly?` 可能回 `null` → 前端正規化為空字串（`?? ''`），符合 `EquipmentItem.purchaseDate: string` 非空型別。其餘選填文字欄（keeper / keeperPhone / locationName / specNote）同理 `?? ''`。
- **送（toRequestBody）**：前端空字串 → `null`（`DateOnly?` 不接受空字串，一定要轉）。其餘選填文字欄保留空字串即可——後端會把空白正規化（trim / 空字串視同未填），兩邊寬鬆處理。

### updatedAt 的處理

- `updatedAt` 是契約欄位、後端一定回傳，但**前端 `EquipmentItem` 型別不含此欄**（前端課的型別設計就沒有），所以 `fromDto` 直接丟棄。
- 這與 template 模組樣式一致：template 的前端型別**含** updatedAt 故保留；equipment 前端型別**不含**故丟棄。以前端型別為準、樣式一致優先。

### id / code / updatedAt 一律以後端為準

- API 模式下，落庫的 `id` / `code` / `updatedAt` 全部取後端回傳值，前端絕不自算落庫。
- `nextEquipmentCode` 的**即時預覽**邏輯在 API 模式仍保留、仍由前端計算——那只是表單上顯示的預覽字串，真正入庫的 `code` 以 POST/PUT 回傳為準（後端在同一交易內取同前綴 MAX+1）。預覽值可能與落庫值差一號，屬正常。

## 驗證紀錄

### 2026-10-12 回報前端修正

- 實拍時由 AI 依報告修正，同一組 14 個前端情境修改前後各跑一次（不合法輸入改成欄位紅字、剛好上限的不誤擋）；`run-e2e` 兩次都 6 條全綠，後端 `dotnet test` 119 條全綠。
- 搬進教材後再跑 `run-e2e`：接學員作品、接 `solution-api` 各一次，都是 6 條全綠。

### 初次接 API 時（mock 模式）

- `pnpm install --frozen-lockfile`：exit 0（鎖版）。
- `pnpm dev --port 3199`（3100 被佔用改用 3199）：`/equipment/crud` 200、`/template/crud` 200。
- `pnpm build`：0 error。
- **未**對真後端驗證（後端當時仍在開發）；API 分支正確性由後續全鏈路 e2e 驗。
