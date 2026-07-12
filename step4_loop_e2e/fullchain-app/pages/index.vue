<!--
  首頁：直接導向 CRUD 標準範本主頁（/template/crud）。
  ssr:false（純 SPA），於 client 端 setup 立即 replace 導頁，不留歷史記錄。
  layout:false 避免導頁瞬間閃過任何 layout。
-->
<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
await navigateTo('/template/crud', { replace: true })
</script>
