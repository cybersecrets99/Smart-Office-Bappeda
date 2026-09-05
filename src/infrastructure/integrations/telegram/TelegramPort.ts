export interface TelegramPort{sendMessage(chatId:string,message:string):Promise<void>;sendOtp(chatId:string,otp:string):Promise<void>;}
