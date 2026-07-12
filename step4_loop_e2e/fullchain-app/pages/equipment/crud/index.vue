<!--
  中心裝備物資 — 列表頁
  ────────────────────────────────────────────────
  複製自 pages/template/crud/index.vue（範本人員列表）並改名為裝備物資實體。
  沿用同一套機制：關鍵字/分類/狀態篩選 + 點表頭排序 + 分頁 + URL 同步 + CSV 匯出 + 刪除確認，
  衍生資料一律 computed，列表狀態委由 useTemplateListPage 工廠管理。
-->
<template>
  <div class="space-y-lg">
    <!-- 麵包屑動作鈕一律用 AppSafeTeleport（hard-load 安全） -->
    <AppSafeTeleport to="#breadcrumb-actions">
      <UButton color="primary" variant="solid" size="md" icon="i-heroicons-plus" @click="goCreate">
        新增品項
      </UButton>
    </AppSafeTeleport>

    <!-- 篩選卡：關鍵字（名稱＋編碼）／分類／狀態 -->
    <CardOutlined>
      <div class="flex items-end gap-sm gap-y-md flex-wrap">
        <div class="space-y-1">
          <div class="text-label-small text-on-surface-variant">關鍵字</div>
          <UInput
            v-model="filters.q"
            icon="i-heroicons-magnifying-glass"
            placeholder="項目名稱／編碼"
            size="md"
            class="w-full md:w-72"
          />
        </div>
        <div class="space-y-1">
          <div class="text-label-small text-on-surface-variant">分類</div>
          <USelectMenu v-model="filters.category" :options="categoryOptions" searchable searchable-placeholder="搜尋分類" size="md" class="w-full md:w-48" />
        </div>
        <div class="space-y-1">
          <div class="text-label-small text-on-surface-variant">狀態</div>
          <USelectMenu v-model="filters.status" :options="statusOptions" size="md" class="w-full md:w-32" />
        </div>
        <UButton color="secondary" variant="outline" size="md" icon="i-heroicons-x-mark" @click="resetFilters">
          清除
        </UButton>
      </div>
    </CardOutlined>

    <!-- 工具列：結果筆數 + 匯出 -->
    <div class="flex items-center justify-between gap-sm flex-wrap">
      <p class="text-body-medium text-on-surface-variant">共 {{ filteredRows.length }} 筆</p>
      <UButton color="secondary" variant="ghost" size="md" icon="i-heroicons-arrow-down-tray" @click="handleExport">
        匯出 CSV
      </UButton>
    </div>

    <!-- 桌機：表格 -->
    <CardOutlined v-if="filteredRows.length > 0" :ui="{ body: { padding: 'p-0' } }" class="hidden md:block">
      <table class="w-full text-body-medium">
        <thead class="bg-surface-variant text-label-small text-on-surface-variant">
          <tr>
            <th class="px-3 py-2 text-left">
              <AppSortHeader label="分類" :priority="priorityOf('categoryKey')" :dir="dirOf('categoryKey')" @click="setSingle('categoryKey')" />
            </th>
            <th class="px-3 py-2 text-left">
              <AppSortHeader label="項目" :priority="priorityOf('name')" :dir="dirOf('name')" @click="setSingle('name')" />
            </th>
            <th class="px-3 py-2 text-left">規格說明</th>
            <th class="px-3 py-2 text-right">
              <AppSortHeader label="數量" :priority="priorityOf('qty')" :dir="dirOf('qty')" @click="setSingle('qty')" />
            </th>
            <th class="px-3 py-2 text-left">保管人</th>
            <th class="px-3 py-2 text-left">存放地點</th>
            <th class="px-3 py-2 text-left">
              <AppSortHeader label="狀態" :priority="priorityOf('status')" :dir="dirOf('status')" @click="setSingle('status')" />
            </th>
            <th class="px-3 py-2 text-left">
              <AppSortHeader label="採購日期" :priority="priorityOf('purchaseDate')" :dir="dirOf('purchaseDate')" @click="setSingle('purchaseDate')" />
            </th>
            <th class="px-3 py-2 text-center"><span class="sr-only">操作</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant">
          <tr v-for="(row, index) in pagedRows" :key="row.id" :class="rowClass(index)" @click="goView(row)">
            <td class="px-3 py-2.5">
              <UBadge color="secondary" variant="soft" size="xs">{{ categoryLabelOf(row.categoryKey) }}</UBadge>
            </td>
            <td class="px-3 py-2.5">
              <div class="font-emphasis text-on-surface">{{ row.name }}</div>
              <div class="font-mono text-label-small text-on-surface-variant">{{ row.code }}</div>
            </td>
            <td class="px-3 py-2.5 text-on-surface-variant">{{ row.spec1 }}</td>
            <td class="px-3 py-2.5 text-right font-mono text-on-surface">{{ row.qty }} {{ row.unit }}</td>
            <td class="px-3 py-2.5 text-on-surface">
              <div>{{ row.keeper || '—' }}</div>
              <div v-if="row.keeperPhone" class="font-mono text-label-small text-on-surface-variant">{{ row.keeperPhone }}</div>
            </td>
            <td class="px-3 py-2.5 text-on-surface-variant">{{ row.locationName || '—' }}</td>
            <td class="px-3 py-2.5"><EquipmentStatusBadge :status="row.status" /></td>
            <td class="px-3 py-2.5 font-mono text-on-surface-variant">{{ row.purchaseDate || '—' }}</td>
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

    <!-- 手機：卡片（資訊與桌機等價） -->
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
              <UBadge color="secondary" variant="soft" size="xs">{{ categoryLabelOf(row.categoryKey) }}</UBadge>
              <span class="font-emphasis text-on-surface">{{ row.name }}</span>
            </div>
            <div class="mt-1 font-mono text-label-small text-on-surface-variant">{{ row.code }}</div>
            <div class="mt-1 text-label-small text-on-surface-variant">{{ row.spec1 }}</div>
            <div class="mt-1 text-label-small text-on-surface-variant">
              數量 <span class="font-mono text-on-surface">{{ row.qty }} {{ row.unit }}</span>
              <span v-if="row.keeper"> ｜保管 {{ row.keeper }}</span>
            </div>
            <div v-if="row.locationName" class="mt-1 flex items-center gap-xs text-label-small text-on-surface-variant">
              <UIcon name="i-heroicons-map-pin" class="h-3.5 w-3.5" />
              <span>{{ row.locationName }}</span>
            </div>
            <div v-if="row.purchaseDate" class="mt-1 text-label-small text-on-surface-variant">採購 <span class="font-mono">{{ row.purchaseDate }}</span></div>
          </div>
          <div class="flex shrink-0 items-center gap-xs">
            <EquipmentStatusBadge :status="row.status" />
            <UButton size="xs" color="secondary" variant="ghost" icon="i-heroicons-eye" square aria-label="檢視" @click.stop="goView(row)" />
            <UButton size="xs" color="primary" variant="ghost" icon="i-heroicons-pencil-square" square aria-label="編輯" @click.stop="goEdit(row)" />
            <UButton size="xs" color="error" variant="ghost" icon="i-heroicons-trash" square aria-label="刪除" @click.stop="requestDelete(row)" />
          </div>
        </div>
      </div>
    </div>

    <!-- 空狀態 -->
    <CardOutlined v-if="filteredRows.length === 0">
      <div class="flex flex-col items-center justify-center gap-sm py-xl text-on-surface-variant">
        <UIcon name="i-heroicons-archive-box" class="h-10 w-10 opacity-40" />
        <p class="text-body-medium">查無符合條件的品項</p>
        <UButton color="primary" variant="ghost" size="md" icon="i-heroicons-x-mark" @click="resetFilters">清除篩選</UButton>
      </div>
    </CardOutlined>

    <!-- 表尾 -->
    <div v-if="filteredRows.length > 0" class="px-1">
      <AppTableFooter
        :current-page="page"
        :total-items="filteredRows.length"
        :page-size="pageSize"
        @update:current-page="page = $event"
        @update:page-size="pageSize = $event"
      />
    </div>

    <!-- 刪除確認 -->
    <AppConfirmModal
      v-model="showDeleteModal"
      variant="danger"
      title="刪除品項"
      :message="`確定要刪除「${deleteTarget?.name ?? ''}」（${deleteTarget?.code ?? ''}）這筆品項嗎？此動作無法復原。`"
      confirm-text="刪除"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import {
  useEquipmentItems,
  categoryLabelOf,
  categoryOrderOf,
  statusLabelOf,
  equipmentTodayString,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_STATUS_OPTIONS,
  type EquipmentItem,
} from '~/composables/useEquipmentItems'
import { useTemplateListPage } from '~/composables/useTemplateListPage'
import { useTableSort, type SortableColumn, type SortRule } from '~/composables/useTableSort'
import { exportCsv, type CsvColumn } from '~/utils/templateCsv'

