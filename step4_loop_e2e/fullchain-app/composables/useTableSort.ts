/**
 * useTableSort — 多欄位（依優先順序）排序狀態與邏輯
 *
 * 用於裝備物資等表格頁面，集中管理排序規則並提供：
 *   - sortRows()：依規則排序資料
 *   - 排序面板（AppSortPanel）的操作方法（add/remove/move/clear/reset）
 *   - 表頭（AppSortHeader）的快速單欄排序與顯示輔助（setSingle/priorityOf/dirOf）
 *
 * 各欄排序值可透過 accessors 覆寫，例如分類依 CATEGORIES 原始順序而非中文 localeCompare。
 */
import { ref, computed } from 'vue'

export interface SortRule {
  key: string
  dir: 'asc' | 'desc'
}

export interface SortableColumn {
  key: string
  label: string
}

export function useTableSort(opts: {
  columns: SortableColumn[]
  defaultRules?: SortRule[]
  accessors?: Record<string, (row: any) => string | number>
}) {
  const { columns, accessors } = opts
  const defaultRules: SortRule[] = opts.defaultRules ?? []

  const rules = ref<SortRule[]>(defaultRules.map(r => ({ ...r })))

  function valueOf(row: any, key: string): string | number {
    const acc = accessors?.[key]
    if (acc) return acc(row)
    return row?.[key] ?? ''
  }

  function compare(a: any, b: any): number {
    for (const r of rules.value) {
      const av = valueOf(a, r.key)
      const bv = valueOf(b, r.key)
      let cmp: number
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv
      } else {
        cmp = String(av).localeCompare(String(bv), 'zh-TW')
      }
      if (cmp !== 0) return r.dir === 'asc' ? cmp : -cmp
    }
    return 0
  }

  function sortRows<T>(rows: T[]): T[] {
    if (rules.value.length === 0) return rows
    return [...rows].sort(compare)
  }

  const usedKeys = computed(() => new Set(rules.value.map(r => r.key)))

  function firstUnusedKey(): string | null {
    const used = usedKeys.value
    return columns.find(c => !used.has(c.key))?.key ?? null
  }

  function addRule() {
    const key = firstUnusedKey()
    if (!key) return
    rules.value = [...rules.value, { key, dir: 'asc' }]
  }

  function removeRule(index: number) {
    rules.value = rules.value.filter((_, i) => i !== index)
  }

  function move(index: number, dir: 'up' | 'down') {
    const target = dir === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= rules.value.length) return
    const next = [...rules.value]
    ;[next[index], next[target]] = [next[target], next[index]]
    rules.value = next
  }

  /** 表頭點擊：若已是唯一主排序則切換升降，否則設為該欄單一排序 */
  function setSingle(key: string) {
    const cur = rules.value
    if (cur.length === 1 && cur[0].key === key) {
      rules.value = [{ key, dir: cur[0].dir === 'asc' ? 'desc' : 'asc' }]
    } else {
      rules.value = [{ key, dir: 'asc' }]
    }
  }

  function priorityOf(key: string): number | null {
    const idx = rules.value.findIndex(r => r.key === key)
    return idx < 0 ? null : idx + 1
  }

  function dirOf(key: string): 'asc' | 'desc' | null {
    return rules.value.find(r => r.key === key)?.dir ?? null
  }

  function clear() {
    rules.value = []
  }

  function reset() {
    rules.value = defaultRules.map(r => ({ ...r }))
  }

  return {
    rules,
    sortRows,
    addRule,
    removeRule,
    move,
    setSingle,
    priorityOf,
    dirOf,
    clear,
    reset,
    usedKeys,
    columns,
  }
}
