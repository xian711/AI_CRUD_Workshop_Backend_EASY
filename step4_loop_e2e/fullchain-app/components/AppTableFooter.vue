<template>
  <div
    class="flex flex-wrap items-center justify-between gap-sm pt-md border-t border-outline-variant"
  >
    <!-- Left: Pagination -->
    <AppPagination
      :model-value="resolvedPage"
      :total="totalPages"
      @update:model-value="onPageChange"
    />

    <!-- Center: 每頁筆數 -->
    <div class="flex items-center gap-xs">
      <span
        class="text-body-medium text-on-surface-variant"
        style="font-family: 'Inter', var(--ui-sys-font-family-default), sans-serif;"
      >
        每頁
      </span>
      <USelect
        :model-value="String(pageSize)"
        :options="pageSizeOptions.map(String)"
        size="sm"
        class="w-20"
        :ui="{
          base: 'text-body-medium',
          rounded: 'rounded-md',
          color: {
            white: {
              outline: 'bg-surface border border-outline-variant text-on-surface focus:ring-2 focus:ring-primary-container focus:border-primary'
            }
          }
        }"
        @update:model-value="$emit('update:pageSize', Number($event))"
        aria-label="每頁筆數"
      />
      <span
        class="text-body-medium text-on-surface-variant"
        style="font-family: 'Inter', var(--ui-sys-font-family-default), sans-serif;"
      >
        筆
      </span>
    </div>

    <!-- Right: 統計文字 -->
    <p
      class="text-body-medium text-on-surface-variant"
      style="font-family: 'Inter', var(--ui-sys-font-family-default), sans-serif;"
    >
      第 {{ rangeStart }} 至 {{ rangeEnd }} 項，共 {{ resolvedTotal }} 筆
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  // canonical names
  currentPage?: number
  totalItems?: number
  pageSize?: number
  pageSizeOptions?: number[]
  // legacy aliases used by most pages
  page?: number
  total?: number
}

const props = withDefaults(defineProps<Props>(), {
  pageSizeOptions: () => [10, 20, 50, 100],
  pageSize: 10,
})

const emit = defineEmits<{
  'update:currentPage': [value: number]
  'update:page': [value: number]
  'update:pageSize': [value: number]
}>()

// resolve aliases
const resolvedPage = computed(() => props.currentPage ?? props.page ?? 1)
const resolvedTotal = computed(() => props.totalItems ?? props.total ?? 0)
const resolvedPageSize = computed(() => props.pageSize ?? 10)

function onPageChange(val: number) {
  emit('update:currentPage', val)
  emit('update:page', val)
}

const totalPages = computed(() => Math.max(1, Math.ceil(resolvedTotal.value / resolvedPageSize.value)))

const rangeStart = computed(() => {
  if (resolvedTotal.value === 0) return 0
  return (resolvedPage.value - 1) * resolvedPageSize.value + 1
})

const rangeEnd = computed(() =>
  Math.min(resolvedPage.value * resolvedPageSize.value, resolvedTotal.value)
)
</script>
