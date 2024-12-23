import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import HtmlStylesOptimizer from '../src/styles-optimizer';

// Helper function to create a temporary directory for testing
function createTempDir() {
  const tempDir = path.join(__dirname, 'temp', `test-styles`);
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

// Helper function to clean up the temporary directory
function cleanTempDir(tempDir: string) {
  fs.rmSync(tempDir, { recursive: true });
}

describe('HtmlStylesOptimizer - baseline', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanTempDir(tempDir);
  });

  it('should deduplicate and consolidate styles correctly', () => {
    const htmlFile1 = path.join(tempDir, 'file1.html');
    const htmlFile2 = path.join(tempDir, 'file2.html');
    const htmlFile3 = path.join(tempDir, 'file3.html');

    const htmlContent1 = `
      <style type="text/css">
        .class1 { color: red; }
      </style>
      <div class="class1">Test</div>
    `;
    const htmlContent2 = `
      <style type="text/css">
        .class1 { color: red; }
      </style>
      <style type="text/css">
        .class2 { color: blue; }
      </style>
      <div class="class2">Test</div>
    `;
    const htmlContent3 = `
      <style type="text/css">
        .class2 { color: blue; }
      </style>
      <style type="text/css">
        .class3 { color: green; }
      </style>
      <div class="class3">Test</div>
    `;

    fs.writeFileSync(htmlFile1, htmlContent1);
    fs.writeFileSync(htmlFile2, htmlContent2);
    fs.writeFileSync(htmlFile3, htmlContent3);

    const optimizer = HtmlStylesOptimizer.getInstance(tempDir);
    optimizer.run();

    const resultContent1 = fs.readFileSync(htmlFile1, 'utf-8');
    const resultContent2 = fs.readFileSync(htmlFile2, 'utf-8');
    const resultContent3 = fs.readFileSync(htmlFile3, 'utf-8');

    // Check the first file
    expect(resultContent1).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - All styles are consolidated here to avoid duplication -->',
    );
    expect(resultContent1).toContain('.class1 { color: red; }');
    expect(resultContent1).not.toContain('.class2 { color: blue; }');
    expect(resultContent1).not.toContain('.class3 { color: green; }');
    expect(resultContent1).not.toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );

    // Check the second file
    expect(resultContent2).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );
    expect(resultContent2).not.toContain('.class1 { color: red; }');
    expect(resultContent2).toContain('.class2 { color: blue; }');
    expect(resultContent2).not.toContain('.class3 { color: green; }');

    // Check the third file
    expect(resultContent3).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );
    expect(resultContent3).not.toContain('.class2 { color: blue; }');
    expect(resultContent3).toContain('.class3 { color: green; }');
  });

  it('should handle mixed styles with different order correctly', () => {
    const htmlFile1 = path.join(tempDir, 'file1.html');
    const htmlFile2 = path.join(tempDir, 'file2.html');
    const htmlFile3 = path.join(tempDir, 'file3.html');

    const htmlContent1 = `
      <style type="text/css">
        .class1 { color: red; }
      </style>
      <style type="text/css">
        .class3 { color: green; }
      </style>
      <div class="class1">Test</div>
    `;
    const htmlContent2 = `
      <style type="text/css">
        .class2 { color: blue; }
      </style>
      <style type="text/css">
        .class1 { color: red; }
      </style>
      <div class="class2">Test</div>
    `;
    const htmlContent3 = `
      <style type="text/css">
        .class3 { color: green; }
      </style>
      <style type="text/css">
        .class2 { color: blue; }
      </style>
      <div class="class3">Test</div>
    `;

    fs.writeFileSync(htmlFile1, htmlContent1);
    fs.writeFileSync(htmlFile2, htmlContent2);
    fs.writeFileSync(htmlFile3, htmlContent3);

    const optimizer = HtmlStylesOptimizer.getInstance(tempDir);
    optimizer.run();

    const resultContent1 = fs.readFileSync(htmlFile1, 'utf-8');
    const resultContent2 = fs.readFileSync(htmlFile2, 'utf-8');
    const resultContent3 = fs.readFileSync(htmlFile3, 'utf-8');

    // Check the first file
    expect(resultContent1).toContain('.class1 { color: red; }');
    expect(resultContent1).not.toContain('.class2 { color: blue; }');
    expect(resultContent1).toContain('.class3 { color: green; }');
    expect(resultContent1).not.toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );

    // Check the second file
    expect(resultContent2).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );
    expect(resultContent2).toContain('.class2 { color: blue; }');
    expect(resultContent2).not.toContain('.class1 { color: red; }');
    expect(resultContent2).not.toContain('.class3 { color: green; }');

    // Check the third file
    expect(resultContent3).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );
    expect(resultContent3).not.toContain('.class3 { color: green; }');
    expect(resultContent3).not.toContain('.class2 { color: blue; }');
    expect(resultContent3).not.toContain('.class1 { color: red; }');
  });

  it('should extract and handle CSS from @layer definitions in <style> tags', () => {
    const htmlFile1 = path.join(tempDir, 'file1.html');
    const htmlFile2 = path.join(tempDir, 'file2.html');

    const htmlContent1 = `
    <style type="text/css">
      @layer base {
        .class1 { color: red; }
      }
    </style>
    <div class="class1">Test</div>
  `;
    const htmlContent2 = `
    <style type="text/css">
      @layer components {
        .class2 { color: blue; }
      }
    </style>
    <div class="class2">Test</div>
  `;

    fs.writeFileSync(htmlFile1, htmlContent1);
    fs.writeFileSync(htmlFile2, htmlContent2);

    const optimizer = HtmlStylesOptimizer.getInstance(tempDir);
    optimizer.run();

    const resultContent1 = fs.readFileSync(htmlFile1, 'utf-8');
    const resultContent2 = fs.readFileSync(htmlFile2, 'utf-8');

    // Check the flattened styles are in the first file
    expect(resultContent1).toContain('.class1 { color: red; }');
    expect(resultContent1).not.toContain('.class2 { color: blue; }');

    // Check that file 2 does not contain duplicate styles
    expect(resultContent2).not.toContain('.class1 { color: red; }');
    expect(resultContent2).toContain('.class2 { color: blue; }');
  });

  it('should extract and handle CSS from @layer definitions in <style> tags, plus not layered class', () => {
    const htmlFile1 = path.join(tempDir, 'file1.html');
    const htmlFile2 = path.join(tempDir, 'file2.html');

    const htmlContent1 = `
    <style type="text/css">
      @layer base {
        .class1 { color: red; }
      }
      .class3 { color: green; }
    </style>
    <div class="class1">Test</div>
  `;
    const htmlContent2 = `
    <style type="text/css">
      @layer components {
        .class2 { color: blue; }
      }
    </style>
    <div class="class2">Test</div>
  `;

    fs.writeFileSync(htmlFile1, htmlContent1);
    fs.writeFileSync(htmlFile2, htmlContent2);

    const optimizer = HtmlStylesOptimizer.getInstance(tempDir);
    optimizer.run();

    const resultContent1 = fs.readFileSync(htmlFile1, 'utf-8');
    const resultContent2 = fs.readFileSync(htmlFile2, 'utf-8');

    // Check the flattened styles are in the first file
    expect(resultContent1).toContain('.class1 { color: red; }');
    expect(resultContent1).toContain('.class3 { color: green; }');
    expect(resultContent1).not.toContain('.class2 { color: blue; }');

    // Check that file 2 does not contain duplicate styles
    expect(resultContent2).toContain('.class2 { color: blue; }');
    expect(resultContent2).not.toContain('.class1 { color: red; }');
    expect(resultContent2).not.toContain('.class3 { color: green; }');
  });

  it('should extract and handle CSS from @layer definitions in <style> tags, deduplicate and consolidate', () => {
    const htmlFile1 = path.join(tempDir, 'file1.html');
    const htmlFile2 = path.join(tempDir, 'file2.html');

    const htmlContent1 = `
      <style type="text/css">
        @layer base {
          .class1 { color: red; }
          .class2 { color: blue; }
        }
        .class3 { color: green; }
      </style>
      <div class="class1">Test</div>
    `;
    const htmlContent2 = `
      <style type="text/css">
        @layer base {
          .class2 { color: blue; }
        }
        .class3 { color: green; }
        .class4 { color: magenta; }
      </style>
      <div class="class2">Test</div>
    `;

    fs.writeFileSync(htmlFile1, htmlContent1);
    fs.writeFileSync(htmlFile2, htmlContent2);

    const optimizer = HtmlStylesOptimizer.getInstance(tempDir);
    optimizer.run();

    const resultContent1 = fs.readFileSync(htmlFile1, 'utf-8');
    const resultContent2 = fs.readFileSync(htmlFile2, 'utf-8');

    // Check the flattened styles are in the first file
    expect(resultContent1).toContain('.class1 { color: red; }');
    expect(resultContent1).toContain('.class2 { color: blue; }');
    expect(resultContent1).toContain('.class3 { color: green; }');
    expect(resultContent1).not.toContain('.class4 { color: magenta; }');

    // Check that file 2 does not contain duplicate styles
    expect(resultContent2).not.toContain('.class1 { color: red; }');
    expect(resultContent2).not.toContain('.class2 { color: blue; }');
    expect(resultContent2).not.toContain('.class3 { color: green; }');
    expect(resultContent2).toContain('.class4 { color: magenta; }');
  });
});

