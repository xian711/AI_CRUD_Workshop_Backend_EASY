<!-- 對應元件：表格可排序欄位表頭（label + 方向箭頭）
     檔案：components/AppSortHeader.vue
     搭配 useTableSort 使用：點擊做快速單欄排序；參與排序的欄位以 primary 色標示，
     完整優先順序於「排序」面板呈現（表頭不顯示序號，比照 Excel） -->
<template>
  <button
    type="button"
    class="group inline-flex items-center gap-1 -mx-1 px-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
    :class="priority ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'"
    :aria-label="`依${label}排序`"
    @click.stop="emit('click')"
  >
    <span>{{ label }}</span>
    <UIcon
      :name="dir === 'asc' ? 'i-heroicons-chevron-up' : dir === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-arrows-up-down'"
      class="h-4 w-4 shrink-0"
      :class="dir ? 'opacity-100' : 'opacity-30 group-hover:opacity-60'"
    />
  </button>
</template>

<script setup lang="ts">
interface Props {
  label: string
  priority?: number | null
  dir?: 'asc' | 'desc' | null
}
withDefaults(defineProps<Props>(), {
  priority: null,
  dir: null,
})
const emit = defineEmits<{ click: [] }>()
</script>
