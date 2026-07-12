/**
 * useTemplateListPage — 通用列表狀態工廠（篩選 + 分頁 + URL 同步 + 返回還原）
 * ──────────────────────────────────────────────────────────────
 * 這個檔案在範本中的角色：
 *   roster / ext-orgs / equipment 各自重複「篩選 + 分頁 + URL 同步」約 200 行 ×3，
 *   本工廠把它抽為單一可重用單元（Refactoring: Extract Function、除臭 Duplicated Code）。
 *
 * ⚠️ 抽象邊界（誠實原則，審查修訂 B-1）：
 *   本工廠「僅支援純字串型 filter」（含 '全部' 哨兵）。布林 / 多值 / 數值區間 filter，
 *   請複製本檔後自行擴充，切勿假設此工廠已通用——避免「看似通用實則窄」的隱形陷阱。
 *
 * 不負責：
 *   - 排序：交由 useTableSort；URL 的 sort 參數由頁面層 glue 維護（本工廠會保留該外部參數）。
 *   - 分頁切片：由頁面 computed 自行 slice（審查修訂 C-4，保持工廠職責單一）。
 */
import { computed, onScopeDispose, reactive, ref, watch, type ComputedRef, type Ref } from 'vue'

const SYNC_DEBOUNCE_MS = 300
const DEFAULT_PAGE_SIZE = 10
const PAGE_QUERY_KEY = 'page'
const SIZE_QUERY_KEY = 'size'

export interface TemplateListPageOptions<F extends Record<string, string>> {
  defaultFilters: F
  /** 進階區的 filter key（FR-T-102：徽章只計這些欄位的非預設數） */
  advancedKeys?: (keyof F & string)[]
  defaultPageSize?: number
  syncDebounceMs?: number
}

export interface TemplateListPage<F> {
  filters: F
  page: Ref<number>
  pageSize: Ref<number>
  showAdvanced: Ref<boolean>
  resetFilters: () => void
  advancedActiveCount: ComputedRef<number>
  buildReturnQuery: () => string
}

/** 讀取 query 中的正整數；非法或缺漏時回傳 fallback */
function readPositiveInt(raw: unknown, fallback: number): number {
  if (typeof raw !== 'string') return fallback
  const value = Number(raw)
  return Number.isInteger(value) && value > 0 ? value : fallback
}

export function useTemplateListPage<F extends Record<string, string>>(
  opts: TemplateListPageOptions<F>,
): TemplateListPage<F> {
  const route = useRoute()
  const router = useRouter()

  const defaultPageSize = opts.defaultPageSize ?? DEFAULT_PAGE_SIZE
  const debounceMs = opts.syncDebounceMs ?? SYNC_DEBOUNCE_MS
  const advancedKeys = opts.advancedKeys ?? []
  const filterKeys = Object.keys(opts.defaultFilters) as (keyof F & string)[]
  const managedKeys = new Set<string>([...filterKeys, PAGE_QUERY_KEY, SIZE_QUERY_KEY])
  const listPath = route.path // 建構時記下列表頁路徑，供 writeQuery 防止跨頁誤寫

  // 初始化：以 URL query 覆蓋 defaults（只接受 defaultFilters 既有 key）
  const filters = reactive({ ...opts.defaultFilters }) as F
  for (const key of filterKeys) {
    const queryValue = route.query[key]
    if (typeof queryValue === 'string') filters[key] = queryValue as F[typeof key]
  }
  const page = ref(readPositiveInt(route.query[PAGE_QUERY_KEY], 1))
  const pageSize = ref(readPositiveInt(route.query[SIZE_QUERY_KEY], defaultPageSize))
  const showAdvanced = ref(advancedKeys.some(key => filters[key] !== opts.defaultFilters[key]))

  // FR-T-102：徽章只計進階欄位中「非預設值」的數量
  const advancedActiveCount = computed(
    () => advancedKeys.filter(key => filters[key] !== opts.defaultFilters[key]).length,
  )

  // FR-T-103：清除 → 還原 defaults 並回到第 1 頁
  function resetFilters(): void {
    for (const key of filterKeys) filters[key] = opts.defaultFilters[key]
    page.value = 1
  }

  // FR-T-104：filters / pageSize 變更 → 頁碼重設為 1（初始化還原期間不觸發）
  // 以 join(' ') 序列化偵測變更：必須帶分隔符，join('') 會讓「值邊界移動但串接結果相同」的變更漏偵測
  watch(
    () => filterKeys.map(key => filters[key]).join(' '),
    () => { page.value = 1 },
  )
  watch(pageSize, () => { page.value = 1 })

  // FR-T-601：僅寫入非預設值；保留非本工廠管理的 query（如 sort，由頁面另行維護）
  function buildManagedQuery(): Record<string, string> {
    const next: Record<string, string> = {}
    for (const key of filterKeys) {
      if (filters[key] !== opts.defaultFilters[key]) next[key] = filters[key]
    }
    if (page.value !== 1) next[PAGE_QUERY_KEY] = String(page.value)
    if (pageSize.value !== defaultPageSize) next[SIZE_QUERY_KEY] = String(pageSize.value)
    return next
  }

  function writeQuery(): void {
    // 防呆：debounce 排程可能在導頁後才觸發，若路由已離開列表頁，
    // 不得把列表 query 用 router.replace 寫到新頁面上（與 onScopeDispose 清理互為雙保險）
    if (route.path !== listPath) return
    const preserved: Record<string, string> = {}
    for (const [key, value] of Object.entries(route.query)) {
      if (!managedKeys.has(key) && typeof value === 'string') preserved[key] = value
    }
    const next = { ...preserved, ...buildManagedQuery() }

    const current = route.query
    const sameSize = Object.keys(current).length === Object.keys(next).length
    const sameValues = Object.entries(next).every(([key, value]) => current[key] === value)
    if (sameSize && sameValues) return
    router.replace({ query: next })
  }

  let syncTimer: ReturnType<typeof setTimeout> | null = null
  watch([() => ({ ...filters }), page, pageSize], () => {
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(writeQuery, debounceMs)
  })
  // 排程必清理：元件卸載時取消尚未觸發的 debounce，避免 timer 洩漏到下一個路由
  onScopeDispose(() => {
    if (syncTimer) clearTimeout(syncTimer)
  })

  // FR-T-602：序列化目前非預設狀態供明細頁 return（不含 sort；值不另行編碼，交給 vue-router）
  function buildReturnQuery(): string {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(buildManagedQuery())) params.set(key, value)
    return params.toString()
  }

  return { filters, page, pageSize, showAdvanced, resetFilters, advancedActiveCount, buildReturnQuery }
}
