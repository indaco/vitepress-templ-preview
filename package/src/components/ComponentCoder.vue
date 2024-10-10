<script setup lang="ts">
import { defineProps, watch, ref } from 'vue';

const props = defineProps<{ content: string }>();
const internalContent = ref(props.content);

// Watch for changes in the content prop and update internalContent
watch(
  () => props.content,
  (newContent) => {
    internalContent.value = newContent;
  },
);
</script>

<template>
  <div class="code-content">
    <div class="language-templ vp-adaptive-theme">
      <button title="Copy Code" class="copy" />
      <span class="lang">templ</span>
      <span class="vp-code" v-html="internalContent" />
    </div>
  </div>
</template>

<style scoped>
.code-content {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 500ms;
  background-color: var(--vp-code-block-bg);
  border-radius: 0.25rem;
  margin-block: 1rem;
}

.code-content[aria-hidden='false'] {
  grid-template-rows: 1fr;
  margin-block: 0;
}

.code-content[aria-hidden='true'] {
  grid-template-rows: 0fr;
}

.code-content > div {
  overflow: hidden;
}
</style>
