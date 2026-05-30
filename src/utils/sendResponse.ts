import type { Response } from "express";

const sendResponse = <T>(res: Response, {
    status,
    success,
    message,
    data
}: {
    status: number;
    success: boolean;
    message: string;
    data?: T
}) => {

    res.status(status).send({
        success,
        message,
        data
    })

}

export default sendResponse;