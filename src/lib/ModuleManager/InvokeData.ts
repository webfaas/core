/**
 * Invoke Data
 */
export class InvokeData {
    public name: string = "";
    public version: string = "";
    public method: string = "";
    public parameter?: any[];
    public registryName?: string;

    static parseInvokeCommandTexto(invokeCommandTexto: string): InvokeData{
        //@module1:version#method

        let invokeData = new InvokeData;
        let tmpVersionPos: number = invokeCommandTexto.indexOf(":");
        let tmpMethodPos: number = invokeCommandTexto.indexOf("#");
        
        if (tmpVersionPos > -1){
            invokeData.name = invokeCommandTexto.substring(0, tmpVersionPos);
            if (tmpMethodPos > -1){
                invokeData.version = invokeCommandTexto.substring(tmpVersionPos + 1, tmpMethodPos);
                invokeData.method = invokeCommandTexto.substring(tmpMethodPos + 1);
            }
            else{
                invokeData.version = invokeCommandTexto.substring(tmpVersionPos + 1);
                invokeData.method = "";
            }
        }
        else{
            if (tmpMethodPos > -1){
                invokeData.name = invokeCommandTexto.substring(0, tmpMethodPos);
                invokeData.version = "*";
                invokeData.method = invokeCommandTexto.substring(tmpMethodPos + 1);
            }
            else{
                invokeData.name = invokeCommandTexto;
                invokeData.version = "*";
                invokeData.method = "";
            }
        }

        return invokeData;
    }
}