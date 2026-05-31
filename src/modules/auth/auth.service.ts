import bcrypt from "bcryptjs";
import pool from "../../db";
import type IUser from "./auth.interface";
import { createToken } from "../../utils/jwt";
import type { Role } from "./auth.interface";
import env_variables from "../../config/env_variables";

class AuthService {
    async signup(payload: IUser) {
        try {
            const { email, name, password, role } = payload;
            const hashPassword = await bcrypt.hash(password, 13);
            const result = await pool.query(
                `
                    INSERT INTO users 
                        (name, email, password, role)
                    VALUES
                        ($1,    $2,     $3,     $4)
                    RETURNING *
                `,
                [name, email, hashPassword, role ? role : "contributor"]
            )
            delete result.rows[0].password

            return result.rows[0]
        } catch (error) {
            console.log(error);
        }
    }

    async login(payload: Pick<IUser, "email" | "password">) {
        try {
            const { email, password } = payload;

            console.log(email, password);


            const queryResult = await pool.query(
                `
                    SELECT * FROM users WHERE email = $1
                `,
                [email]
            )

            const isUserAvailable: Partial<IUser> = queryResult.rows[0];
            if (!isUserAvailable) {
                const err: Error & { status?: number } = new Error("User Not Found!");
                err.status = 404;
                throw err;
            }

            const isPasswordCorrect = await bcrypt.compare(password, isUserAvailable.password as string);
            if (!isPasswordCorrect) {
                const err: Error & { status?: number } = new Error("Credentials not matched")
                err.status = 403;
                throw err;
            }

            const accessToken = createToken({
                id: isUserAvailable.id as number, 
                name: isUserAvailable.name as string, 
                email: isUserAvailable.email as string, 
                role: isUserAvailable.role as Role
            }, env_variables.jwt_access_token as string)

            delete isUserAvailable.password

            return {
                accessToken,
                user: isUserAvailable
            }

        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

export default new AuthService();