<script setup lang="ts">
import type { VTPComponentProps } from "../types";
import { ref, onMounted } from "vue";
import { BundledTheme, createHighlighter } from "shiki";
import { templLang } from "shiki-templ";
import CodeIcon from "./CodeIcon.vue";
import { unescapeFromJSON } from "../utils.js";

const props = defineProps<VTPComponentProps>();

const isCodeSectionVisible = ref(false);
const highlightedCode = ref("");

function toggleCodeSection() {
  isCodeSectionVisible.value = !isCodeSectionVisible.value;
}

onMounted(async () => {
  const highlighter = await createHighlighter({
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
  <div class="container">
    <h3 v-html="props.title"></h3>
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
        {{ isCodeSectionVisible ? "Hide Code" : "Show Code" }}
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
  margin-bottom: 1rem;
}

button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 10px;
  color: var(--vp-button-alt-text);
  font-weight: 500;
  background-color: var(--vp-button-alt-bg);
  transition:
    color 0.25s,
    border-color 0.25s,
    background-color 0.25s;
  border-radius: 20px;
  padding: 0 20px;
  line-height: 38px;
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

.code-content[aria-hidden="false"] {
  grid-template-rows: 1fr;
}

.code-content > div {
  overflow: hidden;
}
</style>
