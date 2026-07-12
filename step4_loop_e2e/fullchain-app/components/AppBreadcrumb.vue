<template>
  <div
    class="border-b border-outline-variant px-4 md:px-6 py-2 transition-colors"
    :class="background ? '' : 'bg-surface'"
    :style="rootStyle"
  >
    <!-- 單列：麵包屑/標題 + 右側動作/內容 全部同一行 -->
    <div class="flex items-center justify-between gap-3 min-h-[36px] flex-wrap md:flex-nowrap">
      <!-- Left: 麵包屑模式 or 標題模式 -->
      <div class="flex items-center min-w-0">
        <!-- 麵包屑模式 -->
        <nav v-if="isBreadcrumbMode" class="flex items-center gap-1.5 md:gap-2 min-w-0" aria-label="麵包屑導航">
          <template v-for="(crumb, i) in breadcrumbs" :key="i">
            <UIcon
              v-if="i > 0"
              name="i-heroicons-chevron-right"
              class="w-4 h-4 text-on-surface-variant flex-shrink-0"
            />
            <div class="flex items-center gap-1">
              <UIcon
                v-if="crumb.icon"
                :name="crumb.icon"
                class="w-4 h-4 text-on-surface-variant flex-shrink-0"
              />
              <!-- 當頁（最後一項）：h2 字級 -->
              <span
                v-if="i === breadcrumbs.length - 1"
                class="text-[length:clamp(20px,1.8vw,24px)] font-heavy text-on-surface truncate"
                style="font-family: 'Inter', var(--ui-sys-font-family-default), sans-serif;"
              >{{ crumb.label }}</span>
              <!-- 上層路徑 -->
              <NuxtLink
                v-else-if="crumb.to"
                :to="crumb.to"
                class="text-body-medium text-on-surface-variant hover:text-on-surface transition-colors"
                style="font-family: 'Inter', var(--ui-sys-font-family-default), sans-serif;"
              >{{ crumb.label }}</NuxtLink>
              <span
                v-else
                class="text-body-medium text-on-surface-variant"
                style="font-family: 'Inter', var(--ui-sys-font-family-default), sans-serif;"
              >{{ crumb.label }}</span>
            </div>
          </template>
        </nav>

        <!-- 標題模式 -->
        <h2
          v-else
          class="text-[length:clamp(20px,1.8vw,24px)] font-heavy text-on-surface"
          style="font-family: 'Inter', var(--ui-sys-font-family-default), sans-serif;"
        >
          {{ pageTitle }}
        </h2>
      </div>

      <!-- Right: 首頁所屬單位選擇器（標題模式）或 Teleport 動作按鈕（麵包屑模式） -->
      <div class="flex items-center gap-2 shrink-0 flex-wrap">
        <!-- Teleport 注入點：左側動作按鈕（返回等） -->
        <div id="breadcrumb-actions-left" class="flex items-center gap-2 flex-wrap"></div>
        <template v-if="!isBreadcrumbMode">
          <label
            for="org-select"
            class="text-label-medium font-emphasis text-on-surface-variant whitespace-nowrap"
          >
            所屬單位
          </label>
          <USelect
            id="org-select"
            v-model="selectedOrg"
            :options="organizations"
            placeholder="請選擇單位"
            class="w-64"
            size="md"
          />
        </template>
        <!-- Teleport 注入點：右側動作按鈕（所有頁面共用） -->
        <div id="breadcrumb-actions" class="flex items-center gap-2 flex-wrap"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
  icon?: string
}

interface Props {
  pageTitle?: string
  breadcrumbs?: BreadcrumbItem[]
  /** 覆蓋麵包屑背景色（例：災時套整頁淺橘）；未傳則預設 bg-surface */
  background?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  pageTitle: '首頁',
  breadcrumbs: () => [],
  background: null,
})

const rootStyle = computed(() =>
  props.background ? { backgroundColor: props.background } : undefined,
)

const isBreadcrumbMode = computed(() => props.breadcrumbs.length > 0)

const selectedOrg = ref('臺北市指揮機關')

const organizations = [
  '臺北市指揮機關',
  '新北市指揮機關',
  '桃園市指揮機關',
  '臺中市指揮機關',
  '臺南市指揮機關',
  '高雄市指揮機關'
]
</script>

<style>
/* 當動作列的兩個子 div 都沒有子元素時，隱藏整個動作列 */
.breadcrumb-action-bar:not(:has(> div > *)) {
  display: none;
}
</style>
