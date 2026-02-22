import { MarkdownRenderer } from 'vitepress';
import { PluginContext } from '../types';
import { UserMessages } from './messages';
import { Logger } from './logger';
import markdownItTemplPreviewPlugin from './markdown-it-templ-preview';

export class MarkdownProcessor {
  private renderer: MarkdownRenderer;
  private context: PluginContext;
  private TEMPL_DEMO_REGEX = /<templ-demo\s+([^>]+?)\/?>/;

  constructor(renderer: MarkdownRenderer, context: PluginContext) {
    this.renderer = renderer;
    this.context = context;
  }

  /**
   * Transforms Markdown content if it contains templ-demo.
   * Uses renderAsync when available (VitePress 2.x) to avoid corrupting
   * the shared async highlight placeholder state.
   */
  public async transform(
    code: string,
    id: string,
  ): Promise<{ code: string; map: null } | undefined> {
    if (!id.endsWith('.md')) return;
    if (!this.TEMPL_DEMO_REGEX.test(code)) return;

    if (!this.renderer) {
      Logger.errorHighlighted(UserMessages.MISSING_MARKDOWN_INSTANCE_ERROR);
      throw new Error(
        `[vitepress-templ-preview] ${UserMessages.MISSING_MARKDOWN_INSTANCE_ERROR.headline} ${UserMessages.MISSING_MARKDOWN_INSTANCE_ERROR.message}`,
      );
    }

    markdownItTemplPreviewPlugin(this.renderer, this.context, id);

    // VitePress 2.x uses markdown-it-async with renderAsync for code highlighting.
    // Using sync render() on the shared instance corrupts highlight placeholder state.
    const md = this.renderer as MarkdownRenderer & {
      renderAsync?: (src: string, env?: unknown) => Promise<string>;
    };
    const rendered = md.renderAsync
      ? await md.renderAsync(code)
      : md.render(code);

    if (!rendered.includes('VTPLivePreview')) return;
    return { code: rendered, map: null };
  }
}
