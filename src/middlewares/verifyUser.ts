import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import env_variables from "../config/env_variables";
import type { JwtPayload } from "jsonwebtoken";
import type IUser from "../modules/auth/auth.interface";
import pool from "../db";

const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
        const err: Error & { status?: number } = new Error("No authorization token provided!");
        err.status = 401;
        throw err;
    }

    try {
        const decodedUser = verifyToken(token, env_variables.jwt_access_token as string) as JwtPayload;
        console.log("middleware", decodedUser);

        const userFromDb = await pool.query(
            `
                SELECT * FROM users WHERE email = $1
            `,
            [decodedUser.email]
        )

        if(userFromDb.rowCount as number < 0) {
            const err: Error & { status?: number } = new Error("No user with the given token found in the data");
            err.status = 404;
            throw err;
        }        

        req.user = decodedUser as IUser;

        next();
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export default verifyUser;