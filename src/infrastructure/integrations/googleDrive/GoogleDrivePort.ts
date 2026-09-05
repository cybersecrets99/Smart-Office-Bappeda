export interface GoogleDrivePort{uploadPdf(input:{name:string;bytes:Uint8Array;folder:string}):Promise<{fileId:string;url?:string}>;}
