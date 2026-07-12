<!-- 安全版 Teleport：延後到 onMounted 才掛載，避免 hard-load 時 target
     尚未插入文件產生壞 vnode（之後整頁 remount 時 unmount 即崩潰）。
     麵包屑動作鈕一律用本元件，勿用裸 <Teleport>。 -->
<template>
  <Teleport v-if="ready" :to="to">
    <slot />
  </Teleport>
</template>
<script setup lang="ts">
interface Props { to: string }
defineProps<Props>()
const ready = ref(false)
onMounted(() => { ready.value = true })
</script>
