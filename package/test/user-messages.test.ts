import { describe, it, expect } from 'vitest';
import { UserMessages } from '../src/user-messages';
import type { UserMessage } from '../src/types';

describe('UserMessages', () => {
  it('should have a valid headline and message for each message entry', () => {
    Object.values(UserMessages).forEach((message: UserMessage) => {
      // Check if the headline is a non-empty string
      expect(message.headline).toBeDefined();
      expect(typeof message.headline).toBe('string');
      expect(message.headline.trim().length).toBeGreaterThan(0);

      // Check if the message is defined
      expect(message.message).toBeDefined();
      expect(typeof message.message).toBe('string');
    });
  });

  it('should not have empty messages unless explicitly allowed', () => {
    const allowedEmptyMessages = [
      'GENERIC_ERROR',
      'WATCHING_FILES',
      'UPDATE_CACHE',
      'EXEC_SYSTEM_CMD',
    ];

    Object.entries(UserMessages).forEach(
      ([key, message]: [string, UserMessage]) => {
        if (!allowedEmptyMessages.includes(key)) {
          expect(message.message.trim().length).toBeGreaterThan(0);
        }
      },
    );
  });

  it('should have unique headlines to avoid confusion', () => {
    const headlines = Object.values(UserMessages).map((msg) => msg.headline);
    const uniqueHeadlines = new Set(headlines);
    expect(uniqueHeadlines.size).toBe(headlines.length);
  });

  it('should match a known snapshot for all UserMessages', () => {
    expect(UserMessages).toMatchSnapshot();
  });

  it('should contain specific known keys in UserMessages', () => {
    const expectedKeys = [
      'GENERIC_ERROR',
      'UNKNOWN_MODE_ERROR',
      'MODE_NOT_DEFINED',
      'NO_SRC_ATTR_ERROR',
      'NO_BINARY',
      'EXEC_SYSTEM_CMD',
      'EXEC_SYSTEM_CMD_ERROR',
      'READING_FILE_ERROR',
      'READING_DIR_ERROR',
      'WATCHING_FILES',
      'UPDATE_CACHE',
      'MISSING_MARKDOWN_OBJ_ERROR',
      'MISSING_MARKDOWN_OBJ_HINT',
      'CSS_OPTIMIZER',
      'JS_OPTIMIZER',
    ];

    const actualKeys = Object.keys(UserMessages);
    expectedKeys.forEach((key) => {
      expect(actualKeys).toContain(key);
    });
  });

  it('should ensure no message key is duplicated', () => {
    const keys = Object.keys(UserMessages);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });
});
