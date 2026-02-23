import type { Ref } from 'vue';
import { onMounted, nextTick, useId } from 'vue';
import type { BundledTheme } from 'shiki';
import { normalizeQuotes } from '../components/normalize-quotes';
import { TemplScriptManager } from '../script-manager';
import { useHighlighter } from '../highlighter';

interface UseTemplPreviewOptions {
  codeContent: string;
  htmlContent: string;
  themes: { light: BundledTheme; dark: BundledTheme };
}

interface UseTemplPreviewReturn {
  sanitizedHtmlContent: string;
  highlightedCode: Ref<string>;
  uid: string;
}

/**
 * Composable that encapsulates common setup logic shared across all VTP preview components:
 * - Sanitizes HTML content (normalizes quotes)
 * - Initializes the Shiki highlighter and highlights code on mount
 * - Triggers script execution via TemplScriptManager after mount
 * - Generates a unique ID for ARIA attributes
 */
export function useTemplPreview(
  options: UseTemplPreviewOptions,
): UseTemplPreviewReturn {
  const sanitizedHtmlContent = normalizeQuotes(options.htmlContent);
  const scriptManager = TemplScriptManager.getInstance();
  const { highlightedCode, highlightCode } = useHighlighter();

  const uid = useId();

  onMounted(async () => {
    await highlightCode(options.codeContent, options.themes);

    nextTick(() => {
      scriptManager.executeScriptsTick();
    });
  });

  return {
    sanitizedHtmlContent,
    highlightedCode,
    uid,
  };
}
