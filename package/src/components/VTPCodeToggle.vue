<script lang="ts">
import type { VTPComponentProps } from '../types';

type VTPCodeToggleProps = VTPComponentProps;
</script>

<script setup lang="ts">
import { ref, onMounted, nextTick, getCurrentInstance } from 'vue';
import { normalizeQuotes } from './index';
import { TemplScriptManager } from '../script-manager';
import { useHighlighter } from '../highlighter';
import CodeIcon from './CodeIcon.vue';
import VTPCard from './VTPCard.vue';
import ComponentPreviewer from './ComponentPreviewer.vue';
import ComponentCoder from './ComponentCoder.vue';

const props = defineProps<VTPCodeToggleProps>();
const isCodeSectionVisible = ref(false);
const sanitizedHtmlContent = normalizeQuotes(props.htmlContent);
const scriptManager = TemplScriptManager.getInstance();
const { highlightedCode, highlightCode } = useHighlighter();

// Access the current instance to generate a unique ID
const instance = getCurrentInstance();
const uid = instance
  ? instance.uid.toString()
  : Math.random().toString(36).substring(2, 11);

function toggleCodeSection(): void {
  isCodeSectionVisible.value = !isCodeSectionVisible.value;
}

onMounted(async () => {
  await highlightCode(props.codeContent, props.themes);

  nextTick(() => {
    scriptManager.executeScriptsTick();
  });
});
</script>

<template>
  <VTPCard v-if="props.isPreviewOnly" v-bind="props" />
  <template v-else>
    <div class="container">
      <ComponentPreviewer :content="sanitizedHtmlContent" />
      <div class="code-section">
        <button
          :class="`button-${props.buttonStyle}`"
          :aria-controls="'code-content-' + uid"
          aria-label="view the source code"
          @click="toggleCodeSection"
        >
          <slot name="code-icon">
            <CodeIcon :fill="`var(--vp-button-${props.buttonStyle}-text)`" />
          </slot>
          {{ isCodeSectionVisible ? 'Hide Code' : 'Show Code' }}
        </button>
        <ComponentCoder
          v-if="highlightedCode && isCodeSectionVisible"
          :id="'code-content-' + uid"
          :content="highlightedCode"
          :aria-hidden="!isCodeSectionVisible"
        />
      </div>
    </div>
  </template>
</template>

<style scoped>
.container {
  margin-top: 1.5rem;
  padding-inline: 1.25rem;
  display: flex;
  flex-direction: column;
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
  margin-bottom: 1rem;
  color: var(--vp-button-alt-text);
  font-weight: 500;
  background-color: var(--vp-button-alt-bg);
  transition:
    color 0.25s,
    border-color 0.25s,
    background-color 0.25s;
  border-radius: 1.25rem;
  padding: 0 1.25rem;
  line-height: 2.25rem;
  font-size: 14px;
}

.button-alt {
  color: var(--vp-button-alt-text);
  background-color: var(--vp-button-alt-bg);
}

.button-alt:hover {
  border-color: var(--vp-button-alt-hover-border);
  color: var(--vp-button-alt-hover-text);
  background-color: var(--vp-button-alt-hover-bg);
}

.button-brand {
  color: var(--vp-button-brand-text);
  background-color: var(--vp-button-brand-bg);
}

.button-brand:hover {
  border-color: var(--vp-button-brand-hover-border);
  color: var(--vp-button-brand-hover-text);
  background-color: var(--vp-button-brand-hover-bg);
}
</style>
