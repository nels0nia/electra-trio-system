
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

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

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Admin authorization middleware
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Requires admin privileges' });
  }
  next();
};

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
    
    // Emit event for real-time updates
    io.emit('user-added', {
      id: result.insertId,
      name,
      email,
      role
    });
    
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

// Get Users (Admin only)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const { role } = req.query;
    
    let query = 'SELECT id, name, email, role, registered_at, profile_image, bio FROM users';
    const queryParams = [];
    
    if (role && ['voter', 'candidate', 'admin'].includes(role)) {
      query += ' WHERE role = ?';
      queryParams.push(role);
    }
    
    const [users] = await pool.query(query, queryParams);
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});

// Get User by ID (Admin only)
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [users] = await pool.query(
      'SELECT id, name, email, role, registered_at, profile_image, bio FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
  }
});

// Update User (Admin only)
app.put('/api/users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, bio, profile_image } = req.body;
    
    // Validate input
    if (!name || !email || !role) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    
    const [result] = await pool.query(
      'UPDATE users SET name = ?, email = ?, role = ?, bio = ?, profile_image = ? WHERE id = ?',
      [name, email, role, bio, profile_image, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Emit event for real-time updates
    io.emit('user-updated', {
      id: parseInt(id),
      name,
      email,
      role,
      bio,
      profile_image
    });
    
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
});

// Delete User (Admin only)
app.delete('/api/users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Emit event for real-time updates
    io.emit('user-deleted', { id: parseInt(id) });
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
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
app.post('/api/elections', authenticateToken, authorizeAdmin, async (req, res) => {
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
    
    // Emit event for real-time updates
    io.emit('election-added', {
      id: result.insertId,
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      status
    });
    
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

// Update Election (Admin only)
app.put('/api/elections/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, status } = req.body;
    
    // Validate input
    if (!title || !startDate || !endDate || !status) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    
    const [result] = await pool.query(
      'UPDATE elections SET title = ?, description = ?, start_date = ?, end_date = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [title, description, startDate, endDate, status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }
    
    // Emit event for real-time updates
    io.emit('election-updated', {
      id: parseInt(id),
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      status
    });
    
    res.json({ success: true, message: 'Election updated successfully' });
  } catch (error) {
    console.error('Error updating election:', error);
    res.status(500).json({ success: false, message: 'Failed to update election', error: error.message });
  }
});

// Delete Election (Admin only)
app.delete('/api/elections/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM elections WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }
    
    // Emit event for real-time updates
    io.emit('election-deleted', { id: parseInt(id) });
    
    res.json({ success: true, message: 'Election deleted successfully' });
  } catch (error) {
    console.error('Error deleting election:', error);
    res.status(500).json({ success: false, message: 'Failed to delete election', error: error.message });
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

// Create Candidate (Admin only)
app.post('/api/candidates', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { userId, electionId, party, platform } = req.body;
    
    // Input validation
    if (!userId || !electionId) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    
    // Check if user exists and is a candidate
    const [users] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update user role to candidate if not already
    if (users[0].role !== 'candidate') {
      await pool.query('UPDATE users SET role = "candidate" WHERE id = ?', [userId]);
    }
    
    // Insert candidate
    const [result] = await pool.query(
      'INSERT INTO candidates (user_id, election_id, party, platform, approved) VALUES (?, ?, ?, ?, TRUE)',
      [userId, electionId, party, platform]
    );
    
    // Emit event for real-time updates
    io.emit('candidate-added', {
      id: result.insertId,
      userId,
      electionId,
      party,
      platform
    });
    
    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      candidateId: result.insertId
    });
    
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ success: false, message: 'Failed to create candidate', error: error.message });
  }
});

// Update Candidate (Admin only)
app.put('/api/candidates/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { party, platform, approved } = req.body;
    
    const [result] = await pool.query(
      'UPDATE candidates SET party = ?, platform = ?, approved = ? WHERE id = ?',
      [party, platform, approved, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    
    // Emit event for real-time updates
    io.emit('candidate-updated', {
      id: parseInt(id),
      party,
      platform,
      approved
    });
    
    res.json({ success: true, message: 'Candidate updated successfully' });
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ success: false, message: 'Failed to update candidate', error: error.message });
  }
});

// Delete Candidate (Admin only)
app.delete('/api/candidates/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM candidates WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    
    // Emit event for real-time updates
    io.emit('candidate-deleted', { id: parseInt(id) });
    
    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ success: false, message: 'Failed to delete candidate', error: error.message });
  }
});

// Cast Vote without encryption
app.post('/api/votes', authenticateToken, async (req, res) => {
  try {
    const { voterId, candidateId, electionId } = req.body;
    
    // Input validation
    if (!voterId || !candidateId || !electionId) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    
    // Ensure user is a voter
    if (req.user.role !== 'voter' && req.user.id !== voterId) {
      return res.status(403).json({ success: false, message: 'Only voters can cast votes' });
    }
    
    // Check if voter has already voted in this election
    const [existingVotes] = await pool.query(
      'SELECT * FROM votes WHERE voter_id = ? AND election_id = ?',
      [voterId, electionId]
    );
    
    if (existingVotes.length > 0) {
      return res.status(409).json({ success: false, message: 'You have already voted in this election' });
    }
    
    // Record the vote without encryption
    const [result] = await pool.query(
      'INSERT INTO votes (voter_id, candidate_id, election_id, timestamp) VALUES (?, ?, ?, NOW())',
      [voterId, candidateId, electionId]
    );
    
    // Emit event for real-time updates
    io.emit('vote-added', {
      id: result.insertId,
      voterId,
      candidateId,
      electionId
    });
    
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

// Get Election Results without decryption
app.get('/api/results/:electionId', async (req, res) => {
  try {
    const { electionId } = req.params;
    
    // Get all votes for this election
    const [votes] = await pool.query(
      'SELECT v.id, v.voter_id, v.candidate_id, v.election_id FROM votes v WHERE v.election_id = ?',
      [electionId]
    );
    
    // Count votes by candidate
    const voteCounts = {};
    votes.forEach(vote => {
      const id = vote.candidate_id;
      voteCounts[id] = (voteCounts[id] || 0) + 1;
    });
    
    // Get candidate information
    const [candidates] = await pool.query(`
      SELECT c.id, u.name, c.party, u.bio 
      FROM candidates c
      JOIN users u ON c.user_id = u.id
      WHERE c.election_id = ?
    `, [electionId]);
    
    // Format the results
    const results = candidates.map(candidate => ({
      candidate_id: candidate.id,
      candidate_name: candidate.name,
      party: candidate.party,
      bio: candidate.bio,
      vote_count: voteCounts[candidate.id] || 0
    }));
    
    // Sort by vote count
    results.sort((a, b) => b.vote_count - a.vote_count);
    
    res.json({ success: true, results });
    
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch results', error: error.message });
  }
});

// Socket.io connections
io.on('connection', (socket) => {
  console.log('A client connected');
  
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

// Start server with Socket.io
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

