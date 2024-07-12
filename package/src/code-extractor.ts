import { CodeExtractorOptions } from "./types";

/**
 * Class to extract templated blocks of code with names starting with a capital letter.
 */
export class CodeExtractor {
  private code: string;
  private options: CodeExtractorOptions;

  private static readonly defaultOptions: CodeExtractorOptions = {
    includePackage: true,
    includeImports: true,
    includeVars: false,
    includeConsts: false,
    includeTypes: false,
  };

  private static readonly packageRegex = /package\s+\w+/;
  private static readonly importRegex = /import\s+\(.*?\);?|import\s+.*?;/gs;
  private static readonly constRegex = /const\s+\(.*?\);?|const\s+.*?;/gs;
  private static readonly varRegex = /var\s+\(.*?\);?|var\s+.*?;/gs;
  private static readonly typeRegex = /type\s+\(.*?\);?|type\s+.*?;/gs;
  private static readonly templRegex = /templ ([A-Z][a-zA-Z]*)\(\)/g;

  /**
   * Constructs a TemplExtractor instance.
   *
   * @param {string} code - The code string to scan for templated blocks.
   * @param {ExtractOptions} [options] - Configuration options to include or exclude certain keywords.
   */
  constructor(code: string, options?: CodeExtractorOptions) {
    this.code = code;
    this.options = { ...CodeExtractor.defaultOptions, ...options };
  }

  /**
   * Extracts templated blocks of code based on the provided options.
   *
   * @returns {string[]} An array of strings, each containing a full templated block with the specified inclusions.
   */
  public extract(): string[] {
    const results: string[] = [];
    const packageMatch = this.getPackageMatch();
    const importStatements = this.getImportStatements();
    const constStatements = this.getConstStatements();
    const varStatements = this.getVarStatements();
    const typeStatements = this.getTypeStatements();

    let match;
    while ((match = CodeExtractor.templRegex.exec(this.code)) !== null) {
      const templBlock = this.extractTemplBlock(match.index);
      if (templBlock) {
        results.push(
          [
            packageMatch ? packageMatch[0] : "",
            ...importStatements,
            ...constStatements,
            ...varStatements,
            ...typeStatements,
            templBlock,
          ]
            .filter(Boolean)
            .join("\n\n"),
        );
      }
    }

    return results;
  }

  private getPackageMatch(): RegExpMatchArray | null {
    return this.options.includePackage
      ? this.code.match(CodeExtractor.packageRegex)
      : null;
  }

  private getImportStatements(): string[] {
    return this.options.includeImports
      ? this.code.match(CodeExtractor.importRegex) ?? []
      : [];
  }

  private getConstStatements(): string[] {
    return this.options.includeConsts
      ? this.code.match(CodeExtractor.constRegex) ?? []
      : [];
  }

  private getVarStatements(): string[] {
    return this.options.includeVars
      ? this.code.match(CodeExtractor.varRegex) ?? []
      : [];
  }

  private getTypeStatements(): string[] {
    return this.options.includeTypes
      ? this.code.match(CodeExtractor.typeRegex) ?? []
      : [];
  }

  private extractTemplBlock(startIndex: number): string | null {
    let braceCount = 0;
    let endIndex = startIndex;

    // Move start index to the first brace
    while (this.code[endIndex] !== "{" && endIndex < this.code.length) {
      endIndex++;
    }

    // Track braces to find the matching closing brace
    for (; endIndex < this.code.length; endIndex++) {
      if (this.code[endIndex] === "{") braceCount++;
      if (this.code[endIndex] === "}") braceCount--;
      if (braceCount === 0) break;
    }

    if (braceCount === 0) {
      return this.code.slice(startIndex, endIndex + 1);
    }

    return null;
  }
}
