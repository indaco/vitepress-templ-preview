/**
 * Escapes special characters in a string to make it safe for inclusion in a JSON string,
 * including replacing single quotes with escaped double quotes.
 *
 * @param {string} str - The input string to be escaped.
 * @returns {string} - The escaped string, safe for inclusion in JSON.
 *
 * @example
 * const unsafeString = 'This is a "test" string with \\ special characters \n and newlines.';
 * const safeString = escapeForJSON(unsafeString);
 * console.log(safeString); // Output: This is a \"test\" string with \\ special characters \\n and newlines.
 */
export function escapeForJSON(str: string): string {
  return str
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/'/g, '\\"') // Replace single quotes with escaped double quotes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\t/g, '\\t') // Escape tabs
    .replace(/</g, '\\u003C') // Escape less-than sign
    .replace(/>/g, '\\u003E'); // Escape greater-than sign
}

/**
 * Unescapes a string that was previously escaped for JSON,
 * converting escaped sequences back to their original characters.
 *
 * @param {string} str - The input string to be unescaped.
 * @returns {string} - The unescaped string.
 *
 * @example
 * const escapedString = 'This is a \\"test\\" string with \\\\ special characters \\n and newlines.';
 * const unescapedString = unescapeFromJSON(escapedString);
 * console.log(unescapedString); // Output: This is a "test" string with \ special characters \n and newlines.
 */
export function unescapeFromJSON(str: string): string {
  return str
    .replace(/\\u003C/g, '<') // Unescape less-than sign
    .replace(/\\u003E/g, '>') // Unescape greater-than sign
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r') // Unescape carriage returns
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}
