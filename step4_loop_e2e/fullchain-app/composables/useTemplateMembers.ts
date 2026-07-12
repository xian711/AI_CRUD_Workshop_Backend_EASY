/**
 * useTemplateMembers — 範本示範實體「人員」的資料層（型別 + 種子 + CRUD API）
 * ──────────────────────────────────────────────────────────────
 * 這個檔案在範本中的角色：
 *   示範一個「後端就緒」的資料層：對外的 CRUD 一律非同步（Promise），未來把內部
 *   實作換成 useFetch 即可，呼叫端完全不用改（針對介面而非實作寫程式）。
 *
 * 設計要點：
 *   - module-level ref 單例 + ensureSeeded()，比照 useTownshipExtOrgs.ts 現行模式。
 *   - getById 回「深拷貝」，杜絕表單直接改到 store（防禦性拷貝）。
 *   - positionTitle 由 positionCode 查表導出（BR-T-05；Replace Conditional with Lookup）。
 *
 * ⚠️ 種子資料為「虛構測試資料」：姓名/電話/地址/證號皆為配合範本演示所杜撰，非真實個資。
 */
import { computed, ref } from 'vue'

// ── 型別與常數 ────────────────────────────────────────────────
export type TemplateMemberStatus = '在職' | '停用'
export type TemplateIdType = '身分證' | '居留證' | '護照'
export type TemplatePositionCode = 'director' | 'deputy' | 'leader' | 'member'

export interface TemplateMember {
  id: string // 'M-001'
  name: string
  gender: '男' | '女'
  birthDate: string // YYYY-MM-DD
  idType: TemplateIdType
  nationalId: string
  phone: string
  email: string
  residenceCounty: string
  residenceTownship: string
  residenceAddress: string
  groupName: string
  positionCode: TemplatePositionCode
  qualifications: string[]
  status: TemplateMemberStatus
  note: string
  updatedAt: string // YYYY-MM-DD，系統寫入
}

/** 新增/編輯的輸入型別：id 與 updatedAt 由系統產生（BR-T-06） */
export type TemplateMemberInput = Omit<TemplateMember, 'id' | 'updatedAt'>

/** 職務中繼資料：顯示名 + 排序權重（BR-T-05：positionTitle 由此導出） */
export const TEMPLATE_POSITION_META: Record<TemplatePositionCode, { title: string; weight: number }> = {
  director: { title: '主任', weight: 1 },
  deputy: { title: '副主任', weight: 2 },
  leader: { title: '組長', weight: 3 },
  member: { title: '組員', weight: 4 },
}

export const TEMPLATE_MEMBER_STATUS_OPTIONS: TemplateMemberStatus[] = ['在職', '停用']
export const TEMPLATE_ID_TYPE_OPTIONS: TemplateIdType[] = ['身分證', '居留證', '護照']
export const TEMPLATE_GENDER_OPTIONS: TemplateMember['gender'][] = ['男', '女']
export const TEMPLATE_GROUP_OPTIONS = ['協作中心', '指揮組', '搶救組', '後勤組', '醫護組', '疏散引導組']
export const TEMPLATE_QUALIFICATION_OPTIONS = ['防災士', 'TCERT', '急救證照', '無線電執照']

/** 職務代碼 → 顯示名（BR-T-05） */
export function positionTitleOf(code: TemplatePositionCode): string {
  return TEMPLATE_POSITION_META[code].title
}
/** 職務代碼 → 排序權重（主任=1 在前） */
export function positionWeightOf(code: TemplatePositionCode): number {
  return TEMPLATE_POSITION_META[code].weight
}

// ── 種子資料（24 筆字面量，虛構測試資料；刻意不用 hash 產生器：顯性優於聰明）──
// 涵蓋 6 編組、4 職務（主任/副主任隸屬協作中心各 1）、3 筆停用、集中臺東縣 4 鄉鎮 + 花蓮縣 2 筆。
type SeedMember = Omit<TemplateMember, 'id'>

