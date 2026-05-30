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
}

export default new IssueService();