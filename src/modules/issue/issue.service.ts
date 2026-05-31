import pool from "../../db";
import type IIssue from "./issue.interface";

class IssueService {
    async createIssue(payload: IIssue) {
        const { title, description, type } = payload;
        try {
            const result = await pool.query(
                `
                    INSERT INTO issues (title, description, type)
                    VALUES ($1, $2, $3)
                    RETURNING *
                `,
                [title, description, type]
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

    async updateIssue(issueId: number, payload: Partial<Pick<IIssue, "title" | "description" | "type">>) {
        try {
            const doesExist = await pool.query(
                `
                    SELECT * FROM issues WHERE id = $1
                `,
                [issueId]
            )

            console.log(payload);            

            if ((doesExist.rowCount as number) < 1) {
                const err: Error & { status?: number } = new Error("The item with id provided by you is not found!")
                err.status = 404;
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

    async deleteIssue(issueId: number) {
        try {
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