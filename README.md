# IT Asset Management System

A web-based application for managing IT assets and employee asset requests. The repository contains a JavaScript frontend and a Node.js/Express backend connected to MySQL.

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** MySQL using `mysql2`
- **Authentication-related packages:** bcryptjs and jsonwebtoken
- **Other backend packages:** dotenv, cors, express-validator

## Project Structure

```text
.
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Authentication, assets, tickets, dashboard
│   ├── middleware/     # Authentication middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── package.json
│   └── server.js
└── frontend/
    ├── index.html
    ├── admin-dashboard.html
    ├── employee-dashboard.html
    ├── request-asset.html
    ├── script.js
    └── style.css
```

## Main Functionality

Based on the current source code, the application includes:

- Employee and admin sign-in flows
- Asset listing, availability lookup, creation, and updates
- Employee asset-request tickets
- Admin ticket-status updates
- Asset handover and return records
- Dashboard statistics for ticket statuses

## Prerequisites

- Node.js and npm
- MySQL Server
- Git

## Local Setup

1. Clone this repository:

   ```bash
   git clone https://github.com/Vinit02102004/it-asset-management.git
   cd it-asset-management
   ```

2. Create and configure a MySQL database using the schema required by the application.

3. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

4. Create a local `.env` file in the `backend` directory. Configure the values required by `backend/config/db.js`:

   ```env
   PORT=8000
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_database_name
   ```

   Replace the example values with your own local settings. Do not commit real credentials.

5. Start the backend:

   ```bash
   npm run dev
   ```

6. Serve the frontend from a local static web server and open `frontend/index.html` in your browser. Ensure the frontend API configuration points to the backend address you are using.

> **Setup note:** The repository currently does not include a database schema or a complete deployment guide. Add the matching SQL schema and verify the frontend API base URL before expecting a fresh installation to run.

## API Route Groups

The Express server mounts these route groups:

| Route | Purpose |
|---|---|
| `/api/auth` | Authentication |
| `/api/assets` | Asset operations |
| `/api/tickets` | Asset-request and ticket operations |
| `/api/dashboard` | Dashboard statistics |

Protected routes require authentication.

## Security Notes

- Keep `.env`, database passwords, signing keys, and access tokens out of Git.
- Use unique, strong credentials; do not publish demo or default passwords.
- Review authentication, authorization, and input validation before deploying this project.
- Use test data rather than real employee or company information in public demos.

## Future Improvements

- Add a documented SQL schema and seed data.
- Add automated tests for API routes and workflows.
- Document role permissions and environment configuration.
- Add screenshots or a short demo using safe sample data.

## Author

**Vinit Gandhi**  
[GitHub](https://github.com/Vinit02102004) · [LinkedIn](https://www.linkedin.com/in/vinit-gandhi-482b8a282/)
