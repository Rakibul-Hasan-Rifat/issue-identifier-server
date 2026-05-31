import type { Request } from "express";
import IUser from "../modules/auth/auth.interface";

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}