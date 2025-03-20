
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
app.get('/api/test-connection', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ success: true, message: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
  }
});

// User Registration
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Input validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    if (!['voter', 'candidate', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }
    
    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: 'User with this email already exists' });
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, registered_at) VALUES (?, ?, ?, ?, NOW())',
      [name, email, passwordHash, role]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        name,
        email,
        role
      },
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

// User Login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    // Get user from database
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// Get Elections
app.get('/api/elections', async (req, res) => {
  try {
    const [elections] = await pool.query(`
      SELECT e.*, u.name as creator_name, 
      (SELECT COUNT(*) FROM candidates WHERE election_id = e.id) as candidate_count,
      (SELECT COUNT(*) FROM votes WHERE election_id = e.id) as vote_count
      FROM elections e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.start_date DESC
    `);
    
    res.json({ success: true, elections });
  } catch (error) {
    console.error('Error fetching elections:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch elections', error: error.message });
  }
});

// Create Election
app.post('/api/elections', async (req, res) => {
  try {
    const { title, description, startDate, endDate, status, createdBy } = req.body;
    
    // Input validation
    if (!title || !startDate || !endDate || !status) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO elections (title, description, start_date, end_date, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [title, description, startDate, endDate, status, createdBy]
    );
    
    res.status(201).json({
      success: true,
      message: 'Election created successfully',
      electionId: result.insertId
    });
    
  } catch (error) {
    console.error('Error creating election:', error);
    res.status(500).json({ success: false, message: 'Failed to create election', error: error.message });
  }
});

// Get Candidates
app.get('/api/candidates', async (req, res) => {
  try {
    const { electionId } = req.query;
    
    let query = `
      SELECT c.*, u.name, u.email, u.profile_image, u.bio
      FROM candidates c
      JOIN users u ON c.user_id = u.id
    `;
    
    if (electionId) {
      query += ' WHERE c.election_id = ?';
      const [candidates] = await pool.query(query, [electionId]);
      res.json({ success: true, candidates });
    } else {
      const [candidates] = await pool.query(query);
      res.json({ success: true, candidates });
    }
    
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch candidates', error: error.message });
  }
});

// Cast Vote
app.post('/api/votes', async (req, res) => {
  try {
    const { voterId, candidateId, electionId } = req.body;
    
    // Input validation
    if (!voterId || !candidateId || !electionId) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    
    // Check if voter has already voted in this election
    const [existingVotes] = await pool.query(
      'SELECT * FROM votes WHERE voter_id = ? AND election_id = ?',
      [voterId, electionId]
    );
    
    if (existingVotes.length > 0) {
      return res.status(409).json({ success: false, message: 'You have already voted in this election' });
    }
    
    // Record the vote
    const [result] = await pool.query(
      'INSERT INTO votes (voter_id, candidate_id, election_id, timestamp) VALUES (?, ?, ?, NOW())',
      [voterId, candidateId, electionId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Vote recorded successfully',
      voteId: result.insertId
    });
    
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({ success: false, message: 'Failed to cast vote', error: error.message });
  }
});

// Get Election Results
app.get('/api/results/:electionId', async (req, res) => {
  try {
    const { electionId } = req.params;
    
    const [results] = await pool.query(`
      SELECT c.id as candidate_id, u.name as candidate_name, c.party, COUNT(v.id) as vote_count
      FROM candidates c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN votes v ON v.candidate_id = c.id
      WHERE c.election_id = ?
      GROUP BY c.id
      ORDER BY vote_count DESC
    `, [electionId]);
    
    res.json({ success: true, results });
    
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch results', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
