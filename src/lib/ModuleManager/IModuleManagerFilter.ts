/**
 * IModuleManagerFilter
 */
export interface IModuleManagerFilter {
    filter(name: string, version: string, method?: string, parameter?: any[], registryName?: string): Promise<any>
}