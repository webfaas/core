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
        code: string;
        url: string;
        method: string;
    
        constructor(err: any, url: string, method?: string) {
            super(err.message || "");
            this.name = "ClientHttpError";
            this.code = err.code || "";
            this.stack = err.stack;
            this.url = url;
            this.method = method || "GET";
        }
    }

    //
    //CompileError
    //
    export class CompileError extends Error {
        code: string;
        
        constructor(err: any) {
            super(err.message || "");
            this.name = "CompileError";
            this.code = err.code || "";
            this.stack = err.stack;
        }
    }

    //
    //FileError
    //
    export class FileError extends Error {
        code: string;
        
        constructor(err: any) {
            super(err.message || "");
            this.name = "FileError";
            this.code = err.code || "";
            this.stack = err.stack;
        }
    }

    //
    //InvokeError
    //
    export class InvokeError extends Error {
        code: string;
        
        constructor(err: any) {
            super(err.message || "");
            this.name = "InvokeError";
            this.code = err.code || "";
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
        code: string;
        type:SecurityErrorTypeEnum;
        
        constructor(type:SecurityErrorTypeEnum, err: any) {
            super(err.message || "");
            this.name = "SecurityError";
            this.type = type;
            this.code = err.code || "";
            this.stack = err.stack;
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