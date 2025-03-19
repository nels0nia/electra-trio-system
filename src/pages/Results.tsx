
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ResultsChart from '@/components/ResultsChart';
import { BarChart, PieChart, Users, Calendar, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Mock data for election results
const electionResults = [
  {
    id: '1',
    title: 'Student Body President Results',
    description: 'Final results for the university student body president election.',
    totalVotes: 328,
    voterTurnout: '65.6%',
    completedDate: '2024-03-01T23:59:59.000Z',
    candidates: [
      { id: '1', name: 'Sarah Chen', party: 'Student First', votes: 145, color: '#4F46E5' },
      { id: '2', name: 'David Park', party: 'Campus Reform', votes: 120, color: '#10B981' },
      { id: '3', name: 'Jessica Lee', party: 'Independent', votes: 63, color: '#F59E0B' }
    ]
  },
  {
    id: '2',
    title: 'City Council Election Results (Partial)',
    description: 'Ongoing results for the city council election.',
    totalVotes: 423,
    voterTurnout: '49.8%',
    completedDate: null, // Still active
    candidates: [
      { id: '1', name: 'James Wilson', party: 'Independent', votes: 168, color: '#4F46E5' },
      { id: '2', name: 'Emily Parker', party: 'Progressive Alliance', votes: 142, color: '#10B981' },
      { id: '3', name: 'Robert Chen', party: 'Citizens Party', votes: 113, color: '#F59E0B' }
    ]
  }
];

// Mock historical data for trend analysis
const voteTrends = [
  { time: '8:00 AM', votes: 32 },
  { time: '10:00 AM', votes: 75 },
  { time: '12:00 PM', votes: 142 },
  { time: '2:00 PM', votes: 218 },
  { time: '4:00 PM', votes: 310 },
  { time: '6:00 PM', votes: 423 }
];

const Results = () => {
  const navigate = useNavigate();
  const [expandedElection, setExpandedElection] = useState<string | null>(null);
  
  // Check if user is authenticated
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (!userType) {
      toast.error('Please log in to view results.');
      navigate('/login');
    }
  }, [navigate]);
  
  const toggleElectionExpand = (id: string) => {
    if (expandedElection === id) {
      setExpandedElection(null);
    } else {
      setExpandedElection(id);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Election Results</h1>
            <p className="text-muted-foreground mt-1">
              View current and past election results
            </p>
          </div>
          
          <Tabs defaultValue="results" className="w-full mb-8">
            <TabsList className="grid grid-cols-1 md:grid-cols-2">
              <TabsTrigger value="results" className="flex items-center justify-center">
                <BarChart className="h-4 w-4 mr-2" />
                <span>Results</span>
              </TabsTrigger>
              {localStorage.getItem('userType') === 'candidate' && (
                <TabsTrigger value="my-results" className="flex items-center justify-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>My Results</span>
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="results" className="animate-fade-in space-y-6">
              {electionResults.map((election) => (
                <Card key={election.id} className="glass-card overflow-hidden">
                  <div className="p-6">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleElectionExpand(election.id)}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            election.completedDate
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {election.completedDate ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </>
                            ) : (
                              <>
                                <Calendar className="h-3 w-3 mr-1" />
                                In Progress
                              </>
                            )}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold">{election.title}</h3>
                      </div>
                      {expandedElection === election.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    {expandedElection === election.id && (
                      <div className="mt-6 animate-fade-in">
                        <p className="text-muted-foreground mb-6">
                          {election.description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <ResultsChart 
                              title="Vote Distribution"
                              candidates={election.candidates}
                              totalVotes={election.totalVotes}
                              chartType="bar"
                            />
                          </div>
                          
                          <div>
                            <ResultsChart 
                              title="Vote Percentage"
                              candidates={election.candidates}
                              totalVotes={election.totalVotes}
                              chartType="pie"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                          <Card className="glass-card p-4">
                            <div className="text-center">
                              <h4 className="text-sm text-muted-foreground mb-1">Total Votes</h4>
                              <p className="text-2xl font-bold">{election.totalVotes}</p>
                            </div>
                          </Card>
                          
                          <Card className="glass-card p-4">
                            <div className="text-center">
                              <h4 className="text-sm text-muted-foreground mb-1">Voter Turnout</h4>
                              <p className="text-2xl font-bold">{election.voterTurnout}</p>
                            </div>
                          </Card>
                          
                          <Card className="glass-card p-4">
                            <div className="text-center">
                              <h4 className="text-sm text-muted-foreground mb-1">Winner</h4>
                              <p className="text-2xl font-bold">
                                {[...election.candidates].sort((a, b) => b.votes - a.votes)[0]?.name || 'TBD'}
                              </p>
                            </div>
                          </Card>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </TabsContent>
            
            {localStorage.getItem('userType') === 'candidate' && (
              <TabsContent value="my-results" className="animate-fade-in">
                <Card className="glass-card p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold">Your Election Performance</h3>
                    <p className="text-muted-foreground mt-1">
                      City Council Election - James Wilson (Independent)
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="glass-card p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-medium">Current Vote Count</h4>
                          <p className="text-3xl font-bold mt-2">168</p>
                        </div>
                        <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Share of Total Votes:</span>
                          <span className="font-medium">39.7%</span>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="glass-card p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-medium">Your Position</h4>
                          <div className="flex items-center mt-2">
                            <span className="text-3xl font-bold">#1</span>
                            <span className="ml-2 text-sm text-muted-foreground">of 3 candidates</span>
                          </div>
                        </div>
                        <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                          <BarChart className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Lead over 2nd place:</span>
                          <span className="font-medium">+26 votes</span>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="glass-card p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-medium">Time Remaining</h4>
                          <p className="text-3xl font-bold mt-2">5 days</p>
                        </div>
                        <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Election End Date:</span>
                          <span className="font-medium">May 15, 2024</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Vote Comparison</h3>
                    <div className="w-full h-[300px]">
                      <ResultsChart 
                        title=""
                        candidates={electionResults[1].candidates}
                        totalVotes={electionResults[1].totalVotes}
                        chartType="bar"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Voting Trend Today</h3>
                    <Card className="glass-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Hourly Vote Count</h4>
                        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                          <span className="font-medium">+42 in last hour</span>
                          <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5L12 19M12 5L6 11M12 5L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      
                      <div className="w-full space-y-2">
                        {voteTrends.map((trend, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-16 text-sm text-muted-foreground">{trend.time}</div>
                            <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${(trend.votes / voteTrends[voteTrends.length - 1].votes) * 100}%` }}
                              />
                            </div>
                            <div className="w-12 text-right text-sm font-medium">{trend.votes}</div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </Card>
              </TabsContent>
            )}
          </Tabs>
          
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Need More Information?</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              For detailed analytics and complete historical data, visit the election archives.
            </p>
            <Button 
              className="btn-primary"
              onClick={() => navigate('/candidates')}
            >
              View All Candidates
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Results;
