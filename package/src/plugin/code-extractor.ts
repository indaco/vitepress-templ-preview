import { CodeExtractorOptions } from '../types';

/**
 * Class to extract templated blocks of code.
 */
export class CodeExtractor {
  private code: string;
  private options: CodeExtractorOptions;

  private static readonly defaultOptions: CodeExtractorOptions = {
    goExportedOnly: false,
    goPackage: true,
    goImports: true,
    goVars: false,
    goConsts: false,
    goTypes: false,
  };

  private static readonly packageRegex = /package\s+\w+/;
  private static readonly importRegex =
    /import\s+(?:\(\s*[^]*?\s*\)|\".*?\")/gs;
  private static readonly constRegex = /const\s+(?:\([^]*?\)|[^\n;]+(;\s*)?)/gs;
  private static readonly varRegex = /var\s+(?:\([^]*?\)|[^\n;]+(;\s*)?)/gs;
  private static readonly typeRegex =
    /type\s+(?:\([^)]*\)|\w+\s+struct\s+\{[^}]*\}|[^\n;]+;)/gs;
  private static readonly exportedTemplRegex =
    /templ\s+([A-Z][a-zA-Z]*)\s*\([^)]*\)\s*\{[^}]*\}/gs;
  private static readonly allTemplRegex =
    /templ\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/gs;

  /**
   * Constructs a CodeExtractor instance.
   *
   * @param {string} code - The code string to scan for templated blocks.
   * @param {CodeExtractorOptions} [options] - Configuration options to include or exclude certain keywords.
   */
  constructor(code: string, options?: CodeExtractorOptions) {
    this.code = code;
    this.options = { ...CodeExtractor.defaultOptions, ...options };
  }

  /**
   * Extracts templated blocks of code based on the provided options.
   *
   * @returns {string[]} An array containing a single string with the full templated block including specified inclusions.
   */
  public extract(): string[] {
    const packageMatch = this.getPackageMatch();
    const importStatements = this.getImportStatements();
    const constStatements = this.getConstStatements();
    const varStatements = this.getVarStatements();
    const typeStatements = this.getTypeStatements();

    const templRegex = this.options.goExportedOnly
      ? CodeExtractor.exportedTemplRegex
      : CodeExtractor.allTemplRegex;

    const matches = this.getAllMatches(templRegex);
    const templBlocks = matches
      .map((match) => this.extractTemplBlock(match.index))
      .filter(Boolean) as string[];

    const allCode = [
      packageMatch ? packageMatch[0].trim() : '',
      ...importStatements.map((stmt) => stmt.trim()),
      ...constStatements.map((stmt) => stmt.trim()),
      ...varStatements.map((stmt) => stmt.trim()),
      ...typeStatements.map((stmt) => stmt.trim()),
      ...templBlocks.map((block) => block.trim()),
    ]
      .filter(Boolean)
      .join('\n\n');

    return [allCode.trim()];
  }

  private getPackageMatch(): RegExpMatchArray | null {
    return this.options.goPackage
      ? this.code.match(CodeExtractor.packageRegex)
      : null;
  }

  private getImportStatements(): string[] {
    return this.options.goImports
      ? (this.code.match(CodeExtractor.importRegex) ?? [])
      : [];
  }

  private getConstStatements(): string[] {
    return this.options.goConsts
      ? (this.code.match(CodeExtractor.constRegex) ?? [])
      : [];
  }

  private getVarStatements(): string[] {
    return this.options.goVars
      ? (this.code.match(CodeExtractor.varRegex) ?? [])
      : [];
  }

  private getTypeStatements(): string[] {
    return this.options.goTypes
      ? (this.code.match(CodeExtractor.typeRegex) ?? [])
      : [];
  }

  private extractTemplBlock(startIndex: number): string | null {
    let braceCount = 0;
    let endIndex = startIndex;

    // Move start index to the first brace
    while (this.code[endIndex] !== '{' && endIndex < this.code.length) {
      endIndex++;
    }

    // Track braces to find the matching closing brace
    for (; endIndex < this.code.length; endIndex++) {
      if (this.code[endIndex] === '{') braceCount++;
      if (this.code[endIndex] === '}') braceCount--;
      if (braceCount === 0) break;
    }

    if (braceCount === 0) {
      return this.code.slice(startIndex, endIndex + 1);
    }

    return null;
  }

  private getAllMatches(regex: RegExp): RegExpExecArray[] {
    const matches: RegExpExecArray[] = [];
    let match;
    while ((match = regex.exec(this.code)) !== null) {
      matches.push(match);
    }
    return matches;
  }
}
