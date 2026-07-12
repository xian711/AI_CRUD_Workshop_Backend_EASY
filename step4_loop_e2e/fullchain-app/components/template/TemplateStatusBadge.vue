<!--
  TemplateStatusBadge — 人員狀態徽章（在職 / 停用）
  範本角色：狀態 → 樣式以具名對照表定義（Replace Conditional with Lookup），
  避免各處散落 status === '在職' ? ... 的條件判斷。
  依 CLAUDE.md：在職 → success；停用 → neutral 膠囊（bg-surface-variant）。
-->
<template>
  <UBadge v-if="meta.color" :color="meta.color" variant="soft" size="sm">{{ meta.label }}</UBadge>
  <span
    v-else
    class="inline-flex items-center rounded-full bg-surface-variant px-2 py-0.5 text-label-small font-emphasis text-on-surface-variant"
  >{{ meta.label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TemplateMemberStatus } from '~/composables/useTemplateMembers'

const props = defineProps<{ status: TemplateMemberStatus }>()

// 狀態 → 樣式對照表：color 為 null 時走 neutral 膠囊
const STATUS_META: Record<TemplateMemberStatus, { label: string; color: 'success' | null }> = {
  在職: { label: '在職', color: 'success' },
  停用: { label: '停用', color: null },
}
const meta = computed(() => STATUS_META[props.status])
</script>