definePageMeta({ layout: 'template', pageTitle: '中心裝備物資管理' })

/** '全部' 哨兵：所有下拉以純字串 options 表達，過濾時 value !== ALL 才生效 */
const ALL = '全部'

const router = useRouter()
const toast = useToast()

const { records, remove } = useEquipmentItems()

// ── 列表狀態（篩選 + 分頁 + URL 同步；本模組無進階區） ──
const { filters, page, pageSize, resetFilters, buildReturnQuery } =
  useTemplateListPage({
    defaultFilters: { q: '', category: ALL, status: ALL },
    defaultPageSize: 20,
  })

// ── 下拉選項（分類/狀態以中文 label 當哨兵值，過濾時比對 label） ──
const categoryOptions = [ALL, ...EQUIPMENT_CATEGORIES.map(c => c.label)]
const statusOptions = [ALL, ...EQUIPMENT_STATUS_OPTIONS.map(statusLabelOf)]

// ── 排序（預設分類→項目升冪，FR-EQ-201/202） ──
const sortableColumns: SortableColumn[] = [
  { key: 'categoryKey', label: '分類' },
  { key: 'name', label: '項目' },
  { key: 'qty', label: '數量' },
  { key: 'status', label: '狀態' },
  { key: 'purchaseDate', label: '採購日期' },
]
const defaultSortRules: SortRule[] = [
  { key: 'categoryKey', dir: 'asc' },
  { key: 'name', dir: 'asc' },
]
const { rules: sortRules, sortRows, setSingle, priorityOf, dirOf } = useTableSort({
  columns: sortableColumns,
  defaultRules: defaultSortRules,
  // 分類依定義順序（數值）排序而非中文筆劃；數量走數值比較
  accessors: {
    categoryKey: (row: EquipmentItem) => categoryOrderOf(row.categoryKey),
    qty: (row: EquipmentItem) => row.qty,
  },
})

