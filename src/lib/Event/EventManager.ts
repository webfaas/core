import { EventEmitter } from "events";

export enum EventManagerEnum {
    PROCESS_MODULE_COMPILED_TO_CACHE = "PROCESS_MODULE_COMPILED_TO_CACHE",
    CONFIG_RELOAD = "CONFIG_RELOAD",
    QUIT = "QUIT"
}

const listSIG = [
    "SIGHUP",
    "SIGINT",
    "SIGQUIT",
    "SIGILL",
    "SIGTRAP",
    "SIGABRT",
    "SIGBUS",
    "SIGFPE",
    "SIGUSR1",
    "SIGSEGV",
    "SIGUSR2",
    "SIGTERM"
];

const event: EventEmitter = new EventEmitter();
event.setMaxListeners(200);

/**
 * Event Manager
 */
export class EventManager {
    public static addListener(type: EventManagerEnum, cb: any){
        event.addListener(type.toString(), cb);
    }
    
    public static emit(type: EventManagerEnum, ...args:any[]){
        event.emit(type.toString(), ...args);
    }
}

listSIG.forEach(function (sig) {
    let processAny = process as any;
    processAny.on(sig, function () {
        EventManager.emit(EventManagerEnum.QUIT, sig);
    });
});
