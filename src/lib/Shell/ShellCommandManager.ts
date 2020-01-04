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
        this.addShellCommand(new ShellCommandInvoke());
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
    executeShellCommand(shellArgv: string[]){
        let commandText: string | undefined = shellArgv[2];
        if (commandText){
            let shellCommand: IShellCommand | null = this.getShellCommand(commandText);
            if (shellCommand === null){
                console.log("UNRECOGNIZED COMMAND!");
                this.printInfo();
            }
            else{
                shellCommand.executeCommand(shellArgv);
            }
        }
        else{
            this.printInfo();
        }
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
                console.log(shellCommand.info + "\n");
            }
        }
    }
}