const SEED: SeedMember[] = [
  { name: '陳建豪', gender: '男', birthDate: '1975-03-12', idType: '身分證', nationalId: 'V123456789', phone: '0912345678', email: 'chenjh@example.tw', residenceCounty: '臺東縣', residenceTownship: '臺東市', residenceAddress: '中華路一段120號', groupName: '協作中心', positionCode: 'director', qualifications: ['防災士', '無線電執照'], status: '在職', note: '協作中心主任', updatedAt: '2026-07-05' },
  { name: '林淑芬', gender: '女', birthDate: '1978-08-22', idType: '身分證', nationalId: 'V223456781', phone: '0922333444', email: 'linsf@example.tw', residenceCounty: '臺東縣', residenceTownship: '臺東市', residenceAddress: '更生路56號', groupName: '協作中心', positionCode: 'deputy', qualifications: ['防災士', 'TCERT'], status: '在職', note: '協作中心副主任', updatedAt: '2026-07-03' },
  { name: '王志明', gender: '男', birthDate: '1982-01-05', idType: '身分證', nationalId: 'V145678902', phone: '0933444555', email: '', residenceCounty: '臺東縣', residenceTownship: '卑南鄉', residenceAddress: '文化路22號', groupName: '指揮組', positionCode: 'leader', qualifications: ['TCERT'], status: '在職', note: '', updatedAt: '2026-06-28' },
  { name: '張美玲', gender: '女', birthDate: '1985-11-18', idType: '身分證', nationalId: 'V256789013', phone: '0955666777', email: 'changml@example.tw', residenceCounty: '臺東縣', residenceTownship: '成功鎮', residenceAddress: '中山路88號', groupName: '搶救組', positionCode: 'leader', qualifications: ['防災士', '急救證照', '無線電執照'], status: '在職', note: '', updatedAt: '2026-06-25' },
  { name: '李國強', gender: '男', birthDate: '1970-06-30', idType: '身分證', nationalId: 'V167890124', phone: '0966777888', email: '', residenceCounty: '臺東縣', residenceTownship: '關山鎮', residenceAddress: '和平路15號', groupName: '後勤組', positionCode: 'leader', qualifications: [], status: '在職', note: '', updatedAt: '2026-06-20' },
  { name: '吳雅婷', gender: '女', birthDate: '1990-04-14', idType: '身分證', nationalId: 'V278901235', phone: '0977888999', email: 'wuyt@example.tw', residenceCounty: '臺東縣', residenceTownship: '臺東市', residenceAddress: '正氣路210號', groupName: '醫護組', positionCode: 'leader', qualifications: ['急救證照'], status: '在職', note: '', updatedAt: '2026-06-18' },
  { name: '黃俊傑', gender: '男', birthDate: '1988-09-09', idType: '身分證', nationalId: 'V189012346', phone: '0910111222', email: '', residenceCounty: '臺東縣', residenceTownship: '卑南鄉', residenceAddress: '賓朗路33號', groupName: '疏散引導組', positionCode: 'leader', qualifications: ['防災士'], status: '在職', note: '', updatedAt: '2026-06-15' },
  { name: '蔡佩珊', gender: '女', birthDate: '1993-02-27', idType: '身分證', nationalId: 'V290123457', phone: '0921222333', email: 'caips@example.tw', residenceCounty: '臺東縣', residenceTownship: '臺東市', residenceAddress: '四維路二段45號', groupName: '搶救組', positionCode: 'member', qualifications: ['急救證照', '無線電執照'], status: '在職', note: '', updatedAt: '2026-06-12' },
  { name: '鄭文彬', gender: '男', birthDate: '1980-12-01', idType: '身分證', nationalId: 'V112233445', phone: '0932333444', email: '', residenceCounty: '臺東縣', residenceTownship: '成功鎮', residenceAddress: '忠孝路9號', groupName: '後勤組', positionCode: 'member', qualifications: [], status: '在職', note: '', updatedAt: '2026-06-10' },
  { name: '許家豪', gender: '男', birthDate: '1995-07-19', idType: '身分證', nationalId: 'V223344556', phone: '0943444555', email: 'hsujh@example.tw', residenceCounty: '臺東縣', residenceTownship: '臺東市', residenceAddress: '傳廣路77號', groupName: '指揮組', positionCode: 'member', qualifications: ['TCERT'], status: '在職', note: '', updatedAt: '2026-06-08' },
  { name: '周淑惠', gender: '女', birthDate: '1983-05-23', idType: '身分證', nationalId: 'V134455667', phone: '0954555666', email: '', residenceCounty: '臺東縣', residenceTownship: '關山鎮', residenceAddress: '中華路102號', groupName: '醫護組', positionCode: 'member', qualifications: ['急救證照'], status: '在職', note: '', updatedAt: '2026-06-05' },
  { name: '劉政宏', gender: '男', birthDate: '1976-10-08', idType: '身分證', nationalId: 'V245566778', phone: '0965666777', email: 'liuzh@example.tw', residenceCounty: '臺東縣', residenceTownship: '臺東市', residenceAddress: '更生路311號', groupName: '疏散引導組', positionCode: 'member', qualifications: [], status: '停用', note: '因職務調動暫停', updatedAt: '2026-05-30' },
  { name: '楊雅文', gender: '女', birthDate: '1991-03-16', idType: '身分證', nationalId: 'V156677889', phone: '0976777888', email: '', residenceCounty: '臺東縣', residenceTownship: '卑南鄉', residenceAddress: '太平路50號', groupName: '搶救組', positionCode: 'member', qualifications: ['防災士', '急救證照'], status: '在職', note: '', updatedAt: '2026-05-28' },
  { name: '謝孟儒', gender: '男', birthDate: '1987-08-11', idType: '身分證', nationalId: 'V267788990', phone: '0917888999', email: '', residenceCounty: '花蓮縣', residenceTownship: '花蓮市', residenceAddress: '國聯一路68號', groupName: '後勤組', positionCode: 'member', qualifications: ['無線電執照'], status: '在職', note: '支援花蓮據點', updatedAt: '2026-05-25' },
  { name: '郭建志', gender: '男', birthDate: '1979-01-29', idType: '身分證', nationalId: 'V178899001', phone: '0928999000', email: 'kuojz@example.tw', residenceCounty: '臺東縣', residenceTownship: '臺東市', residenceAddress: '博愛路133號', groupName: '指揮組', positionCode: 'member', qualifications: [], status: '在職', note: '', updatedAt: '2026-05-22' },
  { name: '簡淑貞', gender: '女', birthDate: '1984-06-07', idType: '身分證', nationalId: 'V289900112', phone: '0939000111', email: '', residenceCounty: '臺東縣', residenceTownship: '成功鎮', residenceAddress: '民權路27號', groupName: '醫護組', positionCode: 'member', qualifications: ['急救證照', '防災士'], status: '在職', note: '', updatedAt: '2026-05-20' },
  { name: '洪世昌', gender: '男', birthDate: '1972-11-25', idType: '身分證', nationalId: 'V123411223', phone: '0940111222', email: '', residenceCounty: '臺東縣', residenceTownship: '臺東市', residenceAddress: '開封街80號', groupName: '疏散引導組', positionCode: 'member', qualifications: [], status: '停用', note: '退休', updatedAt: '2026-05-18' },
  { name: '曾雅琪', gender: '女', birthDate: '1996-09-03', idType: '居留證', nationalId: 'AC12345678', phone: '0951222333', email: 'tsengyq@example.tw', residenceCounty: '臺東縣', residenceTownship: '卑南鄉', residenceAddress: '明峰路11號', groupName: '搶救組', positionCode: 'member', qualifications: ['防災士'], status: '在職', note: '持居留證，示範相依證號驗證', updatedAt: '2026-05-15' },
  { name: '邱志偉', gender: '男', birthDate: '1981-04-21', idType: '身分證', nationalId: 'V145633445', phone: '0962333444', email: '', residenceCounty: '臺東縣', residenceTownship: '關山鎮', residenceAddress: '豐泉路5號', groupName: '後勤組', positionCode: 'member', qualifications: [], status: '在職', note: '', updatedAt: '2026-05-12' },
  { name: '潘美惠', gender: '女', birthDate: '1989-12-13', idType: '身分證', nationalId: 'V256744556', phone: '0973444555', email: '', residenceCounty: '花蓮縣', residenceTownship: '玉里鎮', residenceAddress: '中正路150號', groupName: '醫護組', positionCode: 'member', qualifications: ['急救證照'], status: '在職', note: '支援花蓮據點', updatedAt: '2026-05-10' },
  { name: '賴俊安', gender: '男', birthDate: '1994-05-06', idType: '身分證', nationalId: 'V167855667', phone: '0914555666', email: 'laija@example.tw', residenceCounty: '臺東縣', residenceTownship: '臺東市', residenceAddress: '新生路260號', groupName: '指揮組', positionCode: 'member', qualifications: ['TCERT', '無線電執照'], status: '在職', note: '', updatedAt: '2026-05-08' },
  { name: '江宜蓁', gender: '女', birthDate: '1992-02-18', idType: '身分證', nationalId: 'V278966778', phone: '0925666777', email: '', residenceCounty: '臺東縣', residenceTownship: '成功鎮', residenceAddress: '中華路45號', groupName: '疏散引導組', positionCode: 'member', qualifications: [], status: '在職', note: '', updatedAt: '2026-05-06' },
  { name: '徐大偉', gender: '男', birthDate: '1977-07-30', idType: '身分證', nationalId: 'V189077889', phone: '0936777888', email: '', residenceCounty: '臺東縣', residenceTownship: '臺東市', residenceAddress: '中興路三段12號', groupName: '搶救組', positionCode: 'member', qualifications: [], status: '停用', note: '留職停薪', updatedAt: '2026-05-04' },
  { name: '高淑芳', gender: '女', birthDate: '1986-10-27', idType: '身分證', nationalId: 'V290188990', phone: '0947888999', email: 'kaosf@example.tw', residenceCounty: '臺東縣', residenceTownship: '卑南鄉', residenceAddress: '富源路8號', groupName: '後勤組', positionCode: 'member', qualifications: ['防災士', 'TCERT'], status: '在職', note: '', updatedAt: '2026-05-02' },
]

