import express, { type Request, type Response } from "express";
import env_variables from "./config/env_variables";

const app = express();

app.get("/", (req:Request, res: Response) => {
    res.json({
        method: req.method,
        url: req.url,
        message: "Server is running",
        port: env_variables.port
    })
})

export default app;