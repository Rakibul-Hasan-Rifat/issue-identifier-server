import type { JwtPayload } from "jsonwebtoken";
import pool from "../../db";
import type IUser from "../auth/auth.interface";
import type IIssue from "./issue.interface";
import { Role } from "../auth/auth.interface";

class IssueService {
    async createIssue(user: Pick<IUser, "id" | "name" | "email" | "role">, payload: IIssue) {
        const { title, description, type } = payload;
        console.log(user);
        try {
            const result = await pool.query(
                `
                    INSERT INTO issues (title, description, type, reporter_id)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
                `,
                [title, description, type, user.id]
            )
            return result.rows[0]

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getIssues() {
        try {
            const result = await pool.query(
                `
                    SELECT * FROM issues;
                `
            )

            return result.rows
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async getIssueById(issueId: number) {
        try {
            const result = await pool.query(
                `
                    SELECT * FROM issues WHERE id = $1
                `,
                [issueId]
            )

            return result.rows[0]
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updateIssue(issueId: number, user: Pick<IUser, "id" | "name" | "email" | "role">, payload: Partial<Pick<IIssue, "title" | "description" | "type">>) {
        try {
            const doesExist = await pool.query(
                `
                    SELECT * FROM issues WHERE id = $1
                `,
                [issueId]
            )


            if ((doesExist.rowCount as number) < 1) {
                const err: Error & { status?: number } = new Error("The item with id provided by you is not found!")
                err.status = 404;
                throw err;
            }

            if (user.role?.toUpperCase() !== Role.maintainer &&
                !(
                    user.role?.toUpperCase() === Role.contributor &&
                    user.id === doesExist.rows[0].reporter_id
                )) {
                const err: Error & { status?: number } = new Error("You're forbidden to do this task!");
                err.status = 403;
                throw err;
            }

            const issue: IIssue = doesExist.rows[0];
            const title = payload.title || issue.title;
            const description = payload.description || issue.description;
            const type = payload.type || issue.type;

            const result = await pool.query(
                `
                    UPDATE issues 
                    SET 
                        title = $1,
                        description = $2,
                        type = $3
                    WHERE id = $4
                    RETURNING *
                `,
                [title, description, type, issueId]
            )

            return result.rows[0]
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async deleteIssue(issueId: number, user: Pick<IUser, "id" | "name" | "email" | "role">) {
        try {
            if (user.role?.toUpperCase() !== Role.maintainer) {
                const err: Error & { status?: number } = new Error("You're forbidden to delete an issue");
                err.status = 403;
                throw err;
            }
            
            const result = await pool.query(
                `
                    DELETE FROM issues WHERE id = $1
                `,
                [issueId]
            )

            return result
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

export default new IssueService();