import { describe, it, expect } from 'vitest';
import { CodeExtractor } from './code-extractor';

describe('CodeExtractor', () => {
  const codeSample = `
package hello

templ HelloDemo() {
  @hello("World!!!")
}

templ hello(name string) {
  <div>Hello, { name }</div>
}
`;

  const normalizeString = (str: string) => str.trim().replace(/\s+/g, ' ');

  it('should extract all templ blocks when goExportedOnly is false', () => {
    const extractor = new CodeExtractor(codeSample);
    const result = extractor.extract();
    const expected = `
package hello

templ HelloDemo() {
  @hello("World!!!")
}

templ hello(name string) {
  <div>Hello, { name }</div>
}
`.trim();
    expect(normalizeString(result[0])).toEqual(normalizeString(expected));
  });

  it('should extract only exported templ blocks when goExportedOnly is true', () => {
    const extractor = new CodeExtractor(codeSample, { goExportedOnly: true });
    const result = extractor.extract();
    const expected = `
package hello

templ HelloDemo() {
  @hello("World!!!")
}
`.trim();
    expect(normalizeString(result[0])).toEqual(normalizeString(expected));
  });

  it('should include multiple exported templ components correctly', () => {
    const codeWithMultipleExportedTempls = `
package hello

templ FirstDemo() {
  @hello("First")
}

templ SecondDemo() {
  @hello("Second")
}

templ hello(name string) {
  <div>Hello, { name }</div>
}
`;

    const extractor = new CodeExtractor(codeWithMultipleExportedTempls, {
      goExportedOnly: true,
      goPackage: true,
      goImports: true,
      goConsts: true,
      goVars: true,
      goTypes: true,
    });
    const result = extractor.extract();
    const expected = `
package hello

templ FirstDemo() {
  @hello("First")
}

templ SecondDemo() {
  @hello("Second")
}
`.trim();
    expect(normalizeString(result[0])).toEqual(normalizeString(expected));
  });

  it('should include package, imports, consts, vars, and types correctly', () => {
    const codeWithExtras = `
package hello

import (
  "fmt"
)

const PI = 3.14

var name = "world"

type myType struct {
  name string
}

templ HelloDemo() {
  @hello("World!!!")
}
`;

    const extractor = new CodeExtractor(codeWithExtras, {
      goExportedOnly: true,
      goPackage: true,
      goImports: true,
      goConsts: true,
      goVars: true,
      goTypes: true,
    });
    const result = extractor.extract();
    const expected = `
package hello

import (
  "fmt"
)

const PI = 3.14

var name = "world"

type myType struct {
  name string
}

templ HelloDemo() {
  @hello("World!!!")
}
`.trim();
    expect(normalizeString(result[0])).toEqual(normalizeString(expected));
  });

  it('should not include package, imports, consts, vars, and types when options are false', () => {
    const codeWithExtras = `
package hello

import (
  "fmt"
)

const PI = 3.14

var name = "world"

type myType struct {
  name string
}

templ HelloDemo() {
  @hello("World!!!")
}
`;

    const extractor = new CodeExtractor(codeWithExtras, {
      goExportedOnly: true,
      goPackage: false,
      goImports: false,
      goConsts: false,
      goVars: false,
      goTypes: false,
    });
    const result = extractor.extract();
    const expected = `
templ HelloDemo() {
  @hello("World!!!")
}
`.trim();
    expect(normalizeString(result[0])).toEqual(normalizeString(expected));
  });

  it('should include multiple consts correctly', () => {
    const codeWithMultipleConsts = `
package hello

import (
  "fmt"
)

const (
  PI = 3.14
  E  = 2.71
)

var name = "world"

type myType struct {
  name string
}

templ HelloDemo() {
  @hello("World!!!")
}
`;

    const extractor = new CodeExtractor(codeWithMultipleConsts, {
      goExportedOnly: true,
      goPackage: true,
      goImports: true,
      goConsts: true,
      goVars: true,
      goTypes: true,
    });
    const result = extractor.extract();
    const expected = `
package hello

import (
  "fmt"
)

const (
  PI = 3.14
  E  = 2.71
)

var name = "world"

type myType struct {
  name string
}

templ HelloDemo() {
  @hello("World!!!")
}
`.trim();
    expect(normalizeString(result[0])).toEqual(normalizeString(expected));
  });

  it('should include multiple vars correctly', () => {
    const codeWithMultipleVars = `
package hello

import (
  "fmt"
)

const PI = 3.14

var (
  name = "world"
  age  = 42
)

type myType struct {
  name string
}

templ HelloDemo() {
  @hello("World!!!")
}
`;

    const extractor = new CodeExtractor(codeWithMultipleVars, {
      goExportedOnly: true,
      goPackage: true,
      goImports: true,
      goConsts: true,
      goVars: true,
      goTypes: true,
    });
    const result = extractor.extract();
    const expected = `
package hello

import (
  "fmt"
)

const PI = 3.14

var (
  name = "world"
  age  = 42
)

type myType struct {
  name string
}

templ HelloDemo() {
  @hello("World!!!")
}
`.trim();
    expect(normalizeString(result[0])).toEqual(normalizeString(expected));
  });
});
