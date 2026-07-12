<!--
  CRUD 標準範本 — 人員（檢視 / 編輯 / 新增 三合一整頁）
  ────────────────────────────────────────────────
  這個頁面在範本中的角色：
    示範一個路由三態頁：new = 新增、?mode=edit = 編輯、其餘 = 檢視（FR-T-301）。
    表單依區塊分組、欄位級驗證、儲存時聚焦第一個錯誤欄位，主要動作一律 Teleport 至麵包屑。

  設計要點：
    - 進入 edit/create 才把資料深拷貝進 form（reactive）；view 直接用唯讀 record。
    - 驗證交給純函式 validateFields + 頁面層 rulesFor(form)（相依規則在此產生，BR-T-02）。
    - 動態頁標題以 template layout 的 useState('template-page-title-override') 實現（審查修訂 A-8）。
-->
<template>
  <div class="space-y-lg">
    <!-- 找不到資料：不得白屏（FR：查無資料空狀態 + 返回） -->
    <CardOutlined v-if="notFound">
      <div class="flex flex-col items-center justify-center gap-sm py-xl text-on-surface-variant">
        <UIcon name="i-heroicons-user-minus" class="h-10 w-10 opacity-40" />
        <p class="text-headline-medium font-heavy text-on-surface">查無此人員</p>
        <p class="text-body-medium">人員代碼「{{ route.params.id }}」不存在或已刪除。</p>
        <UButton color="primary" variant="solid" size="md" @click="navigateBack">返回列表</UButton>
      </div>
    </CardOutlined>

    <template v-else>
      <!-- 麵包屑動作鈕一律用 AppSafeTeleport（hard-load 安全），FR-T-304 -->
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
          <UButton color="secondary" variant="solid" size="md" @click="navigateBack">取消</UButton>
          <UButton color="primary" variant="solid" size="md" icon="i-heroicons-check" @click="save">儲存</UButton>
        </template>
      </AppSafeTeleport>

      <!-- ===== 檢視模式 ===== -->
      <template v-if="mode === 'view' && record">
        <CardOutlined>
          <div class="space-y-lg">
            <section>
              <h3 class="mb-md border-b border-outline-variant pb-xs text-body-medium font-heavy text-on-surface-variant">基本資料</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                <ViewField label="姓名" :value="record.name" />
                <ViewField label="性別" :value="record.gender" />
                <ViewField label="生日" :value="record.birthDate" />
                <ViewField label="證件類別" :value="record.idType" />
                <ViewField label="證號" :value="record.nationalId" />
              </div>
            </section>

            <section>
              <h3 class="mb-md border-b border-outline-variant pb-xs text-body-medium font-heavy text-on-surface-variant">聯絡資訊</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                <ViewField label="電話" :value="record.phone" />
                <ViewField label="Email" :value="record.email || '—'" />
                <ViewField label="居住縣市" :value="record.residenceCounty" />
                <ViewField label="居住鄉鎮區" :value="record.residenceTownship" />
                <ViewField label="居住地址" :value="record.residenceAddress" />
              </div>
            </section>

            <section>
              <h3 class="mb-md border-b border-outline-variant pb-xs text-body-medium font-heavy text-on-surface-variant">編組職務</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                <ViewField label="編組" :value="record.groupName" />
                <ViewField label="職務" :value="positionTitleOf(record.positionCode)" />
                <div>
                  <div class="text-label-small text-on-surface-variant mb-0.5">資格</div>
                  <div class="flex flex-wrap items-center gap-1">
                    <UBadge v-for="qual in record.qualifications" :key="qual" color="primary" variant="soft" size="sm">
                      {{ qual }}
                    </UBadge>
                    <span v-if="record.qualifications.length === 0" class="text-body-medium text-on-surface-variant">—</span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 class="mb-md border-b border-outline-variant pb-xs text-body-medium font-heavy text-on-surface-variant">其他</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div>
                  <div class="text-label-small text-on-surface-variant mb-0.5">狀態</div>
                  <TemplateStatusBadge :status="record.status" />
                </div>
                <ViewField label="更新日期" :value="record.updatedAt" />
                <div class="md:col-span-3">
                  <div class="text-label-small text-on-surface-variant mb-0.5">備註</div>
                  <p class="text-body-medium text-on-surface whitespace-pre-wrap">{{ record.note || '—' }}</p>
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
              <h3 class="mb-md border-b border-outline-variant pb-xs text-body-medium font-heavy text-on-surface-variant">基本資料</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                <TemplateFormField label="姓名" name="name" required :error="fieldErrors.name">
                  <UInput
                    v-model="form.name"
                    placeholder="請輸入姓名"
                    class="w-full"
                    :aria-describedby="fieldErrors.name ? 'name-error' : undefined"
                  />
                </TemplateFormField>
                <TemplateFormField label="性別" name="gender" required :error="fieldErrors.gender">
                  <!-- USelectMenu 的 attrs 會 fallthrough 到觸發按鈕，aria-describedby 可正確關聯（NFR-T-02） -->
                  <USelectMenu v-model="form.gender" :options="genderOptions" class="w-full"
                    :aria-describedby="fieldErrors.gender ? 'gender-error' : undefined" />
                </TemplateFormField>
                <TemplateFormField label="生日" name="birthDate" required :error="fieldErrors.birthDate">
                  <!-- 用原生 date input：v-model 即為 YYYY-MM-DD 字串，且可直接掛
                       aria-describedby 關聯錯誤訊息（NFR-T-02）。
                       （附註：AppDatePicker 曾因 v-calendar 3.1.2 × Vue 3.5 不相容而整頁崩潰，
                       2026-07-11 已改原生實作修復；本欄維持直接用 UInput 以保留 aria 接線。） -->
                  <UInput
                    v-model="form.birthDate"
                    type="date"
                    class="w-full"
                    :aria-describedby="fieldErrors.birthDate ? 'birthDate-error' : undefined"
                  />
                </TemplateFormField>
                <TemplateFormField label="證件類別" name="idType" required :error="fieldErrors.idType">
                  <USelectMenu v-model="form.idType" :options="idTypeOptions" class="w-full"
                    :aria-describedby="fieldErrors.idType ? 'idType-error' : undefined" />
                </TemplateFormField>
                <TemplateFormField label="證號" name="nationalId" required :error="fieldErrors.nationalId">
                  <UInput
                    v-model="form.nationalId"
                    :placeholder="form.idType === '身分證' ? '例：A123456789' : '請輸入證號'"
                    class="w-full font-mono"
                    :aria-describedby="fieldErrors.nationalId ? 'nationalId-error' : undefined"
                  />
                </TemplateFormField>
              </div>
            </section>

            <section>
              <h3 class="mb-md border-b border-outline-variant pb-xs text-body-medium font-heavy text-on-surface-variant">聯絡資訊</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                <TemplateFormField label="電話" name="phone" required :error="fieldErrors.phone">
                  <UInput
                    v-model="form.phone"
                    type="tel"
                    placeholder="09xxxxxxxx"
                    class="w-full font-mono"
                    :aria-describedby="fieldErrors.phone ? 'phone-error' : undefined"
                  />
                </TemplateFormField>
                <TemplateFormField label="Email" name="email" :error="fieldErrors.email">
                  <UInput
                    v-model="form.email"
                    type="email"
                    placeholder="name@example.tw（選填）"
                    class="w-full"
                    :aria-describedby="fieldErrors.email ? 'email-error' : undefined"
                  />
                </TemplateFormField>
              </div>
              <div class="mt-md">
                <TemplateFormField label="居住地址" name="residenceCounty" required :error="addressError">
                  <AppAddressPicker
                    v-model:county="form.residenceCounty"
                    v-model:township="form.residenceTownship"
                    v-model:road="residenceRoad"
                    v-model:detail="form.residenceAddress"
                  />
                </TemplateFormField>
              </div>
            </section>

            <section>
              <h3 class="mb-md border-b border-outline-variant pb-xs text-body-medium font-heavy text-on-surface-variant">編組職務</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                <TemplateFormField label="編組" name="groupName" required :error="fieldErrors.groupName">
                  <USelectMenu v-model="form.groupName" :options="groupOptions" placeholder="請選擇編組" class="w-full"
                    :aria-describedby="fieldErrors.groupName ? 'groupName-error' : undefined" />
                </TemplateFormField>
                <TemplateFormField label="職務" name="positionCode" required :error="fieldErrors.positionCode">
                  <USelectMenu v-model="form.positionCode" :options="positionOptions" value-attribute="value" option-attribute="label" class="w-full"
                    :aria-describedby="fieldErrors.positionCode ? 'positionCode-error' : undefined" />
                </TemplateFormField>
              </div>
              <div class="mt-md">
                <TemplateFormField label="資格" name="qualifications">
                  <div class="flex flex-wrap items-center gap-x-lg gap-y-sm">
                    <UCheckbox
                      v-for="qual in qualificationOptions"
                      :key="qual"
                      :model-value="form.qualifications.includes(qual)"
                      :label="qual"
                      @update:model-value="() => toggleQualification(qual)"
                    />
                  </div>
                </TemplateFormField>
              </div>
            </section>

            <section>
              <h3 class="mb-md border-b border-outline-variant pb-xs text-body-medium font-heavy text-on-surface-variant">其他</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                <TemplateFormField label="狀態" name="status" required :error="fieldErrors.status">
                  <USelectMenu v-model="form.status" :options="statusOptions" class="w-full"
                    :aria-describedby="fieldErrors.status ? 'status-error' : undefined" />
                </TemplateFormField>
              </div>
              <div class="mt-md">
                <TemplateFormField label="備註" name="note">
                  <UTextarea
                    v-model="form.note"
                    :rows="4"
                    placeholder="補充說明（選填）"
                    class="w-full"
                  />
                </TemplateFormField>
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
  useTemplateMembers,
  positionTitleOf,
  TEMPLATE_POSITION_META,
  TEMPLATE_GENDER_OPTIONS,
  TEMPLATE_ID_TYPE_OPTIONS,
  TEMPLATE_GROUP_OPTIONS,
  TEMPLATE_QUALIFICATION_OPTIONS,
  TEMPLATE_MEMBER_STATUS_OPTIONS,
  type TemplateMember,
  type TemplateMemberInput,
  type TemplatePositionCode,
} from '~/composables/useTemplateMembers'
import {
  validateFields,
  PHONE_PATTERN,
  TW_ID_PATTERN,
  EMAIL_PATTERN,
  type FieldRule,
  type FieldRules,
} from '~/utils/templateValidation'

