import type MarkdownIt from 'markdown-it';
import { MarkdownEnv } from 'vitepress';

type Awaitable<T> = T | Promise<T>;

export const sanitizeMarkdownForSearch: (
  src: string,
  env: MarkdownEnv,
  md: MarkdownIt,
  inputDir?: string,
) => Awaitable<string> = (src, env, md, inputDir) => {
  if (env.frontmatter?.search === false) return '';
  if (env.relativePath.startsWith(inputDir || 'components')) {
    const cleanedSrc = src.replace(
      /<templ-demo\s[^>]*\/>|<templ-demo\b[^>]*>.*?<\/templ-demo>/gs,
      '',
    );
    return md.render(cleanedSrc, env);
  }
  return '';
};
