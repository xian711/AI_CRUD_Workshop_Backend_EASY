<!--
  中心裝備物資 — 檢視 / 編輯 / 新增 三合一整頁
  ────────────────────────────────────────────────
  複製自 pages/template/crud/[id].vue 並改名為裝備物資實體。
  路由三態：new = 新增、?mode=edit = 編輯、其餘 = 檢視。
  表單依區塊分組、欄位級驗證、儲存時聚焦第一個錯誤欄位，主要動作一律 Teleport 至麵包屑。
-->
<template>
  <div class="space-y-lg">
    <!-- 找不到資料：不得白屏 -->
    <CardOutlined v-if="notFound">
      <div class="flex flex-col items-center justify-center gap-sm py-xl text-on-surface-variant">
        <UIcon name="i-heroicons-archive-box-x-mark" class="h-10 w-10 opacity-40" />
        <p class="text-headline-medium font-heavy text-on-surface">找不到此品項</p>
        <p class="text-body-medium">品項編碼「{{ route.params.id }}」不存在或已刪除。</p>
        <UButton color="primary" variant="solid" size="md" @click="navigateBack">返回列表</UButton>
      </div>
    </CardOutlined>

    <template v-else>
      <!-- 麵包屑動作鈕（hard-load 安全） -->
      <AppSafeTeleport to="#breadcrumb-actions-left">
        <UButton
          v-if="mode === 'view'"
          color="secondary"
          variant="solid"
          size="md"
          icon="i-heroicons-arrow-left"
          @click="navigateBack"
        >
          返回
        </UButton>
      </AppSafeTeleport>
      <AppSafeTeleport to="#breadcrumb-actions">
        <template v-if="mode === 'view'">
          <UButton color="primary" variant="solid" size="md" icon="i-heroicons-pencil-square" @click="enterEdit">
            編輯
          </UButton>
        </template>
        <template v-else>
          <UButton color="secondary" variant="solid" size="md" :disabled="isSubmitting" @click="navigateBack">取消</UButton>
          <UButton color="primary" variant="solid" size="md" icon="i-heroicons-check" :loading="isSubmitting" :disabled="isSubmitting" @click="save">儲存</UButton>
        </template>
      </AppSafeTeleport>

      <!-- ===== 檢視模式 ===== -->
      <template v-if="mode === 'view' && record">
        <CardOutlined>
          <div class="space-y-lg">
            <section>
              <h3 class="mb-md border-b border-outline-variant pb-xs text-body-medium font-heavy text-on-surface-variant">品項資訊</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                <ViewField label="分類" :value="categoryLabelOf(record.categoryKey)" />
                <ViewField label="項目" :value="record.name" />
                <ViewField label="品項編碼" :value="record.code" />
                <ViewField label="數量" :value="`${record.qty} ${record.unit}`" />
                <ViewField label="單位" :value="record.unit" />
                <div class="md:col-span-3">
                  <div class="text-label-small text-on-surface-variant mb-0.5">規格說明</div>
                  <p class="text-body-medium text-on-surface whitespace-pre-wrap">{{ record.spec1 }}</p>
                </div>
              </div>
            </section>

            <section>
              <h3 class="mb-md border-b border-outline-variant pb-xs text-body-medium font-heavy text-on-surface-variant">保管與存放</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                <ViewField label="保管人" :value="record.keeper || '—'" />
                <ViewField label="保管人電話" :value="record.keeperPhone || '—'" />
                <ViewField label="存放地點" :value="record.locationName || '—'" />
              </div>
            </section>

            <section>
              <h3 class="mb-md border-b border-outline-variant pb-xs text-body-medium font-heavy text-on-surface-variant">其他</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div>
                  <div class="text-label-small text-on-surface-variant mb-0.5">狀態</div>
                  <EquipmentStatusBadge :status="record.status" />
                </div>
                <ViewField label="採購日期" :value="record.purchaseDate || '—'" />
                <div class="md:col-span-3">
                  <div class="text-label-small text-on-surface-variant mb-0.5">備註</div>
                  <p class="text-body-medium text-on-surface whitespace-pre-wrap">{{ record.specNote || '—' }}</p>
                </div>
              </div>
            </section>
          </div>
        </CardOutlined>
      </template>

      <!-- ===== 編輯 / 新增模式 ===== -->
      <template v-else-if="mode !== 'view'">
        <CardOutlined>
          <div class="space-y-lg">
            <section>
              <h3 class="mb-md border-b border-outline-variant pb-xs text-body-medium font-heavy text-on-surface-variant">品項資訊</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                <EquipmentFormField label="分類" name="categoryKey" required :error="fieldErrors.categoryKey">
                  <USelectMenu v-model="form.categoryKey" :options="categoryOptions" value-attribute="value" option-attribute="label"
                    placeholder="請選擇分類" searchable class="w-full"
                    :aria-describedby="fieldErrors.categoryKey ? 'categoryKey-error' : undefined" />
                </EquipmentFormField>
                <EquipmentFormField label="項目" name="name" required :error="fieldErrors.name">
                  <!-- 一般分類從清單選；「其他」分類或未選分類時改文字輸入 -->
                  <USelectMenu
                    v-if="!isCustomName"
                    v-model="form.name"
                    :options="itemOptions"
                    :disabled="!form.categoryKey"
                    placeholder="請先選分類再選項目"
                    searchable
                    class="w-full"
                    :aria-describedby="fieldErrors.name ? 'name-error' : undefined"
                  />
                  <UInput
                    v-else
                    v-model="form.name"
                    placeholder="請輸入品名"
                    class="w-full"
                    :aria-describedby="fieldErrors.name ? 'name-error' : undefined"
                  />
                </EquipmentFormField>
                <EquipmentFormField label="品項編碼" name="code">
                  <!-- 系統依「分類＋項目」自動推算，唯讀即時預覽 -->
                  <UInput :model-value="codePreview" readonly placeholder="選定分類與項目後自動產生" class="w-full font-mono" />
                </EquipmentFormField>
                <EquipmentFormField label="數量" name="qty" required :error="fieldErrors.qty">
                  <UInput
                    v-model.number="form.qty"
                    type="number"
                    :min="0"
                    class="w-full"
                    :aria-describedby="fieldErrors.qty ? 'qty-error' : undefined"
                  />
                </EquipmentFormField>
                <EquipmentFormField label="單位" name="unit" required :error="fieldErrors.unit">
                  <UInput
                    v-model="form.unit"
                    placeholder="例：台、件、箱"
                    class="w-full"
                    :aria-describedby="fieldErrors.unit ? 'unit-error' : undefined"
                  />
                </EquipmentFormField>
              </div>
              <div class="mt-md">
                <EquipmentFormField label="規格說明" name="spec1" required :error="fieldErrors.spec1">
                  <UTextarea
                    v-model="form.spec1"
                    :rows="3"
                    placeholder="規格、型號、重要參數"
                    class="w-full"
                    :aria-describedby="fieldErrors.spec1 ? 'spec1-error' : undefined"
                  />
                </EquipmentFormField>
              </div>
            </section>

            <section>
              <h3 class="mb-md border-b border-outline-variant pb-xs text-body-medium font-heavy text-on-surface-variant">保管與存放</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                <EquipmentFormField label="保管人" name="keeper">
                  <UInput v-model="form.keeper" placeholder="保管人姓名（選填）" class="w-full" />
                </EquipmentFormField>
                <EquipmentFormField label="保管人電話" name="keeperPhone" :error="fieldErrors.keeperPhone">
                  <UInput
                    v-model="form.keeperPhone"
                    type="tel"
                    placeholder="手機或市話（選填）"
                    class="w-full font-mono"
                    :aria-describedby="fieldErrors.keeperPhone ? 'keeperPhone-error' : undefined"
                  />
                </EquipmentFormField>
                <EquipmentFormField label="存放地點" name="locationName">
                  <UInput v-model="form.locationName" placeholder="例：後勤倉庫 A 區（選填）" class="w-full" />
                </EquipmentFormField>
              </div>
            </section>

            <section>
              <h3 class="mb-md border-b border-outline-variant pb-xs text-body-medium font-heavy text-on-surface-variant">其他</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                <EquipmentFormField label="狀態" name="status" required :error="fieldErrors.status">
                  <USelectMenu v-model="form.status" :options="statusOptions" value-attribute="value" option-attribute="label" class="w-full"
                    :aria-describedby="fieldErrors.status ? 'status-error' : undefined" />
                </EquipmentFormField>
                <EquipmentFormField label="採購日期" name="purchaseDate" :error="fieldErrors.purchaseDate">
                  <UInput
                    v-model="form.purchaseDate"
                    type="date"
                    :max="today"
                    class="w-full"
                    :aria-describedby="fieldErrors.purchaseDate ? 'purchaseDate-error' : undefined"
                  />
                </EquipmentFormField>
              </div>
              <div class="mt-md">
                <EquipmentFormField label="備註" name="specNote">
                  <UTextarea
                    v-model="form.specNote"
                    :rows="3"
                    placeholder="補充說明（選填）"
                    class="w-full"
                  />
                </EquipmentFormField>
              </div>
            </section>
          </div>
        </CardOutlined>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  useEquipmentItems,
  categoryLabelOf,
  nextEquipmentCode,
  equipmentTodayString,
  itemsOfCategory,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_STATUS_META,
  EQUIPMENT_STATUS_OPTIONS,
  type EquipmentItem,
  type EquipmentItemInput,
} from '~/composables/useEquipmentItems'
import { validateFields, type FieldRules } from '~/utils/templateValidation'

