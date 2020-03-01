/**
 * IRequestContext
 */
export interface IRequestContextStack {
    name: string
    version: string
    method: string
    stack: IRequestContextStack | null
}

export interface IRequestContext {
    level: number
    requestID: string
    clientContext: any
    stack: IRequestContextStack | null
}