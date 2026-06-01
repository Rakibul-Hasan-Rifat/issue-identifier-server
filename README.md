# [Issue-Identifier-Server](https://issue-identifier-server.vercel.app/)

## Teck Stack: Kind of (PERN) but no React here
- PostgreSQL
- Express
- Node

## API endpoints
- User registration: `POST /api/auth/signup`
- User login: `POST /api/auth/login`
- Create issue: `POST /api/issues/`
- Get all issues: `GET /api/issues`
- Get an issue: `GET /api/issues/:id`
- Update issue: `PATCH /api/issues/:id`
- Delete issue: `DELETE /api/issues/:id`

## Database Schema
Table-1: Users
```
id SERIAL PRIMARY KEY,
name VARCHAR(25) NOT NULL,
email VARCHAR(32) UNIQUE NOT NULL,
password TEXT NOT NULL,
role VARCHAR(16) DEFAULT 'contributor',
created_at TIMESTAMP DEFAULT NOW(),
updated_ata TIMESTAMP DEFAULT NOW()
```

Table-2: Issues
```
id SERIAL PRIMARY KEY,
title VARCHAR(150) NOT NULL,
description TEXT NOT NULL,
type VARCHAR(16) NOT NULL,
status VARCHAR(16) NOT NULL DEFAULT 'open',
reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

## Features
- Signup (User registration with id, name, email and role)
- Login (User authentication with token set in the headers)
- Create issue (Any logged in user with role of 'contributor' or 'maintainer' having authority to create issues)
- Update issue (Logged in user with maintainer role can update any issue but contributor can only his own issues)
- Get issues (Anyone having authority to have a look at all issues)
- Get an issue (Any user having the authority to get any issue with id sent as params in the URL)
- Delete an issue (Logged in user only with maintainer role having the right to delete an issue with id sent as params in the URL)

  
