import app from "./app";
import env_variables from "./config/env_variables";

app.listen(env_variables.port, () => {
    console.log(`Server is running at port: ${env_variables.port}`);
    
})