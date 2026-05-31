
            import {createRequire} from "module";
            const require = createRequire(import.meta.url);
        

// src/app.ts
import express from "express";

// src/config/env_variables.ts
import dotenv from "dotenv";
import { env } from "process";
dotenv.config({
  quiet: true
});
var env_variables = {
  port: env.PORT || 5e3,
  db_url: env.DATABASE_URL,
  jwt_access_token: env.JWT_ACCESS_SECRET_TOKEN
};
var env_variables_default = env_variables;

// src/modules/auth/auth.router.ts
import { Router } from "express";

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: env_variables_default.db_url,
  ssl: { rejectUnauthorized: false }
});
var initDb = async () => {
  try {
    await pool.query(
      `
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(25) NOT NULL,
                    email VARCHAR(32) UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    role VARCHAR(16) DEFAULT 'contributor',

                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_ata TIMESTAMP DEFAULT NOW()
                )
            `
    );
    await pool.query(
      `
                CREATE TABLE IF NOT EXISTS issues (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(150) NOT NULL,
                    description TEXT NOT NULL,
                    type VARCHAR(16) NOT NULL,
                    status VARCHAR(16) NOT NULL DEFAULT 'open',
                    reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `
    );
    console.log("Database connection is successful! \u{1F64C}");
  } catch (error) {
    console.log(error);
  }
};
var db_default = pool;

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secretKey) => {
  const token = jwt.sign(payload, secretKey);
  return token;
};
var verifyToken = (token, secretKey) => {
  const decoded = jwt.verify(token, secretKey);
  return decoded;
};

