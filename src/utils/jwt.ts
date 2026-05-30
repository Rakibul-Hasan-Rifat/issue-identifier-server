import jwt from "jsonwebtoken";
import env_variables from "../config/env_variables";
import type IUser from "../modules/auth/auth.interface";

export const createToken = (payload: Pick<IUser, "id" | "name" | "email" | "role">, secretKey: string) => {
    const token = jwt.sign(payload, secretKey)
    return token;
}

export const verifyToken = (token: string, secretKey: string) => {
    const decoded = jwt.verify(token, secretKey)
    return decoded;
}