definePageMeta({ layout: 'template', pageTitle: '中心裝備物資' })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { getById, create, update } = useEquipmentItems()

// ── 模式判定 ──
type PageMode = 'view' | 'edit' | 'create'
const mode = computed<PageMode>(() =>
  route.params.id === 'new' ? 'create' : route.query.mode === 'edit' ? 'edit' : 'view',
)

// ── 動態頁標題（template layout 提供；以實例 uid 記錄擁有者，避免 remount 時互相抹掉） ──
const pageTitleOverride = useState<string | null>('template-page-title-override', () => null)
const pageTitleOwner = useState<number | null>('equipment-crud-page-title-owner', () => null)
const instanceUid = getCurrentInstance()?.uid ?? -1
watchEffect(() => {
  pageTitleOverride.value = mode.value === 'create' ? '新增品項' : mode.value === 'edit' ? '編輯品項' : '檢視品項'
  pageTitleOwner.value = instanceUid
})
onUnmounted(() => {
  if (pageTitleOwner.value === instanceUid) {
    pageTitleOverride.value = null
    pageTitleOwner.value = null
  }
})

// ── 下拉選項 ──
const categoryOptions = EQUIPMENT_CATEGORIES.map(c => ({ label: c.label, value: c.value }))
const statusOptions = EQUIPMENT_STATUS_OPTIONS.map(value => ({ label: EQUIPMENT_STATUS_META[value], value }))
const today = equipmentTodayString()

