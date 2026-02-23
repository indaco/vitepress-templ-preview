<script lang="ts">
import type { VTPComponentProps } from '../types';

type VTPTabsProps = VTPComponentProps;
</script>

<script setup lang="ts">
import { ref } from 'vue';
import { useTemplPreview } from '../composables/useTemplPreview';
import VTPCard from './VTPCard.vue';
import ComponentPreviewer from './ComponentPreviewer.vue';
import ComponentCoder from './ComponentCoder.vue';

const props = defineProps<VTPTabsProps>();
const { sanitizedHtmlContent, highlightedCode, uid } = useTemplPreview(props);
const activeTab = ref<'preview' | 'code'>('preview');

// Handle keyboard navigation (Enter/Space to activate, Arrow keys to switch)
const handleKeydown = (event: KeyboardEvent, tab: 'preview' | 'code') => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    activeTab.value = tab;
  }
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    activeTab.value = activeTab.value === 'preview' ? 'code' : 'preview';
  }
};
</script>

<template>
  <VTPCard v-if="props.isPreviewOnly" v-bind="props" />
  <template v-else>
    <div class="wrapper">
      <div class="tabs" role="tablist">
        <button
          type="button"
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
          type="button"
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

button:focus-visible {
  outline: 2px solid Highlight;
  outline-offset: 2px;
}

.tab-content {
  padding: 0;
}
</style>
