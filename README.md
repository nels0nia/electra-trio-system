
# VoteX - Secure Electronic Voting System

VoteX is a comprehensive electronic voting platform designed to facilitate secure, transparent, and efficient elections.

## Technologies Used

This project is built with:

- Vite - Fast frontend build tool
- TypeScript - Static typing for JavaScript
- React - UI library
- shadcn-ui - UI component library
- Tailwind CSS - Utility-first CSS framework
- MongoDB - NoSQL database for data storage

## Prerequisites

Before running this project, make sure you have:

- Node.js (v18 or later)
- npm or yarn package manager
- MongoDB connection (local or Atlas)

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

### 3. Environment Setup

Create a `.env` file in the project root with the following variables:

```
# MongoDB Connection String
VITE_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/votex?retryWrites=true&w=majority

# Application Settings
VITE_APP_NAME=VoteX
VITE_API_URL=http://localhost:4000/api
```

**Important:** Replace the MongoDB connection string with your own MongoDB connection string.

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:8080

## Database Setup

To initialize your MongoDB database with sample data, you can use the provided `mongodb-seed.js` file:

1. Ensure MongoDB is running and accessible
2. Run the seed file using MongoDB's tools:

```bash
mongosh <your-connection-string> mongodb-seed.js
```

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
