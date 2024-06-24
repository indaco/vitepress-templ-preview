/**
 * Escapes special characters in a string to make it safe for inclusion in a JSON string,
 * without introducing backslashes for display purposes.
 *
 * @param {string} str - The input string to be escaped.
 * @returns {string} - The escaped string, safe for inclusion in JSON.
 *
 * @example
 * const unsafeString = 'This is a "test" string with \\ special characters \n and newlines.';
 * const safeString = escapeForJSON(unsafeString);
 * console.log(safeString); // Output: This is a \"test\" string with \\ special characters \n and newlines.
 */
export function escapeForJSON(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"'); // Escape backslashes and double quotes
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
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}
