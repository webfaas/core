export interface IModuleCompileManifestData {
    name: string,
    filePath: string
}

export interface IModuleCompile {
    exports: any
}

export interface IModuleCompileRequire {
    (path: string, manifest: IModuleCompileManifestData): any
}

export interface IModuleCompileRequireBuilder {
    processRequire: IModuleCompileRequire
    requireBuilder (manifest: IModuleCompileManifestData): Function
}