import type { Request, Response } from "express";
import issueService from "./issue.service";
import sendResponse from "../../utils/sendResponse";

class IssueController {
    async createIssue(req: Request, res: Response) {
        try {
            const result = await issueService.createIssue(req.body)

            sendResponse(res, {
                status: 201,
                success: true,
                message: "Issue created successfully",
                data: result
            })
        } catch (error) {
            console.log(error);
            throw error;            
        }
    }

    async getIssues(req: Request, res: Response) {
        const result = await issueService.getIssues();

        sendResponse(res, {
            status: 200,
            success: true,
            message: "Issues retrived successfully",
            data: result
        })
    }

    async getIssueById(req: Request, res: Response) {
        const result = await issueService.getIssueById(Number(req.params.id))

        sendResponse(res, {
            status: 200,
            success: true,
            message: "Issue retrived successfully",
            data: result
        })
    }
}

export default new IssueController()