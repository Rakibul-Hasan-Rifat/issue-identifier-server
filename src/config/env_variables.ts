import { configDotenv } from "dotenv";
import { env } from "node:process";
configDotenv({
    quiet: true
});

const env_variables = {
    port: env.PORT || 5000,
    db_url: env.DATABASE_URL,
}

export default env_variables;