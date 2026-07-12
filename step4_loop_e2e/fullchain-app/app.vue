<template>
  <div>
    <NuxtLayout>
      <NuxtPage :key="$route.fullPath" />
    </NuxtLayout>
    <!-- Nuxt UI 通知容器：useToast() 需要此元件才會顯示（先前未掛載，全站 toast 靜默失效） -->
    <UNotifications />
  </div>
</template>

<script setup lang="ts">
// 全域設置
</script>

<style>
/* 全域字體設定 */
html {
  font-family: "Inter", var(--ui-sys-font-family-default), sans-serif;
}

body {
  font-family: "Inter", var(--ui-sys-font-family-default), sans-serif;
  color: var(--ui-sys-color-on-surface);
  background-color: var(--ui-sys-color-surface-variant);
}
</style>
