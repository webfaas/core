import { Core } from "../Core";

export interface IShellCommand{
    core: Core | null;
    commandTrigger: string
    executeCommand(shellArgv: string[]): Promise<any>
    info: string;
    example: string;
}