// ── 排序 ↔ URL glue（僅使用者點擊後的單欄排序寫入 URL） ──
function parseSortParam(raw: unknown): SortRule | null {
  if (typeof raw !== 'string') return null
  const [key, dir] = raw.split(':')
  const keyOk = sortableColumns.some(column => column.key === key)
  return keyOk && (dir === 'asc' || dir === 'desc') ? { key, dir } : null
}
function currentSortParam(): string {
  return sortRules.value.length === 1 ? `${sortRules.value[0].key}:${sortRules.value[0].dir}` : ''
}
const route = useRoute()
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

// ── 衍生資料（一律 computed；template 內不做 O(n) 掃描） ──
function matchesFilters(item: EquipmentItem): boolean {
  const keyword = filters.q.trim().toLowerCase()
  if (keyword) {
    const haystack = `${item.name} ${item.code}`.toLowerCase()
    if (!haystack.includes(keyword)) return false
  }
  if (filters.category !== ALL && categoryLabelOf(item.categoryKey) !== filters.category) return false
  if (filters.status !== ALL && statusLabelOf(item.status) !== filters.status) return false
  return true
}
const filteredRows = computed(() => records.value.filter(matchesFilters))
const sortedRows = computed(() => sortRows(filteredRows.value))
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return sortedRows.value.slice(start, start + pageSize.value)
})

// 超界頁碼 clamp（刪除退頁 + 深連結 ?page=99 一併涵蓋）
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))
watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp
}, { immediate: true })

function rowClass(index: number): string {
  const stripe = index % 2 === 1 ? 'bg-surface-variant' : 'bg-surface'
  return `cursor-pointer ${stripe} hover:bg-primary-container`
}

// ── 導覽（帶 return 保存列表狀態；return 另行併入使用者排序） ──
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
  router.push({ path: '/equipment/crud/new', query: returnQuery() })
}
function goView(row: EquipmentItem) {
  router.push({ path: `/equipment/crud/${row.id}`, query: returnQuery() })
}
function goEdit(row: EquipmentItem) {
  router.push({ path: `/equipment/crud/${row.id}`, query: returnQuery({ mode: 'edit' }) })
}

// ── 刪除（二次確認 → 刪除 → toast） ──
const showDeleteModal = ref(false)
const deleteTarget = ref<EquipmentItem | null>(null)
function requestDelete(row: EquipmentItem) {
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

// ── 匯出（目前篩選 + 排序後的全量結果，非僅當頁；含 BOM） ──
function handleExport() {
  const columns: CsvColumn<EquipmentItem>[] = [
    { label: '品項編碼', value: row => row.code },
    { label: '分類', value: row => categoryLabelOf(row.categoryKey) },
    { label: '項目', value: row => row.name },
    { label: '數量', value: row => row.qty },
    { label: '單位', value: row => row.unit },
    { label: '規格說明', value: row => row.spec1 },
    { label: '保管人', value: row => row.keeper },
    { label: '保管人電話', value: row => row.keeperPhone },
    { label: '存放地點', value: row => row.locationName },
    { label: '狀態', value: row => statusLabelOf(row.status) },
    { label: '採購日期', value: row => row.purchaseDate },
    { label: '備註', value: row => row.specNote },
  ]
  const stamp = equipmentTodayString().replace(/-/g, '') // 本地時區日期
  exportCsv(`裝備物資清單-${stamp}.csv`, columns, sortedRows.value)
  toast.add({ title: `已匯出 ${sortedRows.value.length} 筆`, color: 'green', icon: 'i-heroicons-check-circle' })
}
</script>
