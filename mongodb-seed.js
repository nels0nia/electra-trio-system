
// MongoDB Seed File for VoteX
// Run this file with: mongosh <connection-string> mongodb-seed.js

// Database setup
db = db.getSiblingDB('votex');

// Clear existing collections to prevent duplicates
db.users.drop();
db.elections.drop();
db.votes.drop();
db.candidates.drop();

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'role', 'registeredAt'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        email: {
          bsonType: 'string',
          pattern: '^.+@.+$',
          description: 'must be a valid email address and is required'
        },
        password: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        role: {
          enum: ['admin', 'voter', 'candidate'],
          description: 'must be one of the defined roles and is required'
        },
        registeredAt: {
          bsonType: 'date',
          description: 'must be a date and is required'
        }
      }
    }
  }
});

db.createCollection('elections', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'description', 'startDate', 'endDate', 'status'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        description: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        startDate: {
          bsonType: 'date',
          description: 'must be a date and is required'
        },
        endDate: {
          bsonType: 'date',
          description: 'must be a date and is required'
        },
        status: {
          enum: ['upcoming', 'active', 'completed'],
          description: 'must be one of the defined statuses and is required'
        },
        candidates: {
          bsonType: 'array',
          description: 'must be an array of candidate IDs'
        }
      }
    }
  }
});

db.createCollection('candidates', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'manifesto', 'electionId'],
      properties: {
        userId: {
          bsonType: 'objectId',
          description: 'must be an ObjectId and is required'
        },
        manifesto: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        electionId: {
          bsonType: 'objectId',
          description: 'must be an ObjectId and is required'
        },
        votes: {
          bsonType: 'int',
          description: 'must be an integer'
        }
      }
    }
  }
});

db.createCollection('votes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['voterId', 'candidateId', 'electionId', 'timestamp'],
      properties: {
        voterId: {
          bsonType: 'objectId',
          description: 'must be an ObjectId and is required'
        },
        candidateId: {
          bsonType: 'objectId',
          description: 'must be an ObjectId and is required'
        },
        electionId: {
          bsonType: 'objectId',
          description: 'must be an ObjectId and is required'
        },
        timestamp: {
          bsonType: 'date',
          description: 'must be a date and is required'
        }
      }
    }
  }
});

// Insert sample admin user
const adminId = ObjectId();
db.users.insertOne({
  _id: adminId,
  name: 'Admin User',
  email: 'admin@votex.com',
  password: '$2a$10$mFJUNxhzNpXDBn0qbmKnNO9ceM2FsRcvzaGdvO1qWDy6z7R.YGcvW', // admin123 (hashed)
  role: 'admin',
  registeredAt: new Date()
});

// Insert sample voters
const voterId1 = ObjectId();
const voterId2 = ObjectId();
const voterId3 = ObjectId();

db.users.insertMany([
  {
    _id: voterId1,
    name: 'John Doe',
    email: 'voter@example.com',
    password: '$2a$10$sWkxTX0vh7olPRv1cY7N/ewl9qrU6.9vz9PeJnWvpIbHfePmq3iEa', // voter123 (hashed)
    role: 'voter',
    registeredAt: new Date()
  },
  {
    _id: voterId2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: '$2a$10$sWkxTX0vh7olPRv1cY7N/ewl9qrU6.9vz9PeJnWvpIbHfePmq3iEa', // voter123 (hashed)
    role: 'voter',
    registeredAt: new Date()
  },
  {
    _id: voterId3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    password: '$2a$10$sWkxTX0vh7olPRv1cY7N/ewl9qrU6.9vz9PeJnWvpIbHfePmq3iEa', // voter123 (hashed)
    role: 'voter',
    registeredAt: new Date()
  }
]);

// Insert sample candidates
const candidateUserId1 = ObjectId();
const candidateUserId2 = ObjectId();

db.users.insertMany([
  {
    _id: candidateUserId1,
    name: 'Alice Brown',
    email: 'candidate@example.com',
    password: '$2a$10$Nt3z71XCj2dw.pOZ9YFlX.CVodFKWJi9MUz.RBkZgX2mKms2Fv8la', // candidate123 (hashed)
    role: 'candidate',
    registeredAt: new Date()
  },
  {
    _id: candidateUserId2,
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    password: '$2a$10$Nt3z71XCj2dw.pOZ9YFlX.CVodFKWJi9MUz.RBkZgX2mKms2Fv8la', // candidate123 (hashed)
    role: 'candidate',
    registeredAt: new Date()
  }
]);

// Insert sample election
const electionId = ObjectId();
db.elections.insertOne({
  _id: electionId,
  title: 'Student Council Election 2023',
  description: 'Annual election for student council representatives',
  startDate: new Date('2023-11-01T00:00:00Z'),
  endDate: new Date('2023-11-14T23:59:59Z'),
  status: 'active',
  candidates: []
});

// Insert candidate profiles
const candidateId1 = ObjectId();
const candidateId2 = ObjectId();

db.candidates.insertMany([
  {
    _id: candidateId1,
    userId: candidateUserId1,
    manifesto: 'Improving campus facilities and promoting student welfare',
    electionId: electionId,
    votes: 15
  },
  {
    _id: candidateId2,
    userId: candidateUserId2,
    manifesto: 'Enhancing academic resources and extracurricular activities',
    electionId: electionId,
    votes: 12
  }
]);

// Update election with candidate IDs
db.elections.updateOne(
  { _id: electionId },
  { $set: { candidates: [candidateId1, candidateId2] } }
);

// Insert sample votes
db.votes.insertMany([
  {
    voterId: voterId1,
    candidateId: candidateId1,
    electionId: electionId,
    timestamp: new Date('2023-11-02T10:15:30Z')
  },
  {
    voterId: voterId2,
    candidateId: candidateId2,
    electionId: electionId,
    timestamp: new Date('2023-11-03T14:25:10Z')
  }
]);

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.elections.createIndex({ status: 1 });
db.votes.createIndex({ electionId: 1, voterId: 1 }, { unique: true });

print('Database seeded successfully with sample data for VoteX application!');
