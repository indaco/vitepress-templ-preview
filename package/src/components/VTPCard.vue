<script lang="ts">
import type { VTPComponentProps } from '../types';

type VTPCardProps = VTPComponentProps;
</script>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue';
import { normalizeQuotes } from './index';
import { TemplScriptManager } from '../script-manager';
import { useHighlighter } from '../highlighter';
import ConditionalWrapper from './ConditionalWrapper.vue';
import ComponentPreviewer from './ComponentPreviewer.vue';
import ComponentCoder from './ComponentCoder.vue';

const props = defineProps<VTPCardProps>();
const sanitizedHtmlContent = normalizeQuotes(props.htmlContent);
const { highlightedCode, highlightCode } = useHighlighter();
const scriptManager = TemplScriptManager.getInstance();

onMounted(async () => {
  await highlightCode(props.codeContent, props.themes);

  nextTick(() => {
    scriptManager.executeScriptsTick();
  });
});
</script>

<template>
  <div class="container">
    <ConditionalWrapper :is-preview-first="props.isPreviewFirst">
      <template #preview>
        <ComponentPreviewer :content="sanitizedHtmlContent" />
      </template>
      <template v-if="!props.isPreviewOnly" #code>
        <ComponentCoder v-if="highlightedCode" :content="highlightedCode" />
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
  padding-inline: 1.25rem;
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
</style>
