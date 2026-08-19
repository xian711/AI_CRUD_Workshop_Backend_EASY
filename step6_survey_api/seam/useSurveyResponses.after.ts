// ============================================================
//  接後端「之後」——同一個檔，內部換成打 API
//  ⚠️ 跟 .before.ts 逐行比對，你會看到：
//     1. 上半部的型別區塊：**一個字都沒改**（那是跟後端共用的契約）
//     2. 最下面 return 的四個名字與型別：**一個字都沒改**
//     3. 改的只有每個 function 的「肚子裡面」
//  所以 pages/survey/index.vue 與 pages/survey/admin.vue **一行都不用動**。
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

const records = ref<SurveyResponse[]>([])

// ---------- 後端統一封裝 ModelResult<T>：{ success, message, data } ----------
interface ModelResult<T> { success?: boolean; message?: string; data?: T }

function unwrap<T>(result: ModelResult<T> | null | undefined, fallback: string): T {
  if (!result || result.success === false || result.data === undefined || result.data === null) {
    throw new Error(result?.message ?? fallback)
  }
  return result.data
}

function messageFromError(error: unknown, fallback: string): string {
  const data = (error as { data?: ModelResult<unknown> } | undefined)?.data
  return data?.message ?? (error instanceof Error ? error.message : fallback)
}

// ============================================================
//  ⬇⬇⬇ 跟 .before.ts 逐字相同的介面 ⬇⬇⬇
// ============================================================
export function useSurveyResponses() {
  async function loadAll(): Promise<SurveyResponse[]> {
    try {
      const result = await $fetch<ModelResult<SurveyResponse[]>>('/api/survey')
      records.value = unwrap(result, '讀取回覆失敗')
      return records.value
    } catch (error) {
      throw new Error(messageFromError(error, '讀取回覆失敗'))
    }
  }

  async function submit(input: SurveyResponseInput): Promise<SurveyResponse> {
    // 接縫已完成：原本這一行是那句 TODO 註解，現在換成真的呼叫
    // id 與 submittedAt 一律以後端回傳為準，前端不自算
    try {
      const result = await $fetch<ModelResult<SurveyResponse>>('/api/survey', {
        method: 'POST',
        body: input,
      })
      const created = unwrap(result, '送出失敗')
      records.value = [...records.value, created]
      return created
    } catch (error) {
      throw new Error(messageFromError(error, '送出失敗'))
    }
  }

  async function clearAll(): Promise<void> {
    try {
      await $fetch('/api/survey', { method: 'DELETE' })
      records.value = []
    } catch (error) {
      throw new Error(messageFromError(error, '清空失敗'))
    }
  }

  return { records, loadAll, submit, clearAll }
}
