import { Ref, ref } from 'vue';
import { BundledTheme, createHighlighter } from 'shiki';

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
