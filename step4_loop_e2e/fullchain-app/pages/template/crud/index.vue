<!--
  CRUD 標準範本 — 人員管理（列表頁）
  ────────────────────────────────────────────────
  這個頁面在範本中的角色：
    示範一個乾淨的列表頁：篩選（含進階折疊）+ 排序 + 分頁 + URL 同步 + 匯出 + 刪除確認，
    衍生資料一律 computed（NFR-T-05），列表狀態委由 useTemplateListPage 工廠管理。

  對照 roster 現況（單檔 2,255 行）：本頁把重複的列表狀態、排序、CSV 邏輯外包給
  可重用單元，頁面只保留「這個實體特有」的欄位與過濾條件。
-->
<template>
  <div class="space-y-lg">
    <!-- 麵包屑動作鈕一律用 AppSafeTeleport（hard-load 安全），FR-T-304 -->
    <AppSafeTeleport to="#breadcrumb-actions">
      <UButton color="primary" variant="solid" size="md" icon="i-heroicons-plus" @click="goCreate">
        新增人員
      </UButton>
    </AppSafeTeleport>

    <!-- 篩選卡 -->
    <CardOutlined>
      <div class="flex items-end gap-sm gap-y-md flex-wrap">
        <div class="space-y-1">
          <div class="text-label-small text-on-surface-variant">關鍵字</div>
          <UInput
            v-model="filters.q"
            icon="i-heroicons-magnifying-glass"
            placeholder="姓名／電話／Email"
            size="md"
            class="w-full md:w-72"
          />
        </div>
        <div class="space-y-1">
          <div class="text-label-small text-on-surface-variant">編組</div>
          <USelectMenu v-model="filters.group" :options="groupOptions" size="md" class="w-full md:w-40" />
        </div>
        <div class="space-y-1">
          <div class="text-label-small text-on-surface-variant">狀態</div>
          <USelectMenu v-model="filters.status" :options="statusOptions" size="md" class="w-full md:w-32" />
        </div>

        <UButton
          color="secondary"
          variant="outline"
          size="md"
          :icon="showAdvanced ? 'i-heroicons-chevron-up' : 'i-heroicons-adjustments-horizontal'"
          @click="showAdvanced = !showAdvanced"
        >
          進階
          <span
            v-if="advancedActiveCount > 0"
            class="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-label-small font-emphasis text-on-primary"
          >
            {{ advancedActiveCount }}
          </span>
        </UButton>
        <UButton color="secondary" variant="outline" size="md" icon="i-heroicons-x-mark" @click="resetFilters">
          清除
        </UButton>
      </div>

      <!-- 進階列：資格 + 居住縣市/鄉鎮區相依下拉 -->
      <div v-show="showAdvanced" class="mt-md pt-md border-t border-outline-variant flex items-end gap-sm gap-y-md flex-wrap">
        <div class="space-y-1">
          <div class="text-label-small text-on-surface-variant">資格</div>
          <USelectMenu v-model="filters.qual" :options="qualOptions" size="md" class="w-full md:w-40" />
        </div>
        <div class="space-y-1">
          <div class="text-label-small text-on-surface-variant">居住縣市</div>
          <USelectMenu
            v-model="filters.county"
            :options="countyOptions"
            searchable
            searchable-placeholder="搜尋縣市"
            size="md"
            class="w-full md:w-36"
          />
        </div>
        <div class="space-y-1">
          <div class="text-label-small text-on-surface-variant">居住鄉鎮區</div>
          <USelectMenu
            v-model="filters.township"
            :options="townshipOptions"
            searchable
            searchable-placeholder="搜尋鄉鎮區"
            :disabled="filters.county === ALL"
            size="md"
            class="w-full md:w-40"
          />
        </div>
      </div>
    </CardOutlined>

    <!-- 工具列：結果筆數 + 匯出 -->
    <div class="flex items-center justify-between gap-sm flex-wrap">
      <p class="text-body-medium text-on-surface-variant">共 {{ filteredRows.length }} 筆</p>
      <UButton color="secondary" variant="ghost" size="md" icon="i-heroicons-arrow-down-tray" @click="handleExport">
        匯出 CSV
      </UButton>
    </div>

    <!-- 桌機：表格（UCard 無 padding prop，去除內距須用 :ui 覆蓋 body padding） -->
    <CardOutlined v-if="filteredRows.length > 0" :ui="{ body: { padding: 'p-0' } }" class="hidden md:block">
      <table class="w-full text-body-medium">
        <thead class="bg-surface-variant text-label-small text-on-surface-variant">
          <tr>
            <th class="px-3 py-2 text-left">
              <AppSortHeader label="姓名" :priority="priorityOf('name')" :dir="dirOf('name')" @click="setSingle('name')" />
            </th>
            <th class="px-3 py-2 text-left">
              <AppSortHeader label="編組" :priority="priorityOf('groupName')" :dir="dirOf('groupName')" @click="setSingle('groupName')" />
            </th>
            <th class="px-3 py-2 text-left">
              <AppSortHeader label="職務" :priority="priorityOf('positionCode')" :dir="dirOf('positionCode')" @click="setSingle('positionCode')" />
            </th>
            <th class="px-3 py-2 text-left">資格</th>
            <th class="px-3 py-2 text-left">電話</th>
            <th class="px-3 py-2 text-left">
              <AppSortHeader label="狀態" :priority="priorityOf('status')" :dir="dirOf('status')" @click="setSingle('status')" />
            </th>
            <th class="px-3 py-2 text-left">
              <AppSortHeader label="更新日期" :priority="priorityOf('updatedAt')" :dir="dirOf('updatedAt')" @click="setSingle('updatedAt')" />
            </th>
            <th class="px-3 py-2 text-center"><span class="sr-only">操作</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant">
          <tr v-for="(row, index) in pagedRows" :key="row.id" :class="rowClass(index)" @click="goView(row)">
            <td class="px-3 py-2.5 font-emphasis text-on-surface">{{ row.name }}</td>
            <td class="px-3 py-2.5 text-on-surface">{{ row.groupName }}</td>
            <td class="px-3 py-2.5 text-on-surface">{{ positionTitleOf(row.positionCode) }}</td>
            <td class="px-3 py-2.5">
              <div class="flex flex-wrap items-center gap-1">
                <UBadge v-for="qual in row.qualifications.slice(0, MAX_INLINE_BADGES)" :key="qual" color="primary" variant="soft" size="xs">{{ qual }}</UBadge>
                <span v-if="row.qualifications.length > MAX_INLINE_BADGES" class="text-label-small text-on-surface-variant">+{{ row.qualifications.length - MAX_INLINE_BADGES }}</span>
                <span v-if="row.qualifications.length === 0" class="text-on-surface-variant">—</span>
              </div>
            </td>
            <td class="px-3 py-2.5 font-mono text-on-surface-variant">{{ row.phone }}</td>
            <td class="px-3 py-2.5"><TemplateStatusBadge :status="row.status" /></td>
            <td class="px-3 py-2.5 font-mono text-on-surface-variant">{{ row.updatedAt }}</td>
            <td class="px-3 py-2.5">
              <div class="flex items-center justify-center gap-xs" @click.stop>
                <UButton size="xs" color="secondary" variant="ghost" icon="i-heroicons-eye" square aria-label="檢視" @click.stop="goView(row)" />
                <UButton size="xs" color="primary" variant="ghost" icon="i-heroicons-pencil-square" square aria-label="編輯" @click.stop="goEdit(row)" />
                <UButton size="xs" color="error" variant="ghost" icon="i-heroicons-trash" square aria-label="刪除" @click.stop="requestDelete(row)" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </CardOutlined>

    <!-- 手機：卡片 -->
    <div v-if="filteredRows.length > 0" class="md:hidden space-y-sm">
      <div
        v-for="row in pagedRows"
        :key="`m-${row.id}`"
        class="rounded-lg border border-outline-variant bg-surface p-md cursor-pointer transition-colors hover:bg-primary-container/40"
        @click="goView(row)"
      >
        <div class="flex items-start justify-between gap-sm">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-xs flex-wrap">
              <span class="font-emphasis text-on-surface">{{ row.name }}</span>
              <UBadge color="secondary" variant="soft" size="xs">{{ positionTitleOf(row.positionCode) }}</UBadge>
            </div>
            <div class="mt-1 text-label-small text-on-surface-variant">{{ row.groupName }}</div>
            <div class="mt-1 flex items-center gap-xs text-label-small text-on-surface-variant">
              <UIcon name="i-heroicons-phone" class="h-3.5 w-3.5" />
              <span class="font-mono">{{ row.phone }}</span>
            </div>
            <!-- 資格 + 更新日期：與桌機表格資訊等價（NFR-T-01），>N 收斂為 +N 同桌機規則 -->
            <div v-if="row.qualifications.length > 0" class="mt-1 flex flex-wrap items-center gap-1">
              <UBadge v-for="qual in row.qualifications.slice(0, MAX_INLINE_BADGES)" :key="qual" color="primary" variant="soft" size="xs">{{ qual }}</UBadge>
              <span v-if="row.qualifications.length > MAX_INLINE_BADGES" class="text-label-small text-on-surface-variant">+{{ row.qualifications.length - MAX_INLINE_BADGES }}</span>
            </div>
            <div class="mt-1 text-label-small text-on-surface-variant">更新 <span class="font-mono">{{ row.updatedAt }}</span></div>
          </div>
          <div class="flex shrink-0 items-center gap-xs">
            <TemplateStatusBadge :status="row.status" />
            <UButton size="xs" color="secondary" variant="ghost" icon="i-heroicons-eye" square aria-label="檢視" @click.stop="goView(row)" />
            <UButton size="xs" color="primary" variant="ghost" icon="i-heroicons-pencil-square" square aria-label="編輯" @click.stop="goEdit(row)" />
            <UButton size="xs" color="error" variant="ghost" icon="i-heroicons-trash" square aria-label="刪除" @click.stop="requestDelete(row)" />
          </div>
        </div>
      </div>
    </div>

    <!-- 空狀態（FR-T-105） -->
    <CardOutlined v-if="filteredRows.length === 0">
      <div class="flex flex-col items-center justify-center gap-sm py-xl text-on-surface-variant">
        <UIcon name="i-heroicons-magnifying-glass" class="h-10 w-10 opacity-40" />
        <p class="text-body-medium">查無符合條件的資料</p>
        <UButton color="primary" variant="ghost" size="md" icon="i-heroicons-x-mark" @click="resetFilters">清除篩選</UButton>
      </div>
    </CardOutlined>

    <!-- 表尾（FR-T-203；canonical props） -->
    <div v-if="filteredRows.length > 0" class="px-1">
      <AppTableFooter
        :current-page="page"
        :total-items="filteredRows.length"
        :page-size="pageSize"
        @update:current-page="page = $event"
        @update:page-size="pageSize = $event"
      />
    </div>

    <!-- 刪除確認（FR-T-401；confirm 不自動關閉，由 confirmDelete 自行關閉） -->
    <AppConfirmModal
      v-model="showDeleteModal"
      variant="danger"
      title="刪除人員"
      :message="`確定要刪除「${deleteTarget?.name ?? ''}」這筆人員資料嗎？此動作無法復原。`"
      confirm-text="刪除"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import {
  useTemplateMembers,
  positionTitleOf,
  positionWeightOf,
  todayString,
  TEMPLATE_GROUP_OPTIONS,
  TEMPLATE_QUALIFICATION_OPTIONS,
  TEMPLATE_MEMBER_STATUS_OPTIONS,
  type TemplateMember,
} from '~/composables/useTemplateMembers'
import { useTemplateListPage } from '~/composables/useTemplateListPage'
import { useTableSort, type SortableColumn, type SortRule } from '~/composables/useTableSort'
import { exportCsv, type CsvColumn } from '~/utils/templateCsv'
import { COUNTY_NAMES, loadTownships } from '~/utils/taiwanAddress'

