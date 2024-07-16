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
    this.log(headline, message, Logger.PREFIX, ansis.bold.blue);
  }

  static success(headline: string, message: string) {
    this.log(headline, message, Logger.PREFIX, ansis.bold.green);
  }

  static error(headline: string, message: string) {
    this.log(headline, message, Logger.PREFIX, ansis.bold.red);
  }

  static warning(headline: string, message: string) {
    this.log(headline, message, Logger.PREFIX, ansis.bold.yellow);
  }

  static logHighlighted(
    headline: string,
    message: string,
    bgColor: (text: string) => string,
    textColor: (text: string) => string,
  ) {
    console.log(
      `${bgColor(`[${Logger.PREFIX}]`)} ${textColor(`${headline}`)} ${ansis.gray(`${message}`)}`,
    );
  }

  static infoHighlighted(headline: string, message: string) {
    this.logHighlighted(headline, message, ansis.black.bgBlue, ansis.bold.blue);
  }

  static suceessHighlighted(headline: string, message: string) {
    this.logHighlighted(
      headline,
      message,
      ansis.black.bgGreen,
      ansis.bold.green,
    );
  }

  static errorHighlighted(headline: string, message: string) {
    this.logHighlighted(headline, message, ansis.black.bgRed, ansis.bold.red);
  }

  static warningHighlighted(headline: string, message: string) {
    this.logHighlighted(
      headline,
      message,
      ansis.black.bgYellow,
      ansis.bold.yellow,
    );
  }
}
