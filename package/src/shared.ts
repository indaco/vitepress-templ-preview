import { ref } from 'vue';
import { BundledTheme, createHighlighter } from 'shiki';

export function useHighlighter() {
  const highlightedCode = ref('');

  async function highlightCode(
    codeContent: string,
    themes: { light: BundledTheme; dark: BundledTheme },
  ) {
    const highlighter = await createHighlighter({
      langs: [],
      themes: Object.values(themes),
    });

    await highlighter.loadLanguage('templ');

    highlightedCode.value = highlighter.codeToHtml(codeContent, {
      lang: 'templ',
      themes,
      defaultColor: false,
    });
  }

  return {
    highlightedCode,
    highlightCode,
  };
}

export function executeScriptsTick() {
  const previewContent = document.querySelector(
    '.preview-content',
  ) as HTMLElement;
  if (previewContent) {
    // Observe changes to the preview-content element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          executeScripts(mutation.target as HTMLElement);
        }
      });
    });

    observer.observe(previewContent, { childList: true });

    // Execute scripts in initial content
    executeScripts(previewContent);
  }
}

function executeScripts(container: HTMLElement): void {
  const scripts = container.querySelectorAll('script');
  scripts.forEach((script) => {
    const newScript = document.createElement('script');
    newScript.textContent = script.textContent;
    document.body.appendChild(newScript).parentNode?.removeChild(newScript);
  });
}