definePageMeta({ layout: 'template', pageTitle: 'CRUD 標準範本 — 人員管理' })

/** '全部' 哨兵（審查修訂 C-2）：所有下拉以純字串 options 表達，過濾時 value !== ALL 才生效 */
const ALL = '全部'
/** 同行最多 3 個 badge，超過以 +N 收斂（CLAUDE.md Badge 規範） */
const MAX_INLINE_BADGES = 3

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { records, remove } = useTemplateMembers()

// ── 列表狀態（篩選 + 分頁 + URL 同步） ──
const { filters, page, pageSize, showAdvanced, resetFilters, advancedActiveCount, buildReturnQuery } =
  useTemplateListPage({
    defaultFilters: { q: '', group: ALL, status: ALL, qual: ALL, county: ALL, township: ALL },
    advancedKeys: ['qual', 'county', 'township'],
  })

// ── 下拉選項 ──
const groupOptions = [ALL, ...TEMPLATE_GROUP_OPTIONS]
const statusOptions = [ALL, ...TEMPLATE_MEMBER_STATUS_OPTIONS]
const qualOptions = [ALL, ...TEMPLATE_QUALIFICATION_OPTIONS]
const countyOptions = [ALL, ...COUNTY_NAMES]
const townshipOptions = ref<string[]>([ALL])

