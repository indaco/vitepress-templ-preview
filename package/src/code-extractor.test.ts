import { describe, it, expect } from 'vitest';
import { CodeExtractor } from './code-extractor';

describe('CodeExtractor', () => {
  const codeSample = `
package main

import "fmt"

const magicNumber = 3.14

const (
  PI = 3.14
  E  = 2.71
)

var greeting = "hello"

var (
  name = "world"
  age  = 42
)

type myType struct {
  name string
}

templ hello(name string) {
  <div>Hello, { name }</div>
}

templ HelloDemo() {
  @hello("World!!!")
}

templ GreetingsDemo() {
  @hello("First")
}
`;

  const normalizeString = (str: string) => str.trim().replace(/\s+/g, ' ');

  it('should extract package, imports and all templ block as per default options', () => {
    const extractor = new CodeExtractor(codeSample);
    const result = extractor.extract();
    const expected = `
package main

import "fmt"

templ hello(name string) {
  <div>Hello, { name }</div>
}

templ HelloDemo() {
  @hello("World!!!")
}

templ GreetingsDemo() {
  @hello("First")
}
`.trim();
    expect(normalizeString(result[0])).toEqual(normalizeString(expected));
  });

  it('should extract only exported templ blocks when goExportedOnly is true', () => {
    const extractor = new CodeExtractor(codeSample, { goExportedOnly: true });
    const result = extractor.extract();
    const expected = `
package main

import "fmt"

templ HelloDemo() {
  @hello("World!!!")
}

templ GreetingsDemo() {
  @hello("First")
}
`.trim();
    expect(normalizeString(result[0])).toEqual(normalizeString(expected));
  });

  it('should include package, imports, consts, vars, and types correctly. Only exported templ blocks', () => {
    const extractor = new CodeExtractor(codeSample, {
      goExportedOnly: true,
      goPackage: true,
      goImports: true,
      goConsts: true,
      goVars: true,
      goTypes: true,
    });
    const result = extractor.extract();
    const expected = `
package main

import "fmt"

const magicNumber = 3.14

const (
  PI = 3.14
  E  = 2.71
)

var greeting = "hello"

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

templ GreetingsDemo() {
  @hello("First")
}
`.trim();
    expect(normalizeString(result[0])).toEqual(normalizeString(expected));
  });

  it('should not include package, imports, consts, vars, and types when options are false', () => {
    const extractor = new CodeExtractor(codeSample, {
      goPackage: false,
      goImports: false,
      goConsts: false,
      goVars: false,
      goTypes: false,
    });
    const result = extractor.extract();
    const expected = `
templ hello(name string) {
  <div>Hello, { name }</div>
}

templ HelloDemo() {
  @hello("World!!!")
}

templ GreetingsDemo() {
  @hello("First")
}
`.trim();
    expect(normalizeString(result[0])).toEqual(normalizeString(expected));
  });

  it('should include package, imports, multiple consts correctly and exported only templ blocks', () => {
    const extractor = new CodeExtractor(codeSample, {
      goExportedOnly: true,
      goPackage: true,
      goImports: true,
      goConsts: true,
      goVars: false,
      goTypes: false,
    });
    const result = extractor.extract();
    const expected = `
package main

import "fmt"

const magicNumber = 3.14

const (
  PI = 3.14
  E  = 2.71
)

templ HelloDemo() {
  @hello("World!!!")
}

templ GreetingsDemo() {
  @hello("First")
}
`.trim();
    expect(normalizeString(result[0])).toEqual(normalizeString(expected));
  });

  it('should include package, multiple vars and exported only templ blocks only', () => {
    const extractor = new CodeExtractor(codeSample, {
      goExportedOnly: true,
      goPackage: true,
      goImports: false,
      goConsts: false,
      goVars: true,
      goTypes: false,
    });
    const result = extractor.extract();
    const expected = `
package main

var greeting = "hello"

var (
  name = "world"
  age  = 42
)

templ HelloDemo() {
  @hello("World!!!")
}

templ GreetingsDemo() {
  @hello("First")
}
`.trim();
    expect(normalizeString(result[0])).toEqual(normalizeString(expected));
  });

  it('should include package and types and exported exported templ blocks only', () => {
    const extractor = new CodeExtractor(codeSample, {
      goExportedOnly: true,
      goPackage: true,
      goImports: false,
      goConsts: false,
      goVars: false,
      goTypes: true,
    });
    const result = extractor.extract();
    const expected = `
package main

type myType struct {
  name string
}

templ HelloDemo() {
  @hello("World!!!")
}

templ GreetingsDemo() {
  @hello("First")
}
`.trim();
    expect(normalizeString(result[0])).toEqual(normalizeString(expected));
  });

  it('should include package, multiline imports only but exported all templ blocks', () => {
    const codeWithMultilineImports = `
package main

import (
  "fmt"
  "log"
)

const magicNumber = 3.14

const (
  PI = 3.14
  E  = 2.71
)

var greeting = "hello"

var (
  name = "world"
  age  = 42
)

templ hello(name string) {
  <div>Hello, { name }</div>
}

templ HelloDemo() {
  @hello("World!!!")
}

`;
    const extractor = new CodeExtractor(codeWithMultilineImports, {
      goExportedOnly: false,
      goPackage: true,
      goImports: true,
      goConsts: false,
      goVars: false,
      goTypes: true,
    });
    const result = extractor.extract();
    const expected = `
package main

import (
  "fmt"
  "log"
)

templ hello(name string) {
  <div>Hello, { name }</div>
}

templ HelloDemo() {
  @hello("World!!!")
}
`.trim();
    expect(normalizeString(result[0])).toEqual(normalizeString(expected));
  });
});