definePageMeta({ layout: 'template', pageTitle: 'CRUD 標準範本 — 人員' })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { getById, create, update } = useTemplateMembers()

// ── 模式判定（先例：equipment-center/[id].vue） ──
type PageMode = 'view' | 'edit' | 'create'
const mode = computed<PageMode>(() =>
  route.params.id === 'new' ? 'create' : route.query.mode === 'edit' ? 'edit' : 'view',
)

// ── 動態頁標題（template layout 提供，審查修訂 A-8） ──
// 注意：app.vue 以 fullPath 為 key，query 一變就整頁 remount，且 Suspense 下可能出現
// 「同一頁兩個實例並存、舊實例 onUnmounted 晚於新實例 setup」的順序——
// 舊實例無條件清 null 會抹掉新實例剛設的標題；用「標題字串比對」也不行（兩實例字串相同）。
// 正解：以元件實例 uid 記錄「目前誰擁有標題」，只有擁有者卸載時才清（E2E 缺陷 #4 根治版）。
const pageTitleOverride = useState<string | null>('template-page-title-override', () => null)
const pageTitleOwner = useState<number | null>('template-crud-page-title-owner', () => null)
const instanceUid = getCurrentInstance()?.uid ?? -1
watchEffect(() => {
  pageTitleOverride.value = mode.value === 'create' ? '新增人員' : mode.value === 'edit' ? '編輯人員' : '檢視人員'
  pageTitleOwner.value = instanceUid
})
onUnmounted(() => {
  if (pageTitleOwner.value === instanceUid) {
    pageTitleOverride.value = null
    pageTitleOwner.value = null
  }
})

