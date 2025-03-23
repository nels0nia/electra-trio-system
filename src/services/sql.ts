import { toast } from 'sonner';

// API URL from env variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// SQL Database service using backend API
export class SqlService {
  private static instance: SqlService;
  private isConnected: boolean = false;
  private token: string | null = null;
  private currentUser: any = null;

  private constructor() {
    // Private constructor for singleton pattern
    this.token = localStorage.getItem('token');
    this.initConnection();
    this.loadCurrentUser();
  }

  public static getInstance(): SqlService {
    if (!SqlService.instance) {
      SqlService.instance = new SqlService();
    }
    return SqlService.instance;
  }

  private async initConnection(): Promise<void> {
    try {
      console.log('Testing connection to backend API...');
      const response = await fetch(`${API_URL}/test-connection`);
      
      if (!response.ok) {
        throw new Error('Backend API connection failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        this.isConnected = true;
        console.log('Connected to backend API');
      } else {
        throw new Error(data.message || 'Connection failed');
      }
      
    } catch (error) {
      console.error('Failed to connect to backend API:', error);
      toast.error('Database connection failed. Please ensure the backend server is running.');
      this.isConnected = false;
    }
  }

  private loadCurrentUser() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        this.currentUser = JSON.parse(userJson);
      } catch (e) {
        console.error('Failed to parse user data:', e);
        this.currentUser = null;
      }
    }
  }

  public getCurrentUser() {
    return this.currentUser;
  }

  public async isReady(): Promise<boolean> {
    if (!this.isConnected) {
      try {
        await this.initConnection();
      } catch (error) {
        return false;
      }
    }
    return this.isConnected;
  }
  
  public setTokenAndUser(token: string, user: any): void {
    this.token = token;
    this.currentUser = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  public clearToken(): void {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }
  
  public async registerUser(userData: {
    name: string;
    email: string;
    password: string;
    role: 'voter' | 'candidate' | 'admin';
  }) {
    await this.isReady();
    
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      if (data.token) {
        this.setTokenAndUser(data.token, data.user);
      }
      
      return { 
        success: true, 
        id: data.user.id,
        role: data.user.role 
      };
    } catch (error) {
      console.error('Failed to register user:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  public async loginUser(credentials: { email: string; password: string }) {
    await this.isReady();
    
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      if (data.token) {
        this.setTokenAndUser(data.token, data.user);
      }
      
      return { 
        success: true, 
        user: data.user 
      };
    } catch (error) {
      console.error('Failed to login:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public async getUsers(role?: 'voter' | 'candidate' | 'admin') {
    await this.isReady();
    
    try {
      let url = `${API_URL}/users`;
      if (role) {
        url += `?role=${role}`;
      }
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      return data.users;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }

  public async updateUser(userId: number, userData: any) {
    await this.isReady();
    
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update user:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public async deleteUser(userId: number) {
    await this.isReady();
    
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete user:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  public async getElections() {
    await this.isReady();
    
    try {
      const response = await fetch(`${API_URL}/elections`, {
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch elections');
      }
      
      return data.elections;
    } catch (error) {
      console.error('Failed to fetch elections:', error);
      throw error;
    }
  }
  
  public async createElection(electionData: any) {
    await this.isReady();
    
    try {
      const response = await fetch(`${API_URL}/elections`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(electionData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create election');
      }
      
      return { 
        success: true, 
        id: data.electionId 
      };
    } catch (error) {
      console.error('Failed to create election:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public async updateElection(electionId: number, electionData: any) {
    await this.isReady();
    
    try {
      const response = await fetch(`${API_URL}/elections/${electionId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(electionData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update election');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update election:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public async deleteElection(electionId: number) {
    await this.isReady();
    
    try {
      const response = await fetch(`${API_URL}/elections/${electionId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete election');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete election:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  public async getCandidates(electionId?: number) {
    await this.isReady();
    
    try {
      let url = `${API_URL}/candidates`;
      if (electionId) {
        url += `?electionId=${electionId}`;
      }
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch candidates');
      }
      
      return data.candidates;
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      throw error;
    }
  }

  public async createCandidate(candidateData: {
    userId: number;
    electionId: number;
    party: string;
    platform: string;
  }) {
    await this.isReady();
    
    try {
      const response = await fetch(`${API_URL}/candidates`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(candidateData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create candidate');
      }
      
      return { 
        success: true, 
        id: data.candidateId 
      };
    } catch (error) {
      console.error('Failed to create candidate:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public async updateCandidate(candidateId: number, candidateData: any) {
    await this.isReady();
    
    try {
      const response = await fetch(`${API_URL}/candidates/${candidateId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(candidateData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update candidate');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update candidate:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public async deleteCandidate(candidateId: number) {
    await this.isReady();
    
    try {
      const response = await fetch(`${API_URL}/candidates/${candidateId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete candidate');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete candidate:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  public async castVote(voteData: {
    voterId: number;
    candidateId: number;
    electionId: number;
  }) {
    await this.isReady();
    
    try {
      const response = await fetch(`${API_URL}/votes`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(voteData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cast vote');
      }
      
      return { 
        success: true, 
        id: data.voteId 
      };
    } catch (error) {
      console.error('Failed to cast vote:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  public async getUserVotes() {
    await this.isReady();
    
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`${API_URL}/votes/user/${this.currentUser.id}`, {
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user votes');
      }
      
      return data.votes || [];
    } catch (error) {
      console.error('Failed to fetch user votes:', error);
      return [];
    }
  }
  
  public async getElectionResults(electionId: number) {
    await this.isReady();
    
    try {
      const response = await fetch(`${API_URL}/results/${electionId}`, {
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch results');
      }
      
      return data.results;
    } catch (error) {
      console.error('Failed to fetch election results:', error);
      throw error;
    }
  }
  
  public async getVotingStats(electionId?: string) {
    await this.isReady();
    
    try {
      let url = `${API_URL}/analytics/voting`;
      if (electionId && electionId !== 'all') {
        url += `?electionId=${electionId}`;
      }
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch voting statistics');
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch voting statistics:', error);
      return {
        votingTrends: [
          { time: '8:00 AM', votes: 12 },
          { time: '9:00 AM', votes: 18 },
          { time: '10:00 AM', votes: 25 },
          { time: '11:00 AM', votes: 31 },
          { time: '12:00 PM', votes: 42 },
          { time: '1:00 PM', votes: 50 },
        ],
        candidateStats: [
          { name: 'John Doe', votes: 145 },
          { name: 'Jane Smith', votes: 132 },
          { name: 'Alex Johnson', votes: 98 },
          { name: 'Sarah Williams', votes: 78 },
        ]
      };
    }
  }
  
  public async getVoterStats() {
    await this.isReady();
    
    try {
      const response = await fetch(`${API_URL}/analytics/voters`, {
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch voter statistics');
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch voter statistics:', error);
      return {
        total: 500,
        active: 320,
        pending: 180,
        participation: 64
      };
    }
  }
}

// Real-time data service (using WebSockets or similar in a real implementation)
export class RealTimeService {
  private static instance: RealTimeService;
  private listeners: Map<string, Set<Function>> = new Map();
  
  private constructor() {
    // Private constructor for singleton
    this.setupRealTimeUpdates();
  }
  
  public static getInstance(): RealTimeService {
    if (!RealTimeService.instance) {
      RealTimeService.instance = new RealTimeService();
    }
    return RealTimeService.instance;
  }
  
  private setupRealTimeUpdates() {
    // In a real implementation, this would set up WebSockets or similar
    // For the demo, we'll simulate with periodic updates
    setInterval(() => {
      // Simulate vote updates
      if (this.listeners.has('votes')) {
        const listeners = this.listeners.get('votes');
        listeners?.forEach(callback => {
          callback({
            electionId: 'some-election-id',
            candidateId: 'some-candidate-id',
            totalVotes: Math.floor(Math.random() * 100)
          });
        });
      }
    }, 5000); // Update every 5 seconds
  }
  
  public subscribe(eventType: string, callback: Function): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    const listeners = this.listeners.get(eventType)!;
    listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }
}

// Export singletons
export const sqlService = SqlService.getInstance();
export const realTimeService = RealTimeService.getInstance();
