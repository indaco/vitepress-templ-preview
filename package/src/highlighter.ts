import { Ref, ref } from 'vue';
import {
  BundledLanguage,
  BundledTheme,
  createHighlighter,
  HighlighterGeneric,
} from 'shiki';

/** Cached highlighter instance, shared across all uses. */
let cachedHighlighter: HighlighterGeneric<
  BundledLanguage,
  BundledTheme
> | null = null;

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
    if (!cachedHighlighter) {
      cachedHighlighter = await createHighlighter({
        langs: [],
        themes: Object.values(themes),
      });
      await cachedHighlighter.loadLanguage('templ');
    }

    const highlighter = cachedHighlighter;

    // Ensure requested themes are loaded
    const loadedThemes = highlighter.getLoadedThemes();
    for (const theme of Object.values(themes)) {
      if (!loadedThemes.includes(theme)) {
        await highlighter.loadTheme(theme);
      }
    }

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
