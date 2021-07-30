
export enum LogLevel {
    unknown = 0,
    none = 1,
    info = 2,
    debug = 4
}

export class Logger {

    static defaultLogLevel = LogLevel.none;

    constructor() {
        this.logLevel = Logger.defaultLogLevel
    }

    logLevel: LogLevel =  LogLevel.none;
    log(level: LogLevel, method: string, text: string, values?: any) {
        if (this.logLevel >= level) {
            console.log(`EtherClient: [${method}]->${text}`);
            values && console.log(values);
        }
    }
}