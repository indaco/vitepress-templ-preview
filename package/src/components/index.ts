/**
 * Replaces the outermost double quotes in a string with single quotes,
 * while preserving inner double quotes, particularly those used in attribute selectors.
 *
 * This function ensures that nested quotes are handled correctly to maintain
 * valid JavaScript and CSS syntax.
 *
 * @param {string} input - The input string containing potential double quotes to normalize.
 * @returns {string} - The modified string with outer double quotes replaced by single quotes.
 */
export function normalizeQuotes(input: string): string {
  let result = '';
  let inDoubleQuote = false;
  let inSingleQuote = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === '"' && !inSingleQuote) {
      if (inDoubleQuote) {
        // Closing double quote
        if (isInsideAttributeSelector(result)) {
          // Keep the double quote if it's part of an attribute selector
          result += '"';
        } else {
          // Replace outer double quotes with single quotes
          result += "'";
        }
        inDoubleQuote = false;
      } else {
        // Opening double quote
        if (isInsideAttributeSelector(result)) {
          // Keep the double quote if it's part of an attribute selector
          result += '"';
        } else {
          result += "'";
        }
        inDoubleQuote = true;
      }
    } else if (char === "'" && !inDoubleQuote) {
      // Track if we are inside single quotes
      inSingleQuote = !inSingleQuote;
      result += char;
    } else {
      result += char;
    }
  }

  return result;
}

// Helper function to determine if we are in the context of an attribute selector
function isInsideAttributeSelector(context: string): boolean {
  const openBracketIndex = context.lastIndexOf('[');
  const closeBracketIndex = context.lastIndexOf(']');

  // If there's an open bracket without a corresponding close bracket,
  // we're inside an attribute selector.
  return openBracketIndex > closeBracketIndex;
}

export { default as VTPCard } from './VTPCard.vue';
export { default as VTPCodeToggle } from './VTPCodeToggle.vue';
export { default as VTPTabs } from './VTPTabs.vue';
export { default as VTPIconTabs } from './VTPIconTabs.vue';
export { default as VTPToggleButton } from './VTPToggleButton.vue';
