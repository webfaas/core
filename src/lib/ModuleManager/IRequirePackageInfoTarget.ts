import { IModuleNameData } from "../Util/ModuleNameUtil";

export interface IRequirePackageInfoTarget {
    packageName: string
    packageVersion: string
    itemKey: string
    nameParsedObj: IModuleNameData
}