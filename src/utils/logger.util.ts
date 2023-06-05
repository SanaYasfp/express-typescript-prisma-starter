import chalk from 'chalk';
import debug from 'debug';
import path from 'path';
import { dotenvConfig } from '../config';

require('dotenv').config();

//TODO: Move to their own file
//TODO: Publish
function getCallerFileInfo() {
  const originalPrepareStackTrace = Error.prepareStackTrace;

  try {
    const error = new Error();
    let callerFileName = '';
    let callerFunctionName = '';
    let callerLineNumber = null;

    Error.prepareStackTrace = (error, stack) => {
      callerLineNumber = stack[1].getLineNumber();
      callerLineNumber = callerLineNumber ? callerLineNumber - 3 : null;
      callerFileName = stack[1].getFileName() || '';
      callerFunctionName = stack[2].getFunctionName() || '';
    };

    Error.captureStackTrace(error, getCallerFileInfo);
    error.stack;

    return { callerFileName, callerFunctionName, callerLineNumber };
  } finally {
    Error.prepareStackTrace = originalPrepareStackTrace;
  }
}

//TODO: Move to their own file
type LoggerStyle = {
  bg: chalk.Chalk,
  text: chalk.Chalk,
}
interface LoggerExtender {
  name: string;
  style: LoggerStyle;
  label: string,
  shortLabel: string,
  interceptor: <T>(data: T[]) => any;
  doSomethingBefore: () => void;
  doSomethingAfter: () => void;
  /** 
   * Throw an error while an error occur in param function: interceptor, ... 
   * default to false
   */
  useStrick: boolean;
}


//TODO: Publish
export class Logger {
  protected trace = process.env.LOGGER_TRACE || 'logger';
  protected logger: debug.Debugger;
  protected errorLabel = '[ERROR]' as const;
  protected warningLabel = '[WARN]' as const;
  protected infoLabel = '[INFO]' as const;
  protected debugLabel = '[DEBUG]' as const;
  protected successLabel = '[SUCCESS]' as const;

  protected shortErrorLabel = '[x]' as const;
  protected shortWarningLabel = '[w]' as const;
  protected shortInfoLabel = '[i]' as const;
  protected shortDebugLabel = '[d]' as const;
  protected shortSuccessLabel = '[ok]' as const;

  errorStyle: LoggerStyle = {
    bg: chalk.bgRed,
    text: chalk.red.bold,
  };
  warningStyle: LoggerStyle = {
    bg: chalk.bgHex('#FFA500'),
    text: chalk.hex('#FFA500'),
  };
  infoStyle: LoggerStyle = {
    bg: chalk.bgBlue,
    text: chalk.blue,
  };
  debugStyle: LoggerStyle = {
    bg: chalk.inverse,
    text: chalk.hex('#FFFFFF'),
  };
  successStyle: LoggerStyle = {
    bg: chalk.bgGreen,
    text: chalk.green,
  };

  protected label: {
    error: Logger["errorLabel"] | Logger["shortErrorLabel"],
    warn: Logger["warningLabel"] | Logger["shortWarningLabel"],
    info: Logger["infoLabel"] | Logger["shortInfoLabel"],
    debug: Logger["debugLabel"] | Logger["shortDebugLabel"],
    success: Logger["successLabel"] | Logger["shortSuccessLabel"],
  };

  constructor({ trace, shortLabel = false }: { trace?: string; shortLabel?: boolean; } = {}) {
    const callerInfo = getCallerFileInfo();

    if (!trace) {
      const fileName = path.basename(callerInfo.callerFileName);
      trace = fileName.substring(0, fileName.lastIndexOf('.'));
    }

    this.trace = `${this.trace}${Boolean(trace) ? ":" + trace : ""
      }${callerInfo.callerLineNumber ? ":line:" + String(callerInfo.callerLineNumber) : ""
      }`;
    this.logger = debug(this.trace);
    this.label = {
      error: shortLabel ? this.shortErrorLabel : this.errorLabel,
      warn: shortLabel ? this.shortWarningLabel : this.warningLabel,
      debug: shortLabel ? this.shortDebugLabel : this.debugLabel,
      info: shortLabel ? this.shortInfoLabel : this.infoLabel,
      success: shortLabel ? this.shortSuccessLabel : this.successLabel,
    }
  }

  set setTrace(trace: string) {
    this.trace = trace;
  }

  protected print(label: string, style: LoggerStyle, text: string = '') {
    const str = style.bg(label)
      + style.text('| AT: ' + new Date().toUTCString())
      + '| LOG: '
      + text;
    this.logger('%s', str);
  }

  protected printObj(obj: any) {
    this.logger('%O', obj);
  }

  protected log(label: string, style: LoggerStyle, data: any[]) {
    for (const item of data) {
      if (typeof item === 'string')
        this.print(label, style, item);
      else {
        if (item?.message)
          this.print(label, style, item?.message);
        else this.print(label, style);
        this.printObj(item);
      }
    }
  }

  error(...err: any[]) {
    this.log(this.label.error, this.errorStyle, err);
  }

  warn(...err: any[]) {
    this.log(this.label.warn, this.warningStyle, err);
  }

  info(...err: any[]) {
    this.log(this.label.info, this.infoStyle, err);
  }

  debug(...err: any[]) {
    this.log(this.label.debug, this.debugStyle, err);
  }

  success(...err: any[]) {
    this.log(this.label.success, this.successStyle, err);
  }

  /**
   * Extends recorder with more method other than debugging, error, ...
   * Particularly, their register the configuration of new method
   */
  set extends(param: LoggerExtender | LoggerExtender[]) { }

  /**
   * Call a custom method like: '
   * 
   *```
      const logger = new Logger();
      logger.extends({name: 'kurbernateError', ...otherConfig});
      //...
      logger.custom.kurbernateError(err);
      // or
      logger.custom["kurbernateError"];
   ```
   */
  get custom() { return true; }
}




//const logger = new Logger();

//logger.debug('salut');
//logger.debug({ s: 'salut' });

//const hello = () => {
//  try {
//    (() => { throw new Error("hh"); })();
//  } catch (err) {
//    logger.debug(err);
//  }
//}

//hello();
