<!--
  CRUD 標準範本專屬 Layout（平時模組：白／淡色）
  ────────────────────────────────────────────────
  取代原本借用的 township layout：不含公所紅色裝飾標題橫幅、公所 LOGO 與六大群組選單。

  設計來源：ui-dev 0327 的 layouts/default.vue + components/AppHeader.vue + AppSidebar.vue。
  採用其「乾淨 Header（白底、簡單 LOGO/標題）＋ 左側 sidebar ＋ 麵包屑」的結構與 design token；
  刻意捨棄 0327 AppHeader 的主題切換／字級調整／使用者選單／深色模式等 chrome，保持精簡。

  全部使用 SYS token 別名（surface / surface-variant / primary…），零 hex、零 REF token。
-->
<template>
  <div class="flex h-screen flex-col overflow-hidden">
    <!-- 乾淨 Header：白底 + 單一 LOGO + 文字標題（無紅色裝飾橫幅） -->
    <header class="sticky top-0 z-50 flex-shrink-0 border-b border-outline-variant bg-surface">
      <div class="flex h-16 items-center gap-3 px-4 md:px-6">
        <!-- LOGO 底色直引 SYS token：Tailwind 的 bg-primary 別名在 Nuxt UI v2 執行期
             會被其內建 runtime 色（綠）劫持，與品牌紅不一致（E2E 實測），故不用別名 -->
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--ui-sys-color-primary)]">
          <UIcon name="i-heroicons-cube" class="h-6 w-6 text-on-primary" />
        </div>
        <h1 class="truncate text-headline-medium font-heavy text-on-surface">
          防災協作平台 — 開發標準範本
        </h1>
      </div>
    </header>

    <!-- 主內容區 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 左側 sidebar（md 以上顯示；平時白底淡色，僅兩項選單） -->
      <aside class="hidden w-56 flex-shrink-0 flex-col overflow-y-auto border-r border-outline-variant bg-surface md:flex">
        <nav class="space-y-1 p-3" aria-label="範本導航">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            :class="[
              'group flex items-center gap-3 rounded-md px-3 py-2.5 text-body-medium font-emphasis transition-colors',
              isActive(link.to)
                ? 'bg-primary-container text-on-primary-container font-heavy'
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface',
            ]"
          >
            <UIcon :name="link.icon" class="h-5 w-5 flex-shrink-0" />
            <span>{{ link.label }}</span>
          </NuxtLink>
        </nav>
      </aside>

      <!-- 內容主欄 -->
      <main class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <!-- 手機（md 以下）：頂部橫向兩顆 tab 取代 sidebar（簡化 0327 的 drawer） -->
        <nav class="flex gap-1 border-b border-outline-variant bg-surface px-2 py-2 md:hidden" aria-label="範本導航">
          <NuxtLink
            v-for="link in navLinks"
            :key="`m-${link.to}`"
            :to="link.to"
            :class="[
              'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-body-medium font-emphasis transition-colors',
              isActive(link.to)
                ? 'bg-primary-container text-on-primary-container font-heavy'
                : 'text-on-surface-variant hover:bg-surface-variant',
            ]"
          >
            <UIcon :name="link.icon" class="h-5 w-5 flex-shrink-0" />
            <span>{{ link.label }}</span>
          </NuxtLink>
        </nav>

        <!-- 麵包屑（frontend 版；內含 #breadcrumb-actions 與 #breadcrumb-actions-left Teleport 注入點）
             恆渲染、不包在任何 v-if 條件後，確保頁面 hard-load 時注入點即刻可用（配合頁面的 teleportReady 時序）。 -->
        <AppBreadcrumb :page-title="pageTitle" :breadcrumbs="breadcrumbs" />

        <!-- 頁面內容（可捲動，平時淡灰底 surface-variant） -->
        <div class="flex-1 overflow-y-auto bg-surface-variant">
          <div class="p-6">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// 選單：人員管理（範本 CRUD 主頁）／中心裝備物資（新模組）／範本說明（靜態導覽）
const navLinks = [
  { to: '/template/crud', label: '人員管理', icon: 'i-heroicons-users' },
  { to: '/equipment/crud', label: '裝備物資', icon: 'i-heroicons-cube' },
  { to: '/template/about', label: '範本說明', icon: 'i-heroicons-book-open' },
] as const

// 目前路由高亮：精確命中或子路徑（/template/crud/[id]、/new）皆算命中
function isActive(to: string): boolean {
  return route.path === to || route.path.startsWith(`${to}/`)
}

// 動態頁標題：useState 覆寫優先於 route.meta.pageTitle（參考 township layout 的 pageTitle 處理，但簡化）
// 明細頁（[id].vue）以 useState('template-page-title-override') 寫入「檢視／編輯／新增人員」。
const pageTitleOverride = useState<string | null>('template-page-title-override', () => null)
const pageTitle = computed(
  () => pageTitleOverride.value || (route.meta.pageTitle as string) || '開發標準範本',
)

// 麵包屑：頂層頁只顯示當頁標題；子頁顯示「選單 › 當頁標題」。
// 恆回傳至少一項 → AppBreadcrumb 恆為麵包屑模式，不會顯示首頁的「所屬單位」下拉。
const breadcrumbs = computed(() => {
  const parent = navLinks.find(link => isActive(link.to))
  if (!parent) return [{ label: pageTitle.value }]
  if (route.path !== parent.to) {
    return [
      { label: parent.label, to: parent.to, icon: parent.icon },
      { label: pageTitle.value },
    ]
  }
  return [{ label: pageTitle.value, icon: parent.icon }]
})
</script>
