<script lang="ts">
import type { VTPComponentProps } from '../types';

export interface VTPToggleButtonProps extends VTPComponentProps {
  modelValue: boolean;
  label: string;
  showLabel?: boolean;
  activeColor?: string;
}
</script>

<script setup lang="ts">
import { ref, onMounted, nextTick, getCurrentInstance, defineProps } from 'vue';
import { normalizeQuotes } from './index';
import { TemplScriptManager } from '../script-manager';
import { useHighlighter } from '../highlighter';
import VTPCard from './VTPCard.vue';
import ComponentPreviewer from './ComponentPreviewer.vue';
import ComponentCoder from './ComponentCoder.vue';

const props = withDefaults(defineProps<VTPToggleButtonProps>(), {
  modelValue: false,
  label: 'view the code',
  showLabel: true,
  activeColor: 'var(--vp-button-brand-bg)',
});

const activeTab = ref<'preview' | 'code'>('preview');
const sanitizedHtmlContent = normalizeQuotes(props.htmlContent);
const scriptManager = TemplScriptManager.getInstance();
const { highlightedCode, highlightCode } = useHighlighter();

// Access the current instance to generate a unique ID
const instance = getCurrentInstance();
const uid = instance
  ? instance.uid.toString()
  : Math.random().toString(36).substring(2, 11);

// Toggle between "preview" and "code" tabs
const toggleCodeVisibility = () => {
  activeTab.value = activeTab.value === 'preview' ? 'code' : 'preview';
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
        <div
          class="toggle-container"
          :class="{ 'is-checked': activeTab === 'code' }"
          @click="toggleCodeVisibility"
        >
          <span v-if="props.showLabel" class="toggle-label">
            {{ props.label }}
          </span>
          <div class="toggle-switch" />
        </div>
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

.tabs {
  display: flex;
  margin-left: auto;
}

.toggle-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  gap: 0.25rem;
}

.toggle-switch {
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background-color: var(--vp-input-switch-bg-color);
  border-width: 1px;
  border-style: solid;
  border-color: var(--vp-input-border-color);
  border-radius: 2rem;
  transition: background-color 0.3s;
}

.toggle-switch:hover {
  border-color: var(--vp-button-brand-bg);
}

.toggle-switch::after {
  content: '';
  width: 18px;
  height: 18px;
  background-color: var(--vp-c-text-3);
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.is-checked .toggle-switch {
  background-color: var(--vp-button-brand-bg);
  border-color: var(--vp-button-brand-bg);
}

.is-checked .toggle-switch::after {
  background-color: var(--vp-c-gray-3);
  transform: translateX(1.5rem);
}

.toggle-label {
  margin-right: 0.375rem;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.tab-content {
  padding: 0;
}
</style>
