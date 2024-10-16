<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{ content: string }>();
</script>

<template>
  <div class="preview-content" v-html="props.content" />
</template>

<style scoped>
.preview-content {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  flex-flow: row wrap;
  gap: 0.5rem;
  margin-block: 1rem;
  padding: 1rem;
  background-image: repeating-linear-gradient(
    135deg,
    var(--vp-c-border) 0,
    var(--vp-c-border) 1px,
    transparent 1px,
    transparent 11px
  );
  background-size: 6px 6px;
}
</style>
