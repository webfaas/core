export namespace WebFaasError{
    //
    //NotFoundError
    //
    export enum NotFoundErrorTypeEnum{
        TARBALL="TARBALL",
        MANIFEST="MANIFEST",
        VERSION="VERSION",
        DEPENDENCY="DEPENDENCY",
        METHOD="METHOD"
    }

    export class NotFoundError extends Error {
        type: NotFoundErrorTypeEnum;
        artefactName: string;
    
        constructor(type:NotFoundErrorTypeEnum, artefactName: string) {
            super(type.toString() + " NOT FOUND");
            this.name = "NotFoundError";
            this.type = type;
            this.artefactName = artefactName;
        }
    }

    //
    //ClientHttpError
    //
    export class ClientHttpError extends Error {
        code?: string;
        url: string;
        method: string;
    
        constructor(err: Error, url: string, method?: string) {
            super(err.message);
            let genericErr: any = err;
            this.name = "ClientHttpError";
            this.code = genericErr.code;
            this.stack = err.stack;
            this.url = url;
            this.method = method || "GET";
        }
    }

    //
    //CompileError
    //
    export class CompileError extends Error {
        code?: string;
        constructor(err: Error) {
            super(err.message);
            let genericErr: any = err;
            this.name = "CompileError";
            this.code = genericErr.code;
            this.stack = err.stack;
        }
    }

    //
    //FileError
    //
    export class FileError extends Error {
        code?: string;
        constructor(err: Error) {
            super(err.message);
            let genericErr: any = err;
            this.name = "FileError";
            this.code = genericErr.code;
            this.stack = err.stack;
        }
    }

    //
    //InvokeError
    //
    export class InvokeError extends Error {
        code?: string;
        constructor(err: Error) {
            super(err.message);
            let genericErr: any = err;
            this.name = "InvokeError";
            this.code = genericErr.code;
            this.stack = err.stack;
        }
    }

    //
    //SecurityError
    //
    export enum SecurityErrorTypeEnum{
        MISSING_CREDENTIALS="MISSING_CREDENTIALS",
        INVALID_CREDENTIALS="INVALID_CREDENTIALS",
        FORBIDDEN="FORBIDDEN",
        THROTTLED="THROTTLED",
        PAYLOAD_LARGE="PAYLOAD_LARGE",
        PAYLOAD_INVALID="PAYLOAD_INVALID",
        UNCLASSIFIED="UNCLASSIFIED"
    }

    export class SecurityError extends Error {
        type:SecurityErrorTypeEnum;
        
        constructor(type:SecurityErrorTypeEnum, message: string) {
            super(message);
            this.name = "SecurityError";
            this.type = type;
        }
    }

    //
    //ValidateError
    //
    export class ValidateError extends Error {
        code: string;
        field: string;
        
        constructor(code: string, field: string, message: string) {
            super(message);
            this.name = "ValidateError";
            this.field = field;
            this.code = code;
        }
    }
}