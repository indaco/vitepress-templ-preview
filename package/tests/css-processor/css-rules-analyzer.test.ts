import { describe, it, expect } from 'vitest';
import { CssRulesAnalyzer } from '../../src/plugin/css-processor/css-rules-analyzer';
import { LayerProcessor } from '../../src/plugin/css-processor/strategies/layer-processor';
import { CssTokenProcessor } from '../../src/plugin/css-processor/css-token-processor';

describe('CssRuleAnalyzer', () => {
  const tokenProcessor = new CssTokenProcessor([new LayerProcessor()]);
  const rulesAnalyzer = new CssRulesAnalyzer(tokenProcessor);

  it('should handle unique rules in multiple inputs', () => {
    const cssInputs = [
      `.class1 { color: red; }`,
      `.class2 { background: blue; }`,
    ];

    const result = rulesAnalyzer.analyze(cssInputs);

    expect(result.unique.size).toBe(2);
    expect(result.duplicates.size).toBe(0);

    const uniqueRules = Array.from(result.unique.values()).map(
      (entry) => entry.rule,
    );
    expect(uniqueRules).toEqual([
      '.class1{color:red;}',
      '.class2{background:blue;}',
    ]);
  });

  it('should detect duplicate rules across inputs', () => {
    const cssInputs = [`.class1 { color: red; }`, `.class1 { color: red; }`];

    const result = rulesAnalyzer.analyze(cssInputs);

    expect(result.unique.size).toBe(0);
    expect(result.duplicates.size).toBe(1);

    const duplicateRules = Array.from(result.duplicates.values());
    expect(duplicateRules).toEqual([
      {
        rule: '.class1{color:red;}',
        sources: ['Input #1', 'Input #2'],
      },
    ]);
  });

  it('should detect duplicate rules across multiple inputs', () => {
    const inputOne = `.class1 { color: red; }
      .class3 { color: green; }`;
    const inputTwo = `.class2 { color: blue; }
        .class1 { color: red; }`;
    const inputThree = `.class3 { color: green; }
        .class2 { color: blue; }
        .class4 { color: yellow; }`;

    const cssInputs = [inputOne, inputTwo, inputThree];
    const result = rulesAnalyzer.analyze(cssInputs);

    expect(result.unique.size).toBe(1);
    expect(result.duplicates.size).toBe(3);

    const uniqueRules = Array.from(result.unique.values());
    expect(uniqueRules).toEqual([
      {
        rule: '.class4{color:yellow;}',
        sources: ['Input #3'],
      },
    ]);

    const duplicateRules = Array.from(result.duplicates.values());
    expect(duplicateRules).toEqual([
      {
        rule: '.class1{color:red;}',
        sources: ['Input #1', 'Input #2'],
      },
      {
        rule: '.class3{color:green;}',
        sources: ['Input #1', 'Input #3'],
      },
      {
        rule: '.class2{color:blue;}',
        sources: ['Input #2', 'Input #3'],
      },
    ]);
  });

  it('should handle inputs with identical rules in different orders', () => {
    const cssInputs = [
      `
      .class1 { color: red; }
      .class2 { background: blue; }
      `,
      `
      .class2 { background: blue; }
      .class1 { color: red; }
      `,
    ];

    const result = rulesAnalyzer.analyze(cssInputs);

    expect(result.unique.size).toBe(0);
    expect(result.duplicates.size).toBe(2);

    const duplicateRules = Array.from(result.duplicates.values())
      .map((entry) => ({
        rule: entry.rule,
        sources: entry.sources,
      }))
      .sort((a, b) => a.rule.localeCompare(b.rule));

    expect(duplicateRules).toEqual([
      {
        rule: '.class1{color:red;}',
        sources: ['Input #1', 'Input #2'],
      },
      {
        rule: '.class2{background:blue;}',
        sources: ['Input #1', 'Input #2'],
      },
    ]);
  });

  it('should handle @media at-rules', () => {
    const cssInputs = [
      `@media (max-width: 600px) { .class1 { color: red; } }`,
      `@media (max-width: 600px) { .class1 { color: red; } }`,
    ];

    const result = rulesAnalyzer.analyze(cssInputs);

    expect(result.unique.size).toBe(0);
    expect(result.duplicates.size).toBe(1);

    const duplicateRules = Array.from(result.duplicates.values());
    expect(duplicateRules).toEqual([
      {
        rule: '@media (max-width:600px){.class1{color:red;}}',
        sources: ['Input #1', 'Input #2'],
      },
    ]);
  });

  it('should handle nested rules and ignore comments', () => {
    const cssInputs = [
      `
      /* This is a comment */
      @media (max-width: 600px) {
        .class1 { color: red; }
      }
      `,
      `
      @media (max-width: 600px) {
        .class1 { color: red; }
      }
      `,
    ];

    const result = rulesAnalyzer.analyze(cssInputs);

    expect(result.unique.size).toBe(0);
    expect(result.duplicates.size).toBe(1);

    const duplicateRules = Array.from(result.duplicates.values());
    expect(duplicateRules).toEqual([
      {
        rule: '@media (max-width:600px){.class1{color:red;}}',
        sources: ['Input #1', 'Input #2'],
      },
    ]);
  });

  it('should handle empty inputs gracefully', () => {
    const cssInputs = ['', '', ''];

    const result = rulesAnalyzer.analyze(cssInputs);

    expect(result.unique.size).toBe(0);
    expect(result.duplicates.size).toBe(0);
  });

  it('should handle inputs with whitespace variations', () => {
    const cssInputs = [
      `.class1 { color: red; }`,
      `  .class1 {    color:red;    }  `,
    ];

    const result = rulesAnalyzer.analyze(cssInputs);

    expect(result.unique.size).toBe(0);
    expect(result.duplicates.size).toBe(1);

    const duplicateRules = Array.from(result.duplicates.values());
    expect(duplicateRules).toEqual([
      {
        rule: '.class1{color:red;}',
        sources: ['Input #1', 'Input #2'],
      },
    ]);
  });

  it('should handle complex selectors', () => {
    const cssInputs = [
      `.class1.class2:hover { color: red; }`,
      `.class1.class2:hover { color: red; }`,
    ];

    const result = rulesAnalyzer.analyze(cssInputs);

    expect(result.unique.size).toBe(0);
    expect(result.duplicates.size).toBe(1);

    const duplicateRules = Array.from(result.duplicates.values());
    expect(duplicateRules).toEqual([
      {
        rule: '.class1.class2:hover{color:red;}',
        sources: ['Input #1', 'Input #2'],
      },
    ]);
  });

  it('should fix invalid or malformed CSS rules', () => {
    const cssInputs = [
      `.class1 { color: red; `,
      `.class2 { background: blue }`,
    ];

    const result = rulesAnalyzer.analyze(cssInputs);

    expect(result.unique.size).toBe(2);
    expect(result.duplicates.size).toBe(0);

    const uniqueRules = Array.from(result.unique.values()).map(
      (entry) => entry.rule,
    );
    expect(uniqueRules).toEqual([
      '.class1{color:red;}',
      '.class2{background:blue;}',
    ]);
  });
});
