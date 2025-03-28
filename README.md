
# VoteX - Secure Electronic Voting System

VoteX is a comprehensive electronic voting platform designed to facilitate secure, transparent, and efficient elections.

## Technologies Used

This project is built with:

- Vite - Fast frontend build tool
- TypeScript - Static typing for JavaScript
- React - UI library
- shadcn-ui - UI component library
- Tailwind CSS - Utility-first CSS framework
- Node.js & Express - Backend API
- MySQL - Relational database for data storage
- XAMPP - Local development environment

## Prerequisites

Before running this project, make sure you have:

- Node.js (v18 or later)
- npm or yarn package manager
- XAMPP (or similar local server with MySQL)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd votex
```

### 2. Install dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Database Setup

1. Start XAMPP and ensure MySQL service is running
2. Create a new database named `votex`
3. Import the SQL schema and sample data using the provided `database.sql` file:
   - Open phpMyAdmin (usually at http://localhost/phpmyadmin)
   - Select the `votex` database
   - Go to the "Import" tab
   - Choose the `database.sql` file and click "Go"

### 4. Environment Setup

Create a `.env` file in the project root for the frontend:

```
# Database Connection
VITE_DB_HOST=localhost
VITE_DB_PORT=3306
VITE_DB_USER=root
VITE_DB_PASSWORD=
VITE_DB_NAME=votex

# Application Settings
VITE_APP_NAME=VoteX
VITE_API_URL=http://localhost:4000/api
```

Create a `.env` file in the backend directory for the backend:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=votex

# Server Configuration
PORT=4000
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

**Important:** Update the database connection details to match your XAMPP configuration.

### 5. Start the backend server

```bash
cd backend
npm run dev
```

The backend API will be available at http://localhost:4000

### 6. Run the frontend development server

```bash
# In a new terminal window
npm run dev
```

The frontend application will be available at http://localhost:5173 (or another port if 5173 is in use)

## Features

- User authentication (Admin, Voter, Candidate)
- Election creation and management
- Secure voting system
- Real-time election results
- Candidate profiles

## Project Structure

- `/src` - Frontend source code
  - `/components` - Reusable UI components
  - `/pages` - Application pages/routes
  - `/services` - Services for data handling
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions
- `/backend` - Backend API
  - `server.js` - Express server and API endpoints
  - `.env` - Backend environment configuration

## Deployment

To build the project for production:

```bash
# Build frontend
npm run build

# Prepare backend for production
cd backend
npm install --production
```

## License

[MIT](LICENSE)
