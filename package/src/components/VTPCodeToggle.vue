<script lang="ts">
import type { Ref } from 'vue';
import type { VTPComponentProps } from '../types';

interface VTPCodeToggleProps extends VTPComponentProps {}
</script>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { executeScriptsTick, useHighlighter } from '../shared';
import CodeIcon from './CodeIcon.vue';
import VTPCard from './VTPCard.vue';

const props = defineProps<VTPCodeToggleProps>();
const isCodeSectionVisible: Ref<boolean> = ref(false);
const { highlightedCode, highlightCode } = useHighlighter();

function toggleCodeSection(): void {
  isCodeSectionVisible.value = !isCodeSectionVisible.value;
}

onMounted(async () => {
  await highlightCode(props.codeContent, props.themes);

  nextTick(() => {
    executeScriptsTick();
  });
});
</script>

<template>
  <VTPCard v-if="props.isPreviewOnly" v-bind="props" />
  <template v-else>
    <div class="container">
      <div class="preview">
        <div class="preview-content" v-html="props.htmlContent"></div>
      </div>
      <div class="code-section">
        <button
          @click="toggleCodeSection"
          :class="`button-${props.buttonStyle}`"
          aria-label="view the source code"
        >
          <slot name="code-icon">
            <CodeIcon :fill="`var(--vp-button-${props.buttonStyle}-text)`" />
          </slot>
          {{ isCodeSectionVisible ? 'Hide Code' : 'Show Code' }}
        </button>
        <div class="code-content" :aria-hidden="!isCodeSectionVisible">
          <div>
            <div class="language-templ vp-adaptive-theme">
              <button title="Copy Code" class="copy"></button>
              <span class="lang">templ</span>
              <span class="vp-code" v-html="highlightedCode"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
.container {
  margin-top: 1.5rem;
  padding: 1.25rem;
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

.preview-content {
  display: flex;
  justify-content: center;
  flex-flow: row wrap;
  row-gap: 0.75rem;
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

.code-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 500ms;
  background-color: var(--vp-code-block-bg);
  border-radius: 5px;
}

.code-content[aria-hidden='false'] {
  grid-template-rows: 1fr;
}

.code-content > div {
  overflow: hidden;
}
</style>
