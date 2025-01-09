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

// Helper function to minify a string
function _minify(text: string): string {
  return text.replace(/\s+/g, '');
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
    expect(resultContent1).toContain(_minify('.class1 { color: red; }'));
    expect(resultContent1).not.toContain(_minify('.class2 { color: blue; }'));
    expect(resultContent1).not.toContain(_minify('.class3 { color: green; }'));
    expect(resultContent1).not.toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );

    // Check the second file
    expect(resultContent2).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );
    expect(resultContent2).not.toContain(_minify('.class1 { color: red; }'));
    expect(resultContent2).toContain(_minify('.class2 { color: blue; }'));
    expect(resultContent2).not.toContain(_minify('.class3 { color: green; }'));

    // Check the third file
    expect(resultContent3).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );
    expect(resultContent3).not.toContain(_minify('.class2 { color: blue; }'));
    expect(resultContent3).toContain(_minify('.class3 { color: green; }'));
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
    expect(resultContent1).toContain(_minify('.class1 { color: red; }'));
    expect(resultContent1).not.toContain(_minify('.class2 { color: blue; }'));
    expect(resultContent1).toContain(_minify('.class3 { color: green; }'));
    expect(resultContent1).not.toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );

    // Check the second file
    expect(resultContent2).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );
    expect(resultContent2).toContain(_minify('.class2 { color: blue; }'));
    expect(resultContent2).not.toContain(_minify('.class1 { color: red; }'));
    expect(resultContent2).not.toContain(_minify('.class3 { color: green; }'));

    // Check the third file
    expect(resultContent3).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->',
    );
    expect(resultContent3).not.toContain(_minify('.class3 {color: green; }'));
    expect(resultContent3).not.toContain(_minify('.class2 { color: blue; }'));
    expect(resultContent3).not.toContain(_minify('.class1 { color: red; }'));
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

    //  Check the flattened styles are in the first file
    expect(resultContent1).toContain(_minify('.class1 { color: red; }'));
    expect(resultContent1).not.toContain(_minify('.class2 { color: blue; }'));

    // Check that file 2 does not contain duplicate styles
    expect(resultContent2).not.toContain(_minify('.class1 { color: red; }'));
    expect(resultContent2).toContain(_minify('.class2 { color: blue; }'));
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
    expect(resultContent1).toContain(_minify('.class1 { color: red; }'));
    expect(resultContent1).toContain(_minify('.class3 { color: green; }'));
    expect(resultContent1).not.toContain(_minify('.class2 { color: blue; }'));

    // Check that file 2 does not contain duplicate styles
    expect(resultContent2).toContain(_minify('.class2 { color: blue; }'));
    expect(resultContent2).not.toContain(_minify('.class1 { color: red; }'));
    expect(resultContent2).not.toContain(_minify('.class3 { color: green; }'));
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
    expect(resultContent1).toContain(_minify('.class1 { color: red; }'));
    expect(resultContent1).toContain(_minify('.class2 { color: blue; }'));
    expect(resultContent1).toContain(_minify('.class3 { color: green; }'));
    expect(resultContent1).not.toContain(
      _minify('.class4 { color: magenta; }'),
    );

    // Check that file 2 does not contain duplicate styles
    expect(resultContent2).not.toContain(_minify('.class1 { color: red; }'));
    expect(resultContent2).not.toContain(_minify('.class2 { color: blue; }'));
    expect(resultContent2).not.toContain(_minify('.class3 { color: green; }'));
    expect(resultContent2).toContain(_minify('.class4 { color: magenta; }'));
  });
});

