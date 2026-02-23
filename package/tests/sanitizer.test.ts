import { describe, it, expect, vi } from 'vitest';
import { sanitizeMarkdownForSearch } from '../src/sanitizer';

/**
 * Creates a minimal mock of VitePress MarkdownEnv.
 */
function createMockEnv(
  relativePath: string,
  frontmatter?: Record<string, unknown>,
) {
  return {
    relativePath,
    frontmatter: frontmatter ?? {},
  } as Parameters<typeof sanitizeMarkdownForSearch>[1];
}

/**
 * Creates a minimal mock of VitePress MarkdownRenderer.
 * The render function returns the input source wrapped in a known marker
 * so tests can verify that md.render was called with the expected content.
 */
function createMockMd(renderImpl?: (src: string, env: unknown) => string) {
  return {
    render: renderImpl ?? vi.fn((src: string) => `<rendered>${src}</rendered>`),
  } as unknown as Parameters<typeof sanitizeMarkdownForSearch>[2];
}

describe('sanitizeMarkdownForSearch', () => {
  describe('frontmatter search exclusion', () => {
    it('should return empty string when frontmatter search is false', () => {
      const env = createMockEnv('components/button.md', { search: false });
      const md = createMockMd();
      const result = sanitizeMarkdownForSearch('# Hello', env, md);
      expect(result).toBe('');
    });

    it('should not return early when frontmatter search is true', () => {
      const env = createMockEnv('components/button.md', { search: true });
      const md = createMockMd();
      const result = sanitizeMarkdownForSearch('# Hello', env, md);
      expect(result).not.toBe('');
    });

    it('should not return early when frontmatter has no search field', () => {
      const env = createMockEnv('components/button.md');
      const md = createMockMd();
      const result = sanitizeMarkdownForSearch('# Hello', env, md);
      expect(result).not.toBe('');
    });

    it('should not return early when frontmatter is undefined', () => {
      const env = createMockEnv('components/button.md');
      env.frontmatter = undefined;
      const md = createMockMd();
      const result = sanitizeMarkdownForSearch('# Hello', env, md);
      expect(result).not.toBe('');
    });
  });

  describe('relativePath matching', () => {
    it('should return empty string when relativePath does not start with inputDir', () => {
      const env = createMockEnv('guide/getting-started.md');
      const md = createMockMd();
      const result = sanitizeMarkdownForSearch(
        '# Hello',
        env,
        md,
        'components',
      );
      expect(result).toBe('');
    });

    it('should return empty string when relativePath does not start with default inputDir', () => {
      const env = createMockEnv('guide/getting-started.md');
      const md = createMockMd();
      const result = sanitizeMarkdownForSearch('# Hello', env, md);
      expect(result).toBe('');
    });

    it('should process content when relativePath starts with the default inputDir', () => {
      const env = createMockEnv('components/button.md');
      const md = createMockMd();
      const result = sanitizeMarkdownForSearch('# Hello', env, md);
      expect(result).not.toBe('');
    });

    it('should process content when relativePath starts with a custom inputDir', () => {
      const env = createMockEnv('demos/button.md');
      const md = createMockMd();
      const result = sanitizeMarkdownForSearch('# Hello', env, md, 'demos');
      expect(result).not.toBe('');
    });

    it('should use "components" as default inputDir when inputDir is not provided', () => {
      const envMatch = createMockEnv('components/button.md');
      const envNoMatch = createMockEnv('other/button.md');
      const md = createMockMd();

      const resultMatch = sanitizeMarkdownForSearch('# Hello', envMatch, md);
      const resultNoMatch = sanitizeMarkdownForSearch(
        '# Hello',
        envNoMatch,
        md,
      );

      expect(resultMatch).not.toBe('');
      expect(resultNoMatch).toBe('');
    });
  });

  describe('templ-demo tag stripping', () => {
    it('should strip self-closing templ-demo tags', () => {
      const src = '# Title\n<templ-demo src="button.templ" />\n## Footer';
      const env = createMockEnv('components/button.md');
      const render = vi.fn((s: string) => s);
      const md = createMockMd(render);

      sanitizeMarkdownForSearch(src, env, md);

      expect(render).toHaveBeenCalledWith('# Title\n\n## Footer', env);
    });

    it('should strip self-closing templ-demo tags with multiple attributes', () => {
      const src =
        '<templ-demo src="button.templ" title="Button" mode="inline" />';
      const env = createMockEnv('components/button.md');
      const render = vi.fn((s: string) => s);
      const md = createMockMd(render);

      sanitizeMarkdownForSearch(src, env, md);

      expect(render).toHaveBeenCalledWith('', env);
    });

    it('should strip templ-demo tags with content between open and close', () => {
      const src =
        '# Title\n<templ-demo src="button.templ">some inner content</templ-demo>\n## Footer';
      const env = createMockEnv('components/button.md');
      const render = vi.fn((s: string) => s);
      const md = createMockMd(render);

      sanitizeMarkdownForSearch(src, env, md);

      expect(render).toHaveBeenCalledWith('# Title\n\n## Footer', env);
    });

    it('should strip templ-demo tags with multiline content', () => {
      const src = [
        '# Title',
        '<templ-demo src="button.templ">',
        '  <div>preview</div>',
        '  <p>description</p>',
        '</templ-demo>',
        '## Footer',
      ].join('\n');
      const env = createMockEnv('components/button.md');
      const render = vi.fn((s: string) => s);
      const md = createMockMd(render);

      sanitizeMarkdownForSearch(src, env, md);

      expect(render).toHaveBeenCalledWith('# Title\n\n## Footer', env);
    });

    it('should strip multiple templ-demo tags from the same source', () => {
      const src = [
        '# Title',
        '<templ-demo src="a.templ" />',
        '## Section',
        '<templ-demo src="b.templ">content</templ-demo>',
        '## Footer',
      ].join('\n');
      const env = createMockEnv('components/button.md');
      const render = vi.fn((s: string) => s);
      const md = createMockMd(render);

      sanitizeMarkdownForSearch(src, env, md);

      expect(render).toHaveBeenCalledWith(
        '# Title\n\n## Section\n\n## Footer',
        env,
      );
    });

    it('should preserve non-templ-demo content unchanged', () => {
      const src = '# Hello\n\nSome **markdown** content.\n\n## End';
      const env = createMockEnv('components/button.md');
      const render = vi.fn((s: string) => s);
      const md = createMockMd(render);

      sanitizeMarkdownForSearch(src, env, md);

      expect(render).toHaveBeenCalledWith(src, env);
    });
  });

  describe('md.render integration', () => {
    it('should pass cleaned content and env to md.render', () => {
      const src = '# Title\n<templ-demo src="x.templ" />\nMore text';
      const env = createMockEnv('components/button.md');
      const render = vi.fn((_s: string) => '<h1>Title</h1>\n<p>More text</p>');
      const md = createMockMd(render);

      const result = sanitizeMarkdownForSearch(src, env, md);

      expect(render).toHaveBeenCalledTimes(1);
      expect(render).toHaveBeenCalledWith('# Title\n\nMore text', env);
      expect(result).toBe('<h1>Title</h1>\n<p>More text</p>');
    });

    it('should return the result of md.render', () => {
      const src = '# Hello';
      const env = createMockEnv('components/button.md');
      const md = createMockMd();
      const result = sanitizeMarkdownForSearch(src, env, md);
      expect(result).toBe('<rendered># Hello</rendered>');
    });
  });
});
