import type { UserMessage } from './types';

export const UserMessages: Record<string, UserMessage> = {
  GENERIC_ERROR: {
    headline: 'Error',
    message: '',
  },
  UNKNOWN_MODE_ERROR: {
    headline: 'Unknown mode for static-templ',
    message: '',
  },
  MODE_NOT_DEFINED: {
    headline: 'No static-templ mode',
    message: 'No mode has been defined in options',
  },
  NO_SRC_ATTR_ERROR: {
    headline: 'NO src attribute found',
    message: "The 'src' attribute is required and must not be empty.",
  },
  NO_BINARY: {
    headline: 'Command not found',
    message: 'is not installed or not found in PATH.',
  },
  EXEC_SYSTEM_CMD: {
    headline: 'Executing system command',
    message: '',
  },
  EXEC_SYSTEM_CMD_ERROR: {
    headline: 'Error executing command',
    message: 'Something went wrong executing the system command',
  },
  READING_FILE_ERROR: {
    headline: 'Error reading file',
    message: 'Something went wrong reading the file',
  },
  READING_DIR_ERROR: {
    headline: 'Error reading directory',
    message: 'Something went wrong reading the directory',
  },
  WATCHING_FILES: {
    headline: 'Watching Templ files at',
    message: '',
  },
  UPDATE_CACHE: {
    headline: 'Updated cache for',
    message: '',
  },
  MISSING_MARKDOWN_OBJ_ERROR: {
    headline: 'markdown-it Configuration Error',
    message:
      'You forgot to set the `markdown` object in the VitePress configuration file.',
  },
  MISSING_MARKDOWN_OBJ_HINT: {
    headline: 'HINT - update the vitepress config file',
    message: `\n//.vitepress/config.js\nexport default defineConfig({
  // ...
  markdown: {}, /* an empty object is enough */
})
`,
  },
  CSS_OPTIMIZER: {
    headline: 'Styles tags optimization',
    message: 'Consolidating CSS styles across files to avoid duplications.',
  },
  JS_OPTIMIZER: {
    headline: 'Script tags optimization',
    message: 'Consolidating JS scripst across files to avoid duplications.',
  },
};
