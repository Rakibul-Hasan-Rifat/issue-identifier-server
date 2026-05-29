import type { Request, Response } from "express";
import authService from "./auth.service";

class AuthControllers {
    async signup(req: Request, res: Response) {
        const result = await authService.signup(req.body)
        
        res.status(201).send(result)
    }
}

export default new AuthControllers();