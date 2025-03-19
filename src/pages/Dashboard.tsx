
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ResultsChart from '@/components/ResultsChart';
import { Plus, FileText, UserPlus, Vote, BarChart, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for elections
const mockElections = [
  {
    id: '1',
    title: 'Presidential Election 2024',
    description: 'National election for the president of the country.',
    startDate: '2024-06-01T00:00:00.000Z',
    endDate: '2024-06-02T23:59:59.000Z',
    status: 'upcoming',
    candidates: 5,
    registeredVoters: 1250,
    votesCast: 0,
  },
  {
    id: '2',
    title: 'City Council Election',
    description: 'Election for city council representatives.',
    startDate: '2024-05-01T00:00:00.000Z',
    endDate: '2024-05-15T23:59:59.000Z',
    status: 'active',
    candidates: 12,
    registeredVoters: 850,
    votesCast: 423,
  },
  {
    id: '3',
    title: 'Student Body President',
    description: 'University election for student body president.',
    startDate: '2024-02-15T00:00:00.000Z',
    endDate: '2024-03-01T23:59:59.000Z',
    status: 'ended',
    candidates: 3,
    registeredVoters: 500,
    votesCast: 328,
  }
];

// Mock data for candidates
const mockCandidates = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    position: 'Presidential Candidate',
    party: 'Progressive Party',
    electionId: '1',
    status: 'approved',
    registered: '2024-03-15T10:30:00.000Z',
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    email: 'maria@example.com',
    position: 'Presidential Candidate',
    party: 'Conservative Alliance',
    electionId: '1',
    status: 'pending',
    registered: '2024-03-17T14:20:00.000Z',
  },
  {
    id: '3',
    name: 'James Wilson',
    email: 'james@example.com',
    position: 'City Council',
    party: 'Independent',
    electionId: '2',
    status: 'approved',
    registered: '2024-02-28T09:15:00.000Z',
  },
  {
    id: '4',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    position: 'Student Body President',
    party: 'Student First',
    electionId: '3',
    status: 'approved',
    registered: '2024-01-20T11:40:00.000Z',
  }
];

// Mock data for voters
const mockVoters = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    registrationDate: '2024-02-01T08:30:00.000Z',
    status: 'active',
    voteHistory: [
      { electionId: '3', voted: true, date: '2024-02-20T14:30:00.000Z' }
    ]
  },
  {
    id: '2',
    name: 'Lisa Brown',
    email: 'lisa@example.com',
    registrationDate: '2024-01-15T10:20:00.000Z',
    status: 'active',
    voteHistory: [
      { electionId: '3', voted: true, date: '2024-02-25T11:45:00.000Z' },
      { electionId: '2', voted: true, date: '2024-05-05T16:20:00.000Z' }
    ]
  },
  {
    id: '3',
    name: 'Michael Smith',
    email: 'michael@example.com',
    registrationDate: '2024-03-10T09:15:00.000Z',
    status: 'inactive',
    voteHistory: []
  },
  {
    id: '4',
    name: 'Emma Johnson',
    email: 'emma@example.com',
    registrationDate: '2024-01-05T13:40:00.000Z',
    status: 'active',
    voteHistory: [
      { electionId: '3', voted: true, date: '2024-02-18T10:10:00.000Z' }
    ]
  }
];

