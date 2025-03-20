
import { toast } from 'sonner';

// API URL from env variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// SQL Database service using backend API
export class SqlService {
  private static instance: SqlService;
  private isConnected: boolean = false;
  private token: string | null = null;

  private constructor() {
    // Private constructor for singleton pattern
    this.token = localStorage.getItem('token');
    this.initConnection();
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
  
  // Set auth token
  public setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }
  
  // Clear auth token
  public clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }
  
  // Get auth headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }
  
  // User related methods
  public async registerUser(userData: {
    name: string;
    email: string;
    password: string;
    role: 'voter' | 'candidate' | 'admin';
    registeredAt: Date;
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
        this.setToken(data.token);
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
  
  // Login user
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
        this.setToken(data.token);
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
  
  // Election related methods
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
  
  // Candidate related methods
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
  
  // Vote related methods
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
  
  // Get election results
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
