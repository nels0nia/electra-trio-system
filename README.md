
# VoteX - Secure Electronic Voting System

VoteX is a comprehensive electronic voting platform designed to facilitate secure, transparent, and efficient elections.

## Technologies Used

This project is built with:

- Vite - Fast frontend build tool
- TypeScript - Static typing for JavaScript
- React - UI library
- shadcn-ui - UI component library
- Tailwind CSS - Utility-first CSS framework
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
npm install
# or
yarn install
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

Create a `.env` file in the project root with the following variables:

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

**Important:** Update the database connection details to match your XAMPP configuration.

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:8080

## Features

- User authentication (Admin, Voter, Candidate)
- Election creation and management
- Secure voting system
- Real-time election results
- Candidate profiles

## Project Structure

- `/src` - Source code
  - `/components` - Reusable UI components
  - `/pages` - Application pages/routes
  - `/services` - Services for data handling
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions

## Deployment

To build the project for production:

```bash
npm run build
# or
yarn build
```

## License

[MIT](LICENSE)