// src/modules/auth/auth.service.ts
var AuthService = class {
  async signup(payload) {
    try {
      const { email, name, password, role } = payload;
      const hashPassword = await bcrypt.hash(password, 13);
      const result = await db_default.query(
        `
                    INSERT INTO users 
                        (name, email, password, role)
                    VALUES
                        ($1,    $2,     $3,     $4)
                    RETURNING *
                `,
        [name, email, hashPassword, role ? role : "contributor"]
      );
      delete result.rows[0].password;
      return result.rows[0];
    } catch (error) {
      console.log(error);
    }
  }
  async login(payload) {
    try {
      const { email, password } = payload;
      console.log(email, password);
      const queryResult = await db_default.query(
        `
                    SELECT * FROM users WHERE email = $1
                `,
        [email]
      );
      const isUserAvailable = queryResult.rows[0];
      if (!isUserAvailable) {
        const err = new Error("User Not Found!");
        err.status = 404;
        throw err;
      }
      const isPasswordCorrect = await bcrypt.compare(password, isUserAvailable.password);
      if (!isPasswordCorrect) {
        const err = new Error("Credentials not matched");
        err.status = 403;
        throw err;
      }
      const accessToken = createToken({
        id: isUserAvailable.id,
        name: isUserAvailable.name,
        email: isUserAvailable.email,
        role: isUserAvailable.role
      }, env_variables_default.jwt_access_token);
      delete isUserAvailable.password;
      return {
        accessToken,
        user: isUserAvailable
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
};
var auth_service_default = new AuthService();

// src/utils/sendResponse.ts
var sendResponse = (res, {
  status,
  success,
  message,
  data
}) => {
  res.status(status).send({
    success,
    message,
    data
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.controller.ts
var AuthControllers = class {
  async signup(req, res) {
    const result = await auth_service_default.signup(req.body);
    sendResponse_default(res, {
      status: 201,
      success: true,
      message: "User registered successfully",
      data: result
    });
  }
  async login(req, res) {
    const { accessToken, user } = await auth_service_default.login(req.body);
    sendResponse_default(res, {
      status: 200,
      success: true,
      message: "Login successful",
      data: {
        token: accessToken,
        user
      }
    });
  }
};
var auth_controller_default = new AuthControllers();

// src/modules/auth/auth.router.ts
var authRoute = Router();
authRoute.post("/signup", auth_controller_default.signup);
authRoute.post("/login", auth_controller_default.login);
var auth_router_default = authRoute;

// src/utils/globalError.ts
var globalError = (err, req, res, next) => {
  const success = false;
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).send({
    success,
    message,
    stack: err.stack || ""
  });
};
var globalError_default = globalError;

// src/modules/issue/issue.router.ts
import { Router as Router2 } from "express";

// src/modules/auth/auth.interface.ts
var Role = {
  contributor: "CONTRIBUTOR",
  maintainer: "MAINTAINER"
};

// src/modules/issue/issue.service.ts
var IssueService = class {
  async createIssue(user, payload) {
    const { title, description, type } = payload;
    console.log(user);
    try {
      const result = await db_default.query(
        `
                    INSERT INTO issues (title, description, type, reporter_id)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
                `,
        [title, description, type, user.id]
      );
      return result.rows[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getIssues() {
    try {
      const result = await db_default.query(
        `
                    SELECT * FROM issues;
                `
      );
      const issues = result.rows;
      const issueReporterIds = issues.map((issue) => issue.reporter_id);
      const reporters = await db_default.query(
        `
                    SELECT id, name, email, role FROM users WHERE id = ANY($1)
                `,
        [issueReporterIds]
      );
      issues.forEach((issue) => {
        reporters.rows.forEach((reporter) => {
          if (issue.reporter_id === reporter.id) {
            issue.reporter = reporter;
          }
        });
        delete issue.reporter_id;
      });
      return issues;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getIssueById(issueId) {
    try {
      const result = await db_default.query(
        `
                    SELECT * FROM issues WHERE id = $1
                `,
        [issueId]
      );
      const issue = result.rows[0];
      const reporter = await db_default.query(
        `
                    SELECT id, name, email, role FROM users WHERE id = $1
                `,
        [issue.reporter_id]
      );
      issue.reporter = reporter.rows[0];
      delete issue.reporter_id;
      return issue;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updateIssue(issueId, user, payload) {
    try {
      const doesExist = await db_default.query(
        `
                    SELECT * FROM issues WHERE id = $1
                `,
        [issueId]
      );
      if (doesExist.rowCount < 1) {
        const err = new Error("The item with id provided by you is not found!");
        err.status = 404;
        throw err;
      }
      if (user.role?.toUpperCase() !== Role.maintainer && !(user.role?.toUpperCase() === Role.contributor && user.id === doesExist.rows[0].reporter_id)) {
        const err = new Error("You're forbidden to do this task!");
        err.status = 403;
        throw err;
      }
      const issue = doesExist.rows[0];
      const title = payload.title || issue.title;
      const description = payload.description || issue.description;
      const type = payload.type || issue.type;
      const result = await db_default.query(
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
      );
      return result.rows[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async deleteIssue(issueId, user) {
    try {
      if (user.role?.toUpperCase() !== Role.maintainer) {
        const err = new Error("You're forbidden to delete an issue");
        err.status = 403;
        throw err;
      }
      const result = await db_default.query(
        `
                    DELETE FROM issues WHERE id = $1
                `,
        [issueId]
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
};
var issue_service_default = new IssueService();

// src/modules/issue/issue.controller.ts
var IssueController = class {
  async createIssue(req, res) {
    try {
      const result = await issue_service_default.createIssue(req.user, req.body);
      sendResponse_default(res, {
        status: 201,
        success: true,
        message: "Issue created successfully",
        data: result
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getIssues(req, res) {
    const result = await issue_service_default.getIssues();
    sendResponse_default(res, {
      status: 200,
      success: true,
      message: "Issues retrived successfully",
      data: result
    });
  }
  async getIssueById(req, res) {
    const result = await issue_service_default.getIssueById(Number(req.params.id));
    sendResponse_default(res, {
      status: 200,
      success: true,
      message: "Issue retrived successfully",
      data: result
    });
  }
  async updateIssue(req, res) {
    const result = await issue_service_default.updateIssue(Number(req.params.id), req.user, req.body);
    sendResponse_default(res, {
      status: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  }
  async deleteIssue(req, res) {
    const result = await issue_service_default.deleteIssue(Number(req.params.id), req.user);
    sendResponse_default(res, {
      status: 200,
      success: true,
      message: "Issue deleted successfully",
      data: result
    });
  }
};
var issue_controller_default = new IssueController();

// src/middlewares/verifyUser.ts
var verifyUser = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    const err = new Error("No authorization token provided!");
    err.status = 401;
    throw err;
  }
  try {
    const decodedUser = verifyToken(token, env_variables_default.jwt_access_token);
    console.log("middleware", decodedUser);
    const userFromDb = await db_default.query(
      `
                SELECT * FROM users WHERE email = $1
            `,
      [decodedUser.email]
    );
    if (userFromDb.rowCount < 0) {
      const err = new Error("No user with the given token found in the data");
      err.status = 404;
      throw err;
    }
    req.user = decodedUser;
    next();
  } catch (error) {
    console.log(error);
    throw error;
  }
};
var verifyUser_default = verifyUser;

// src/modules/issue/issue.router.ts
var issueRoute = Router2();
issueRoute.post("/", verifyUser_default, issue_controller_default.createIssue);
issueRoute.get("/", issue_controller_default.getIssues);
issueRoute.get("/:id", issue_controller_default.getIssueById);
issueRoute.patch("/:id", verifyUser_default, issue_controller_default.updateIssue);
issueRoute.delete("/:id", verifyUser_default, issue_controller_default.deleteIssue);
var issue_router_default = issueRoute;

// src/app.ts
var app = express();
app.use(express.json());
app.use("/api/auth", auth_router_default);
app.use("/api/issues", issue_router_default);
app.get("/", (req, res) => {
  res.json({
    method: req.method,
    url: req.url,
    message: "Server is running",
    port: env_variables_default.port
  });
});
app.use(globalError_default);
var app_default = app;

// src/server.ts
app_default.listen(env_variables_default.port, () => {
  initDb();
  console.log(`Server is running at port: ${env_variables_default.port}`);
});
//# sourceMappingURL=server.js.map