// ── 單例 state ────────────────────────────────────────────────
const store = ref<TemplateMember[]>([])
let seeded = false

function ensureSeeded(): void {
  if (seeded) return
  store.value = SEED.map((seed, index) => ({
    id: `M-${String(index + 1).padStart(3, '0')}`,
    ...seed,
    qualifications: [...seed.qualifications],
  }))
  seeded = true
}

/** 今天日期（本地時區 YYYY-MM-DD）：勿用 toISOString()——其為 UTC，台灣時區早上 8 點前會差一天 */
export function todayString(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** 深拷貝（含陣列欄位），避免呼叫端拿到 store 內部參考 */
function cloneMember(member: TemplateMember): TemplateMember {
  return { ...member, qualifications: [...member.qualifications] }
}

/** 產生流水 id：M- + 現有最大序號 +1，補零至 3 位 */
function nextId(): string {
  const maxSerial = store.value.reduce((max, member) => {
    const serial = Number(member.id.replace('M-', ''))
    return Number.isFinite(serial) ? Math.max(max, serial) : max
  }, 0)
  return `M-${String(maxSerial + 1).padStart(3, '0')}`
}

// ── 後端接軌（API 模式）───────────────────────────────────────
// 雙模式設計：預設走上方的記憶體 mock（前端課離線可跑）；
// 當 runtimeConfig.public.useApi === true 時改打真後端（後端課用），mock 程式碼與 SEED 全數保留。
//   - 解包約定：取 response.data 為實體；success===false 或 HTTP 錯誤 → 拋 new Error(繁中訊息)，
//     與 mock 拋錯行為一致，呼叫端的錯誤處理完全不用改。
//   - 反應性：沿用 module-level store 作「本地快取」。初次載入 GET 全量填入；
//     create/update/remove 成功後以「後端回傳的實體」增量維護快取（不重新全量拉取，省流量）。
//   - id / updatedAt 一律以後端回傳為準（前端絕不自算）。
const API_BASE = '/api/template/members'

/** 後端回應 DTO（camelCase，對齊 TemplateMember）。注意：email / note 後端型別可為 null，解包時正規化為空字串 */
interface MemberResultDto {
  id: string
  name: string
  gender: TemplateMember['gender']
  birthDate: string
  idType: TemplateIdType
  nationalId: string
  phone: string
  email: string | null
  residenceCounty: string
  residenceTownship: string
  residenceAddress: string
  groupName: string
  positionCode: TemplatePositionCode
  qualifications: string[] | null
  status: TemplateMemberStatus
  note: string | null
  updatedAt: string
}

type MemberEnvelope = { success?: boolean; message?: string; data?: MemberResultDto }
type MemberListEnvelope = { success?: boolean; message?: string; data?: MemberResultDto[] }

/** DTO → TemplateMember：把後端可為 null 的 email / note / qualifications 正規化，符合前端非空型別 */
function fromDto(dto: MemberResultDto): TemplateMember {
  return {
    id: dto.id,
    name: dto.name,
    gender: dto.gender,
    birthDate: dto.birthDate,
    idType: dto.idType,
    nationalId: dto.nationalId,
    phone: dto.phone,
    email: dto.email ?? '',
    residenceCounty: dto.residenceCounty,
    residenceTownship: dto.residenceTownship,
    residenceAddress: dto.residenceAddress,
    groupName: dto.groupName,
    positionCode: dto.positionCode,
    qualifications: [...(dto.qualifications ?? [])],
    status: dto.status,
    note: dto.note ?? '',
    updatedAt: dto.updatedAt,
  }
}

/** 解包 ModelResult<T>：success===false 視為業務失敗，拋出後端繁中訊息 */
function unwrap<T>(result: { success?: boolean; message?: string; data?: T } | null | undefined, fallback: string): T {
  if (!result || result.success === false) {
    const message = result?.message?.trim()
    throw new Error(message ? message : fallback)
  }
  return result.data as T
}

/** 從 $fetch 拋出的 FetchError 萃取後端繁中訊息（body 為 ModelResult），無則回退到預設訊息 */
function messageFromError(error: unknown, fallback: string): string {
  const message = (error as { data?: { message?: string } })?.data?.message
  return message && message.trim() ? message : fallback
}

/** 從 FetchError 取 HTTP 狀態碼（相容 ofetch 的 statusCode / response.status） */
function statusOf(error: unknown): number | undefined {
  const e = error as { statusCode?: number; response?: { status?: number } }
  return e?.statusCode ?? e?.response?.status
}

// API 模式的「初次全量載入」狀態（多頁同時掛載時去重，只打一次 GET）
let apiLoaded = false
let apiLoadPromise: Promise<void> | null = null

/** API 模式：初次進入時 GET 全量填入本地快取（非同步；填 store 後 records 反應性自動更新畫面） */
function ensureLoaded(): void {
  if (apiLoaded || apiLoadPromise) return
  apiLoadPromise = $fetch<MemberListEnvelope>(API_BASE)
    .then((result) => {
      store.value = unwrap(result, '載入人員清單失敗').map(fromDto)
      apiLoaded = true
    })
    .catch((error) => {
      // 載入失敗不中斷頁面（清單維持空）；清掉 promise 讓下次進入頁面時可重試
      apiLoadPromise = null
      // eslint-disable-next-line no-console
      console.error('[useTemplateMembers] 載入人員清單失敗：', messageFromError(error, '無法連線後端'))
    })
}

export function useTemplateMembers() {
  // 模式旗標：來自 runtimeConfig.public.useApi（env NUXT_PUBLIC_USE_API=true 開啟），預設 false=mock
  const useApi = useRuntimeConfig().public.useApi === true

  if (useApi) ensureLoaded() // API 模式：觸發初次全量載入（去重）
  else ensureSeeded() // mock 模式：同步植入 24 筆種子（預設，離線可跑）

  /** 響應式清單（列表頁以 computed 過濾/排序；對外唯讀，變更請走 create/update/remove） */
  // 後端接軌：mock=種子；API=本地快取（由 ensureLoaded 以 GET /api/template/members 全量填入）
  const records = computed(() => store.value)

  // 後端接軌：GET /api/template/members/{id}（單筆直打後端，不走快取）
  async function getById(id: string): Promise<TemplateMember | undefined> {
    if (!useApi) {
      const found = store.value.find(member => member.id === id)
      return found ? cloneMember(found) : undefined
    }
    try {
      const result = await $fetch<MemberEnvelope>(`${API_BASE}/${id}`)
      return fromDto(unwrap(result, `找不到人員 ${id}`))
    } catch (error) {
      // 404（不存在）比照 mock 回 undefined，交由頁面顯示「查無此人員」；其餘錯誤上拋
      if (statusOf(error) === 404) return undefined
      throw new Error(messageFromError(error, `讀取人員 ${id} 失敗`))
    }
  }

  // 後端接軌：POST /api/template/members（成功以後端回傳實體 push 進本地快取，id/updatedAt 以後端為準）
  async function create(input: TemplateMemberInput): Promise<TemplateMember> {
    if (!useApi) {
      const created: TemplateMember = { ...input, qualifications: [...input.qualifications], id: nextId(), updatedAt: todayString() }
      store.value = [created, ...store.value]
      return cloneMember(created)
    }
    let result: MemberEnvelope
    try {
      result = await $fetch<MemberEnvelope>(API_BASE, { method: 'POST', body: input })
    } catch (error) {
      throw new Error(messageFromError(error, '新增人員失敗'))
    }
    const created = fromDto(unwrap(result, '新增人員失敗'))
    store.value = [created, ...store.value] // 增量更新快取（不重新全量拉取）
    return created
  }

  // 後端接軌：PUT /api/template/members/{id}（成功以後端回傳實體替換本地快取；不存在後端回 404 → 拋錯）
  async function update(id: string, input: TemplateMemberInput): Promise<TemplateMember> {
    if (!useApi) {
      const index = store.value.findIndex(member => member.id === id)
      if (index < 0) throw new Error(`找不到人員 ${id}`)
      const updated: TemplateMember = { ...input, qualifications: [...input.qualifications], id, updatedAt: todayString() }
      store.value = store.value.map((member, i) => (i === index ? updated : member))
      return cloneMember(updated)
    }
    let result: MemberEnvelope
    try {
      result = await $fetch<MemberEnvelope>(`${API_BASE}/${id}`, { method: 'PUT', body: input })
    } catch (error) {
      throw new Error(messageFromError(error, `更新人員 ${id} 失敗`))
    }
    const updated = fromDto(unwrap(result, `更新人員 ${id} 失敗`))
    store.value = store.value.map(member => (member.id === id ? updated : member)) // 增量替換快取
    return updated
  }

  // 後端接軌：DELETE /api/template/members/{id}（成功 204 無主體，不需解包；成功後從本地快取剔除）
  async function remove(id: string): Promise<void> {
    if (!useApi) {
      store.value = store.value.filter(member => member.id !== id)
      return
    }
    try {
      await $fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
    } catch (error) {
      throw new Error(messageFromError(error, `刪除人員 ${id} 失敗`))
    }
    store.value = store.value.filter(member => member.id !== id) // 剔除快取
  }

  return { records, getById, create, update, remove }
}
