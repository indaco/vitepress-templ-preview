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

export { default as VTPCard } from './VTPCard.vue';
export { default as VTPCodeToggle } from './VTPCodeToggle.vue';
export { default as VTPTabs } from './VTPTabs.vue';
export { default as VTPIconTabs } from './VTPIconTabs.vue';