describe('HtmlStylesOptimizer - Complex CSS', () => {
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
    expect(resultContent1).toContain(_minify(':root {'));
    expect(resultContent1).toContain('--hs-color-primary: #ff0000');
    expect(resultContent1).toContain(
      _minify('.base {color: var(--hs-color-primary); }'),
    );
    expect(resultContent1).toContain(
      _minify('.btn{ color: var(--hs-color-secondary); }'),
    );

    expect(resultContent1).toEqual(
      `
<!-- [vitepress-templ-plugin] - DO NOT EDIT - All styles are consolidated here to avoid duplication -->
<style type="text/css">
*, *:before, *:after{box-sizing:border-box;border:0;}
:root{--hs-color-primary: #ff0000;--hs-color-secondary: #00ff00;}
.btn{color:var(--hs-color-secondary);}
.base{color:var(--hs-color-primary);}
</style>
<div class="class1">Test</div>
      `.trim(),
    );

    // Check for consolidated styles
    expect(resultContent2).toContain(
      _minify('.btn-error { color: var(--hs-color-error); }'),
    );
    expect(resultContent2).not.toContain(
      _minify('.base { color: var(--hs-color-primary); }'),
    );

    //  Check for proper generated messages
    expect(resultContent1).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - All styles are consolidated here',
    );
    expect(resultContent2).toContain(
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found',
    );
  });

  it('should properly extract layer and preserve :root etc', () => {
    const htmlFile1 = path.join(tempDir, 'file1.html');
    const htmlFile2 = path.join(tempDir, 'file2.html');

    const htmlContent1 = `<style type="text/css">
    /* [taox] BEGIN */
    @layer reset,base,components,utilities;@layer reset{*,*:before,*:after{box-sizing:border-box;border:0;border-style:solid}}@layer base{:root{--hs-c-white: 1 0 0;--hs-c-black: 0 0 0;--hs-transparent: oklch(0 0 0 / 0);--hs-opacity: 1;--hs-font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--hs-font-serif: ui-serif, georgia, cambria, "Times New Roman", times, serif;--hs-font-mono: ui-monospace, sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace}}

    /* [taox] END */
    </style>
    <div class="class1">Test</div>`;

    const htmlContent2 = `<style type="text/css">
    /* [taox] BEGIN */
    @layer reset,base,components,utilities;@layer reset{*,*:before,*:after{box-sizing:border-box;border:0;border-style:solid}}@layer base{:root{--hs-c-white: 1 0 0;--hs-c-black: 0 0 0;--hs-transparent: oklch(0 0 0 / 0);--hs-opacity: 1;--hs-font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--hs-font-serif: ui-serif, georgia, cambria, "Times New Roman", times, serif;--hs-font-mono: ui-monospace, sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace}.hans :is(blockquote,dl,dd,h1,h2,h3,h4,h5,h6,figure,p,pre){margin:0}.hans :is(h1,h2,h3,h4,h5,h6,p){overflow-wrap:break-word}.hans :is(h1,h2,h3,h4,h5,h6){word-break:break-word;text-wrap:balance}.hans :is(p,li,figcaption){text-wrap:pretty}.hans a{text-decoration:none}.hans :is(a,button){cursor:pointer}.hans :is(button,input,select,textarea){font-family:inherit;font-size:100%;font-feature-settings:inherit;font-variation-settings:inherit;line-height:inherit;color:inherit}.hans :is(button,select){text-transform:none}.hans li+li{margin-top:0}.hans :is(img,svg,video,canvas){display:block;max-width:100%;height:auto}}@layer utilities{.sronly{position:absolute;overflow:hidden;width:1px;height:1px;margin:-1px;padding:0;white-space:nowrap;clip:rect(0,0,0,0);border-width:0;}}

    /* [taox] END */
    </style>`;

    fs.writeFileSync(htmlFile1, htmlContent1);
    fs.writeFileSync(htmlFile2, htmlContent2);

    const optimizer = HtmlStylesOptimizer.getInstance(tempDir);
    optimizer.run();

    const resultContent1 = fs.readFileSync(htmlFile1, 'utf-8');
    const resultContent2 = fs.readFileSync(htmlFile2, 'utf-8');

    expect(resultContent1).toEqual(
      `<!-- [vitepress-templ-plugin] - DO NOT EDIT - All styles are consolidated here to avoid duplication -->
<style type="text/css">
*, *:before, *:after{box-sizing:border-box;border:0;border-style:solid;}
:root{--hs-c-white: 1 0 0;--hs-c-black: 0 0 0;--hs-transparent: oklch(0 0 0 / 0);--hs-opacity: 1;--hs-font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--hs-font-serif: ui-serif, georgia, cambria, "Times New Roman", times, serif;--hs-font-mono: ui-monospace, sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace;}
</style>
<div class="class1">Test</div>`.trim(),
    );

    expect(resultContent2).toEqual(
      `<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->
<style type="text/css">
.hans :is(blockquote, dl, dd, h1, h2, h3, h4, h5, h6, figure, p, pre){margin:0;}
.hans :is(h1, h2, h3, h4, h5, h6, p){overflow-wrap:break-word;}
.hans :is(h1, h2, h3, h4, h5, h6){word-break:break-word;text-wrap:balance;}
.hans :is(p, li, figcaption){text-wrap:pretty;}
.hans a{text-decoration:none;}
.hans :is(a, button){cursor:pointer;}
.hans :is(button, input, select, textarea){font-family:inherit;font-size:100%;font-feature-settings:inherit;font-variation-settings:inherit;line-height:inherit;color:inherit;}
.hans :is(button, select){text-transform:none;}
.hans li+li{margin-top:0;}
.hans :is(img, svg, video, canvas){display:block;max-width:100%;height:auto;}
.sronly{position:absolute;overflow:hidden;width:1px;height:1px;margin:-1px;padding:0;white-space:nowrap;clip:rect(0,0,0,0);border-width:0;}
</style>
`,
    );
  });

  it('should properly extract layers content and preserve other rules', () => {
    const htmlFile1 = path.join(tempDir, 'file1.html');
    const htmlFile2 = path.join(tempDir, 'file2.html');

    const htmlContent1 = `<style type="text/css">
          /* [taox] BEGIN */
          @layer reset,base,components,utilities;@layer reset{*,*:before,*:after{box-sizing:border-box;border:0;border-style:solid}}@layer base{:root{--hs-c-white: 1 0 0;--hs-c-black: 0 0 0;--hs-transparent: oklch(0 0 0 / 0);--hs-opacity: 1;--hs-font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--hs-font-serif: ui-serif, georgia, cambria, "Times New Roman", times, serif;--hs-font-mono: ui-monospace, sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace}.hans :is(blockquote,dl,dd,h1,h2,h3,h4,h5,h6,figure,p,pre){margin:0}.hans :is(h1,h2,h3,h4,h5,h6,p){overflow-wrap:break-word}.hans :is(h1,h2,h3,h4,h5,h6){word-break:break-word;text-wrap:balance}.hans :is(p,li,figcaption){text-wrap:pretty}.hans a{text-decoration:none}.hans :is(a,button){cursor:pointer}.hans :is(button,input,select,textarea){font-family:inherit;font-size:100%;font-feature-settings:inherit;font-variation-settings:inherit;line-height:inherit;color:inherit}.hans :is(button,select){text-transform:none}.hans li+li{margin-top:0}.hans :is(img,svg,video,canvas){display:block;max-width:100%;height:auto}}@layer utilities{.sronly{position:absolute;overflow:hidden;width:1px;height:1px;margin:-1px;padding:0;white-space:nowrap;clip:rect(0,0,0,0);border-width:0;}}

          /* [taox] END */
          </style>
          <div class="class1">Test</div>`;

    const htmlContent2 = `<style type="text/css">
          /* [taox] BEGIN */
          @layer reset,base,components,utilities;@layer reset{*,*:before,*:after{box-sizing:border-box;border:0;border-style:solid}}@layer base{:root{--hs-c-white: 1 0 0;--hs-c-black: 0 0 0;--hs-transparent: oklch(0 0 0 / 0);--hs-opacity: 1;--hs-font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--hs-font-serif: ui-serif, georgia, cambria, "Times New Roman", times, serif;--hs-font-mono: ui-monospace, sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace}.hans :is(blockquote,dl,dd,h1,h2,h3,h4,h5,h6,figure,p,pre){margin:0}.hans :is(h1,h2,h3,h4,h5,h6,p){overflow-wrap:break-word}.hans :is(h1,h2,h3,h4,h5,h6){word-break:break-word;text-wrap:balance}.hans :is(p,li,figcaption){text-wrap:pretty}.hans a{text-decoration:none}.hans :is(a,button){cursor:pointer}.hans :is(button,input,select,textarea){font-family:inherit;font-size:100%;font-feature-settings:inherit;font-variation-settings:inherit;line-height:inherit;color:inherit}.hans :is(button,select){text-transform:none}.hans li+li{margin-top:0}.hans :is(img,svg,video,canvas){display:block;max-width:100%;height:auto}}@layer utilities{.sronly{position:absolute;overflow:hidden;width:1px;height:1px;margin:-1px;padding:0;white-space:nowrap;clip:rect(0,0,0,0);border-width:0;}}

          /* [taox] END */
          </style><style type="text/css">
        :root {
          --hs-c-slate-50: 0.984 0.003 247.858;
          --hs-c-slate-100: 0.968 0.007 247.896;
          --hs-c-slate-200: 0.929 0.013 255.508;
          --hs-c-slate-300: 0.869 0.022 252.894;
          --hs-c-slate-400: 0.704 0.04 256.788;
          --hs-c-slate-500: 0.554 0.046 257.417;
          --hs-c-slate-600: 0.446 0.043 257.281;
          --hs-c-slate-700: 0.372 0.044 257.287;
          --hs-c-slate-800: 0.279 0.041 260.031;
          --hs-c-slate-900: 0.208 0.042 265.755;
          --hs-c-slate-950: 0.129 0.042 264.695;
          --hs-c-neutral-50: var(--hs-c-slate-50);
          --hs-c-neutral-100: var(--hs-c-slate-100);
          --hs-c-neutral-200: var(--hs-c-slate-200);
          --hs-c-neutral-300: var(--hs-c-slate-300);
          --hs-c-neutral-400: var(--hs-c-slate-400);
          --hs-c-neutral-500: var(--hs-c-slate-500);
          --hs-c-neutral-600: var(--hs-c-slate-600);
          --hs-c-neutral-700: var(--hs-c-slate-700);
          --hs-c-neutral-800: var(--hs-c-slate-800);
          --hs-c-neutral-900: var(--hs-c-slate-900);
          --hs-c-neutral-950: var(--hs-c-slate-950);
        }
        </style>
          <div class="class2">Test</div>`;

    fs.writeFileSync(htmlFile1, htmlContent1);
    fs.writeFileSync(htmlFile2, htmlContent2);

    const optimizer = HtmlStylesOptimizer.getInstance(tempDir, {
      minify: true,
    });
    optimizer.run();

    const resultContent1 = fs.readFileSync(htmlFile1, 'utf-8');
    const resultContent2 = fs.readFileSync(htmlFile2, 'utf-8');

    expect(resultContent1).toEqual(
      `
<!-- [vitepress-templ-plugin] - DO NOT EDIT - All styles are consolidated here to avoid duplication -->
<style type="text/css">
*, *:before, *:after{box-sizing:border-box;border:0;border-style:solid;}
:root{--hs-c-white: 1 0 0;--hs-c-black: 0 0 0;--hs-transparent: oklch(0 0 0 / 0);--hs-opacity: 1;--hs-font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--hs-font-serif: ui-serif, georgia, cambria, "Times New Roman", times, serif;--hs-font-mono: ui-monospace, sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace;}
.hans :is(blockquote, dl, dd, h1, h2, h3, h4, h5, h6, figure, p, pre){margin:0;}
.hans :is(h1, h2, h3, h4, h5, h6, p){overflow-wrap:break-word;}
.hans :is(h1, h2, h3, h4, h5, h6){word-break:break-word;text-wrap:balance;}
.hans :is(p, li, figcaption){text-wrap:pretty;}
.hans a{text-decoration:none;}
.hans :is(a, button){cursor:pointer;}
.hans :is(button, input, select, textarea){font-family:inherit;font-size:100%;font-feature-settings:inherit;font-variation-settings:inherit;line-height:inherit;color:inherit;}
.hans :is(button, select){text-transform:none;}
.hans li+li{margin-top:0;}
.hans :is(img, svg, video, canvas){display:block;max-width:100%;height:auto;}
.sronly{position:absolute;overflow:hidden;width:1px;height:1px;margin:-1px;padding:0;white-space:nowrap;clip:rect(0,0,0,0);border-width:0;}
</style>
<div class="class1">Test</div>
        `.trim(),
    );

    expect(resultContent2).toEqual(
      `
<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->
<style type="text/css">
:root{--hs-c-slate-50: 0.984 0.003 247.858;--hs-c-slate-100: 0.968 0.007 247.896;--hs-c-slate-200: 0.929 0.013 255.508;--hs-c-slate-300: 0.869 0.022 252.894;--hs-c-slate-400: 0.704 0.04 256.788;--hs-c-slate-500: 0.554 0.046 257.417;--hs-c-slate-600: 0.446 0.043 257.281;--hs-c-slate-700: 0.372 0.044 257.287;--hs-c-slate-800: 0.279 0.041 260.031;--hs-c-slate-900: 0.208 0.042 265.755;--hs-c-slate-950: 0.129 0.042 264.695;--hs-c-neutral-50: var(--hs-c-slate-50);--hs-c-neutral-100: var(--hs-c-slate-100);--hs-c-neutral-200: var(--hs-c-slate-200);--hs-c-neutral-300: var(--hs-c-slate-300);--hs-c-neutral-400: var(--hs-c-slate-400);--hs-c-neutral-500: var(--hs-c-slate-500);--hs-c-neutral-600: var(--hs-c-slate-600);--hs-c-neutral-700: var(--hs-c-slate-700);--hs-c-neutral-800: var(--hs-c-slate-800);--hs-c-neutral-900: var(--hs-c-slate-900);--hs-c-neutral-950: var(--hs-c-slate-950);}
</style>
<div class="class2">Test</div>
`.trim(),
    );
  });

  // it('should correctly parse HTML with @layer rules and extract styles', () => {
  //   const htmlFile = path.join(tempDir, 'file_button.html');

  //   const htmlContent = `<style type="text/css">
  //      /* [taox] BEGIN */
  //      @layer reset,base,components,utilities;@layer reset{*,*:before,*:after{box-sizing:border-box;border:0;border-style:solid}}@layer base{:root{--hs-c-white: 1 0 0;--hs-c-black: 0 0 0;--hs-transparent: oklch(0 0 0 / 0);--hs-opacity: 1;--hs-font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--hs-font-serif: ui-serif, georgia, cambria, "Times New Roman", times, serif;--hs-font-mono: ui-monospace, sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace}.hans :is(blockquote,dl,dd,h1,h2,h3,h4,h5,h6,figure,p,pre){margin:0}.hans :is(h1,h2,h3,h4,h5,h6,p){overflow-wrap:break-word}.hans :is(h1,h2,h3,h4,h5,h6){word-break:break-word;text-wrap:balance}.hans :is(p,li,figcaption){text-wrap:pretty}.hans a{text-decoration:none}.hans :is(a,button){cursor:pointer}.hans :is(button,input,select,textarea){font-family:inherit;font-size:100%;font-feature-settings:inherit;font-variation-settings:inherit;line-height:inherit;color:inherit}.hans :is(button,select){text-transform:none}.hans li+li{margin-top:0}.hans :is(img,svg,video,canvas){display:block;max-width:100%;height:auto}}@layer utilities{.sronly{position:absolute;overflow:hidden;width:1px;height:1px;margin:-1px;padding:0;white-space:nowrap;clip:rect(0,0,0,0);border-width:0}}

  //     /* [taox] END */
  //     </style><style type="text/css">
  //     :root {
  //       --hs-c-slate-50: 0.984 0.003 247.858;
  //       --hs-c-slate-100: 0.968 0.007 247.896;
  //       --hs-c-slate-200: 0.929 0.013 255.508;
  //       --hs-c-slate-300: 0.869 0.022 252.894;
  //       --hs-c-slate-400: 0.704 0.04 256.788;
  //       --hs-c-slate-500: 0.554 0.046 257.417;
  //       --hs-c-slate-600: 0.446 0.043 257.281;
  //       --hs-c-slate-700: 0.372 0.044 257.287;
  //       --hs-c-slate-800: 0.279 0.041 260.031;
  //       --hs-c-slate-900: 0.208 0.042 265.755;
  //       --hs-c-slate-950: 0.129 0.042 264.695;
  //       --hs-c-neutral-50: var(--hs-c-slate-50);
  //       --hs-c-neutral-100: var(--hs-c-slate-100);
  //       --hs-c-neutral-200: var(--hs-c-slate-200);
  //       --hs-c-neutral-300: var(--hs-c-slate-300);
  //       --hs-c-neutral-400: var(--hs-c-slate-400);
  //       --hs-c-neutral-500: var(--hs-c-slate-500);
  //       --hs-c-neutral-600: var(--hs-c-slate-600);
  //       --hs-c-neutral-700: var(--hs-c-slate-700);
  //       --hs-c-neutral-800: var(--hs-c-slate-800);
  //       --hs-c-neutral-900: var(--hs-c-slate-900);
  //       --hs-c-neutral-950: var(--hs-c-slate-950);
  //     }
  //     </style><style type="text/css">
  //      /* [taox] BEGIN */
  //     @layer components{:is(button,a).hans-btn{--hs-btn-font-family: var(--hs-font-family, var(--hs-font-sans));--hs-btn-block-size: 2.5rem;--hs-btn-min-size: 2.5rem;--hs-btn-px: 1.25em;--hs-btn-py: 0;--hs-btn-font-size: .95rem;--hs-btn-line-height: 1.25rem;--hs-btn-color: var(--hs-btn-default-color);--hs-btn-color-hover: var(--hs-btn-default-color-hover);--hs-btn-color-active: var(--hs-btn-default-color-active);--hs-btn-bg: var(--hs-btn-default-bg);--hs-btn-bg-hover: var(--hs-btn-default-bg-hover);--hs-btn-bg-active: var(--hs-btn-default-bg-active);--hs-btn-border: var(--hs-transparent);--hs-btn-border-hover: var(--hs-btn-border);--hs-btn-border-radius: .375rem;--hs-btn-border-width: 1px;--hs-btn-border-style: solid;--hs-btn-ring-width: 2px;--hs-btn-ring-style: solid;--hs-btn-ring-color: var(--hs-btn-default-ring-color);--hs-btn-ring-offset: 2px;cursor:pointer;user-select:none;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;min-inline-size:var(--hs-btn-min-size);block-size:var(--hs-btn-block-size);padding:var(--hs-btn-py) var(--hs-btn-px);font-family:var(--hs-btn-font-family);font-size:var(--hs-btn-font-size);font-weight:var(--hs-btn-font-weight, 500);line-height:var(--hs-btn-line-height);color:var(--hs-btn-color);background-color:var(--hs-btn-bg);border-color:var(--hs-btn-border);border-style:var(--hs-btn-border-style);border-width:var(--hs-btn-border-width);border-radius:var(--hs-btn-border-radius);outline-color:var(--hs-transparent);transition:color .3s cubic-bezier(.4,0,.2,1),background-color .3s cubic-bezier(.4,0,.2,1),outline-color .1s cubic-bezier(.4,0,.2,1),outline-width .1s cubic-bezier(.4,0,.2,1),outline-offset .1s cubic-bezier(.4,0,.2,1),box-shadow .3s cubic-bezier(.4,0,.2,1)}a.hans-btn{@media screen and (-ms-high-contrast: active){text-decoration:var(--text-decoration, underline)}}:is(button,a).hans-btn:hover{color:var(--hs-btn-color-hover);background-color:var(--hs-btn-bg-hover);border-color:var(--hs-btn-border-hover)}:is(button,a).hans-btn[data-focus-visible=true]:is(:focus,:focus-visible){outline:var(--hs-btn-ring-width) var(--hs-btn-ring-style) var(--hs-btn-ring-color);outline-offset:var(--hs-btn-ring-offset)}:is(button,a).hans-btn:active{color:var(--hs-btn-color-active);background-color:var(--hs-btn-bg-active)}:is(button,a).hans-btn:disabled{--hs-btn-bg: oklch(var(--hs-c-neutral-200));--hs-btn-color: oklch(var(--hs-c-neutral-700));--hs-btn-border: oklch(var(--hs-c-neutral-400));cursor:not-allowed;opacity:.7}.hans-btn[data-block=true]{overflow:hidden;width:100%}.hans-btn[data-border-style=dashed]{--hs-btn-border-style: dashed}.hans-btn[data-border-style=dotted]{--hs-btn-border-style: dotted}.hans-btn[data-border-style=double]{--hs-btn-border-style: double;border-width:2px}.hans-btn[data-shape=box]{--hs-btn-border-radius: 0}.hans-btn[data-shape=pill]{--hs-btn-border-radius: 4rem}.hans-btn[data-shape=circle]{--hs-btn-border-radius: 100vh;aspect-ratio:1/1;min-inline-size:2.5rem;min-block-size:2.5rem;padding:0}.hans-btn[data-size=xs]{--hs-btn-block-size: 1.5rem;--hs-btn-min-size: 1.5rem;--hs-btn-px: .5em;--hs-btn-py: 0;--hs-btn-font-size: .75rem;--hs-btn-line-height: 1rem}.hans-btn[data-size=sm]{--hs-btn-block-size: 2rem;--hs-btn-min-size: 2rem;--hs-btn-px: .75em;--hs-btn-py: 0;--hs-btn-font-size: .875rem;--hs-btn-line-height: 1.25rem}.hans-btn[data-size=md]{--hs-btn-block-size: 2.5rem;--hs-btn-min-size: 2.5rem;--hs-btn-px: 1.25em;--hs-btn-py: 0;--hs-btn-font-size: .95rem;--hs-btn-line-height: 1.25rem}.hans-btn[data-size=lg]{--hs-btn-block-size: 3rem;--hs-btn-min-size: 3rem;--hs-btn-px: 1em;--hs-btn-py: .6em;--hs-btn-font-size: 1.0625rem;--hs-btn-line-height: 1.25rem}.hans-btn__icon{display:inline-block;margin:0;background-repeat:no-repeat;background-size:contain}.hans-btn__icon svg{vertical-align:middle}.hans-btn__icon--left{order:-1;margin-inline-end:.25em}.hans-btn__icon--right{order:1;margin-inline-start:.25em}.hans-btn[data-icon-only=true]{align-items:center;justify-content:center;aspect-ratio:1/1;width:var(--hs-btn-block-size);height:var(--hs-btn-block-size);padding:0}.hans-btn[data-icon-only=true][data-shape=box]{--hs-btn-border-radius: 0}.hans-btn[data-icon-only=true][data-shape=circle]{--hs-btn-border-radius: 100vh}.hans-btn[data-icon-only=true] .icon{margin:0}.hans-btn[data-color=primary]{--hs-btn-color: var(--hs-btn-primary-color);--hs-btn-color-hover: var(--hs-btn-primary-color-hover);--hs-btn-color-active: var(--hs-btn-primary-color-active);--hs-btn-bg: var(--hs-btn-primary-bg);--hs-btn-bg-hover: var(--hs-btn-primary-bg-hover);--hs-btn-bg-active: var(--hs-btn-primary-bg-active);--hs-btn-ring-color: var(--hs-btn-primary-ring-color)}.hans-btn[data-color=secondary]{--hs-btn-color: var(--hs-btn-secondary-color);--hs-btn-color-hover: var(--hs-btn-secondary-color-hover);--hs-btn-color-active: var(--hs-btn-secondary-color-active);--hs-btn-bg: var(--hs-btn-secondary-bg);--hs-btn-bg-hover: var(--hs-btn-secondary-bg-hover);--hs-btn-bg-active: var(--hs-btn-secondary-bg-active);--hs-btn-ring-color: var(--hs-btn-secondary-ring-color)}.hans-btn[data-color=accent]{--hs-btn-color: var(--hs-btn-accent-color);--hs-btn-color-hover: var(--hs-btn-accent-color-hover);--hs-btn-color-active: var(--hs-btn-accent-color-active);--hs-btn-bg: var(--hs-btn-accent-bg);--hs-btn-bg-hover: var(--hs-btn-accent-bg-hover);--hs-btn-bg-active: var(--hs-btn-accent-bg-active);--hs-btn-ring-color: var(--hs-btn-accent-ring-color)}.hans-btn[data-color=success]{--hs-btn-color: var(--hs-btn-success-color);--hs-btn-color-hover: var(--hs-btn-success-color-hover);--hs-btn-color-active: var(--hs-btn-success-color-active);--hs-btn-bg: var(--hs-btn-success-bg);--hs-btn-bg-hover: var(--hs-btn-success-bg-hover);--hs-btn-bg-active: var(--hs-btn-success-bg-active);--hs-btn-ring-color: var(--hs-btn-success-ring-color)}.hans-btn[data-color=error]{--hs-btn-color: var(--hs-btn-error-color);--hs-btn-color-hover: var(--hs-btn-error-color-hover);--hs-btn-color-active: var(--hs-btn-error-color-active);--hs-btn-bg: var(--hs-btn-error-bg);--hs-btn-bg-hover: var(--hs-btn-error-bg-hover);--hs-btn-bg-active: var(--hs-btn-error-bg-active);--hs-btn-ring-color: var(--hs-btn-error-ring-color)}.hans-btn[data-color=warning]{--hs-btn-color: var(--hs-btn-warning-color);--hs-btn-color-hover: var(--hs-btn-warning-color-hover);--hs-btn-color-active: var(--hs-btn-warning-color-active);--hs-btn-bg: var(--hs-btn-warning-bg);--hs-btn-bg-hover: var(--hs-btn-warning-bg-hover);--hs-btn-bg-active: var(--hs-btn-warning-bg-active);--hs-btn-ring-color: var(--hs-btn-warning-ring-color)}.hans-btn[data-color=info]{--hs-btn-color: var(--hs-btn-info-color);--hs-btn-color-hover: var(--hs-btn-info-color-hover);--hs-btn-color-active: var(--hs-btn-info-color-active);--hs-btn-bg: var(--hs-btn-info-bg);--hs-btn-bg-hover: var(--hs-btn-info-bg-hover);--hs-btn-bg-active: var(--hs-btn-info-bg-active);--hs-btn-ring-color: var(--hs-btn-info-ring-color)}.hans-btn[data-color=ghost]{--hs-btn-color: var(--hs-btn-ghost-color);--hs-btn-color-hover: var(--hs-btn-ghost-color-hover);--hs-btn-color-active: var(--hs-btn-ghost-color-active);--hs-btn-bg: transparent;--hs-btn-bg-hover: var(--hs-btn-ghost-bg-hover);--hs-btn-bg-active: var(--hs-btn-ghost-bg-active);--hs-btn-ring-color: var(--hs-btn-ghost-ring-color)}.hans-btn:is(:not([data-variant=outline],[data-variant=light]))[data-border-style]{--hs-btn-border: oklch(var(--hs-c-neutral-300))}.hans-btn:is([data-color=primary]):is(:not([data-variant=outline],[data-variant=light]))[data-border-style]{--hs-btn-border: oklch(var(--hs-c-primary-400))}.hans-btn:is([data-color=secondary]):is(:not([data-variant=outline],[data-variant=light]))[data-border-style]{--hs-btn-border: oklch(var(--hs-c-secondary-400))}.hans-btn:is([data-color=accent]):is(:not([data-variant=outline],[data-variant=light]))[data-border-style]{--hs-btn-border: oklch(var(--hs-c-accent-400))}.hans-btn:is([data-color=success]):is(:not([data-variant=outline],[data-variant=light]))[data-border-style]{--hs-btn-border: oklch(var(--hs-c-success-400))}.hans-btn:is([data-color=error]):is(:not([data-variant=outline],[data-variant=light]))[data-border-style]{--hs-btn-border: oklch(var(--hs-c-error-400))}.hans-btn:is([data-color=warning]):is(:not([data-variant=outline],[data-variant=light]))[data-border-style]{--hs-btn-border: oklch(var(--hs-c-warning-400))}.hans-btn:is([data-color=info]):is(:not([data-variant=outline],[data-variant=light]))[data-border-style]{--hs-btn-border: oklch(var(--hs-c-info-300))}@media (width <= 480px){.hans-btn{--hs-btn-font-family: var(--hs-font-family, var(--hs-font-sans));--hs-btn-px: .875em;--hs-btn-py: 0;--hs-btn-block-size: 2.25rem;--hs-btn-min-size: 2.25rem;--hs-btn-font-size: .875rem}.hans-btn[data-size=sm]{--hs-btn-px: .75em;--hs-btn-py: 0;--hs-btn-block-size: 2rem;--hs-btn-min-size: 2rem;--hs-btn-font-size: .875rem}.hans-btn[data-size=lg]{--hs-btn-px: 1.5em;--hs-btn-py: 0;--hs-btn-block-size: 3rem;--hs-btn-min-size: 3rem;--hs-btn-font-size: 1.25rem}}}

  //      /* [taox] END */
  //     </style>
  //     <style type="text/css">
  //      /* [taox] BEGIN */
  //     @layer components{:root{--hs-btn-default-color: oklch(var(--hs-c-neutral-950));--hs-btn-default-color-hover: var(--hs-btn-default-color);--hs-btn-default-color-active: var(--hs-btn-default-color-hover);--hs-btn-default-bg: oklch(var(--hs-c-neutral-100));--hs-btn-default-bg-hover: oklch(var(--hs-c-neutral-200));--hs-btn-default-bg-active: var(--hs-btn-default-bg-hover);--hs-btn-default-ring-color: oklch(var(--hs-c-neutral-300));--hs-btn-primary-bg: oklch(var(--hs-c-primary-300));--hs-btn-primary-bg-hover: oklch(var(--hs-c-primary-400));--hs-btn-primary-bg-active: var(--hs-btn-primary-bg-hover);--hs-btn-primary-ring-color: oklch(var(--hs-c-primary-300));--hs-btn-secondary-bg: oklch(var(--hs-c-secondary-300));--hs-btn-secondary-bg-hover: oklch(var(--hs-c-secondary-400));--hs-btn-secondary-bg-active: var(--hs-btn-secondary-bg-hover);--hs-btn-secondary-ring-color: oklch(var(--hs-c-secondary-300));--hs-btn-accent-bg: oklch(var(--hs-c-accent-300));--hs-btn-accent-bg-hover: oklch(var(--hs-c-accent-400));--hs-btn-accent-bg-active: var(--hs-btn-accent-bg-hover);--hs-btn-accent-ring-color: oklch(var(--hs-c-accent-300));--hs-btn-success-bg: oklch(var(--hs-c-success-400));--hs-btn-success-bg-hover: oklch(var(--hs-c-success-500));--hs-btn-success-bg-active: var(--hs-btn-success-bg-hover);--hs-btn-success-ring-color: oklch(var(--hs-c-success-300));--hs-btn-error-bg: oklch(var(--hs-c-error-400));--hs-btn-error-bg-hover: oklch(var(--hs-c-error-500));--hs-btn-error-bg-active: var(--hs-btn-error-bg-hover);--hs-btn-error-ring-color: oklch(var(--hs-c-error-300));--hs-btn-warning-bg: oklch(var(--hs-c-warning-400));--hs-btn-warning-bg-hover: oklch(var(--hs-c-warning-500));--hs-btn-warning-bg-active: var(--hs-btn-warning-bg-hover);--hs-btn-warning-ring-color: oklch(var(--hs-c-warning-300));--hs-btn-info-bg: oklch(var(--hs-c-info-400));--hs-btn-info-bg-hover: oklch( var(--hs-c-info-500) ; --hs-btn-info-bg-active: var(--hs-btn-info-bg-hover) );--hs-btn-info-ring-color: oklch(var(--hs-c-info-300));--hs-btn-ghost-color: oklch(var(--hs-c-neutral-700));--hs-btn-ghost-color-hover: var(--hs-btn-ghost-color);--hs-btn-ghost-bg: var(--hs-transparent);--hs-btn-ghost-bg-hover: oklch(var(--hs-c-neutral-100));--hs-btn-ghost-bg-active: var(--hs-btn-ghost-bg-hover);--hs-btn-ghost-ring-color: oklch(var(--hs-c-neutral-300))}html.light,html[data-theme=light],body.light{--hs-btn-default-color: oklch(var(--hs-c-neutral-950));--hs-btn-default-color-hover: var(--hs-btn-default-color);--hs-btn-default-color-active: var(--hs-btn-default-color-hover);--hs-btn-default-bg: oklch(var(--hs-c-neutral-100));--hs-btn-default-bg-hover: oklch(var(--hs-c-neutral-200));--hs-btn-default-bg-active: var(--hs-btn-default-bg-hover);--hs-btn-default-ring-color: oklch(var(--hs-c-neutral-300));--hs-btn-primary-bg: oklch(var(--hs-c-primary-300));--hs-btn-primary-bg-hover: oklch(var(--hs-c-primary-400));--hs-btn-primary-bg-active: var(--hs-btn-primary-bg-hover);--hs-btn-primary-ring-color: oklch(var(--hs-c-primary-300));--hs-btn-secondary-bg: oklch(var(--hs-c-secondary-300));--hs-btn-secondary-bg-hover: oklch(var(--hs-c-secondary-400));--hs-btn-secondary-bg-active: var(--hs-btn-secondary-bg-hover);--hs-btn-secondary-ring-color: oklch(var(--hs-c-secondary-300));--hs-btn-accent-bg: oklch(var(--hs-c-accent-300));--hs-btn-accent-bg-hover: oklch(var(--hs-c-accent-400));--hs-btn-accent-bg-active: var(--hs-btn-accent-bg-hover);--hs-btn-accent-ring-color: oklch(var(--hs-c-accent-300));--hs-btn-success-bg: oklch(var(--hs-c-success-400));--hs-btn-success-bg-hover: oklch(var(--hs-c-success-500));--hs-btn-success-bg-active: var(--hs-btn-success-bg-hover);--hs-btn-success-ring-color: oklch(var(--hs-c-success-300));--hs-btn-error-bg: oklch(var(--hs-c-error-400));--hs-btn-error-bg-hover: oklch(var(--hs-c-error-500));--hs-btn-error-bg-active: var(--hs-btn-error-bg-hover);--hs-btn-error-ring-color: oklch(var(--hs-c-error-300));--hs-btn-warning-bg: oklch(var(--hs-c-warning-400));--hs-btn-warning-bg-hover: oklch(var(--hs-c-warning-500));--hs-btn-warning-bg-active: var(--hs-btn-warning-bg-hover);--hs-btn-warning-ring-color: oklch(var(--hs-c-warning-300));--hs-btn-info-bg: oklch(var(--hs-c-info-400));--hs-btn-info-bg-hover: oklch( var(--hs-c-info-500) ; --hs-btn-info-bg-active: var(--hs-btn-info-bg-hover) );--hs-btn-info-ring-color: oklch(var(--hs-c-info-300));--hs-btn-ghost-color: oklch(var(--hs-c-neutral-700));--hs-btn-ghost-color-hover: var(--hs-btn-ghost-color);--hs-btn-ghost-bg: var(--hs-transparent);--hs-btn-ghost-bg-hover: oklch(var(--hs-c-neutral-100));--hs-btn-ghost-bg-active: var(--hs-btn-ghost-bg-hover);--hs-btn-ghost-ring-color: oklch(var(--hs-c-neutral-300))}}

  //      /* [taox] END */
  //     </style>
  //       <style type="text/css">
  //      /* [taox] BEGIN */
  //     @layer components{html.dark,html[data-theme=dark],body.dark{--hs-btn-opacity: 20%;--hs-btn-opacity-offset: 10%;--hs-btn-default-color: oklch(var(--hs-c-neutral-50));--hs-btn-default-color-hover: var(--hs-btn-default-color);--hs-btn-default-color-active: var(--hs-btn-default-color-hover);--hs-btn-default-bg: oklch(var(--hs-c-neutral-700));--hs-btn-default-bg-hover: oklch(var(--hs-c-neutral-800));--hs-btn-default-bg-active: var(--hs-btn-default-bg-hover);--hs-btn-default-border: var(--hs-transparent);--hs-btn-default-ring-color: oklch(var(--hs-c-neutral-700));--hs-btn-primary-color: oklch(var(--hs-c-primary-950));--hs-btn-primary-color-hover: var(--hs-btn-primary-color);--hs-btn-primary-color-active: var(--hs-btn-primary-color-hover);--hs-btn-primary-bg: oklch(var(--hs-c-primary-400));--hs-btn-primary-bg-hover: oklch(var(--hs-c-primary-500));--hs-btn-primary-bg-active: var(--hs-btn-primary-bg-hover);--hs-btn-primary-ring-color: oklch(var(--hs-c-primary-400));--hs-btn-secondary-color: oklch(var(--hs-c-secondary-950));--hs-btn-secondary-color-hover: var(--hs-btn-secondary-color);--hs-btn-secondary-color-active: var(--hs-btn-secondary-color-hover);--hs-btn-secondary-bg: oklch(var(--hs-c-secondary-400));--hs-btn-secondary-bg-hover: oklch(var(--hs-c-secondary-500));--hs-btn-secondary-bg-active: var(--hs-btn-secondary-bg-hover);--hs-btn-secondary-ring-color: oklch(var(--hs-c-secondary-400));--hs-btn-accent-color: oklch(var(--hs-c-accent-950));--hs-btn-accent-color-hover: var(--hs-btn-accent-color);--hs-btn-accent-color-active: var(--hs-btn-accent-color-hover);--hs-btn-accent-bg: oklch(var(--hs-c-accent-400));--hs-btn-accent-bg-hover: oklch(var(--hs-c-accent-500));--hs-btn-accent-bg-active: var(--hs-btn-accent-bg-hover);--hs-btn-accent-ring-color: oklch(var(--hs-c-accent-400));--hs-btn-success-color: oklch(var(--hs-c-success-950));--hs-btn-success-color-hover: var(--hs-btn-success-color);--hs-btn-success-color-active: var(--hs-btn-success-color-hover);--hs-btn-success-bg: oklch(var(--hs-c-success-400));--hs-btn-success-bg-hover: oklch(var(--hs-c-success-500));--hs-btn-success-bg-active: var(--hs-btn-success-bg-hover);--hs-btn-success-ring-color: oklch(var(--hs-c-success-400));--hs-btn-error-color: oklch(var(--hs-c-error-950));--hs-btn-error-color-hover: var(--hs-btn-error-color);--hs-btn-error-color-active: var(--hs-btn-error-color-hover);--hs-btn-error-bg: oklch(var(--hs-c-error-400));--hs-btn-error-bg-hover: oklch(var(--hs-c-error-500));--hs-btn-error-bg-active: var(--hs-btn-error-bg-hover);--hs-btn-error-ring-color: oklch(var(--hs-c-error-400));--hs-btn-warning-color: oklch(var(--hs-c-warning-950));--hs-btn-warning-color-hover: var(--hs-btn-warning-color);--hs-btn-warning-color-active: var(--hs-btn-warning-color-hover);--hs-btn-warning-bg: oklch(var(--hs-c-warning-400));--hs-btn-warning-bg-hover: oklch(var(--hs-c-warning-500));--hs-btn-warning-bg-active: var(--hs-btn-warning-bg-hover);--hs-btn-warning-ring-color: oklch(var(--hs-c-warning-400));--hs-btn-info-color: oklch(var(--hs-c-info-950));--hs-btn-info-color-hover: var(--hs-btn-info-color);--hs-btn-info-color-active: var(--hs-btn-info-color-hover);--hs-btn-info-bg: oklch(var(--hs-c-info-400));--hs-btn-info-bg-hover: oklch(var(--hs-c-info-500));--hs-btn-info-bg-active: var(--hs-btn-info-bg-hover);--hs-btn-info-ring-color: oklch(var(--hs-c-info-400));--hs-btn-ghost-color: oklch(var(--hs-c-neutral-300));--hs-btn-ghost-color-hover: oklch(var(--hs-c-neutral-950));--hs-btn-ghost-color-active: var(--hs-btn-ghost-color-hover);--hs-btn-ghost-bg: var(--hs-transparent);--hs-btn-ghost-bg-hover: oklch(var(--hs-c-neutral-500));--hs-btn-ghost-bg-active: var(--hs-btn-ghost-bg-hover);--hs-btn-ghost-ring-color: oklch(var(--hs-c-neutral-400))}@media (prefers-color-scheme: dark){:root{--hs-btn-opacity: 20%;--hs-btn-opacity-offset: 10%;--hs-btn-default-color: oklch(var(--hs-c-neutral-50));--hs-btn-default-color-hover: var(--hs-btn-default-color);--hs-btn-default-color-active: var(--hs-btn-default-color-hover);--hs-btn-default-bg: oklch(var(--hs-c-neutral-700));--hs-btn-default-bg-hover: oklch(var(--hs-c-neutral-800));--hs-btn-default-bg-active: var(--hs-btn-default-bg-hover);--hs-btn-default-border: var(--hs-transparent);--hs-btn-default-ring-color: oklch(var(--hs-c-neutral-700));--hs-btn-primary-color: oklch(var(--hs-c-primary-950));--hs-btn-primary-color-hover: var(--hs-btn-primary-color);--hs-btn-primary-color-active: var(--hs-btn-primary-color-hover);--hs-btn-primary-bg: oklch(var(--hs-c-primary-400));--hs-btn-primary-bg-hover: oklch(var(--hs-c-primary-500));--hs-btn-primary-bg-active: var(--hs-btn-primary-bg-hover);--hs-btn-primary-ring-color: oklch(var(--hs-c-primary-400));--hs-btn-secondary-color: oklch(var(--hs-c-secondary-950));--hs-btn-secondary-color-hover: var(--hs-btn-secondary-color);--hs-btn-secondary-color-active: var(--hs-btn-secondary-color-hover);--hs-btn-secondary-bg: oklch(var(--hs-c-secondary-400));--hs-btn-secondary-bg-hover: oklch(var(--hs-c-secondary-500));--hs-btn-secondary-bg-active: var(--hs-btn-secondary-bg-hover);--hs-btn-secondary-ring-color: oklch(var(--hs-c-secondary-400));--hs-btn-accent-color: oklch(var(--hs-c-accent-950));--hs-btn-accent-color-hover: var(--hs-btn-accent-color);--hs-btn-accent-color-active: var(--hs-btn-accent-color-hover);--hs-btn-accent-bg: oklch(var(--hs-c-accent-400));--hs-btn-accent-bg-hover: oklch(var(--hs-c-accent-500));--hs-btn-accent-bg-active: var(--hs-btn-accent-bg-hover);--hs-btn-accent-ring-color: oklch(var(--hs-c-accent-400));--hs-btn-success-color: oklch(var(--hs-c-success-950));--hs-btn-success-color-hover: var(--hs-btn-success-color);--hs-btn-success-color-active: var(--hs-btn-success-color-hover);--hs-btn-success-bg: oklch(var(--hs-c-success-400));--hs-btn-success-bg-hover: oklch(var(--hs-c-success-500));--hs-btn-success-bg-active: var(--hs-btn-success-bg-hover);--hs-btn-success-ring-color: oklch(var(--hs-c-success-400));--hs-btn-error-color: oklch(var(--hs-c-error-950));--hs-btn-error-color-hover: var(--hs-btn-error-color);--hs-btn-error-color-active: var(--hs-btn-error-color-hover);--hs-btn-error-bg: oklch(var(--hs-c-error-400));--hs-btn-error-bg-hover: oklch(var(--hs-c-error-500));--hs-btn-error-bg-active: var(--hs-btn-error-bg-hover);--hs-btn-error-ring-color: oklch(var(--hs-c-error-400));--hs-btn-warning-color: oklch(var(--hs-c-warning-950));--hs-btn-warning-color-hover: var(--hs-btn-warning-color);--hs-btn-warning-color-active: var(--hs-btn-warning-color-hover);--hs-btn-warning-bg: oklch(var(--hs-c-warning-400));--hs-btn-warning-bg-hover: oklch(var(--hs-c-warning-500));--hs-btn-warning-bg-active: var(--hs-btn-warning-bg-hover);--hs-btn-warning-ring-color: oklch(var(--hs-c-warning-400));--hs-btn-info-color: oklch(var(--hs-c-info-950));--hs-btn-info-color-hover: var(--hs-btn-info-color);--hs-btn-info-color-active: var(--hs-btn-info-color-hover);--hs-btn-info-bg: oklch(var(--hs-c-info-400));--hs-btn-info-bg-hover: oklch(var(--hs-c-info-500));--hs-btn-info-bg-active: var(--hs-btn-info-bg-hover);--hs-btn-info-ring-color: oklch(var(--hs-c-info-400));--hs-btn-ghost-color: oklch(var(--hs-c-neutral-300));--hs-btn-ghost-color-hover: oklch(var(--hs-c-neutral-950));--hs-btn-ghost-color-active: var(--hs-btn-ghost-color-hover);--hs-btn-ghost-bg: var(--hs-transparent);--hs-btn-ghost-bg-hover: oklch(var(--hs-c-neutral-500));--hs-btn-ghost-bg-active: var(--hs-btn-ghost-bg-hover);--hs-btn-ghost-ring-color: oklch(var(--hs-c-neutral-400))}}}

  //      /* [taox] END */
  //     </style>

  //     <button class="hans hans-btn " aria-label="Button">Button</button>`;

  //   fs.writeFileSync(htmlFile, htmlContent);

  //   const optimizer = HtmlStylesOptimizer.getInstance(tempDir);
  //   optimizer.run();

  //   const resultContent = fs.readFileSync(htmlFile, 'utf-8');

  //   // Assert expected styles are consolidated
  //   expect(resultContent).toContain('expected style output');
  // });
});