// 縣市 → 鄉鎮區相依下拉（審查修訂：比照 ext-orgs 既有模式）
// async 競態防護：await 回來後縣市若已被改掉，丟棄過期結果，避免選項清單與縣市不一致
async function reloadTownshipOptions(county: string) {
  if (county === ALL) {
    townshipOptions.value = [ALL]
    return
  }
  const townships = await loadTownships(county)
  if (filters.county !== county) return // 過期回應：使用者已切換縣市
  townshipOptions.value = [ALL, ...townships.map(t => t.name)]
}
watch(() => filters.county, (county) => {
  filters.township = ALL
  reloadTownshipOptions(county)
})
// 重整後若 county 已由 URL 還原為非「全部」，補載鄉鎮區選項讓還原值可正確顯示
onMounted(() => {
  if (filters.county !== ALL) reloadTownshipOptions(filters.county)
})

// ── 排序（useTableSort；預設職務→姓名，FR-T-202） ──
const sortableColumns: SortableColumn[] = [
  { key: 'name', label: '姓名' },
  { key: 'groupName', label: '編組' },
  { key: 'positionCode', label: '職務' },
  { key: 'status', label: '狀態' },
  { key: 'updatedAt', label: '更新日期' },
]
const defaultSortRules: SortRule[] = [
  { key: 'positionCode', dir: 'asc' },
  { key: 'name', dir: 'asc' },
]
const { rules: sortRules, sortRows, setSingle, priorityOf, dirOf } = useTableSort({
  columns: sortableColumns,
  defaultRules: defaultSortRules,
  // 職務依權重（數值）排序而非中文筆劃；其餘欄位字串比較即可（FR-T-201）
  accessors: { positionCode: (row: TemplateMember) => positionWeightOf(row.positionCode) },
})