// ── 下拉選項 ──
const genderOptions = TEMPLATE_GENDER_OPTIONS
const idTypeOptions = TEMPLATE_ID_TYPE_OPTIONS
const groupOptions = TEMPLATE_GROUP_OPTIONS
const statusOptions = TEMPLATE_MEMBER_STATUS_OPTIONS
const qualificationOptions = TEMPLATE_QUALIFICATION_OPTIONS
const positionOptions = (Object.keys(TEMPLATE_POSITION_META) as TemplatePositionCode[]).map(code => ({
  label: TEMPLATE_POSITION_META[code].title,
  value: code,
}))

// ── 狀態 ──
const record = ref<TemplateMember | null>(null) // 檢視模式的唯讀來源
const notFound = ref(false)
const fieldErrors = reactive<Record<string, string>>({})
// AppAddressPicker 內建「路名」欄；本範本實體僅保留單一 residenceAddress。
// 設計限制：編輯模式的路名欄僅為「輔助輸入」——完整地址存於詳址欄（residenceAddress），
// 載入既有資料時路名欄留空、詳址欄帶回完整地址；儲存時僅在詳址尚未含路名時才前綴合併，
// 避免「儲存→再編輯→再儲存」造成路名重複疊加。
const residenceRoad = ref('')

function emptyForm(): TemplateMemberInput {
  return {
    name: '', gender: '男', birthDate: '', idType: '身分證', nationalId: '',
    phone: '', email: '', residenceCounty: '', residenceTownship: '', residenceAddress: '',
    groupName: '', positionCode: 'member', qualifications: [], status: '在職', note: '',
  }
}
function toInput(member: TemplateMember): TemplateMemberInput {
  return {
    name: member.name, gender: member.gender, birthDate: member.birthDate,
    idType: member.idType, nationalId: member.nationalId, phone: member.phone,
    email: member.email, residenceCounty: member.residenceCounty,
    residenceTownship: member.residenceTownship, residenceAddress: member.residenceAddress,
    groupName: member.groupName, positionCode: member.positionCode,
    qualifications: [...member.qualifications], status: member.status, note: member.note,
  }
}
const form = reactive<TemplateMemberInput>(emptyForm())

