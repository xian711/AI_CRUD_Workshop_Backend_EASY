<script setup lang="ts">
interface Props {
  modelValue: number    // current page (1-based)
  total: number         // total number of pages
  siblings?: number     // pages on each side of current
  showFirstLast?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  siblings: 1,
  showFirstLast: true
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const goTo = (page: number) => {
  if (page < 1 || page > props.total || page === props.modelValue) return
  emit('update:modelValue', page)
}

const visiblePages = computed(() => {
  const pages: (number | '...')[] = []
  const { modelValue: current, total, siblings } = props

  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i)

  if (total <= 7) {
    return range(1, total)
  }

  const leftSiblingIndex = Math.max(current - siblings, 1)
  const rightSiblingIndex = Math.min(current + siblings, total)

  const showLeftDots = leftSiblingIndex > 2
  const showRightDots = rightSiblingIndex < total - 1

  if (!showLeftDots && showRightDots) {
    const leftRange = range(1, 3 + siblings * 2)
    return [...leftRange, '...', total]
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = range(total - (3 + siblings * 2 - 1), total)
    return [1, '...', ...rightRange]
  }

  const middleRange = range(leftSiblingIndex, rightSiblingIndex)
  return [1, '...', ...middleRange, '...', total]
})
</script>

<template>
  <nav class="flex items-center gap-xs" aria-label="分頁導航" role="navigation">
    <!-- Previous -->
    <button
      @click="goTo(modelValue - 1)"
      :disabled="modelValue <= 1"
      class="flex items-center justify-center rounded-[var(--ui-comp-pagination-btn-radius)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
      :style="`width: var(--ui-comp-pagination-btn-size); height: var(--ui-comp-pagination-btn-size);`"
      :class="modelValue <= 1
        ? 'text-[var(--ui-comp-pagination-btn-text-disabled)] cursor-not-allowed bg-[var(--ui-comp-pagination-btn-bg-default)] border border-[var(--ui-comp-pagination-btn-border-default)]'
        : 'bg-[var(--ui-comp-pagination-btn-bg-default)] border border-[var(--ui-comp-pagination-btn-border-default)] text-[var(--ui-comp-pagination-btn-text-default)] hover:border-[var(--ui-comp-pagination-btn-border-hover)] hover:text-[var(--ui-comp-pagination-btn-text-hover)]'"
      aria-label="上一頁"
      :aria-disabled="modelValue <= 1"
    >
      <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
    </button>

    <!-- Page numbers -->
    <template v-for="(page, index) in visiblePages" :key="index">
      <!-- Ellipsis -->
      <span
        v-if="page === '...'"
        class="flex items-center justify-center text-[var(--ui-comp-pagination-btn-text-disabled)]"
        :style="`width: var(--ui-comp-pagination-btn-size); height: var(--ui-comp-pagination-btn-size);`"
        aria-hidden="true"
      >...</span>

      <!-- Page button -->
      <button
        v-else
        @click="goTo(page as number)"
        class="flex items-center justify-center text-label-small font-strong rounded-[var(--ui-comp-pagination-btn-radius)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
        :style="`width: var(--ui-comp-pagination-btn-size); height: var(--ui-comp-pagination-btn-size);`"
        :class="page === modelValue
          ? 'bg-[var(--ui-comp-pagination-btn-bg-active)] border border-[var(--ui-comp-pagination-btn-border-active)] text-[var(--ui-comp-pagination-btn-text-active)]'
          : 'bg-[var(--ui-comp-pagination-btn-bg-default)] border border-[var(--ui-comp-pagination-btn-border-default)] text-[var(--ui-comp-pagination-btn-text-default)] hover:border-[var(--ui-comp-pagination-btn-border-hover)] hover:text-[var(--ui-comp-pagination-btn-text-hover)]'"
        :aria-label="`第 ${page} 頁`"
        :aria-current="page === modelValue ? 'page' : undefined"
      >{{ page }}</button>
    </template>

    <!-- Next -->
    <button
      @click="goTo(modelValue + 1)"
      :disabled="modelValue >= total"
      class="flex items-center justify-center rounded-[var(--ui-comp-pagination-btn-radius)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
      :style="`width: var(--ui-comp-pagination-btn-size); height: var(--ui-comp-pagination-btn-size);`"
      :class="modelValue >= total
        ? 'text-[var(--ui-comp-pagination-btn-text-disabled)] cursor-not-allowed bg-[var(--ui-comp-pagination-btn-bg-default)] border border-[var(--ui-comp-pagination-btn-border-default)]'
        : 'bg-[var(--ui-comp-pagination-btn-bg-default)] border border-[var(--ui-comp-pagination-btn-border-default)] text-[var(--ui-comp-pagination-btn-text-default)] hover:border-[var(--ui-comp-pagination-btn-border-hover)] hover:text-[var(--ui-comp-pagination-btn-text-hover)]'"
      aria-label="下一頁"
      :aria-disabled="modelValue >= total"
    >
      <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
    </button>
  </nav>
</template>