// ── 排序 ↔ URL glue（僅使用者點擊後的單欄排序寫入 URL，審查修訂 A-3） ──
function parseSortParam(raw: unknown): SortRule | null {
  if (typeof raw !== 'string') return null
  const [key, dir] = raw.split(':')
  const keyOk = sortableColumns.some(column => column.key === key)
  return keyOk && (dir === 'asc' || dir === 'desc') ? { key, dir } : null
}
function currentSortParam(): string {
  return sortRules.value.length === 1 ? `${sortRules.value[0].key}:${sortRules.value[0].dir}` : ''
}
// 還原必須在註冊 watch 之前，避免還原動作反被當成使用者操作而覆寫頁碼/URL
const restoredSort = parseSortParam(route.query.sort)
if (restoredSort) sortRules.value = [restoredSort]

watch(sortRules, () => {
  const desired = currentSortParam()
  const current = typeof route.query.sort === 'string' ? route.query.sort : ''
  if (desired === current) return
  const next = { ...route.query }
  if (desired) next.sort = desired
  else delete next.sort
  router.replace({ query: next })
}, { deep: true })

// ── 衍生資料（一律 computed；template 內不做 O(n) 掃描，NFR-T-05） ──
function matchesFilters(member: TemplateMember): boolean {
  const keyword = filters.q.trim().toLowerCase()
  if (keyword) {
    const haystack = [member.name, member.phone, member.email].join(' ').toLowerCase()
    if (!haystack.includes(keyword)) return false
  }
  if (filters.group !== ALL && member.groupName !== filters.group) return false
  if (filters.status !== ALL && member.status !== filters.status) return false
  if (filters.qual !== ALL && !member.qualifications.includes(filters.qual)) return false
  if (filters.county !== ALL && member.residenceCounty !== filters.county) return false
  if (filters.township !== ALL && member.residenceTownship !== filters.township) return false
  return true
}
const filteredRows = computed(() => records.value.filter(matchesFilters))
const sortedRows = computed(() => sortRows(filteredRows.value))
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return sortedRows.value.slice(start, start + pageSize.value)
})

