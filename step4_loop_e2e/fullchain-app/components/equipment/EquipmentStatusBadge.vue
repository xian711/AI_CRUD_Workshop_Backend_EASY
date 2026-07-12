<!--
  EquipmentStatusBadge — 裝備狀態徽章（正常 / 維修中 / 已報廢）
  角色：狀態 → 樣式以具名對照表定義（Replace Conditional with Lookup），
  避免各處散落 status === 'normal' ? ... 的條件判斷。
  配色：正常＝success（綠）、維修中＝warning（黃）、已報廢＝error（紅）。
-->
<template>
  <UBadge :color="meta.color" variant="soft" size="sm">{{ meta.label }}</UBadge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { EQUIPMENT_STATUS_META, type EquipmentStatus } from '~/composables/useEquipmentItems'

const props = defineProps<{ status: EquipmentStatus }>()

// 狀態 → 徽章配色對照表
const STATUS_COLOR: Record<EquipmentStatus, 'success' | 'warning' | 'error'> = {
  normal: 'success',
  maintenance: 'warning',
  scrapped: 'error',
}
const meta = computed(() => ({
  label: EQUIPMENT_STATUS_META[props.status],
  color: STATUS_COLOR[props.status],
}))
</script>
