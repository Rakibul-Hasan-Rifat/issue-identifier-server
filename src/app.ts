import express, { type Request, type Response } from "express";
import env_variables from "./config/env_variables";
import authRoute from "./modules/auth/auth.router";
import globalError from "./utils/globalError";

const app = express();

// middlewares
app.use(express.json())
app.use("/api/auth", authRoute)

app.get("/", (req:Request, res: Response) => {
    res.json({
        method: req.method,
        url: req.url,
        message: "Server is running",
        port: env_variables.port
    })
})

app.use(globalError)

export default app;