// 超界頁碼 clamp（FR-T-402 刪除退頁 + 深連結 ?page=99 一併涵蓋；immediate 讓初始還原值也被檢查）
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))
watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp
}, { immediate: true })

function rowClass(index: number): string {
  const stripe = index % 2 === 1 ? 'bg-surface-variant' : 'bg-surface'
  return `cursor-pointer ${stripe} hover:bg-primary-container`
}

// ── 導覽（帶 return 保存列表狀態，FR-T-602；return 另行併入使用者排序） ──
function buildListReturn(): string {
  const params = new URLSearchParams(buildReturnQuery())
  const sort = currentSortParam()
  if (sort) params.set('sort', sort)
  return params.toString()
}
function returnQuery(extra: Record<string, string> = {}): Record<string, string> {
  const ret = buildListReturn()
  return { ...extra, ...(ret ? { return: ret } : {}) }
}
function goCreate() {
  router.push({ path: '/template/crud/new', query: returnQuery() })
}
function goView(row: TemplateMember) {
  router.push({ path: `/template/crud/${row.id}`, query: returnQuery() })
}
function goEdit(row: TemplateMember) {
  router.push({ path: `/template/crud/${row.id}`, query: returnQuery({ mode: 'edit' }) })
}

// ── 刪除（二次確認 → 刪除 → toast，FR-T-401；當頁清空退頁由上方 totalPages watch 統一處理） ──
const showDeleteModal = ref(false)
const deleteTarget = ref<TemplateMember | null>(null)
function requestDelete(row: TemplateMember) {
  deleteTarget.value = row
  showDeleteModal.value = true
}
async function confirmDelete() {
  const target = deleteTarget.value
  if (!target) return
  await remove(target.id)
  showDeleteModal.value = false
  toast.add({ title: `已刪除 ${target.name}`, color: 'green', icon: 'i-heroicons-check-circle' })
  deleteTarget.value = null
}

// ── 匯出（目前篩選 + 排序後的全量結果，非僅當頁，FR-T-501） ──
function handleExport() {
  const columns: CsvColumn<TemplateMember>[] = [
    { label: '姓名', value: row => row.name },
    { label: '性別', value: row => row.gender },
    { label: '生日', value: row => row.birthDate },
    { label: '證件類別', value: row => row.idType },
    { label: '證號', value: row => row.nationalId },
    { label: '電話', value: row => row.phone },
    { label: 'Email', value: row => row.email },
    { label: '居住縣市', value: row => row.residenceCounty },
    { label: '居住鄉鎮區', value: row => row.residenceTownship },
    { label: '居住地址', value: row => row.residenceAddress },
    { label: '編組', value: row => row.groupName },
    { label: '職務', value: row => positionTitleOf(row.positionCode) },
    { label: '資格', value: row => row.qualifications.join('、') },
    { label: '狀態', value: row => row.status },
    { label: '更新日期', value: row => row.updatedAt },
  ]
  const stamp = todayString().replace(/-/g, '') // 本地時區日期，與 updatedAt 寫入邏輯一致
  exportCsv(`人員清單-${stamp}.csv`, columns, sortedRows.value)
  toast.add({ title: `已匯出 ${sortedRows.value.length} 筆`, color: 'green', icon: 'i-heroicons-check-circle' })
}
</script>
