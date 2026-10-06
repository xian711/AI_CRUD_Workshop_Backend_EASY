/**
 * useSurveyResponses — 課程回饋問卷「問卷回覆」的資料層（型別 + 持久化 + 非同步 CRUD）
 * ──────────────────────────────────────────────────────────────
 * 【接上後端之後的版本】
 * 同一個檔 composables/useSurveyResponses.ts，把那一行 TODO 換成真的 POST／GET /api/survey。
 * 跟 useSurveyResponses.before.ts（＝前端課 survey-app 的真檔）逐行對照，你會看到：
 *   1. 「型別與列舉常數」整段：一個字都沒改（這就是跟後端共用的契約）。
 *   2. useSurveyResponses() 回傳的 { responses, submit, clearAll } 與簽章：一個字都沒改。
 *   3. 改的只有函式「肚子裡面」：多一條 API 分支（雙模式，比照範本 useTemplateMembers.ts
 *      與後端課 step4 的 useEquipmentItems.ts）。localStorage 分支原封不動保留。
 * 所以 pages/survey/index.vue 與 pages/survey/admin.vue 一行都不用動。
 *
 * 模式開關：runtimeConfig.public.useApi（survey-app 的 nuxt.config.ts 預設 false）
 *   - false（預設）：存 localStorage，行為跟前端課一模一樣；GitHub Pages 靜態站照樣能用。
 *   - NUXT_PUBLIC_USE_API=true：打真後端 /api/survey。
 *     dev 期由 nuxt.config.ts 的 nitro.devProxy 轉發到 .NET（預設 http://localhost:5080），
 *     要在 devProxy 加一條 '/api/survey'（比照既有的 '/api/template'）。
 *
 * 後端契約（凍結；欄位名、型別、單選值一律以本檔上半部的型別為準）：
 *   GET    /api/survey → 200 ModelResult<SurveyResponse[]>（新的在最前面）
 *   POST   /api/survey → 201 ModelResult<SurveyResponse>（body = SurveyResponseInput；
 *                        id、submittedAt 由後端產生）
 *   DELETE /api/survey → 204 無主體（清空全部；SCOPE Q5）
 *
 * 本檔不含任何種子資料：問卷回覆是使用者真實填的，預設空清單即為正確初始狀態。
 */
import { computed, ref } from 'vue'

// ── 型別與列舉常數 ────────────────────────────────────────────
/** 整體滿意度 1–5，5 = 非常滿意（PRD 第 3 題） */
export type SurveyRating = 1 | 2 | 3 | 4 | 5
/** 最有收穫的段落（PRD 第 4 題） */
export type SurveyBestSection = '為什麼要 harness' | '範本與規矩' | '生成新模組' | 'LOOP 驗證'
/** 課程難度（PRD 第 5 題） */
export type SurveyDifficulty = '太簡單' | '剛好' | '太難'
/** 回公司最想先導入（PRD 第 6 題） */
export type SurveyAdoptPlan = '寫 CODE-RULES' | '整理範本' | 'PRD 流程' | 'LOOP 驗證'
/** 願意推薦給同事（PRD 第 8 題） */
export type SurveyRecommend = '是' | '否'

export interface SurveyResponse {
  id: string // 'R-001'，流水號由系統產生
  respondentName: string // 第 1 題 姓名（選填，可匿名）
  organization: string // 第 2 題 服務單位
  rating: SurveyRating // 第 3 題 整體滿意度
  bestSection: SurveyBestSection // 第 4 題 最有收穫的段落
  difficulty: SurveyDifficulty // 第 5 題 課程難度
  adoptPlan: SurveyAdoptPlan // 第 6 題 回公司最想先導入
  suggestion: string // 第 7 題 建議與想法（選填）
  willRecommend: SurveyRecommend // 第 8 題 願意推薦給同事
  submittedAt: string // 'YYYY-MM-DD HH:mm'，系統寫入
}

/** 送出用的輸入型別：id 與 submittedAt 由系統產生（PRD §3） */
export type SurveyResponseInput = Omit<SurveyResponse, 'id' | 'submittedAt'>

/**
 * 填答中的表單狀態：列舉欄位「尚未選擇」時為空字串／null，
 * 送出前才由 toSurveyInput() 收斂成 SurveyResponseInput（不用 any、不用型別斷言）。
 */
export type SurveyResponseDraft = {
  respondentName: string
  organization: string
  rating: SurveyRating | null
  bestSection: SurveyBestSection | ''
  difficulty: SurveyDifficulty | ''
  adoptPlan: SurveyAdoptPlan | ''
  suggestion: string
  willRecommend: SurveyRecommend | ''
}

/** 服務單位字數上限（PRD 第 2 題） */
export const ORGANIZATION_MAX_LENGTH = 30
/** 建議與想法字數上限（PRD 第 7 題，需顯示剩餘字數） */
export const SUGGESTION_MAX_LENGTH = 200

