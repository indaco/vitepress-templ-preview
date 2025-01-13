import { TagAttrs } from '../types';
import type { Token } from 'markdown-it/index.js';

// Function to parse attributes from the matched tag
export function parseAttrs(attrsString: string): TagAttrs {
  const attrs: TagAttrs = {};
  const regex = /([a-zA-Z0-9-]+)="([^"]+)"/g;
  const matches = attrsString.matchAll(regex);

  for (const match of matches) {
    const [key, value] = [match[1], match[2]];
    attrs[key] = value;
  }

  return attrs;
}

export /**
 * Retrieves the value of a specific attribute from the token.
 *
 * @param {Token} token - The markdown-it token.
 * @param {string} attrName - The name of the attribute.
 * @param {string} defaultValue - The default value if the attribute is not found.
 * @param {boolean} [parseJson=false] - Whether to parse the attribute value as JSON.
 * @returns {string | boolean} - The attribute value or the default value.
 */
function getAttributeOrElse(
  token: Token,
  attrName: string,
  defaultValue: string,
  parseJson: boolean = false,
): string | boolean {
  const attr = token.attrs?.find((attr) => attr[0] === attrName);
  if (attr) {
    return parseJson ? JSON.parse(attr[1].toLowerCase()) : attr[1];
  }
  return parseJson ? JSON.parse(defaultValue.toLowerCase()) : defaultValue;
}
