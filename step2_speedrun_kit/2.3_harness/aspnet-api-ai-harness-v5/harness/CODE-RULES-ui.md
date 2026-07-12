# CODE-RULES-ui（前端程式規範）

一行一條。預設值取自 原單位前端（Vue 3）範本，公司導入時可改；CRUD / UI 前端改碼前必讀。**純後端 API 工作不必讀本檔。**

| 項目 | 規範 |
|---|---|
| 技術棧 | Vue 3 + TypeScript + Vite + Pinia；元件一律 `<script setup lang="ts">` |
| 檔名 | 元件 / service kebab-case（`custom-dialog.vue`、`example.service.ts`） |
| 目錄 | 功能模組分層：`src/{模組}/` 內含 `pages / components / services / models / types / store.ts`；共用放 `common/` |
| Props | `defineProps<{...}>()` 泛型＋`withDefaults`；雙向綁定 `defineModel`；事件 `defineEmits<>` |
| API 封裝 | 單一 axios instance（`baseURL: import.meta.env.VITE_SERVER_URL`＋token 攔截器）；每個資源一支 `*.service.ts`，回傳 `ApiResponse<T>` |
| 狀態 | Pinia setup store（`defineStore('x', () => {...})`）；跨模組以 `@/` alias 匯入 |
| Env | 變數一律 `VITE_` 前綴；多環境 `.env.{env}`；金鑰不進版控 |
| 格式化 | Prettier（singleQuote、tabWidth 2）＋ESLint flat config；commit 前跑 `lint` / `format` |
| 樣式 | 依 `modules/crud-ui/design-token-rules.md`，不硬編碼 |
| 表單互動 | 依 `modules/crud-ui/CRUD-UI.md` 慣例（Label 在上、必填 `*`、二次確認、分頁預設值…） |
| 註解 | 只寫「為什麼」；中英文之間加半形空格 |

## 範本檔案（照著這個寫，位於原單位前端範本專案）

範本僅供對照，不列入 loop 必讀；路徑不存在或不可讀時，依上方表格規範即可，不標 blocker。

| 類型 | 範本 |
|---|---|
| 元件 | `src/common/components/custom-dialog.vue` |
| service / axios | `src/common/services/example.service.ts`、`src/common/axios/index.ts` |
| store | `src/map/store.ts` |
