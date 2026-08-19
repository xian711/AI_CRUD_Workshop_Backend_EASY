// ============================================================
//  接後端「之前」——前端課的版本，資料存 localStorage
//  這是 PRD BR-4 / BR-7 的實作：資料在瀏覽器，並留好接縫
//  ⚠️ 你自己前端課做出來的版本不會跟這份逐字一樣，那沒關係。
//     重點只有一件事：**下方 return 的那幾個名字**。
// ============================================================

// ---------- 契約型別（10 欄：8 題 + id + submittedAt）----------
export type Satisfaction = 1 | 2 | 3 | 4 | 5
export type BestSection = 'why-harness' | 'template-rules' | 'new-module' | 'loop-verify'
export type Difficulty = 'too-easy' | 'just-right' | 'too-hard'
export type AdoptFirst = 'code-rules' | 'template' | 'prd-flow' | 'loop'

export interface SurveyResponse {
  id: string
  name: string
  org: string
  satisfaction: Satisfaction
  bestSection: BestSection
  difficulty: Difficulty
  adoptFirst: AdoptFirst
  comment: string
  wouldRecommend: boolean
  submittedAt: string        // 'YYYY-MM-DD HH:mm'
}

export type SurveyResponseInput = Omit<SurveyResponse, 'id' | 'submittedAt'>

const STORAGE_KEY = 'course-survey-responses'
const records = ref<SurveyResponse[]>([])

function readStorage(): SurveyResponse[] {
  if (!import.meta.client) return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as SurveyResponse[] }
  catch { return [] }
}

function writeStorage(list: SurveyResponse[]): void {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function nowString(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// ============================================================
//  ⬇⬇⬇ 這個 function 匯出的東西，就是「呼叫端看得到的介面」 ⬇⬇⬇
//  接後端時，下面 return 的四個名字與它們的參數／回傳型別，一個字都不能動。
// ============================================================
export function useSurveyResponses() {
  async function loadAll(): Promise<SurveyResponse[]> {
    records.value = readStorage()
    return records.value
  }

  async function submit(input: SurveyResponseInput): Promise<SurveyResponse> {
    // TODO: DEV 串接 POST /api/survey
    const list = readStorage()
    const created: SurveyResponse = {
      ...input,
      id: String(list.length + 1),
      submittedAt: nowString(),
    }
    list.push(created)
    writeStorage(list)
    records.value = list
    return created
  }

  async function clearAll(): Promise<void> {
    writeStorage([])
    records.value = []
  }

  return { records, loadAll, submit, clearAll }
}
