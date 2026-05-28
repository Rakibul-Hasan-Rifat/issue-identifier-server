import app from "./app";
import env_variables from "./config/env_variables";
import { initDb } from "./db";

app.listen(env_variables.port,  () => {
    initDb()
    console.log(`Server is running at port: ${env_variables.port}`);
})