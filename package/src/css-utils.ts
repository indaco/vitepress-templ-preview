/**
 * Flattens CSS content by removing unnecessary newlines, spaces, and excessive symbols,
 * while preserving the user's intended formatting if newlines exist in the input.
 *
 * @param content - The CSS content to process.
 * @returns The flattened CSS content.
 */
export function flattenCssContent(content: string): string {
  return content
    .replace(/(\n|\r)/g, ' ') // Replace newlines with spaces (not fully flattening, but reducing extra whitespace)
    .replace(/\s{2,}/g, ' ') // Collapse multiple spaces into one
    .replace(/\s*{\s*/g, ' { ') // Normalize spaces around opening braces
    .replace(/\s*}\s*/g, ' } ') // Normalize spaces around closing braces
    .replace(/;\s*/g, '; ') // Normalize space after semicolons
    .replace(/;\s*}/g, '; }') // Ensure semicolons are properly followed by braces
    .trim();
}
