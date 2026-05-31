import { Router } from "express";
import issueController from "./issue.controller";
import verifyUser from "../../middlewares/verifyUser";

const issueRoute = Router();

issueRoute.post("/", verifyUser, issueController.createIssue);
issueRoute.get("/", issueController.getIssues);
issueRoute.get("/:id", issueController.getIssueById);
issueRoute.patch("/:id", verifyUser, issueController.updateIssue);
issueRoute.delete("/:id", verifyUser, issueController.deleteIssue);

export default issueRoute;