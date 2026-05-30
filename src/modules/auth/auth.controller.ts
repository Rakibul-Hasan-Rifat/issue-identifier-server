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

    async login(req: Request, res: Response) {
        const {accessToken, user} = await authService.login(req.body)

        sendResaponse(res, {
            status: 200,
            success: true,
            message: "Login successful",
            data: {
                token: accessToken,
                user
            }
        })
    }
}

export default new AuthControllers();