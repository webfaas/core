import { EventEmitter } from "events";

export enum EventManagerEnum {
    PROCESS_MODULE_COMPILED_TO_CACHE = "PROCESS_MODULE_COMPILED_TO_CACHE",
    CONFIG_RELOAD = "CONFIG_RELOAD"
}

const event: EventEmitter = new EventEmitter();

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