/** 滿意度選項：label 給人看、value 存數字，之後匯出 CSV 可直接在 Excel 算統計 */
export const SURVEY_RATING_OPTIONS: { label: string; value: SurveyRating }[] = [
  { label: '5 — 非常滿意', value: 5 },
  { label: '4 — 滿意', value: 4 },
  { label: '3 — 普通', value: 3 },
  { label: '2 — 不滿意', value: 2 },
  { label: '1 — 非常不滿意', value: 1 },
]
export const SURVEY_BEST_SECTION_OPTIONS: SurveyBestSection[] = [
  '為什麼要 harness', '範本與規矩', '生成新模組', 'LOOP 驗證',
]
export const SURVEY_DIFFICULTY_OPTIONS: SurveyDifficulty[] = ['太簡單', '剛好', '太難']
export const SURVEY_ADOPT_PLAN_OPTIONS: SurveyAdoptPlan[] = [
  '寫 CODE-RULES', '整理範本', 'PRD 流程', 'LOOP 驗證',
]
export const SURVEY_RECOMMEND_OPTIONS: SurveyRecommend[] = ['是', '否']

/** 空白表單（新的一份問卷） */
export function emptySurveyDraft(): SurveyResponseDraft {
  return {
    respondentName: '',
    organization: '',
    rating: null,
    bestSection: '',
    difficulty: '',
    adoptPlan: '',
    suggestion: '',
    willRecommend: '',
  }
}

/**
 * 表單狀態 → 送出輸入。必填未填時回 null（型別守衛，讓 TypeScript 自行收斂聯集型別）。
 * 字串欄位一律 trim，與驗證（已 trim 比對）及入庫格式保持一致。
 */
export function toSurveyInput(draft: SurveyResponseDraft): SurveyResponseInput | null {
  if (draft.rating === null) return null
  if (!draft.bestSection || !draft.difficulty || !draft.adoptPlan || !draft.willRecommend) return null
  if (!draft.organization.trim()) return null
  return {
    respondentName: draft.respondentName.trim(),
    organization: draft.organization.trim(),
    rating: draft.rating,
    bestSection: draft.bestSection,
    difficulty: draft.difficulty,
    adoptPlan: draft.adoptPlan,
    suggestion: draft.suggestion.trim(),
    willRecommend: draft.willRecommend,
  }
}

// ── 單例 state ＋ localStorage 持久化（BR-4）────────────────────
const STORAGE_KEY = 'course-survey-responses-v1'
const store = ref<SurveyResponse[]>([])
let loaded = false

/** 從 localStorage 載入一次（SSR 已關閉，但仍守 typeof window 以免非瀏覽器環境爆炸） */
function ensureLoaded(): void {
  if (loaded) return
  loaded = true
  if (typeof window === 'undefined') return
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return
  try {
    // 邊界轉型：localStorage 是純字串，解析後只能靠形狀檢查，非 any 滲漏
    const parsed: unknown = JSON.parse(raw)
    store.value = Array.isArray(parsed) ? (parsed as SurveyResponse[]) : []
  } catch {
    // 內容毀損（手動改壞、或舊版格式）時視為無資料，不讓整個管理頁崩潰
    store.value = []
  }
}

/** 寫回 localStorage：每次異動後呼叫，讓重新整理仍看得到（BR-4） */
function persist(): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store.value))
}

