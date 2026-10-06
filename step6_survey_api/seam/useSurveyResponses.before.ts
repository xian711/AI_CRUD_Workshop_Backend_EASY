/**
 * useSurveyResponses — 課程回饋問卷「問卷回覆」的資料層（型別 + 持久化 + 非同步 CRUD）
 * ──────────────────────────────────────────────────────────────
 * 由 composables/useTemplateMembers.ts 複製改名而來（與「這個實體長什麼樣子」有關 → 複製）。
 *
 * 這個檔案的角色：
 *   示範一個「後端就緒」的資料層：對外的 CRUD 一律非同步（Promise），未來把內部實作
 *   換成 useFetch / $fetch 即可，呼叫端（頁面）完全不用改（針對介面而非實作寫程式）。
 *
 * 設計要點：
 *   - module-level ref 單例 + ensureLoaded()，比照範本的 ensureSeeded() 模式。
 *   - 本版無後端（PRD §1），改以 localStorage 持久化，重新整理不會遺失（BR-4）。
 *   - submit() 內留 POST 接縫註解，換真 API 時只改本檔內部實作（BR-7）。
 *   - 對外回傳一律深拷貝，杜絕呼叫端直接改到 store（防禦性拷貝）。
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

export function useSurveyResponses() {
  ensureLoaded()

  /** 響應式清單（新的在最前面）；對外唯讀，變更請走 submit / clearAll */
  // 後端接軌：改為 useFetch('/api/survey')（GET 全量清單）— [SD 待定]
  const responses = computed(() => store.value)

  /**
   * 送出一份問卷回覆。呼叫端只認得這個 Promise 介面，
   * 之後把內部實作換成真 API，頁面一行都不用改（BR-7）。
   */
  async function submit(input: SurveyResponseInput): Promise<SurveyResponse> {
    // TODO: DEV 串接 POST /api/survey
    const created: SurveyResponse = { ...input, id: nextId(), submittedAt: nowStamp() }
    store.value = [created, ...store.value]
    persist()
    return cloneResponse(created)
  }

  /** 清空全部回覆（管理頁危險操作，BR-5 由頁面層負責二次確認） */
  // 後端接軌：改為 DELETE /api/survey（全清）— [SD 待定]
  async function clearAll(): Promise<void> {
    store.value = []
    persist()
  }

  return { responses, submit, clearAll }
}
