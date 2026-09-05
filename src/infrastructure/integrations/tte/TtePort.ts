export interface TtePort{sign(input:{documentId:string;digest:string;signerId:string;otp:string}):Promise<{signatureId:string;signedAt:string}>;}
