import { Pool } from "pg";
import env_variables from "../config/env_variables";

const pool = new Pool({
    connectionString: env_variables.db_url
})

export const initDb = async () => {

    try {
        await pool.query(
            `
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(25) NOT NULL,
                    email VARCHAR(32) UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    role VARCHAR(16) DEFAULT 'contributor',

                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_ata TIMESTAMP DEFAULT NOW()
                )
            `
        )

        await pool.query(
            `
                CREATE TABLE IF NOT EXISTS issues (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(150) NOT NULL,
                    description TEXT NOT NULL,
                    type VARCHAR(16) NOT NULL,
                    status VARCHAR(16) NOT NULL DEFAULT 'open',
                    reporter_id INT REFERENCES users(id) ON DELETE CASCADE,

                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `
        )
        console.log("Database connection is successful! 🙌");

    } catch (error) {
        console.log(error);
    }
}

export default pool;