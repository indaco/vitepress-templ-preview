import { describe, it, expect, beforeEach } from 'vitest';
import { CssLayerStateMachine } from '../src/css-layer-state-machine';

describe('LayerStateMachine', () => {
  let stateMachine: CssLayerStateMachine;

  beforeEach(() => {
    stateMachine = new CssLayerStateMachine();
  });

  describe('extractLayerBlocks', () => {
    it('should extract simple @layer blocks', () => {
      const input = `
        @layer base {
          .base { color: red; }
        }
      `;
      const expected = ['.base { color: red; }'];
      const result = stateMachine.extractLayerBlocks(input);
      expect(result).toEqual(expected);
    });

    it('should extract multiple @layer declarations on the same line', () => {
      const input = `
        @layer base, components; @layer components {
          .component { color: blue; }
        }
      `;
      const expected = ['.component { color: blue; }'];
      const result = stateMachine.extractLayerBlocks(input);
      expect(result).toEqual(expected);
    });

    it('should extract multiple @layer blocks separately', () => {
      const input = `
        @layer base {
          .base { color: red; }
        }
        @layer components {
          .component { color: blue; }
        }
      `;
      const expected = ['.base { color: red; }', '.component { color: blue; }'];
      const result = stateMachine.extractLayerBlocks(input);
      expect(result).toEqual(expected);
    });

    it('should extract @layer with multiple rules inside', () => {
      const input = `
        @layer utilities {
          .btn { padding: 10px; }
          .card { border: 1px solid black; }
        }
      `;
      const expected = [
        '.btn { padding: 10px; } .card { border: 1px solid black; }',
      ];
      const result = stateMachine.extractLayerBlocks(input);
      expect(result).toEqual(expected);
    });

    it('should extract @layer with multiple rules on the same line', () => {
      const input = `
        @layer utilities { .btn { padding: 10px; } .card { border: 1px solid black; } }
      `;
      const expected = [
        '.btn { padding: 10px; } .card { border: 1px solid black; }',
      ];
      const result = stateMachine.extractLayerBlocks(input);
      expect(result).toEqual(expected);
    });

    it('should handle layers without content (empty braces)', () => {
      const input = `
        @layer emptyLayer {};
      `;
      const expected: string[] = [];
      const result = stateMachine.extractLayerBlocks(input);
      expect(result).toEqual(expected);
    });

    it('should handle layers without semicolons', () => {
      const input = `
        @layer base {
          .base { color: red; }
        }
        @layer components {
          .component { color: blue; }
        }
      `;
      const expected = ['.base { color: red; }', '.component { color: blue; }'];
      const result = stateMachine.extractLayerBlocks(input);
      expect(result).toEqual(expected);
    });

    it('should handle layers with multiple declarations on one line', () => {
      const input = `
        @layer base { .base { color: red; } } @layer components { .component { color: blue; } }
      `;
      const expected = ['.base { color: red; }', '.component { color: blue; }'];
      const result = stateMachine.extractLayerBlocks(input);
      expect(result).toEqual(expected);
    });

    it('should handle edge case with unmatched opening brace', () => {
      const input = `
        @layer brokenLayer {
          .btn { color: red; }
      `;
      const expected: string[] = [];
      const result = stateMachine.extractLayerBlocks(input);
      expect(result).toEqual(expected);
    });

    it('should handle edge case with unmatched closing brace', () => {
      const input = `
        @layer brokenLayer {
          .btn { color: red; } }
        }
      `;
      const expected = ['.btn { color: red; }'];
      const result = stateMachine.extractLayerBlocks(input);
      expect(result).toEqual(expected);
    });

    it('should extract CSS with newlines and tabs properly', () => {
      const input = `
        @layer base {
          .base {
            color: red;
            background: white;
          }
        }
      `;
      const expected = ['.base { color: red; background: white; }'];
      const result = stateMachine.extractLayerBlocks(input);
      expect(result).toEqual(expected);
    });
  });
});
