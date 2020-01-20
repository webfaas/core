import { Core } from "../Core";
import { InvokeData } from "../ModuleManager/InvokeData";
import { IShellCommand } from "./IShellCommand";
import { ShellCommandInvoke } from "./ShellCommandInvoke"

/**
 * ShellCommandManager
 */
export class ShellCommandManager {
    private core: Core;
    private listShellCommand: Map<string, IShellCommand> = new Map<string, IShellCommand>();
    
    constructor(core: Core) {
        this.core = core;
        this.addShellCommand(new ShellCommandInvoke(this.core));
    }

    /**
     * add shell command
     * @param newShellCommand shellCommand
     */
    addShellCommand(newShellCommand: IShellCommand){
        this.listShellCommand.set(newShellCommand.commandTrigger.toUpperCase(), newShellCommand);
        newShellCommand.core = this.core;
    }

    /**
     * return shellCommand
     * @param commandTrigger command trigger
     */
    getShellCommand(commandTrigger: string): IShellCommand | null{
        return this.listShellCommand.get(commandTrigger.toUpperCase()) || null;
    }

    /**
     * execute shell command
     * @param shellArgv process.argv
     */
    executeShellCommand(shellArgv: string[]): Promise<void>{
        return new Promise((resolve, reject) => {
            try {
                let commandText: string | undefined = shellArgv[2];
                if (commandText){
                    let shellCommand: IShellCommand | null = this.getShellCommand(commandText);
                    if (shellCommand === null){
                        this.printLog("RESPONSE", "UNRECOGNIZED COMMAND!")
                        this.printInfo();
                        resolve();
                    }
                    else{
                        shellCommand.executeCommand(shellArgv).then((response) => {
                            this.printLog("RESPONSE", response);
                            resolve();
                        }).catch((errExecuteCommand) => {
                            reject(errExecuteCommand);
                        })
                    }
                }
                else{
                    this.printInfo();
                    resolve();
                }
            }
            catch (errTry) {
                this.printLog("ERROR", errTry);
                reject(errTry);
            }
        });
    }

    /**
     * print help
     */
    printInfo(): void{
        console.log("COMMANDS:\n");
        let keys: string[] = Array.from(this.listShellCommand.keys());
        for (let i = 0; i < keys.length; i ++){
            let shellCommand: IShellCommand | null = this.getShellCommand(keys[i]);
            /* istanbul ignore else  */
            if (shellCommand){
                this.printLog("", shellCommand.info + "\n");
            }
        }
    }

    /**
     * print log
     * @param type type log
     * @param message message log
     */
    printLog(type: string, message: any): void{
        console.log(type, message);
    }
}