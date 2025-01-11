/**
 * Represents a user message with a headline and message content.
 */
export interface VTPMessage {
  /**
   * The headline of the message.
   */
  headline: string;

  /**
   * The content of the message.
   */
  message: string;
}

export const UserMessages: Record<string, VTPMessage> = {
  GENERIC_ERROR: {
    headline: 'Error',
    message: 'An unexpected error occurred. Please try again later.',
  },
  UNKNOWN_MODE_ERROR: {
    headline: 'Unknown Mode',
    message: 'The specified mode for static-templ is not recognized.',
  },
  MODE_NOT_DEFINED: {
    headline: 'Mode Not Defined',
    message:
      'No mode has been defined in the options. Please specify a valid mode.',
  },
  NO_SRC_ATTR_ERROR: {
    headline: 'Missing src Attribute',
    message:
      "The 'src' attribute is required and must not be empty. Please provide a valid source.",
  },
  NO_BINARY: {
    headline: 'Command Not Found',
    message:
      'The specified command is not installed or was not found in the system PATH.',
  },
  EXEC_SYSTEM_CMD: {
    headline: 'Executing System Command',
    message:
      'The system is currently executing a command. Please wait for completion.',
  },
  EXEC_SYSTEM_CMD_ERROR: {
    headline: 'Command Execution Error',
    message:
      'An error occurred while executing the system command. Check for system errors or missing binaries.',
  },
  READING_FILE_ERROR: {
    headline: 'File Read Error',
    message:
      'An error occurred while reading the file. Please check if the file exists and is accessible.',
  },
  READING_DIR_ERROR: {
    headline: 'Directory Read Error',
    message:
      'An error occurred while reading the directory. Ensure the directory path is correct and accessible.',
  },
  WATCHING_FILES: {
    headline: 'Watching Templ Files',
    message:
      'The system is now watching Templ files for changes in the specified directory.',
  },
  UPDATE_CACHE: {
    headline: 'Cache Updated',
    message:
      'The cache has been successfully updated for the specified resources.',
  },
  MISSING_MARKDOWN_INSTANCE_ERROR: {
    headline: 'Markdown instance is not initialized.',
    message:
      'The Markdown instance seems to be not initialized from the vitepress config.',
  },
  MISSING_MARKDOWN_OBJ_ERROR: {
    headline: 'Markdown-it Configuration Error',
    message:
      'The `markdown` object is missing in the VitePress configuration file. Please add it.',
  },
  MISSING_MARKDOWN_OBJ_HINT: {
    headline: 'Configuration Hint',
    message: `To resolve the error, add the following snippet to your VitePress configuration file:\n\n\`\`\`javascript
// .vitepress/config.js
export default defineConfig({
  // ...
  markdown: {}, /* an empty object is enough */
})
\`\`\`
    `,
  },
  CSS_OPTIMIZER: {
    headline: 'CSS Optimization',
    message:
      'Consolidating CSS styles across files to avoid duplications and improve load times.',
  },
  JS_OPTIMIZER: {
    headline: 'JS Optimization',
    message:
      'Consolidating JavaScript files to avoid duplications and improve performance.',
  },
};