// 項目連動：一般分類給標準項目清單；「其他」分類改文字輸入
const itemOptions = computed(() => itemsOfCategory(form.categoryKey))
const isCustomName = computed(() => form.categoryKey === 'OTHER')

// 品項編碼即時預覽：編輯時分類/項目未變則保留原碼，否則於新前綴取下一流水
const codePreview = computed(() => {
  if (!form.categoryKey || !form.name.trim()) return ''
  if (mode.value === 'edit' && record.value
    && record.value.categoryKey === form.categoryKey && record.value.name === form.name) {
    return record.value.code
  }
  return nextEquipmentCode(form.categoryKey, form.name)
})

// ── 狀態 ──
const record = ref<EquipmentItem | null>(null) // 檢視模式的唯讀來源
const notFound = ref(false)
const isSubmitting = ref(false) // 送出中旗標：防重複送出（連點儲存只會入庫一次）
const fieldErrors = reactive<Record<string, string>>({})

function emptyForm(): EquipmentItemInput {
  return {
    categoryKey: '', name: '', qty: 0, unit: '', spec1: '',
    keeper: '', keeperPhone: '', locationName: '',
    status: 'normal', purchaseDate: '', specNote: '',
  }
}
function toInput(item: EquipmentItem): EquipmentItemInput {
  return {
    categoryKey: item.categoryKey, name: item.name, qty: item.qty, unit: item.unit,
    spec1: item.spec1, keeper: item.keeper, keeperPhone: item.keeperPhone,
    locationName: item.locationName, status: item.status,
    purchaseDate: item.purchaseDate, specNote: item.specNote,
  }
}
const form = reactive<EquipmentItemInput>(emptyForm())

// 分類切換：若現有項目已不屬於新分類則清空（避免殘留）；
// 時序無關寫法——載入既有品項時項目本就屬於該分類，不會被誤清；「其他」為文字輸入故保留。
watch(() => form.categoryKey, (next) => {
  if (next === 'OTHER') return
  if (form.name && !itemsOfCategory(next).includes(form.name)) form.name = ''
})

// ── 錯誤清除：只清「被變更的欄位」的錯誤，未修正的欄位錯誤保留 ──
function clearErrors() {
  for (const key of Object.keys(fieldErrors)) delete fieldErrors[key]
}
watch(
  () => ({ ...form }),
  (next, prev) => {
    for (const key of Object.keys(next) as (keyof EquipmentItemInput)[]) {
      if (next[key] !== prev[key]) delete fieldErrors[key]
    }
  },
)

