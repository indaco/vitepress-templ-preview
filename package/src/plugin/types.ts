/**
 * Represents the attributes of an HTML tag.
 */
export interface TagAttrs {
  [key: string]: string;
}

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
