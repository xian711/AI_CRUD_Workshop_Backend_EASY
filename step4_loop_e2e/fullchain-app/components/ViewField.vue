<!-- 檢視 Modal 用的 label + value 欄位 -->
<template>
  <div>
    <div class="text-label-small text-on-surface-variant mb-0.5">{{ label }}</div>
    <div class="text-body-medium text-on-surface font-emphasis">{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string }>()
</script>
