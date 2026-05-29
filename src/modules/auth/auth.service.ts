import bcrypt from "bcryptjs";
import pool from "../../db";
import type IUser from "./auth.interface";

class AuthService {
    async signup(payload: IUser) {
        
        const { email, name, password, role } = payload;
        
        const hashPassword = await bcrypt.hash(password, 13)

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
    }
}

export default new AuthService();