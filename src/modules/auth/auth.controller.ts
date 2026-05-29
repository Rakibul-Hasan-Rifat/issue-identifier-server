import type { Request, Response } from "express";
import authService from "./auth.service";
import sendResaponse from "../../utils/sendResponse";

class AuthControllers {
    async signup(req: Request, res: Response) {
        const result = await authService.signup(req.body)
        
        sendResaponse(res, {
            status: 201,
            success: true,
            message: "User registered successfully",
            data: result
        })
    }
}

export default new AuthControllers();