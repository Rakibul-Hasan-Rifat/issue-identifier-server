import { configDotenv } from "dotenv";
import { env } from "node:process";
configDotenv({
    quiet: true
});

const env_variables = {
    port: env.PORT || 5000,
    db_url: env.DATABASE_URL,
    jwt_access_token: env.JWT_ACCESS_SECRET_TOKEN
}

export default env_variables;