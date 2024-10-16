import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import HtmlStylesOptimizer from './styles-optimizer';

// Helper function to create a temporary directory for testing
function createTempDir() {
  const tempDir = path.join(__dirname, 'temp', `test-styles}`);
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

// Helper function to clean up the temporary directory
function cleanTempDir(tempDir: string) {
  fs.rmSync(tempDir, { recursive: true });
}

describe('HtmlStylesOptimizer', () => {
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
    expect(resultContent1).toContain('.class2 { color: blue; }');
    expect(resultContent1).not.toContain('.class3 { color: green; }');
    expect(resultContent1).not.toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );

    // Check the second file
    expect(resultContent2).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );
    expect(resultContent2).not.toContain('.class1 { color: red; }');
    expect(resultContent2).not.toContain('.class2 { color: blue; }');
    expect(resultContent2).not.toContain('.class3 { color: green; }');

    // Check the third file
    expect(resultContent3).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );
    expect(resultContent3).not.toContain('.class2 { color: blue; }');
    expect(resultContent3).toContain('.class3 { color: green; }');
  });

  it('should handle multiple files with nested styles correctly', () => {
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
    expect(resultContent1).toContain('.class1 { color: red; }');
    expect(resultContent1).toContain('.class2 { color: blue; }');
    expect(resultContent1).not.toContain('.class3 { color: green; }');
    expect(resultContent1).not.toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );

    // Check the second file
    expect(resultContent2).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );
    expect(resultContent2).not.toContain('.class1 { color: red; }');
    expect(resultContent2).not.toContain('.class2 { color: blue; }');
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
    expect(resultContent1).toContain('.class2 { color: blue; }');
    expect(resultContent1).toContain('.class3 { color: green; }');
    expect(resultContent1).not.toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );

    // Check the second file
    expect(resultContent2).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );
    expect(resultContent2).not.toContain('.class2 { color: blue; }');
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
});
