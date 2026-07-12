<!--
  default layout — 直接 re-export template layout。
  範本頁都以 definePageMeta({ layout: 'template' }) 明確指定 layout；
  本檔確保「未指定 layout 名稱」的頁面（例如未來新增的頁）也能套到同一套 chrome，
  避免出現無 header／無麵包屑注入點的裸頁。
  以 <NuxtLayout name="template"> 巢狀包裹 slot，內容零重複（DRY），單一事實來源仍是 template.vue。
-->
<template>
  <NuxtLayout name="template">
    <slot />
  </NuxtLayout>
</template>
