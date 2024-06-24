<script setup lang="ts">
import type { VTPComponentProps } from "../types";
import { ref, onMounted, computed } from "vue";
import { BundledTheme, getHighlighter } from "shiki";
import { templLang } from "shiki-templ";
import ViewIcon from "./ViewIcon.vue";
import CodeIcon from "./CodeIcon.vue";
import { unescapeFromJSON } from "../utils";

const props = defineProps<VTPComponentProps>();

const activeTab = ref("preview");
const highlightedCode = ref("");

const fillColor = (tab: string) => {
  return computed(() => {
    return activeTab.value === tab
      ? "var(--vp-button-brand-text)"
      : "var(--vp-button-alt-text)";
  });
};

const previewFillColor = fillColor("preview");
const codeFillColor = fillColor("code");

// Handle keyboard navigation
const handleKeydown = (event: KeyboardEvent, tab: string) => {
  if (event.key === "Enter" || event.key === " ") {
    activeTab.value = tab;
  }
};

onMounted(async () => {
  const highlighter = await getHighlighter({
    langs: [templLang],
    themes: Object.values(props.themes),
  });

  // Parse the code content to ensure it is correctly escaped
  const codeContent = unescapeFromJSON(props.codeContent);

  highlightedCode.value = highlighter.codeToHtml(codeContent, {
    lang: "templ",
    themes: props.themes as {
      light: BundledTheme;
      dark: BundledTheme;
    },
    defaultColor: false,
  });
});
</script>

<template>
  <div>
    <div class="wrapper">
      <h3 v-html="props.title"></h3>
      <div class="tabs" role="tablist">
        <button
          role="tab"
          :aria-selected="activeTab === 'preview'"
          :class="{ active: activeTab === 'preview' }"
          @click="activeTab = 'preview'"
          @keydown="(e: any) => handleKeydown(e, 'preview')"
          tabindex="0"
          aria-label="preview the component"
        >
          <slot name="preview-icon">
            <ViewIcon :fill="previewFillColor" />
          </slot>
        </button>
        <button
          role="tab"
          :aria-selected="activeTab === 'code'"
          :class="{ active: activeTab === 'code' }"
          @click="activeTab = 'code'"
          @keydown="(e: any) => handleKeydown(e, 'code')"
          tabindex="0"
          aria-label="view the source code"
        >
          <slot name="code-icon">
            <CodeIcon :fill="codeFillColor" />
          </slot>
        </button>
      </div>
    </div>
    <div class="tab-content" role="tabpanel">
      <div
        v-if="activeTab === 'preview'"
        class="preview-content"
        v-html="props.htmlContent"
      ></div>
      <div v-if="activeTab === 'code'" class="code-content">
        <div class="language-templ vp-adaptive-theme">
          <button title="Copy Code" class="copy"></button>
          <span class="lang">templ</span>
          <span class="vp-code" v-html="highlightedCode"></span>
        </div>
      </div>
    </div>
  </div>
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
}

button {
  padding: 0.375rem;
  font-size: inherit;
  border-radius: 100vh;
  color: var(--vp-button-alt-text);
  font-weight: 500;
  background-color: var(--vp-button-alt-bg);
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
  padding: 20px 0;
}
</style>
