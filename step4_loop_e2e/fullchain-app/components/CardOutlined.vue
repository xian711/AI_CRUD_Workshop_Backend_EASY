<template>
  <UCard
    class="outlined-card"
    v-bind="$attrs"
  >
    <slot />
    <template v-for="(_, name) in $slots" v-slot:[name]="slotData">
      <slot :name="name" v-bind="slotData" />
    </template>
  </UCard>
</template>

<script setup lang="ts">
// Outlined Card - 使用設計系統的 outlined 樣式
</script>

<style scoped>
.outlined-card {
  border: 1px solid var(--ui-sys-color-outline-variant);
}
</style>
