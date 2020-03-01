/**
 * IModuleManagerFilter
 */
export interface IModuleManagerFilter {
    priority: number
    filter(name: string, version: string, method?: string, parameter?: any[], registryName?: string): Promise<any>
}