/**
 * Singleton class that manages the observation and execution of script elements within a dynamically updated preview content area.
 * It listens for changes to the DOM and executes new scripts as they are added to the `.preview-content` element.
 */
export class TemplScriptManager {
  private static instance: TemplScriptManager;
  private domContentLoadedRegex: RegExp;

  private constructor() {
    this.domContentLoadedRegex =
      /document\.addEventListener\s*\(\s*['"]DOMContentLoaded['"]\s*,\s*(function\s*\([^)]*\)\s*\{|\([^)]*\)\s*=>\s*\{)([\s\S]*?(\{[\s\S]*?\}[\s\S]*?)*)\}\s*\);?\s*|document\.addEventListener\s*\(\s*['"]DOMContentLoaded['"]\s*,\s*(\w+)\s*\);?\s*/;
  }

  /**
   * Returns the singleton instance of PreviewScriptManager.
   */
  public static getInstance(): TemplScriptManager {
    if (!TemplScriptManager.instance) {
      TemplScriptManager.instance = new TemplScriptManager();
    }
    return TemplScriptManager.instance;
  }

  /**
   * Initializes the observer and executes scripts within the initial content.
   */
  public executeScriptsTick(): void {
    const previewContent = document.querySelector(
      '.preview-content',
    ) as HTMLElement;
    if (previewContent) {
      // Observe changes to the preview-content element
      const observer = new MutationObserver((mutations) =>
        this.handleMutations(mutations),
      );

      observer.observe(previewContent, { childList: true, subtree: true });

      // Execute scripts in initial content
      this.executeScripts(previewContent);
    }
  }

  /**
   * Handles mutations and triggers script execution for added nodes.
   */
  private handleMutations(mutations: MutationRecord[]): void {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        this.executeScripts(mutation.target as HTMLElement);
      }
    });
  }

  /**
   * Executes all script elements within the provided container.
   * @param {HTMLElement} container - The container element to search for script elements.
   */
  private executeScripts(container: HTMLElement): void {
    const scripts = container.querySelectorAll('script');

    scripts.forEach((script) => {
      if (!script.getAttribute('data-executed')) {
        if (script.textContent) {
          this.processAndExecuteScript(script.textContent);
        }

        script.setAttribute('data-executed', 'true');
      }
    });
  }

  /**
   * Processes and executes the provided script content.
   * @param {string} scriptContent - The script content to be processed and executed.
   */
  private processAndExecuteScript(scriptContent: string) {
    const match = this.domContentLoadedRegex.exec(scriptContent);

    if (match) {
      const cleanedScriptContent = scriptContent.replace(match[0], '').trim();
      if (cleanedScriptContent) {
        this.createAndExecuteScript(cleanedScriptContent);
      }

      if (match[2]) {
        const extractedFunctionBody = match[2].trim();
        this.createAndExecuteScript(
          `(function() { ${extractedFunctionBody} })();`,
        );
      } else if (match[4]) {
        const functionName = match[4].trim();
        this.createAndExecuteScript(`${functionName}();`);
      }
    } else {
      this.createAndExecuteScript(scriptContent);
    }
  }

  /**
   * Creates a new script element with the provided content and executes it.
   * @param {string} scriptContent - The script content to be executed.
   */
  private createAndExecuteScript(scriptContent: string): void {
    const script = document.createElement('script');
    script.setAttribute('data-executed', 'true');
    script.textContent = scriptContent;
    document.body.appendChild(script).parentNode?.removeChild(script);
  }
}