// ── 載入：edit/create 深拷貝進 form；view 用唯讀 record ──
async function load() {
  clearErrors()
  if (mode.value === 'create') {
    record.value = null
    Object.assign(form, emptyForm())
    notFound.value = false
    return
  }
  const found = await getById(String(route.params.id))
  if (!found) {
    record.value = null
    notFound.value = true
    return
  }
  notFound.value = false
  record.value = found
  Object.assign(form, toInput(found))
}
load()
// 離開本頁時 route.params.id / query.mode 會變 undefined 再觸發一次 watch，此時不得再跑 load()
watch(() => route.params.id, (id) => { if (id) load() })
watch(() => route.query.mode, () => { if (route.params.id) load() })

// ── 驗證 ──
/** 保管人電話：台灣手機（09 開頭 10 碼）或市話（區碼＋7~8 碼，可含一個連字號）；選填，填了才驗 */
const KEEPER_PHONE_PATTERN = /^(09\d{8}|0\d{1,2}-?\d{6,8})$/

function rulesFor(): FieldRules<EquipmentItemInput> {
  return {
    categoryKey: [{ required: true, message: '請選擇分類' }],
    name: [{ required: true, message: '請選擇或輸入項目' }],
    unit: [{ required: true, message: '請輸入單位' }],
    spec1: [{ required: true, message: '請輸入規格說明' }],
    keeperPhone: [{ pattern: KEEPER_PHONE_PATTERN, message: '電話格式錯誤（手機 09xxxxxxxx 或市話 0X-XXXXXXXX）' }],
    status: [{ required: true, message: '請選擇狀態' }],
  }
}

// 錯誤欄位聚焦順序
const FIELD_ORDER = ['categoryKey', 'name', 'qty', 'unit', 'spec1', 'keeper', 'keeperPhone', 'locationName', 'status', 'purchaseDate']

function focusFirstError(errors: Record<string, string>) {
  const key = FIELD_ORDER.find(field => errors[field])
  if (!key) return
  nextTick(() => {
    const host = document.querySelector(`[data-field="${key}"]`)
    host?.querySelector<HTMLElement>('input, select, textarea, button')?.focus()
  })
}

// ── 儲存 / 導覽 ──
async function save() {
  if (isSubmitting.value) return // 防重複送出：前一次尚未收尾則忽略
  const errors = validateFields(form as unknown as Record<string, unknown>, rulesFor())
  // 數量與採購日期非純字串規則，於引擎外另行檢查（引擎為無狀態純函式，不改共用檔）
  if (typeof form.qty !== 'number' || Number.isNaN(form.qty)) {
    errors.qty = '請輸入數量'
  } else if (form.qty < 0) {
    errors.qty = '數量不可小於 0'
  }
  if (form.purchaseDate && form.purchaseDate > today) {
    errors.purchaseDate = '採購日期不可晚於今天'
  }
  clearErrors()
  if (Object.keys(errors).length > 0) {
    Object.assign(fieldErrors, errors)
    focusFirstError(errors)
    toast.add({ title: `請修正 ${Object.keys(errors).length} 個欄位`, color: 'red', icon: 'i-heroicons-exclamation-triangle' })
    return
  }
  // 儲存前正規化：字串欄位一律 trim，與驗證（已 trim 比對）及入庫格式一致
  const payload: EquipmentItemInput = {
    categoryKey: form.categoryKey,
    name: form.name.trim(),
    qty: form.qty,
    unit: form.unit.trim(),
    spec1: form.spec1.trim(),
    keeper: form.keeper.trim(),
    keeperPhone: form.keeperPhone.trim(),
    locationName: form.locationName.trim(),
    status: form.status,
    purchaseDate: form.purchaseDate,
    specNote: form.specNote.trim(),
  }
  isSubmitting.value = true
  try {
    if (mode.value === 'create') {
      await create(payload)
      toast.add({ title: '已新增品項', color: 'green', icon: 'i-heroicons-check-circle' })
    } else if (record.value) {
      await update(record.value.id, payload)
      toast.add({ title: '已儲存變更', color: 'green', icon: 'i-heroicons-check-circle' })
    }
    navigateBack()
  } finally {
    isSubmitting.value = false
  }
}

// view → edit：加上 mode=edit，保留 return
function enterEdit() {
  router.replace({ query: { ...route.query, mode: 'edit' } })
}

// 返回列表並還原查詢狀態（route.query.return 為 query string）
function navigateBack() {
  const ret = typeof route.query.return === 'string' ? route.query.return : ''
  router.push(ret ? `/equipment/crud?${ret}` : '/equipment/crud')
}
</script>
