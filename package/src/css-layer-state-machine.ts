import { flattenCssContent } from './css-utils';

/**
 * **LayerStateMachine**
 *
 * The `LayerStateMachine` class is responsible for extracting CSS content from `@layer` declarations.
 * It tracks the internal state of the current position in the content using a **state machine** to manage
 * transitions between being "inside" or "outside" of an `@layer` block.
 *
 * ### Key Responsibilities:
 * - **State Tracking**: Uses a simple state machine (`OUTSIDE_LAYER`, `INSIDE_LAYER`).
 * - **Brace Tracking**: Uses a stack (`layerStack`) to manage nested layers.
 * - **Content Extraction**: Extracts and returns the CSS content within `@layer` blocks.
 *
 * ### Usage:
 * ```ts
 * const stateMachine = new LayerStateMachine();
 * const extractedBlocks = stateMachine.extractLayerBlocks(cssContent);
 * console.log(extractedBlocks);
 * ```
 */
export class CssLayerStateMachine {
  /**
   * The current state of the state machine.
   *
   * - `'OUTSIDE_LAYER'`: Not currently inside an `@layer` block.
   * - `'INSIDE_LAYER'`: Currently inside an `@layer` block.
   */
  private state: 'OUTSIDE_LAYER' | 'INSIDE_LAYER' = 'OUTSIDE_LAYER';

  /**
   * Stack to keep track of nested layers.
   * Each layer push/pop corresponds to `{}` braces in the CSS content.
   */
  private layerStack: number[] = [];

  /**
   * Stores the current CSS block content being processed.
   * This accumulates characters from inside an `@layer` block.
   */
  private currentBlock: string = '';

  /**
   * Stores all extracted CSS blocks that were inside `@layer` declarations.
   */
  private extractedBlocks: string[] = [];

  /**
   * **extractLayerBlocks**
   *
   * Extracts the CSS content inside `@layer` blocks from the provided CSS content.
   *
   * - The method parses the content character-by-character.
   * - Uses state tracking to know when it's inside an `@layer` block.
   * - Uses a **stack** to manage nested braces (`{}`).
   *
   * @param {string} content - The full CSS content.
   * @returns {string[]} An array of extracted CSS blocks found inside `@layer` declarations.
   *
   * @example
   * const content = `
   *   @layer base {
   *     .base { color: red; }
   *   }
   * `;
   * const machine = new LayerStateMachine();
   * const blocks = machine.extractLayerBlocks(content);
   * console.log(blocks); // ['.base { color: red; }']
   */
  public extractLayerBlocks(content: string): string[] {
    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if (this.state === 'OUTSIDE_LAYER' && this.isLayerStart(content, i)) {
        this.enterLayer();
        i = content.indexOf('{', i);
        if (i === -1) break;
        continue;
      }

      if (this.state === 'INSIDE_LAYER') {
        if (char === '{') this.pushLayer();
        if (char === '}') this.popLayer();

        if (this.isInsideLayer()) {
          this.currentBlock += char;
        }

        if (this.isLayerComplete()) {
          this.finalizeBlock();
          this.state = 'OUTSIDE_LAYER';
          const nextLayerIndex = this.getNextLayerOnSameLine(content, i);
          if (nextLayerIndex !== -1) {
            i = nextLayerIndex - 1;
          }
        }
      }
    }

    return this.extractedBlocks;
  }

  /**
   * **isLayerStart**
   *
   * Checks if the given position in the content marks the start of an `@layer` block.
   *
   * @param {string} content - The full CSS content.
   * @param {number} index - The current position in the content.
   * @returns {boolean} `true` if an `@layer` starts at the current index, otherwise `false`.
   */
  private isLayerStart(content: string, index: number): boolean {
    return content.slice(index, index + 6) === '@layer';
  }

  /**
   * **enterLayer**
   *
   * Transitions the state machine to "INSIDE_LAYER" state and initializes the layer stack.
   */
  private enterLayer(): void {
    this.state = 'INSIDE_LAYER';
    this.layerStack.push(1);
  }

  /**
   * **pushLayer**
   *
   * Adds a new layer context to the stack when encountering an opening brace `{`.
   */
  private pushLayer(): void {
    this.layerStack.push(1);
  }

  /**
   * **popLayer**
   *
   * Pops the last layer context from the stack when encountering a closing brace `}`.
   */
  private popLayer(): void {
    if (this.layerStack.length > 0) {
      this.layerStack.pop();
    }
  }

  /**
   * **isInsideLayer**
   *
   * Checks if the parser is currently inside an `@layer` block.
   *
   * @returns {boolean} `true` if the current layer stack is not empty, otherwise `false`.
   */
  private isInsideLayer(): boolean {
    return this.layerStack.length > 0;
  }

  /**
   * **isLayerComplete**
   *
   * Checks if the parser has exited from an `@layer` block.
   *
   * @returns {boolean} `true` if the current layer stack is empty, otherwise `false`.
   */
  private isLayerComplete(): boolean {
    return this.layerStack.length === 0;
  }

  /**
   * **finalizeBlock**
   *
   * Finalizes the current CSS block being processed. It cleans up, flattens, and adds it to
   * the list of extracted blocks.
   */
  private finalizeBlock(): void {
    const cleanedBlock = this.currentBlock.trim();
    if (cleanedBlock) {
      const processedContent = this.processBlockContent(cleanedBlock);
      this.extractedBlocks.push(processedContent);
    }
    this.currentBlock = '';
  }

  /**
   * **processBlockContent**
   *
   * Processes the content of the CSS block to flatten it if it contains newlines.
   *
   * @param {string} content - The CSS block content.
   * @returns {string} The flattened CSS block.
   */
  private processBlockContent(content: string): string {
    const hasNewlines = /\n/.test(content);
    return hasNewlines ? flattenCssContent(content) : content.trim();
  }

  /**
   * **getNextLayerOnSameLine**
   *
   * Finds the next occurrence of `@layer` on the same line.
   *
   * @param {string} content - The full CSS content.
   * @param {number} currentIndex - The current position in the content.
   * @returns {number} The index of the next `@layer` on the same line, or -1 if none is found.
   */
  private getNextLayerOnSameLine(
    content: string,
    currentIndex: number,
  ): number {
    const nextLayerIndex = content.indexOf('@layer', currentIndex);
    const newlineIndex = content.indexOf('\n', currentIndex);
    if (
      nextLayerIndex !== -1 &&
      (newlineIndex === -1 || nextLayerIndex < newlineIndex)
    ) {
      return nextLayerIndex;
    }
    return -1;
  }
}
