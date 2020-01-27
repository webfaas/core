export interface ISemver {
    valid(value: string): boolean
    maxSatisfying(versionsArray:Array<string>, version: string): string | null
}