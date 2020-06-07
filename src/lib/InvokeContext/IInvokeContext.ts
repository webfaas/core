export interface IInvokeContext {
    tenantID: string;
    getConnection(name: string): any
}