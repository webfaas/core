import * as vm from "vm";

/**
 * SandBox
 */
export class SandBoxProcess {
    env: any = {};
    hrtime = process.hrtime;
    memoryUsage = process.memoryUsage;
    cpuUsage = process.cpuUsage;
    nextTick = process.nextTick;
    pid = process.pid;
    platform = process.platform;
    cwd = function(){
        return "";
    };
    //sandBox.process.on
    //sandBox.process.once
    //sandBox.process.listeners
    //sandBox.process.removeListener
    //sandBox.process.umask
}

/**
 * SandBox Object
 */
export class SandBox {
    constructor() {
    }

    global: any = {}
    process: SandBoxProcess = new SandBoxProcess();
    clearImmediate = global.clearImmediate;
    clearInterval = global.clearInterval;
    clearTimeout = global.clearTimeout;
    setImmediate = global.setImmediate;
    setInterval = global.setInterval;
    setTimeout = global.setTimeout;
    Buffer = global.Buffer;
    console = global.console;

    /**
     * Build a Sandbox context
     */
    static SandBoxBuilderContext(): vm.Context{
        var sandboxObj = new SandBox();
        var sandboxContext = vm.createContext(sandboxObj);
        return sandboxContext;
    }
}