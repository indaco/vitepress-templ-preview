import ansis from 'ansis';

export class Logger {
  static PREFIX = 'vitepress-templ-preview';
  static log(
    headline: string,
    message: string,
    prefix: string,
    color: (text: string) => string,
  ) {
    let _headline = '';
    if (headline != '') {
      _headline = `${headline}:`;
    }
    console.log(
      `${color(`[${prefix}]`)} ${_headline} ${ansis.gray`${message}`}`,
    );
  }

  static info(headline: string, message: string) {
    this.log(headline, message, Logger.PREFIX, ansis.bold.blueBright);
  }

  static error(headline: string, message: string) {
    this.log(headline, message, Logger.PREFIX, ansis.bold.red);
  }

  static warning(headline: string, message: string) {
    this.log(headline, message, Logger.PREFIX, ansis.bold.yellow);
  }
}
