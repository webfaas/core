import { Core } from "../Core";

export interface IShellCommand{
    core: Core | null;
    commandTrigger: string
    executeCommand(shellArgv: string[]): void
    info: string;
    example: string;
}