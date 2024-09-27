<script lang="ts">
import type { VTPComponentProps } from '../types';

type VTPTabsProps = VTPComponentProps;
</script>

<script setup lang="ts">
import { ref, onMounted, nextTick, getCurrentInstance } from 'vue';
import { executeScriptsTick, useHighlighter } from '../shared';
import VTPCard from './VTPCard.vue';

const props = defineProps<VTPTabsProps>();
const activeTab = ref('preview');
const { highlightedCode, highlightCode } = useHighlighter();

// Access the current instance to generate a unique ID
const instance = getCurrentInstance();
const uid = instance
  ? instance.uid.toString()
  : Math.random().toString(36).substring(2, 11);

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
          Preview
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
          Code
        </button>
      </div>
    </div>
    <div
      :id="'tabpanel-' + activeTab + '-' + uid"
      class="tab-content"
      role="tabpanel"
    >
      <div
        v-show="activeTab === 'preview'"
        class="preview-content"
        v-html="props.htmlContent"
      />
      <div v-show="activeTab === 'code'" class="code-content">
        <div class="language-templ vp-adaptive-theme">
          <button title="Copy Code" class="copy" />
          <span class="lang">templ</span>
          <span class="vp-code" v-html="highlightedCode" />
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
  width: 100%;
  border-bottom: 1px solid var(--vp-c-divider);
}

button {
  padding: 0.375rem 1rem;
  font-size: inherit;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

button.active {
  color: var(--vp-c-text-1);
  border-bottom: 2px solid var(--vp-c-text-2);
}

button:not(.active):hover {
  color: var(--vp-button-alt-hover-text);
  background-color: var(--vp-c-bg-soft);
}

.tab-content {
  padding: 0;
}

.preview-content {
  display: flex;
  justify-content: center;
  flex-flow: row wrap;
  gap: 0.75rem;
  margin-block: 2rem;
  padding-inline: 0;
}
</style>
