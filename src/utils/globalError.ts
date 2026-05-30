import type { NextFunction, Request, Response } from "express";

const globalError = (err: Error & { status: number }, req: Request, res: Response, next: NextFunction) => {
    const success = false
    const status = err.status || 500
    const message = err.message || "Internal Server Error"

    res.status(status).send({
        success,
        message,
        stack: err.stack || ""
    })
}

export default globalError;