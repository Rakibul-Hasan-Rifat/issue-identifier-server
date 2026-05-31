import type { Jwt, JwtPayload } from "jsonwebtoken";
import type IUser from "./modules/auth/auth.interface";

declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}