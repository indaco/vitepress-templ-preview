<script lang="ts">
import type { VTPComponentProps } from '../types';

interface VTPIconTabsProps extends VTPComponentProps {}
</script>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, getCurrentInstance } from 'vue';
import ViewIcon from './ViewIcon.vue';
import CodeIcon from './CodeIcon.vue';
import VTPCard from './VTPCard.vue';
import { executeScriptsTick, useHighlighter } from '../shared';

const props = defineProps<VTPIconTabsProps>();
const activeTab = ref('preview');
const { highlightedCode, highlightCode } = useHighlighter();

// Access the current instance to generate a unique ID
const instance = getCurrentInstance();
const uid = instance
  ? instance.uid.toString()
  : Math.random().toString(36).substring(2, 11);

const fillColor = (tab: string) => {
  return computed(() => {
    return activeTab.value === tab
      ? 'var(--vp-button-brand-text)'
      : 'var(--vp-button-alt-text)';
  });
};

const previewFillColor = fillColor('preview');
const codeFillColor = fillColor('code');

// Handle keyboard navigation
const handleKeydown = (event: KeyboardEvent, tab: string) => {
  if (event.key === 'Enter' || event.key === ' ') {
    activeTab.value = tab;
  }
};

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
    <div class="wrapper">
      <div class="tabs" role="tablist">
        <button
          role="tab"
          :id="'tab-preview-' + uid"
          :aria-selected="activeTab === 'preview'"
          :class="{ active: activeTab === 'preview' }"
          @click="activeTab = 'preview'"
          @keydown="(e) => handleKeydown(e, 'preview')"
          tabindex="0"
          :aria-controls="'tabpanel-preview-' + uid"
          aria-label="preview the component"
        >
          <slot name="preview-icon">
            <ViewIcon :fill="previewFillColor" />
          </slot>
        </button>
        <button
          role="tab"
          :id="'tab-code-' + uid"
          :aria-selected="activeTab === 'code'"
          :class="{ active: activeTab === 'code' }"
          @click="activeTab = 'code'"
          @keydown="(e) => handleKeydown(e, 'code')"
          tabindex="0"
          :aria-controls="'tabpanel-code-' + uid"
          aria-label="view the source code"
        >
          <slot name="code-icon">
            <CodeIcon :fill="codeFillColor" />
          </slot>
        </button>
      </div>
    </div>
    <div
      class="tab-content"
      role="tabpanel"
      :id="'tabpanel-' + activeTab + '-' + uid"
    >
      <div
        v-show="activeTab === 'preview'"
        class="preview-content"
        v-html="props.htmlContent"
      ></div>
      <div v-show="activeTab === 'code'" class="code-content">
        <div class="language-templ vp-adaptive-theme">
          <button title="Copy Code" class="copy"></button>
          <span class="lang">templ</span>
          <span class="vp-code" v-html="highlightedCode"></span>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
.wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding: 0;
}

.wrapper h3 {
  padding: 0;
  margin: 0;
}

.tabs {
  display: flex;
  gap: 0.25rem;
  margin-left: auto;
  padding: 0.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 100vh;
}

button {
  cursor: pointer;
  padding-block: 0.275rem;
  padding-inline: 0.5rem;
  font-size: inherit;
  border-radius: 100vh;
  color: var(--vp-button-alt-text);
  font-weight: 500;
  border: 1px solid var(--vp-button-alt-border);
  transition:
    background-color 0.3s,
    color 0.3s,
    border-color 0.3s;
}

button.active {
  border-color: var(--vp-button-brand-border);
  color: var(--vp-button-brand-text);
  background-color: var(--vp-button-brand-bg);
}

button.active:hover {
  border-color: var(--vp-button-brand-hover-border);
  color: var(--vp-button-brand-hover-text);
  background-color: var(--vp-button-brand-hover-bg);
}

button:not(.active):hover {
  border-color: var(--vp-button-alt-hover-border);
  color: var(--vp-button-alt-hover-text);
  background-color: var(--vp-button-alt-hover-bg);
}

button:focus-visible {
  outline: 2px solid Highlight;
}

.tab-content {
  padding: 0;
}

.preview-content {
  display: flex;
  justify-content: center;
  flex-flow: row wrap;
  row-gap: 0.75rem;
  margin-block: 2rem;
  padding-inline: 0;
}
</style>
