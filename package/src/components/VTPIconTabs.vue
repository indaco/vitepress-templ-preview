<script lang="ts">
import type { VTPComponentProps } from '../types';

type VTPIconTabsProps = VTPComponentProps;
</script>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, getCurrentInstance } from 'vue';
import { normalizeQuotes } from './index';
import { TemplScriptManager } from '../script-manager';
import { useHighlighter } from '../highlighter';
import ViewIcon from './icons/ViewIcon.vue';
import CodeIcon from './icons/CodeIcon.vue';
import VTPCard from './VTPCard.vue';
import ComponentPreviewer from './ComponentPreviewer.vue';
import ComponentCoder from './ComponentCoder.vue';

const props = defineProps<VTPIconTabsProps>();
const sanitizedHtmlContent = normalizeQuotes(props.htmlContent);
const scriptManager = TemplScriptManager.getInstance();
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
    scriptManager.executeScriptsTick();
  });
});
</script>

<template>
  <VTPCard v-if="props.isPreviewOnly" v-bind="props" />
  <template v-else>
    <div class="wrapper">
      <div class="tabs" role="tablist">
        <button
          :id="'tab-preview-' + uid"
          role="tab"
          :aria-selected="activeTab === 'preview'"
          :class="{ active: activeTab === 'preview' }"
          tabindex="0"
          :aria-controls="'tabpanel-preview-' + uid"
          aria-label="preview the component"
          @click="activeTab = 'preview'"
          @keydown="(e) => handleKeydown(e, 'preview')"
        >
          <slot name="preview-icon">
            <ViewIcon :fill="previewFillColor" />
          </slot>
        </button>
        <button
          :id="'tab-code-' + uid"
          role="tab"
          :aria-selected="activeTab === 'code'"
          :class="{ active: activeTab === 'code' }"
          tabindex="0"
          :aria-controls="'tabpanel-code-' + uid"
          aria-label="view the source code"
          @click="activeTab = 'code'"
          @keydown="(e) => handleKeydown(e, 'code')"
        >
          <slot name="code-icon">
            <CodeIcon :fill="codeFillColor" />
          </slot>
        </button>
      </div>
    </div>
    <div
      :id="'tabpanel-' + activeTab + '-' + uid"
      class="tab-content"
      role="tabpanel"
    >
      <ComponentPreviewer
        v-show="activeTab === 'preview'"
        :content="sanitizedHtmlContent"
      />
      <ComponentCoder
        v-if="highlightedCode"
        v-show="activeTab === 'code'"
        :content="highlightedCode"
      />
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
</style>
