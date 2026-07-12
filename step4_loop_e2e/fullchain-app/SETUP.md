# solution-app — 執行說明

本專案＝CRUD 標準範本 ＋ 在其上新開發的「中心裝備物資」模組（`/equipment/crud`），是 step3 的**參考解**。範本原有的人員 CRUD（`/template/crud`）仍保留可跑。

可獨立執行的最小 Nuxt 3 專案，展示 CRUD 標準範本頁（人員管理列表 / 檢視 / 編輯 / 新增）與裝備物資模組。

## 啟動

```bash
pnpm install      # 安裝依賴（順帶 nuxt prepare 產生型別）
pnpm dev          # 啟動 dev server
```

啟動後開啟 <http://localhost:3100>（會自動導向 `/template/crud`）。

預設為 **mock 模式**（記憶體種子 24 筆，離線可跑，不需後端）。

> **教材版註記**：本工作坊包不含 sample-api 後端，以下 API 模式章節僅供課後銜接後端課參考，課堂全程用 mock 模式即可。

## API 模式（接 .NET 後端）

資料層 `composables/useTemplateMembers.ts` 為雙模式：預設 mock；`NUXT_PUBLIC_USE_API=true` 時改打真後端。
mock 程式碼與種子完整保留，兩模式可自由切換。

### 1) 先啟動後端（port 5080）

依 `sample-api/SETUP.md`：

```bash
cd sample-api/src/CrudTemplate.Api
dotnet run --urls http://localhost:5080
```

確認就緒（應回 200 + 24 筆）：

```bash
curl http://localhost:5080/api/template/members
```

### 2) 以 API 模式啟動前端

環境變數 `NUXT_PUBLIC_USE_API=true` 開啟 API 模式。

- **bash / macOS / Linux**：
  ```bash
  NUXT_PUBLIC_USE_API=true pnpm dev
  ```
- **Windows PowerShell**：
  ```powershell
  $env:NUXT_PUBLIC_USE_API = "true"; pnpm dev
  ```

### 3) 驗證 devProxy 生效

`nuxt.config.ts` 的 `nitro.devProxy` 已把 `/api/template` 轉發到後端（避開 CORS）。
透過前端埠（3100）打，應等同直打後端（3100 → 5080 已通）：

```bash
curl http://localhost:3100/api/template/members
```

預期 200 + 24 筆（`{ success, message, data }` 封裝，`data` 為人員陣列）。

### 覆蓋後端位址（選用）

後端不在預設 `http://localhost:5080` 時，用 `NUXT_PUBLIC_API_BASE` 覆蓋 devProxy 目標來源：

- **bash**：
  ```bash
  NUXT_PUBLIC_USE_API=true NUXT_PUBLIC_API_BASE=http://localhost:5090 pnpm dev
  ```
- **Windows PowerShell**：
  ```powershell
  $env:NUXT_PUBLIC_USE_API = "true"; $env:NUXT_PUBLIC_API_BASE = "http://localhost:5090"; pnpm dev
  ```

> 接縫說明：API 模式下 `records` 以 module-level ref 作本地快取——初次 GET 全量填入，
> create/update/remove 成功後以「後端回傳的實體」增量維護（不重新全量拉取）；`getById` 直打單筆。
> 解包取 `response.data`；`success:false` 或 HTTP 錯誤一律拋繁中 `Error`，與 mock 拋錯行為一致，呼叫端不需改動。

## 與主專案 frontend/ 的差異

- **Port**：本包用 **3100**（`nuxt.config.ts` 的 `devServer.port`），避免與主專案 3000 埠衝突，可同時開兩個。
- **依賴精簡**：只保留 `nuxt`、`@nuxt/ui`、`vue`、`@nuxtjs/tailwindcss`、`@iconify-json/heroicons`、`@iconify/utils`、`typescript`。移除 leaflet / echarts / v-calendar / xlsx / vuedraggable / turf / vue-leaflet 等與範本無關的套件。
- **版本鎖定**：`nuxt` 鎖 `3.21.1`、`vite` 以 `pnpm.overrides` 鎖 `7.3.1`（與 frontend 相同的已驗證組合）。caret 會拉到 nuxt 3.21.8 + vite 7.3.6，其 `@nuxt/vite-builder` 在 `ssr:false` 下有 `No entry found in rollupOptions.input` 回歸。
- **nuxt.config 精簡**：CSS 只載入 `design-token.css → comp-tokens.css`（移除 `map-icons.css`）；移除 `build.transpile`（echarts）與 `nitro.publicDir`（Cloudflare 部署）等無關設定。保留 tailwind theme.extend、字型 head、`ssr:false`、`colorMode: light`。
- **workspace 隔離**：放了自己的 `pnpm-workspace.yaml`，讓 sample-app 自成 workspace root，`pnpm install` 不會併入外層。
- **新增檔**：`pages/index.vue`（導向 `/template/crud`）、`layouts/default.vue`（re-export `template` layout）。
- **未修剪任何共用元件**：依賴閉包內元件（AppBreadcrumb、AppAddressPicker 等）皆逐字照抄 frontend，無專案特定依賴需拿掉。註：`AppBreadcrumb` 的「所屬單位」下拉分支在本包永不渲染（template layout 恆提供麵包屑），為 inert 死碼，刻意保留以維持與 frontend 一致。

> 種子資料為虛構測試資料（24 筆），非真實個資。資料層在 `composables/useTemplateMembers.ts`，改接後端只需把內部實作換成 `useFetch`。
