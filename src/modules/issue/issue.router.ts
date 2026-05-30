import { Router } from "express";
import issueController from "./issue.controller";

const issueRoute = Router();

issueRoute.post("/", issueController.createIssue);
issueRoute.get("/", issueController.getIssues);
issueRoute.get("/:id", issueController.getIssues);

export default issueRoute;