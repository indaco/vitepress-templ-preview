import { Ref, ref } from 'vue';
import { BundledTheme, createHighlighter } from 'shiki';

const domContentLoadedRegex =
  /document\.addEventListener\s*\(\s*['"]DOMContentLoaded['"]\s*,\s*(function\s*\([^)]*\)\s*\{|\([^)]*\)\s*=>\s*\{)([\s\S]*?(\{[\s\S]*?\}[\s\S]*?)*)\}\s*\);?\s*|document\.addEventListener\s*\(\s*['"]DOMContentLoaded['"]\s*,\s*(\w+)\s*\);?\s*/;

/**
 * The return type of the `useHighlighter` function.
 */
interface UseHighlighterReturn {
  highlightedCode: Ref<string>;
  highlightCode: (
    codeContent: string,
    themes: { light: BundledTheme; dark: BundledTheme },
  ) => Promise<void>;
}

/**
 * Custom hook to use the Shiki highlighter for syntax highlighting code content.
 *
 * @returns {Object} An object containing:
 * - `highlightedCode`: A ref that holds the highlighted HTML string.
 * - `highlightCode`: A function to highlight the provided code content based on the specified themes.
 */
export function useHighlighter(): UseHighlighterReturn {
  const highlightedCode = ref('');

  /**
   * Highlights the provided code content using Shiki.
   * @param {string} codeContent - The code content to be highlighted.
   * @param {Object} themes - An object containing light and dark themes.
   * @param {BundledTheme} themes.light - The light theme.
   * @param {BundledTheme} themes.dark - The dark theme.
   * @returns {Promise<void>}
   */
  async function highlightCode(
    codeContent: string,
    themes: { light: BundledTheme; dark: BundledTheme },
  ): Promise<void> {
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

/**
 * Normalizes quotes in strings that contain nested or mismatched double quotes due to JSON-stringify by replacing the outer double quotes with single quotes.
 *
 * @param {string} input - The input string that may contain nested or mismatched double quotes.
 * @returns {string} - The modified string with the outermost double quotes replaced by single quotes.
 */
export function normalizeQuotes(input: string): string {
  return input.replace(
    /"([^"]*\[[^'"]*="[^'"]*"\][^"]*)"/g,
    function (match, p1) {
      return `'${p1}'`;
    },
  );
}

/**
 * Observes changes to the preview-content element and executes scripts within it.
 */
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

    observer.observe(previewContent, { childList: true, subtree: true });

    // Execute scripts in initial content
    executeScripts(previewContent);
  }
}

/**
 * Executes all script elements within the provided container.
 * @param {HTMLElement} container - The container element to search for script elements.
 */
function executeScripts(container: HTMLElement): void {
  const scripts = container.querySelectorAll('script');

  scripts.forEach((script) => {
    if (!script.getAttribute('data-executed')) {
      if (script.textContent) {
        processAndExecuteScript(script.textContent);
      }

      script.setAttribute('data-executed', 'true');
    }
  });
}

/**
 * Processes and executes the provided script content.
 * If the script contains a DOMContentLoaded event listener, the function body is extracted and executed separately.
 * @param {string} scriptContent - The script content to be processed and executed.
 */
function processAndExecuteScript(scriptContent: string) {
  const match = domContentLoadedRegex.exec(scriptContent);

  if (match) {
    const cleanedScriptContent = scriptContent.replace(match[0], '').trim();
    if (cleanedScriptContent) {
      createAndExecuteScript(cleanedScriptContent);
    }

    if (match[2]) {
      const extractedFunctionBody = match[2].trim();
      createAndExecuteScript(`(function() { ${extractedFunctionBody} })();`);
    } else if (match[4]) {
      const functionName = match[4].trim();
      createAndExecuteScript(`${functionName}();`);
    }
  } else {
    createAndExecuteScript(scriptContent);
  }
}

/**
 * Creates a new script element with the provided content and executes it.
 * @param {string} scriptContent - The script content to be executed.
 */
function createAndExecuteScript(scriptContent: string) {
  const script = document.createElement('script');
  script.setAttribute('data-executed', 'true');
  script.textContent = scriptContent;
  document.body.appendChild(script).parentNode?.removeChild(script);
}
