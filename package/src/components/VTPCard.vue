<script setup lang="ts">
import type { VTPComponentProps } from '../types';
import { onMounted, nextTick } from 'vue';
import { executeScriptsTick, useHighlighter } from '../shared';
import ConditionalWrapper from './ConditionalWrapper.vue';

const props = defineProps<VTPComponentProps>();
const { highlightedCode, highlightCode } = useHighlighter();

onMounted(async () => {
  await highlightCode(props.codeContent, props.themes);

  nextTick(() => {
    executeScriptsTick();
  });
});
</script>

<template>
  <div class="container">
    <ConditionalWrapper :isPreviewFirst="props.isPreviewFirst">
      <template #preview>
        <div class="preview">
          <div class="preview-content" v-html="props.htmlContent"></div>
        </div>
      </template>
      <template #code v-if="!props.isPreviewOnly">
        <div class="code-content">
          <div class="language-templ vp-adaptive-theme">
            <button title="Copy Code" class="copy"></button>
            <span class="lang">templ</span>
            <span class="vp-code" v-html="highlightedCode"></span>
          </div>
        </div>
      </template>
    </ConditionalWrapper>
  </div>
</template>

<style scoped>
.container {
  margin-top: 1.5rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 5px;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
}

.container h3 {
  margin: 0;
  margin-bottom: 0.5rem;
}

.preview {
  margin-block: 1rem;
}

.preview-content {
  display: flex;
  justify-content: center;
}

button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 10px;
  color: var(--vp-button-brand-text);
  font-weight: 500;
  background-color: var(--vp-button-brand-bg);
  transition:
    color 0.25s,
    border-color 0.25s,
    background-color 0.25s;
  border-radius: 20px;
  padding: 0 20px;
  line-height: 38px;
  font-size: 14px;
}

button:hover {
  border-color: var(--vp-button-brand-hover-border);
  color: var(--vp-button-brand-hover-text);
  background-color: var(--vp-button-brand-hover-bg);
}

.code-content {
  display: grid;
  grid-template-rows: 1fr;
  margin-block: 1rem;
  background-color: var(--vp-code-block-bg);
  border-radius: 5px;
}
</style>