describe('HtmlStylesOptimizer - Hansui component', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanTempDir(tempDir);
  });

  it('should properly handle layers and :root', () => {
    const htmlFile1 = path.join(tempDir, 'file1.html');
    const htmlFile2 = path.join(tempDir, 'file2.html');

    const htmlContent1 = `<style type="text/css">
  @layer reset {
    *, *:before, *:after {
      box-sizing: border-box;
      border: 0;
    }
  }
  :root {
    --hs-color-primary: #ff0000;
    --hs-color-secondary: #00ff00;
  }
  .base { color: var(--hs-color-primary); }
  @layer components {.btn { color: var(--hs-color-secondary); }}
</style>
<div class="class1">Test</div>`;

    const htmlContent2 = `<style type="text/css">
  .base { color: var(--hs-color-primary); }
  @layer components {.btn-error { color: var(--hs-color-error); }}
</style>
<div class="class2">Test</div>`;

    fs.writeFileSync(htmlFile1, htmlContent1);
    fs.writeFileSync(htmlFile2, htmlContent2);

    const optimizer = HtmlStylesOptimizer.getInstance(tempDir);
    optimizer.run();

    const resultContent1 = fs.readFileSync(htmlFile1, 'utf-8');
    const resultContent2 = fs.readFileSync(htmlFile2, 'utf-8');

    // Verify root styles are preserved
    expect(resultContent1).toContain(':root {');
    expect(resultContent1).toContain('--hs-color-primary: #ff0000');
    expect(resultContent1).toContain(
      '.base { color: var(--hs-color-primary); }',
    );
    expect(resultContent1).toContain(
      '.btn { color: var(--hs-color-secondary); }',
    );

    expect(resultContent1).toEqual(
      `
<!-- [vitepress-templ-plugin] - DO NOT EDIT - All styles are consolidated here to avoid duplication -->
<style type="text/css">
*, *:before, *:after { box-sizing: border-box; border: 0; }
:root { --hs-color-primary: #ff0000; --hs-color-secondary: #00ff00; }
.base { color: var(--hs-color-primary); }
.btn { color: var(--hs-color-secondary); }
</style>
<div class="class1">Test</div>
  `.trim(),
    );

    // Check for consolidated styles
    expect(resultContent2).toContain(
      '.btn-error { color: var(--hs-color-error); }',
    );
    expect(resultContent2).not.toContain(
      '.base { color: var(--hs-color-primary); }',
    );

    // Check for proper generated messages
    expect(resultContent1).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - All styles are consolidated here',
    );
    expect(resultContent2).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found',
    );
  });
});
