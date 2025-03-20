
-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS votex;
USE votex;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'voter', 'candidate') NOT NULL,
  registered_at DATETIME NOT NULL,
  profile_image VARCHAR(255),
  bio TEXT,
  UNIQUE INDEX idx_email (email)
);

-- Elections table
CREATE TABLE IF NOT EXISTS elections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  status ENUM('draft', 'upcoming', 'active', 'ended') NOT NULL DEFAULT 'draft',
  created_by INT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  election_id INT NOT NULL,
  party VARCHAR(100),
  platform TEXT,
  approved BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
  UNIQUE KEY unique_candidate_election (user_id, election_id)
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  voter_id INT NOT NULL,
  candidate_id INT NOT NULL,
  election_id INT NOT NULL,
  timestamp DATETIME NOT NULL,
  FOREIGN KEY (voter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
  UNIQUE KEY unique_vote (voter_id, election_id)
);

-- Voter eligibility for specific elections
CREATE TABLE IF NOT EXISTS voter_eligibility (
  id INT AUTO_INCREMENT PRIMARY KEY,
  election_id INT NOT NULL,
  voter_id INT NOT NULL,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
  FOREIGN KEY (voter_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_voter_election (voter_id, election_id)
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role, registered_at)
VALUES ('Admin User', 'admin@votex.com', '$2a$10$XFE0LQAIJmMIjPJidVIFw.j7JFM0paG5HgF4U1HdnE3PiOqAGq7.6', 'admin', NOW());

-- Insert sample voters
INSERT INTO users (name, email, password_hash, role, registered_at)
VALUES 
('Alice Johnson', 'alice@example.com', '$2a$10$XHLiFuLZDXQX9MCzpZjDIe3ICW10yvgXnJHLFQy8fxuSeTcb2C1xW', 'voter', NOW()),
('Bob Smith', 'bob@example.com', '$2a$10$XHLiFuLZDXQX9MCzpZjDIe3ICW10yvgXnJHLFQy8fxuSeTcb2C1xW', 'voter', NOW()),
('Charlie Davis', 'charlie@example.com', '$2a$10$XHLiFuLZDXQX9MCzpZjDIe3ICW10yvgXnJHLFQy8fxuSeTcb2C1xW', 'voter', NOW()),
('Diana Evans', 'diana@example.com', '$2a$10$XHLiFuLZDXQX9MCzpZjDIe3ICW10yvgXnJHLFQy8fxuSeTcb2C1xW', 'voter', NOW()),
('Evan Harris', 'evan@example.com', '$2a$10$XHLiFuLZDXQX9MCzpZjDIe3ICW10yvgXnJHLFQy8fxuSeTcb2C1xW', 'voter', NOW());

-- Insert sample candidates
INSERT INTO users (name, email, password_hash, role, registered_at, bio)
VALUES 
('Alex Morgan', 'alex@example.com', '$2a$10$XHLiFuLZDXQX9MCzpZjDIe3ICW10yvgXnJHLFQy8fxuSeTcb2C1xW', 'candidate', NOW(), 'Experienced leader with a focus on innovation'),
('Blake Jordan', 'blake@example.com', '$2a$10$XHLiFuLZDXQX9MCzpZjDIe3ICW10yvgXnJHLFQy8fxuSeTcb2C1xW', 'candidate', NOW(), 'Advocate for equal opportunity and sustainable practices'),
('Casey Reynolds', 'casey@example.com', '$2a$10$XHLiFuLZDXQX9MCzpZjDIe3ICW10yvgXnJHLFQy8fxuSeTcb2C1xW', 'candidate', NOW(), 'Independent thinker focused on community growth');

-- Insert sample elections
INSERT INTO elections (title, description, start_date, end_date, status, created_by, created_at, updated_at)
VALUES 
('Student Council President', 'Election for the position of Student Council President for the 2025 academic year.', 
 '2025-04-10 00:00:00', '2025-04-15 23:59:59', 'upcoming', 1, NOW(), NOW()),
('Class Representative', 'Select your class representative for the Fall semester.', 
 '2025-03-25 00:00:00', '2025-03-28 23:59:59', 'active', 1, NOW(), NOW()),
('Faculty Board Member', 'Vote for faculty board members to represent student interests.', 
 '2025-02-15 00:00:00', '2025-02-20 23:59:59', 'ended', 1, NOW(), NOW());

-- Set up candidates for elections
INSERT INTO candidates (user_id, election_id, party, platform, approved)
VALUES 
(6, 1, 'Progress Party', 'Building a stronger student community through inclusive activities', TRUE),
(7, 1, 'Unity Alliance', 'Focusing on academic excellence and student wellbeing', TRUE),
(8, 1, 'Independent', 'Bringing fresh ideas and transparent leadership', TRUE),
(6, 2, 'Progress Party', 'Ensuring all student voices are heard in class decisions', TRUE),
(7, 2, 'Unity Alliance', 'Creating a productive and supportive classroom environment', TRUE),
(8, 2, 'Independent', 'Building bridges between students and faculty', TRUE),
(6, 3, 'Progress Party', 'Advocating for modernized curriculum and resources', TRUE),
(7, 3, 'Unity Alliance', 'Ensuring faculty decisions reflect diverse student needs', TRUE);

-- Set up sample votes
INSERT INTO votes (voter_id, candidate_id, election_id, timestamp)
VALUES 
(2, 7, 3, '2025-02-16 10:23:45'),
(3, 7, 3, '2025-02-17 09:15:22'),
(4, 8, 3, '2025-02-18 14:05:37'),
(5, 7, 3, '2025-02-19 11:30:18');

-- Set all voters as eligible for all elections
INSERT INTO voter_eligibility (election_id, voter_id)
VALUES 
(1, 2), (1, 3), (1, 4), (1, 5),
(2, 2), (2, 3), (2, 4), (2, 5),
(3, 2), (3, 3), (3, 4), (3, 5);

-- Note: All passwords in this sample data are hashed from 'password123'
-- In a real application, each user would have a unique and securely hashed password
