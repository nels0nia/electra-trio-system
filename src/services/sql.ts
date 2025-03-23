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

  public isAdmin(): boolean {
    return this.currentUser && this.currentUser.role === 'admin';
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
    
    if (!this.isAdmin()) {
      toast.error('Only administrators can access user management');
      return [];
    }
    
    try {
      let url = `${API_URL}/users`;
      if (role) {
        url += `?role=${role}`;
      }
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
      return [];
    }
  }

  public async updateUser(userId: number, userData: any) {
    await this.isReady();
    
    if (!this.isAdmin()) {
      toast.error('Only administrators can update users');
      return { success: false, error: 'Permission denied' };
    }
    
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
      
      toast.success('User updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public async deleteUser(userId: number) {
    await this.isReady();
    
    if (!this.isAdmin()) {
      toast.error('Only administrators can delete users');
      return { success: false, error: 'Permission denied' };
    }
    
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }
      
      toast.success('User deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
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
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch elections');
      }
      
      const data = await response.json();
      return data.elections || [];
    } catch (error) {
      console.error('Failed to fetch elections:', error);
      toast.error('Failed to fetch elections');
      return [];
    }
  }
  
  public async createElection(electionData: any) {
    await this.isReady();
    
    if (!this.isAdmin()) {
      toast.error('Only administrators can create elections');
      return { success: false, error: 'Permission denied' };
    }
    
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
      
      toast.success('Election created successfully');
      return { 
        success: true, 
        id: data.electionId 
      };
    } catch (error) {
      console.error('Failed to create election:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create election');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public async updateElection(electionId: number, electionData: any) {
    await this.isReady();
    
    if (!this.isAdmin()) {
      toast.error('Only administrators can update elections');
      return { success: false, error: 'Permission denied' };
    }
    
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
      
      toast.success('Election updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to update election:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update election');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public async deleteElection(electionId: number) {
    await this.isReady();
    
    if (!this.isAdmin()) {
      toast.error('Only administrators can delete elections');
      return { success: false, error: 'Permission denied' };
    }
    
    try {
      const response = await fetch(`${API_URL}/elections/${electionId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete election');
      }
      
      toast.success('Election deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to delete election:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete election');
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
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch candidates');
      }
      
      const data = await response.json();
      return data.candidates || [];
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      toast.error('Failed to fetch candidates');
      return [];
    }
  }

  public async createCandidate(candidateData: {
    userId: number;
    electionId: number;
    party: string;
    platform: string;
  }) {
    await this.isReady();
    
    if (!this.isAdmin()) {
      toast.error('Only administrators can create candidates');
      return { success: false, error: 'Permission denied' };
    }
    
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
      
      toast.success('Candidate created successfully');
      return { 
        success: true, 
        id: data.candidateId 
      };
    } catch (error) {
      console.error('Failed to create candidate:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create candidate');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public async updateCandidate(candidateId: number, candidateData: any) {
    await this.isReady();
    
    if (!this.isAdmin()) {
      toast.error('Only administrators can update candidates');
      return { success: false, error: 'Permission denied' };
    }
    
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
      
      toast.success('Candidate updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to update candidate:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update candidate');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public async deleteCandidate(candidateId: number) {
    await this.isReady();
    
    if (!this.isAdmin()) {
      toast.error('Only administrators can delete candidates');
      return { success: false, error: 'Permission denied' };
    }
    
    try {
      const response = await fetch(`${API_URL}/candidates/${candidateId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete candidate');
      }
      
      toast.success('Candidate deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to delete candidate:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete candidate');
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
      
      toast.success('Vote cast successfully');
      return { 
        success: true, 
        id: data.voteId 
      };
    } catch (error) {
      console.error('Failed to cast vote:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cast vote');
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
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch user votes');
      }
      
      const data = await response.json();
      return data.votes || [];
    } catch (error) {
      console.error('Failed to fetch user votes:', error);
      toast.error('Failed to fetch your voting history');
      return [];
    }
  }
  
  public async getElectionResults(electionId: number) {
    await this.isReady();
    
    try {
      const response = await fetch(`${API_URL}/results/${electionId}`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch results');
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Failed to fetch election results:', error);
      toast.error('Failed to fetch election results');
      return [];
    }
  }
  
  public async getVotingStats(electionId?: string) {
    await this.isReady();
    
    if (!this.isAdmin()) {
      toast.error('Only administrators can access voting statistics');
      return {
        votingTrends: [],
        candidateStats: []
      };
    }
    
    try {
      let url = `${API_URL}/analytics/voting`;
      if (electionId && electionId !== 'all') {
        url += `?electionId=${electionId}`;
      }
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch voting statistics');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch voting statistics:', error);
      toast.error('Failed to fetch voting statistics');
      return {
        votingTrends: [],
        candidateStats: []
      };
    }
  }
  
  public async getVoterStats() {
    await this.isReady();
    
    if (!this.isAdmin()) {
      toast.error('Only administrators can access voter statistics');
      return {
        total: 0,
        active: 0,
        pending: 0,
        participation: 0
      };
    }
    
    try {
      const response = await fetch(`${API_URL}/analytics/voters`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch voter statistics');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch voter statistics:', error);
      toast.error('Failed to fetch voter statistics');
      return {
        total: 0,
        active: 0,
        pending: 0,
        participation: 0
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
