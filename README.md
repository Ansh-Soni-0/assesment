# Newtonite Operations --- Employee Work Management System

A full-stack JavaScript application for managing operational work items,
teams, users, assignments, priorities, and work progress. This project
was prepared for the Newtonite "Operations Under Pressure" software
engineering assessment.

## Tech Stack

**Frontend** - React 18 - Vite - React Router - TanStack Query - Axios -
Tailwind CSS - React Hook Form and Zod - Recharts - Lucide React

**Backend** - Node.js (ES modules) - Express - MongoDB with Mongoose -
JWT authentication - bcryptjs for password hashing - Helmet, CORS, and
Express rate limiting

**Testing** - Vitest - Supertest - MongoDB Memory Server (available as a
development dependency)

## Features

The application source includes screens and API modules for:

-   User login and authentication context
-   Dashboard and operational overview
-   Creating, viewing, editing, and managing work items
-   Work-item priority and status workflows
-   Team listing and team details
-   User management
-   My Work view
-   Work-item comments and activity history data models
-   Notifications
-   Request validation and centralized error handling
-   Role/team authorization middleware
-   Idempotency middleware to help prevent duplicate requests
-   MongoDB models for users, teams, team memberships, work items,
    comments, activities, notifications, counters, and idempotency
    records

> Note: These are capabilities represented in the source code. Verify
> each workflow in a running environment before treating it as
> production-ready.

## Project Structure

``` text
assessment/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── server/
│   ├── package.json
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── scripts/
│       ├── app.js
│       └── server.js
├── .env.example
├── package.json
└── README.md
```

## Requirements

-   Node.js 20 or newer recommended
-   npm
-   A MongoDB instance, either local or MongoDB Atlas

Check your installed versions:

``` bash
node --version
npm --version
```

## Getting Started

### 1. Clone the repository

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

Replace the placeholders with your GitHub repository URL and folder
name.

### 2. Install dependencies

Run this command from the **project root**, where the root
`package.json` is located:

``` bash
npm install
```

The project uses npm workspaces, so this installs dependencies for both
`client` and `server`.

### 3. Configure environment variables

Create a `.env` file by copying `.env.example`.

**Windows PowerShell:**

``` powershell
Copy-Item .env.example .env
```

**Windows Command Prompt:**

``` bat
copy .env.example .env
```

**macOS/Linux:**

``` bash
cp .env.example .env
```

Open `.env` and configure the values for your environment:

``` dotenv
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/newtonite_ops
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000
ADMIN_EMAIL=admin@newtonite.local
ADMIN_PASSWORD=ChangeMe123!
ADMIN_NAME=System Administrator
```

-   For local MongoDB, ensure the MongoDB service is running.
-   For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection
    string. In Atlas, allow your development IP address and create a
    database user with appropriate permissions.
-   Use a strong, unique `JWT_SECRET`.
-   Change the sample administrator password before using the app beyond
    local testing.
-   Do not commit `.env` or credentials to GitHub.

### 4. Seed initial data (if needed)

After MongoDB is configured, run:

``` bash
npm run seed
```

The seed script may create development users and sample records. Review
`server/src/scripts/seed.js` before running it against a database
containing data you want to preserve.

### 5. Start the application

From the project root:

``` bash
npm run dev
```

The root script starts the frontend and backend together.

-   Frontend: <http://localhost:3000>
-   Backend: <http://localhost:5000>

Keep the terminal open while developing. Use `Ctrl+C` to stop the
development processes.

## Useful Commands

Run commands from the project root unless noted.

  ------------------------------------------------------------------------
  Command                              Purpose
  ------------------------------------ -----------------------------------
  `npm install`                        Install dependencies for the npm
                                       workspaces

  `npm run dev`                        Start frontend and backend together

  `npm run dev --workspace=client`     Start only the frontend

  `npm run dev --workspace=server`     Start only the backend

  `npm run build --workspace=client`   Build the frontend for production

  `npm run build`                      Run the configured build scripts
                                       for both workspaces

  `npm test`                           Run the server test script

  `npm run seed`                       Run the database seed script
  ------------------------------------------------------------------------

## Database

The example MongoDB URI uses the database name `newtonite_ops`.

Collections are created by MongoDB/Mongoose as the application writes
documents. Depending on the model and database state, collections may
include users, teams, team memberships, work items, comments,
activities, notifications, counters, and idempotency records.

To inspect data in MongoDB Atlas: 1. Open your Atlas project and
cluster. 2. Select **Data Explorer**. 3. Open the database named
`newtonite_ops` (or the database name in your `MONGODB_URI`). 4. Select
a collection and inspect its documents.

If the database or collections do not appear, verify that the server's
`MONGODB_URI` points to the Atlas cluster you are viewing and that the
application has successfully written data.

## Troubleshooting

### Vite cannot find an import

Check that import paths and filenames match exactly, including
capitalization and extensions (`.js` or `.jsx`). The frontend should be
opened using the URL printed by Vite, not the VS Code Live Server
extension.

### `react/jsx-runtime` cannot be resolved or JSX syntax errors appear

Run the app through Vite using `npm run dev` from the project root. Do
not open React source files directly in the browser. Ensure
`client/index.html` points to `/src/main.jsx` and that
`client/src/main.jsx` contains normal JSX source rather than manually
compiled `_jsx(...)` output.

### Vite warns about `#` in the project path

Move or rename the project folder so its full path does not contain a
`#` character, then reopen the renamed folder in VS Code and restart the
development server.

### MongoDB connection fails

-   Confirm MongoDB is running or Atlas is reachable.
-   Check `MONGODB_URI` in `.env`.
-   For Atlas, verify the database user and Network Access IP allowlist.
-   Restart the backend after changing `.env`.

### Port already in use

Stop the process using the port, or configure a different backend
`PORT`. If you change the frontend port, update `CLIENT_ORIGIN` to
match.

## Security Notes

-   Never commit `.env`, database passwords, JWT secrets, or real user
    credentials.
-   Replace all sample credentials before sharing or deploying the
    project.
-   Restrict MongoDB Atlas network access and database-user permissions.
-   Configure production CORS origins and secure deployment settings
    before public release.

## Current Status

This repository contains the JavaScript version of the project (`.js`
and `.jsx` files). Run the setup, build, and test commands in your own
environment to verify the current state. A successful MongoDB connection
alone does not confirm that every frontend workflow, API endpoint, or
test is working.

## Contributing

1.  Create a branch for your change.
2.  Make the change and test it locally.
3.  Commit your changes with a descriptive message.
4.  Open a pull request describing the change and validation performed.

## License

No license has been specified. Add a `LICENSE` file before allowing
others to reuse or distribute this project.