/** 送出時間戳（本地時區 'YYYY-MM-DD HH:mm'）：勿用 toISOString()——其為 UTC，台灣早上 8 點前會差一天 */
export function nowStamp(): string {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  return `${date} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

/**
 * 今天日期（本地時區，YYYYMMDD），供 CSV 檔名使用（BR-6）。
 * 刻意不叫 todayString()：範本的 useTemplateMembers 已導出同名函式，
 * Nuxt auto-import 是全域單一命名空間，撞名會被靜默忽略其中一個。
 */
export function surveyDateStamp(): string {
  return nowStamp().slice(0, 10).replace(/-/g, '')
}

/** 深拷貝：欄位皆為純量，展開即可；統一走此函式，日後加陣列欄位時只改這裡 */
function cloneResponse(response: SurveyResponse): SurveyResponse {
  return { ...response }
}

/** 產生流水 id：R- + 現有最大序號 +1，補零至 3 位 */
function nextId(): string {
  const maxSerial = store.value.reduce((max, response) => {
    const serial = Number(response.id.replace('R-', ''))
    return Number.isFinite(serial) ? Math.max(max, serial) : max
  }, 0)
  return `R-${String(maxSerial + 1).padStart(3, '0')}`
}

// ── 後端接軌（API 模式）──────────────────────────────────────
// 解包約定：取 ModelResult.data 為實體；success===false 或 HTTP 錯誤 → 拋 new Error(繁中訊息)。
// 頁面本來就用 try/catch 接 submit() 的錯誤，所以錯誤處理也不用改。
// id / submittedAt 一律以後端回傳為準（API 模式下前端不再自算）。
const API_BASE = '/api/survey'

/** 後端回應 DTO（camelCase，對齊 SurveyResponse）。選填欄位後端可能回 null，解包時正規化成空字串 */
interface SurveyResultDto {
  id: string
  respondentName: string | null
  organization: string
  rating: SurveyRating
  bestSection: SurveyBestSection
  difficulty: SurveyDifficulty
  adoptPlan: SurveyAdoptPlan
  suggestion: string | null
  willRecommend: SurveyRecommend
  submittedAt: string
}

type SurveyEnvelope = { success?: boolean; message?: string; data?: SurveyResultDto }
type SurveyListEnvelope = { success?: boolean; message?: string; data?: SurveyResultDto[] }

/** DTO → SurveyResponse：把後端可為 null 的選填欄位正規化，符合前端的 string 型別 */
function fromDto(dto: SurveyResultDto): SurveyResponse {
  return {
    id: dto.id,
    respondentName: dto.respondentName ?? '',
    organization: dto.organization,
    rating: dto.rating,
    bestSection: dto.bestSection,
    difficulty: dto.difficulty,
    adoptPlan: dto.adoptPlan,
    suggestion: dto.suggestion ?? '',
    willRecommend: dto.willRecommend,
    submittedAt: dto.submittedAt,
  }
}

/** 解包 ModelResult<T>：success===false 或沒有 data 視為失敗，拋出後端的繁中訊息 */
function unwrap<T>(result: { success?: boolean; message?: string; data?: T } | null | undefined, fallback: string): T {
  if (!result || result.success === false || result.data === undefined || result.data === null) {
    const message = result?.message?.trim()
    throw new Error(message ? message : fallback)
  }
  return result.data
}

/** 從 $fetch 拋出的 FetchError 取出後端繁中訊息（body 是 ModelResult），沒有就用預設訊息 */
function messageFromError(error: unknown, fallback: string): string {
  const message = (error as { data?: { message?: string } })?.data?.message
  return message && message.trim() ? message : fallback
}

// API 模式的載入狀態：同一時間只打一次 GET（填答頁與管理頁同時掛載時去重）
let apiLoading: Promise<void> | null = null

/**
 * API 模式：GET /api/survey 全量填入 store（非同步；填好後 responses 會自動更新畫面）。
 * 每次進頁面都重抓一次，管理頁才看得到其他裝置剛送出的回覆。
 */
function refreshFromApi(): void {
  if (apiLoading) return
  apiLoading = $fetch<SurveyListEnvelope>(API_BASE)
    .then((result) => {
      store.value = unwrap(result, '讀取問卷回覆失敗').map(fromDto)
    })
    .catch((error: unknown) => {
      // 載入失敗不讓頁面崩潰（清單維持原狀）；下次進頁面會再試
      // eslint-disable-next-line no-console
      console.error('[useSurveyResponses] 讀取問卷回覆失敗：', messageFromError(error, '無法連線後端'))
    })
    .finally(() => {
      apiLoading = null
    })
}

export function useSurveyResponses() {
  // 模式旗標：runtimeConfig.public.useApi（env NUXT_PUBLIC_USE_API=true 開啟），預設 false＝localStorage
  const useApi = useRuntimeConfig().public.useApi === true

  if (useApi) refreshFromApi() // API 模式：GET /api/survey 全量載入
  else ensureLoaded() // localStorage 模式：跟前端課一樣

  /** 響應式清單（新的在最前面）；對外唯讀，變更請走 submit / clearAll */
  // 後端接軌（已接上）：API 模式＝由 refreshFromApi() 以 GET /api/survey 填入的本地快取
  const responses = computed(() => store.value)

  /**
   * 送出一份問卷回覆。呼叫端只認得這個 Promise 介面，
   * 之後把內部實作換成真 API，頁面一行都不用改（BR-7）。
   */
  async function submit(input: SurveyResponseInput): Promise<SurveyResponse> {
    if (!useApi) {
      const created: SurveyResponse = { ...input, id: nextId(), submittedAt: nowStamp() }
      store.value = [created, ...store.value]
      persist()
      return cloneResponse(created)
    }
    // 接縫已接上：原本這裡是那一行 TODO 註解，現在是真的 POST /api/survey
    let result: SurveyEnvelope
    try {
      result = await $fetch<SurveyEnvelope>(API_BASE, { method: 'POST', body: input })
    } catch (error) {
      throw new Error(messageFromError(error, '送出問卷失敗'))
    }
    const created = fromDto(unwrap(result, '送出問卷失敗'))
    store.value = [created, ...store.value] // 新的放最前面，跟 localStorage 模式一致
    return cloneResponse(created)
  }

  /** 清空全部回覆（管理頁危險操作，BR-5 由頁面層負責二次確認） */
  // 後端接軌（已接上）：API 模式＝DELETE /api/survey（全清，成功回 204 無主體，不需解包）
  async function clearAll(): Promise<void> {
    if (!useApi) {
      store.value = []
      persist()
      return
    }
    try {
      await $fetch(API_BASE, { method: 'DELETE' })
    } catch (error) {
      throw new Error(messageFromError(error, '清空問卷回覆失敗'))
    }
    store.value = []
  }

  return { responses, submit, clearAll }
}