// ── 錯誤清除：只清「被變更的欄位」的錯誤，未修正的欄位錯誤保留（FR-T-303） ──
function clearErrors() {
  for (const key of Object.keys(fieldErrors)) delete fieldErrors[key]
}
// 淺拷貝快照逐 key 比對：qualifications 為整組替換（非就地 mutate），參考比較即可偵測
watch(
  () => ({ ...form }),
  (next, prev) => {
    for (const key of Object.keys(next) as (keyof TemplateMemberInput)[]) {
      if (next[key] !== prev[key]) delete fieldErrors[key]
    }
  },
)
// 路名欄是詳址的輔助輸入，變更視同修正地址錯誤
watch(residenceRoad, () => { delete fieldErrors.residenceAddress })

const addressError = computed(
  () => fieldErrors.residenceCounty || fieldErrors.residenceTownship || fieldErrors.residenceAddress || '',
)

// ── 載入：edit/create 深拷貝進 form；view 用唯讀 record ──
async function load() {
  clearErrors()
  if (mode.value === 'create') {
    record.value = null
    Object.assign(form, emptyForm())
    residenceRoad.value = ''
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
  residenceRoad.value = ''
}
load()
// 離開本頁時 route.params.id / query.mode 會變成 undefined 再觸發一次 watch，
// 此時不得再跑 load()（會誤判 notFound 造成卸載前閃爍）
watch(() => route.params.id, (id) => { if (id) load() })
watch(() => route.query.mode, () => { if (route.params.id) load() })

// ── 資格多選 ──
function toggleQualification(qual: string) {
  form.qualifications = form.qualifications.includes(qual)
    ? form.qualifications.filter(item => item !== qual)
    : [...form.qualifications, qual]
}

// ── 驗證規則（相依規則在頁面層產生，引擎保持無狀態，BR-T-02） ──
/** 居留證／護照證號長度上限（BR-T-02：非身分證僅檢查非空與長度） */
const ID_NUMBER_MAX_LENGTH = 20

function rulesFor(current: TemplateMemberInput): FieldRules<TemplateMemberInput> {
  const idRules: FieldRule[] = current.idType === '身分證'
    ? [{ required: true, message: '請輸入證號' }, { pattern: TW_ID_PATTERN, message: '身分證格式錯誤（例：A123456789）' }]
    : [{ required: true, message: '請輸入證號' }, { maxLength: ID_NUMBER_MAX_LENGTH, message: `證號長度不可超過 ${ID_NUMBER_MAX_LENGTH} 字` }]
  return {
    name: [{ required: true, message: '請輸入姓名' }],
    gender: [{ required: true, message: '請選擇性別' }],
    birthDate: [{ required: true, message: '請選擇生日' }],
    idType: [{ required: true, message: '請選擇證件類別' }],
    nationalId: idRules,
    phone: [{ required: true, message: '請輸入電話' }, { pattern: PHONE_PATTERN, message: '行動電話格式錯誤（09 開頭共 10 碼）' }],
    email: [{ pattern: EMAIL_PATTERN, message: 'Email 格式錯誤' }],
    residenceCounty: [{ required: true, message: '請選擇居住縣市' }],
    residenceTownship: [{ required: true, message: '請選擇居住鄉鎮區' }],
    residenceAddress: [{ required: true, message: '請輸入居住地址' }],
    groupName: [{ required: true, message: '請選擇編組' }],
    positionCode: [{ required: true, message: '請選擇職務' }],
    status: [{ required: true, message: '請選擇狀態' }],
  }
}

// 錯誤欄位聚焦順序（FR-T-303）；地址三欄共用同一個 data-field 錨點
const FIELD_ORDER = [
  'name', 'gender', 'birthDate', 'idType', 'nationalId', 'phone', 'email',
  'residenceCounty', 'residenceTownship', 'residenceAddress', 'groupName', 'positionCode', 'status',
]
const ADDRESS_KEYS = ['residenceCounty', 'residenceTownship', 'residenceAddress']

function focusFirstError(errors: Record<string, string>) {
  const key = FIELD_ORDER.find(field => errors[field])
  if (!key) return
  const anchor = ADDRESS_KEYS.includes(key) ? 'residenceCounty' : key
  nextTick(() => {
    const host = document.querySelector(`[data-field="${anchor}"]`)
    host?.querySelector<HTMLElement>('input, select, textarea, button')?.focus()
  })
}

// ── 儲存 / 導覽 ──
async function save() {
  const errors = validateFields(form, rulesFor(form))
  clearErrors()
  if (Object.keys(errors).length > 0) {
    Object.assign(fieldErrors, errors)
    focusFirstError(errors)
    toast.add({ title: `請修正 ${Object.keys(errors).length} 個欄位`, color: 'red', icon: 'i-heroicons-exclamation-triangle' })
    return
  }
  // 路名僅在詳址尚未含路名時前綴合併，防止「儲存→再編輯→再儲存」重複疊加（見 residenceRoad 宣告處說明）
  const road = residenceRoad.value.trim()
  const detail = form.residenceAddress.trim()
  const mergedAddress = road && !detail.startsWith(road) ? `${road}${detail}` : detail
  // 儲存前正規化：字串欄位一律 trim，與驗證（已 trim 比對）及入庫格式保持一致
  const payload: TemplateMemberInput = {
    name: form.name.trim(),
    gender: form.gender,
    birthDate: form.birthDate,
    idType: form.idType,
    nationalId: form.nationalId.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    residenceCounty: form.residenceCounty,
    residenceTownship: form.residenceTownship,
    residenceAddress: mergedAddress,
    groupName: form.groupName,
    positionCode: form.positionCode,
    qualifications: [...form.qualifications],
    status: form.status,
    note: form.note.trim(),
  }
  if (mode.value === 'create') {
    await create(payload)
    toast.add({ title: '已新增人員', color: 'green', icon: 'i-heroicons-check-circle' })
  } else if (record.value) {
    await update(record.value.id, payload)
    toast.add({ title: '已儲存變更', color: 'green', icon: 'i-heroicons-check-circle' })
  }
  navigateBack()
}

// view → edit：加上 mode=edit，保留 return
function enterEdit() {
  router.replace({ query: { ...route.query, mode: 'edit' } })
}

// 返回列表並還原查詢狀態（route.query.return 為 query string）
function navigateBack() {
  const ret = typeof route.query.return === 'string' ? route.query.return : ''
  router.push(ret ? `/template/crud?${ret}` : '/template/crud')
}
</script>