// Results data for the completed election
const electionResults = {
  id: '3',
  title: 'Student Body President Results',
  totalVotes: 328,
  candidates: [
    { id: '1', name: 'Sarah Chen', party: 'Student First', votes: 145, color: '#4F46E5' },
    { id: '2', name: 'David Park', party: 'Campus Reform', votes: 120, color: '#10B981' },
    { id: '3', name: 'Jessica Lee', party: 'Independent', votes: 63, color: '#F59E0B' }
  ]
};

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Check if user is admin, redirect if not
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'admin') {
      toast.error('Unauthorized access. Please log in as admin.');
      navigate('/login');
    }
  }, [navigate]);
  
  const [activeTab, setActiveTab] = useState('elections');
  const [isNewElectionDialogOpen, setIsNewElectionDialogOpen] = useState(false);
  
  // Functions to handle election creation (would connect to backend in real app)
  const handleCreateElection = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Election created successfully!');
    setIsNewElectionDialogOpen(false);
  };
  
  // Function to approve/reject candidates
  const handleCandidateStatus = (id: string, status: 'approved' | 'rejected') => {
    toast.success(`Candidate ${status} successfully!`);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage elections, candidates, and monitor voting activity
              </p>
            </div>
            
            <div className="flex gap-3">
              <Dialog open={isNewElectionDialogOpen} onOpenChange={setIsNewElectionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    New Election
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Election</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to create a new election.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleCreateElection} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Election Title
                      </label>
                      <Input
                        id="title"
                        placeholder="e.g., Presidential Election 2024"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Description
                      </label>
                      <textarea
                        id="description"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Short description of this election"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="startDate" className="text-sm font-medium">
                          Start Date
                        </label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="endDate" className="text-sm font-medium">
                          End Date
                        </label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsNewElectionDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="btn-primary">
                        Create Election
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={() => navigate('/results')}
              >
                <BarChart className="mr-2 h-4 w-4" />
                View Results
              </Button>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Total Elections</h3>
                    <p className="text-3xl font-bold mt-2">{mockElections.length}</p>
                  </div>
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                    <Vote className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active:</span>
                    <span className="font-medium">{mockElections.filter(e => e.status === 'active').length}</span>
                  </div>
                </div>
              </Card>
              
              <Card className="glass-card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Registered Voters</h3>
                    <p className="text-3xl font-bold mt-2">{mockVoters.length}</p>
                  </div>
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active:</span>
                    <span className="font-medium">{mockVoters.filter(v => v.status === 'active').length}</span>
                  </div>
                </div>
              </Card>
              
              <Card className="glass-card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Total Candidates</h3>
                    <p className="text-3xl font-bold mt-2">{mockCandidates.length}</p>
                  </div>
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pending Approval:</span>
                    <span className="font-medium">{mockCandidates.filter(c => c.status === 'pending').length}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          <Tabs 
            defaultValue="elections" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-8">
              <TabsTrigger value="elections">Elections</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="voters">Voters</TabsTrigger>
            </TabsList>
            
            <TabsContent value="elections" className="animate-fade-in">
              <div className="space-y-6">
                {mockElections.map((election) => (
                  <Card key={election.id} className="glass-card overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                election.status === 'active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                  : election.status === 'upcoming'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
                              }`}
                            >
                              {election.status}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold">{election.title}</h3>
                          <p className="text-muted-foreground mt-1">{election.description}</p>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button variant="outline" className="text-sm">
                            Edit
                          </Button>
                          <Button variant="default" className="btn-primary text-sm">
                            {election.status === 'ended' 
                              ? 'View Results' 
                              : election.status === 'active'
                              ? 'Monitor'
                              : 'Manage'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-border">
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="font-medium mt-1">
                            {new Date(election.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">End Date</p>
                          <p className="font-medium mt-1">
                            {new Date(election.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Candidates</p>
                          <p className="font-medium mt-1">{election.candidates}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {election.status === 'ended' ? 'Total Votes' : 'Registered Voters'}
                          </p>
                          <p className="font-medium mt-1">
                            {election.status === 'ended' 
                              ? `${election.votesCast} / ${election.registeredVoters}`
                              : election.registeredVoters}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="candidates" className="animate-fade-in">
              <Card className="glass-card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Candidate Applications</h3>
                    <Button className="btn-primary">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Candidate
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="pb-3 pr-6 font-medium">Name</th>
                          <th className="pb-3 px-6 font-medium">Email</th>
                          <th className="pb-3 px-6 font-medium">Position</th>
                          <th className="pb-3 px-6 font-medium">Party</th>
                          <th className="pb-3 px-6 font-medium">Status</th>
                          <th className="pb-3 px-6 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockCandidates.map((candidate) => (
                          <tr key={candidate.id} className="border-b border-border">
                            <td className="py-4 pr-6">{candidate.name}</td>
                            <td className="py-4 px-6 text-muted-foreground">{candidate.email}</td>
                            <td className="py-4 px-6">{candidate.position}</td>
                            <td className="py-4 px-6">{candidate.party}</td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                candidate.status === 'approved' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                  : candidate.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}>
                                {candidate.status}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                {candidate.status === 'pending' && (
                                  <>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                                      onClick={() => handleCandidateStatus(candidate.id, 'approved')}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                                      onClick={() => handleCandidateStatus(candidate.id, 'rejected')}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="voters" className="animate-fade-in">
              <Card className="glass-card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Registered Voters</h3>
                    <Button className="btn-primary">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Voter
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="pb-3 pr-6 font-medium">Name</th>
                          <th className="pb-3 px-6 font-medium">Email</th>
                          <th className="pb-3 px-6 font-medium">Registration Date</th>
                          <th className="pb-3 px-6 font-medium">Status</th>
                          <th className="pb-3 px-6 font-medium">Participation</th>
                          <th className="pb-3 px-6 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockVoters.map((voter) => (
                          <tr key={voter.id} className="border-b border-border">
                            <td className="py-4 pr-6">{voter.name}</td>
                            <td className="py-4 px-6 text-muted-foreground">{voter.email}</td>
                            <td className="py-4 px-6">
                              {new Date(voter.registrationDate).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                voter.status === 'active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
                              }`}>
                                {voter.status}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              {voter.voteHistory.length} elections
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                {voter.status === 'active' ? (
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Election Results Preview */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Latest Election Results</h2>
            <ResultsChart 
              title={electionResults.title}
              candidates={electionResults.candidates}
              totalVotes={electionResults.totalVotes}
              chartType="bar"
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
