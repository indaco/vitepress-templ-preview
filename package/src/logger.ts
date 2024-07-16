import ansis from 'ansis';
import { UserMessage } from './types';

export class Logger {
  static PREFIX = 'vitepress-templ-preview';

  static makeMessage(msg: UserMessage, others: string[]): string {
    let message = msg.message;
    if (msg.message && others.length > 0) {
      message += ' ';
    }
    return message + others.join(' ');
  }

  static log(
    headline: string | undefined,
    message: string,
    prefix: string,
    color: (text: string) => string,
  ) {
    const _headline = headline ? `${headline}:` : '';
    const formattedMessage = _headline
      ? `${_headline} ${ansis.gray`${message}`}`
      : `${ansis.gray`${message}`}`;
    console.log(`${color(`[${prefix}]`)} ${formattedMessage}`);
  }

  static info(msg: UserMessage, ...others: string[]) {
    const message = this.makeMessage(msg, others);
    this.log(msg.headline, message, Logger.PREFIX, ansis.bold.blue);
  }

  static success(msg: UserMessage, ...others: string[]) {
    const message = this.makeMessage(msg, others);
    this.log(msg.headline, message, Logger.PREFIX, ansis.bold.green);
  }

  static error(msg: UserMessage, ...others: string[]) {
    const message = this.makeMessage(msg, others);
    this.log(msg.headline, message, Logger.PREFIX, ansis.bold.red);
  }

  static warning(msg: UserMessage, ...others: string[]) {
    const message = this.makeMessage(msg, others);
    this.log(msg.headline, message, Logger.PREFIX, ansis.bold.yellow);
  }

  static logHighlighted(
    headline: string | undefined,
    message: string,
    bgColor: (text: string) => string,
    textColor: (text: string) => string,
  ) {
    console.log(
      `${bgColor(`[${Logger.PREFIX}]`)} ${textColor(`${headline}`)} ${ansis.gray`${message}`}`,
    );
  }

  static infoHighlighted(msg: UserMessage, ...others: string[]) {
    const message = this.makeMessage(msg, others);
    this.logHighlighted(
      msg.headline,
      message,
      ansis.black.bgBlue,
      ansis.bold.blue,
    );
  }

  static successHighlighted(msg: UserMessage, ...others: string[]) {
    const message = this.makeMessage(msg, others);
    this.logHighlighted(
      msg.headline,
      message,
      ansis.black.bgGreen,
      ansis.bold.green,
    );
  }

  static errorHighlighted(msg: UserMessage, ...others: string[]) {
    const message = this.makeMessage(msg, others);
    this.logHighlighted(
      msg.headline,
      message,
      ansis.black.bgRed,
      ansis.bold.red,
    );
  }

  static warningHighlighted(msg: UserMessage, ...others: string[]) {
    const message = this.makeMessage(msg, others);
    this.logHighlighted(
      msg.headline,
      message,
      ansis.black.bgYellow,
      ansis.bold.yellow,
    );
  }
}
