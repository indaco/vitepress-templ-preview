<script setup lang="ts">
import type { Ref } from "vue";
import type { VTPComponentProps } from "../types";
import { ref, onMounted, nextTick } from "vue";
import { BundledTheme, createHighlighter } from "shiki";
import { templLang } from "shiki-templ";

const props = defineProps<VTPComponentProps>();

const highlightedCode: Ref<string> = ref("");

function executeScripts(container: HTMLElement): void {
  const scripts = container.querySelectorAll("script");
  scripts.forEach((script) => {
    const newScript = document.createElement("script");
    newScript.textContent = script.textContent;
    document.body.appendChild(newScript).parentNode?.removeChild(newScript);
  });
}

onMounted(async () => {
  const highlighter = await createHighlighter({
    langs: [templLang],
    themes: Object.values(props.themes),
  });

  highlightedCode.value = highlighter.codeToHtml(props.codeContent, {
    lang: "templ",
    themes: props.themes as {
      light: BundledTheme;
      dark: BundledTheme;
    },
    defaultColor: false,
  });

  nextTick(() => {
    const previewContent = document.querySelector(
      ".preview-content",
    ) as HTMLElement;
    if (previewContent) {
      // Observe changes to the preview-content element
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            executeScripts(mutation.target as HTMLElement);
          }
        });
      });

      observer.observe(previewContent, { childList: true });

      // Execute scripts in initial content
      executeScripts(previewContent);
    }
  });
});
</script>

<template>
  <div class="container">
    <h3 v-html="props.title"></h3>
    <div class="preview">
      <div class="preview-content" v-html="props.htmlContent"></div>
    </div>

    <div class="code-content">
      <div class="language-templ vp-adaptive-theme">
        <button title="Copy Code" class="copy"></button>
        <span class="lang">templ</span>
        <span class="vp-code" v-html="highlightedCode"></span>
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

.code-content {
  display: grid;
  grid-template-rows: 1fr;
  background-color: var(--vp-code-block-bg);
  border-radius: 5px;
}
</style>
