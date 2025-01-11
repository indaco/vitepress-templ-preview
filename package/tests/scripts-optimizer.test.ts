import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import HtmlScriptsOptimizer from '../src/scripts-optimizer';

// Helper function to create a temporary directory for testing
function createTempDir() {
  const tempDir = path.join(__dirname, 'temp', `test-scripts`);
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

// Helper function to clean up the temporary directory
function cleanTempDir(tempDir: string) {
  fs.rmSync(tempDir, { recursive: true });
}

describe('HtmlScriptsOptimizer', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanTempDir(tempDir);
  });

  it('should deduplicate and consolidate scripts correctly', () => {
    const htmlFile1 = path.join(tempDir, 'file1.html');
    const htmlFile2 = path.join(tempDir, 'file2.html');
    const htmlFile3 = path.join(tempDir, 'file3.html');

    const htmlContent1 = `
      <script type="text/javascript">
        console.log('script1');
      </script>
      <div>Test</div>
    `;
    const htmlContent2 = `
      <script type="text/javascript">
        console.log('script1');
      </script>
      <script type="text/javascript">
        console.log('script2');
      </script>
      <div>Test</div>
    `;
    const htmlContent3 = `
      <script type="text/javascript">
        console.log('script2');
      </script>
      <script type="text/javascript">
        function greetings() {
          console.log("hello world")
        }
      </script>
      <div>Test</div>
    `;

    fs.writeFileSync(htmlFile1, htmlContent1);
    fs.writeFileSync(htmlFile2, htmlContent2);
    fs.writeFileSync(htmlFile3, htmlContent3);

    const optimizer = HtmlScriptsOptimizer.getInstance(tempDir);
    optimizer.run();

    const resultContent1 = fs.readFileSync(htmlFile1, 'utf-8');
    const resultContent2 = fs.readFileSync(htmlFile2, 'utf-8');
    const resultContent3 = fs.readFileSync(htmlFile3, 'utf-8');

    // Check the first file
    expect(resultContent1).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - All scripts are consolidated here to avoid duplication -->',
    );
    expect(resultContent1).toContain("console.log('script1');");
    expect(resultContent1).toContain("console.log('script2');");
    expect(resultContent1).toMatch(/function greetings\(\) {/);
    expect(resultContent1).not.toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated scripts found and moved to avoid duplication -->',
    );

    // Check the second file
    expect(resultContent2).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated scripts found and moved to avoid duplication -->',
    );
    expect(resultContent2).not.toContain("console.log('script1');");
    expect(resultContent2).not.toContain("console.log('script2');");
    expect(resultContent2).not.toMatch(/function greetings\(\) {/);

    // Check the third file
    expect(resultContent3).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated scripts found and moved to avoid duplication -->',
    );
    expect(resultContent3).not.toContain("console.log('script2');");
    expect(resultContent3).not.toMatch(/function greetings\(\) {/);
  });

  it('should handle multiple files with nested scripts correctly', () => {
    const htmlFile1 = path.join(tempDir, 'file1.html');
    const htmlFile2 = path.join(tempDir, 'file2.html');
    const htmlFile3 = path.join(tempDir, 'file3.html');

    const htmlContent1 = `
      <script type="text/javascript">
        console.log('script1');
      </script>
      <div>Test</div>
    `;
    const htmlContent2 = `
      <script type="text/javascript">
        console.log('script1');
      </script>
      <script type="text/javascript">
        console.log('script2');
      </script>
      <div>Test</div>
    `;
    const htmlContent3 = `
      <script type="text/javascript">
        console.log('script2');
      </script>
      <script type="text/javascript">
        console.log('script3');
      </script>
      <div>Test</div>
    `;

    fs.writeFileSync(htmlFile1, htmlContent1);
    fs.writeFileSync(htmlFile2, htmlContent2);
    fs.writeFileSync(htmlFile3, htmlContent3);

    const optimizer = HtmlScriptsOptimizer.getInstance(tempDir);
    optimizer.run();

    const resultContent1 = fs.readFileSync(htmlFile1, 'utf-8');
    const resultContent2 = fs.readFileSync(htmlFile2, 'utf-8');
    const resultContent3 = fs.readFileSync(htmlFile3, 'utf-8');

    // Check the first file
    expect(resultContent1).toContain("console.log('script1');");
    expect(resultContent1).toContain("console.log('script2');");
    expect(resultContent1).toContain("console.log('script3');");
    expect(resultContent1).not.toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated scripts found and moved to avoid duplication -->',
    );

    // Check the second file
    expect(resultContent2).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated scripts found and moved to avoid duplication -->',
    );
    expect(resultContent2).not.toContain("console.log('script1');");
    expect(resultContent2).not.toContain("console.log('script2');");
    expect(resultContent2).not.toContain("console.log('script3');");

    // Check the third file
    expect(resultContent3).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated scripts found and moved to avoid duplication -->',
    );
    expect(resultContent3).not.toContain("console.log('script1');");
    expect(resultContent3).not.toContain("console.log('script2');");
    expect(resultContent3).not.toContain("console.log('script3');");
  });

  it('should handle mixed scripts with different order correctly', () => {
    const htmlFile1 = path.join(tempDir, 'file1.html');
    const htmlFile2 = path.join(tempDir, 'file2.html');
    const htmlFile3 = path.join(tempDir, 'file3.html');

    const htmlContent1 = `
      <script type="text/javascript">
        console.log('script1');
      </script>
      <script type="text/javascript">
        console.log('script3');
      </script>
      <div>Test</div>
    `;
    const htmlContent2 = `
      <script type="text/javascript">
        console.log('script2');
      </script>
      <script type="text/javascript">
        console.log('script1');
      </script>
      <div>Test</div>
    `;
    const htmlContent3 = `
      <script type="text/javascript">
        console.log('script3');
      </script>
      <script type="text/javascript">
        console.log('script2');
      </script>
      <div>Test</div>
    `;

    fs.writeFileSync(htmlFile1, htmlContent1);
    fs.writeFileSync(htmlFile2, htmlContent2);
    fs.writeFileSync(htmlFile3, htmlContent3);

    const optimizer = HtmlScriptsOptimizer.getInstance(tempDir);
    optimizer.run();

    const resultContent1 = fs.readFileSync(htmlFile1, 'utf-8');
    const resultContent2 = fs.readFileSync(htmlFile2, 'utf-8');
    const resultContent3 = fs.readFileSync(htmlFile3, 'utf-8');

    // Check the first file
    expect(resultContent1).toContain("console.log('script1');");
    expect(resultContent1).toContain("console.log('script2');");
    expect(resultContent1).toContain("console.log('script3');");
    expect(resultContent1).not.toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated scripts found and moved to avoid duplication -->',
    );

    // Check the second file
    expect(resultContent2).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated scripts found and moved to avoid duplication -->',
    );
    expect(resultContent2).not.toContain("console.log('script1');");
    expect(resultContent2).not.toContain("console.log('script2');");
    expect(resultContent2).not.toContain("console.log('script3');");

    // Check the third file
    expect(resultContent3).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated scripts found and moved to avoid duplication -->',
    );
    expect(resultContent3).not.toContain("console.log('script2');");
    expect(resultContent3).not.toContain("console.log('script3');");
  });
});
