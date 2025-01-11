import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import HtmlStylesOptimizer from '../../src/plugin/optimizer/styles-optimizer';

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
    @layer reset,base,components,utilities;@layer reset{*,*:before,*:after{box-sizing:border-box;border:0;border-style:solid}}@layer base{:root{--hs-c-white: 1 0 0;--hs-c-black: 0 0 0;--hs-transparent: oklch(0 0 0 / 0);--hs-opacity: 1;--hs-font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--hs-font-serif: ui-serif, georgia, cambria, "Times New Roman", times, serif;--hs-font-mono: ui-monospace, sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace}.preflight :is(blockquote,dl,dd,h1,h2,h3,h4,h5,h6,figure,p,pre){margin:0}.preflight :is(h1,h2,h3,h4,h5,h6,p){overflow-wrap:break-word}.preflight :is(h1,h2,h3,h4,h5,h6){word-break:break-word;text-wrap:balance}.preflight :is(p,li,figcaption){text-wrap:pretty}.preflight a{text-decoration:none}.preflight :is(a,button){cursor:pointer}.preflight :is(button,input,select,textarea){font-family:inherit;font-size:100%;font-feature-settings:inherit;font-variation-settings:inherit;line-height:inherit;color:inherit}.preflight :is(button,select){text-transform:none}.preflight li+li{margin-top:0}.preflight :is(img,svg,video,canvas){display:block;max-width:100%;height:auto}}@layer utilities{.sronly{position:absolute;overflow:hidden;width:1px;height:1px;margin:-1px;padding:0;white-space:nowrap;clip:rect(0,0,0,0);border-width:0;}}

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
.preflight :is(blockquote, dl, dd, h1, h2, h3, h4, h5, h6, figure, p, pre){margin:0;}
.preflight :is(h1, h2, h3, h4, h5, h6, p){overflow-wrap:break-word;}
.preflight :is(h1, h2, h3, h4, h5, h6){word-break:break-word;text-wrap:balance;}
.preflight :is(p, li, figcaption){text-wrap:pretty;}
.preflight a{text-decoration:none;}
.preflight :is(a, button){cursor:pointer;}
.preflight :is(button, input, select, textarea){font-family:inherit;font-size:100%;font-feature-settings:inherit;font-variation-settings:inherit;line-height:inherit;color:inherit;}
.preflight :is(button, select){text-transform:none;}
.preflight li+li{margin-top:0;}
.preflight :is(img, svg, video, canvas){display:block;max-width:100%;height:auto;}
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
          @layer reset,base,components,utilities;@layer reset{*,*:before,*:after{box-sizing:border-box;border:0;border-style:solid}}@layer base{:root{--hs-c-white: 1 0 0;--hs-c-black: 0 0 0;--hs-transparent: oklch(0 0 0 / 0);--hs-opacity: 1;--hs-font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--hs-font-serif: ui-serif, georgia, cambria, "Times New Roman", times, serif;--hs-font-mono: ui-monospace, sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace}.preflight :is(blockquote,dl,dd,h1,h2,h3,h4,h5,h6,figure,p,pre){margin:0}.preflight :is(h1,h2,h3,h4,h5,h6,p){overflow-wrap:break-word}.preflight :is(h1,h2,h3,h4,h5,h6){word-break:break-word;text-wrap:balance}.preflight :is(p,li,figcaption){text-wrap:pretty}.preflight a{text-decoration:none}.preflight :is(a,button){cursor:pointer}.preflight :is(button,input,select,textarea){font-family:inherit;font-size:100%;font-feature-settings:inherit;font-variation-settings:inherit;line-height:inherit;color:inherit}.preflight :is(button,select){text-transform:none}.preflight li+li{margin-top:0}.preflight :is(img,svg,video,canvas){display:block;max-width:100%;height:auto}}@layer utilities{.sronly{position:absolute;overflow:hidden;width:1px;height:1px;margin:-1px;padding:0;white-space:nowrap;clip:rect(0,0,0,0);border-width:0;}}

          /* [taox] END */
          </style>
          <div class="class1">Test</div>`;

    const htmlContent2 = `<style type="text/css">
          /* [taox] BEGIN */
          @layer reset,base,components,utilities;@layer reset{*,*:before,*:after{box-sizing:border-box;border:0;border-style:solid}}@layer base{:root{--hs-c-white: 1 0 0;--hs-c-black: 0 0 0;--hs-transparent: oklch(0 0 0 / 0);--hs-opacity: 1;--hs-font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--hs-font-serif: ui-serif, georgia, cambria, "Times New Roman", times, serif;--hs-font-mono: ui-monospace, sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace}.preflight :is(blockquote,dl,dd,h1,h2,h3,h4,h5,h6,figure,p,pre){margin:0}.preflight :is(h1,h2,h3,h4,h5,h6,p){overflow-wrap:break-word}.preflight :is(h1,h2,h3,h4,h5,h6){word-break:break-word;text-wrap:balance}.preflight :is(p,li,figcaption){text-wrap:pretty}.preflight a{text-decoration:none}.preflight :is(a,button){cursor:pointer}.preflight :is(button,input,select,textarea){font-family:inherit;font-size:100%;font-feature-settings:inherit;font-variation-settings:inherit;line-height:inherit;color:inherit}.preflight :is(button,select){text-transform:none}.preflight li+li{margin-top:0}.preflight :is(img,svg,video,canvas){display:block;max-width:100%;height:auto}}@layer utilities{.sronly{position:absolute;overflow:hidden;width:1px;height:1px;margin:-1px;padding:0;white-space:nowrap;clip:rect(0,0,0,0);border-width:0;}}

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
.preflight :is(blockquote, dl, dd, h1, h2, h3, h4, h5, h6, figure, p, pre){margin:0;}
.preflight :is(h1, h2, h3, h4, h5, h6, p){overflow-wrap:break-word;}
.preflight :is(h1, h2, h3, h4, h5, h6){word-break:break-word;text-wrap:balance;}
.preflight :is(p, li, figcaption){text-wrap:pretty;}
.preflight a{text-decoration:none;}
.preflight :is(a, button){cursor:pointer;}
.preflight :is(button, input, select, textarea){font-family:inherit;font-size:100%;font-feature-settings:inherit;font-variation-settings:inherit;line-height:inherit;color:inherit;}
.preflight :is(button, select){text-transform:none;}
.preflight li+li{margin-top:0;}
.preflight :is(img, svg, video, canvas){display:block;max-width:100%;height:auto;}
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
});
