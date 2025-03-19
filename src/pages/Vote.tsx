
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VoteCard from '@/components/VoteCard';
import { Calendar, Vote as VoteIcon, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// Mock election data
const activeElections = [
  {
    id: '1',
    title: 'City Council Election',
    description: 'Election for city council representatives. Choose your preferred candidate to represent your district for the next 4 years.',
    startDate: '2024-05-01T00:00:00.000Z',
    endDate: '2024-05-15T23:59:59.000Z',
    status: 'active' as const,
  }
];

const upcomingElections = [
  {
    id: '2',
    title: 'Presidential Election 2024',
    description: 'National election for the president of the country. This is a crucial vote that will determine the leadership for the next term.',
    startDate: '2024-06-01T00:00:00.000Z',
    endDate: '2024-06-02T23:59:59.000Z',
    status: 'upcoming' as const,
  }
];

const pastElections = [
  {
    id: '3',
    title: 'Student Body President',
    description: 'University election for student body president. The elected candidate will represent student interests to the administration.',
    startDate: '2024-02-15T00:00:00.000Z',
    endDate: '2024-03-01T23:59:59.000Z',
    status: 'ended' as const,
  }
];

// Mock candidates data
const candidates = [
  {
    id: '1',
    name: 'James Wilson',
    position: 'City Council',
    party: 'Independent',
    bio: 'Committed to sustainable urban development and improving public transportation infrastructure for all citizens.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    experience: '8 years in local government',
  },
  {
    id: '2',
    name: 'Emily Parker',
    position: 'City Council',
    party: 'Progressive Alliance',
    bio: 'Focused on affordable housing, education reform, and creating equitable opportunities for all community members.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    experience: '5 years as community organizer',
  },
  {
    id: '3',
    name: 'Robert Chen',
    position: 'City Council',
    party: 'Citizens Party',
    bio: 'Dedicated to economic development, public safety, and transparent governance that serves citizens first.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    experience: '12 years in business leadership',
  }
];

const Vote = () => {
  const navigate = useNavigate();
  const [completedElections, setCompletedElections] = useState<string[]>([]);
  
  // Check if user is voter, redirect if not
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'voter') {
      toast.error('Unauthorized access. Please log in as voter.');
      navigate('/login');
    }
  }, [navigate]);
  
  const handleVote = (electionId: string, candidateId: string) => {
    // In a real app, this would submit to backend
    console.log(`Voted for candidate ${candidateId} in election ${electionId}`);
    setCompletedElections([...completedElections, electionId]);
    toast.success('Your vote has been recorded successfully!');
  };
  
  const hasVoted = (electionId: string) => {
    return completedElections.includes(electionId);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Vote</h1>
            <p className="text-muted-foreground mt-1">
              Cast your vote in active elections or view upcoming elections
            </p>
          </div>
          
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-8">
              <TabsTrigger value="active" className="flex items-center justify-center">
                <VoteIcon className="h-4 w-4 mr-2" />
                <span>Active</span>
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Upcoming</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center justify-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Completed</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="animate-fade-in space-y-6">
              {activeElections.length > 0 ? (
                activeElections.map((election) => (
                  <div key={election.id}>
                    {hasVoted(election.id) ? (
                      <Card className="glass-card p-6 text-center">
                        <div className="py-8">
                          <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6">
                            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="text-2xl font-medium mb-2">{election.title}</h3>
                          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            You have successfully cast your vote in this election. Thank you for participating!
                          </p>
                        </div>
                      </Card>
                    ) : (
                      <VoteCard
                        election={election}
                        candidates={candidates}
                        onVote={handleVote}
                      />
                    )}
                  </div>
                ))
              ) : (
                <Card className="glass-card p-8 text-center">
                  <p className="text-muted-foreground">There are no active elections at this time.</p>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="upcoming" className="animate-fade-in space-y-6">
              {upcomingElections.length > 0 ? (
                upcomingElections.map((election) => (
                  <VoteCard
                    key={election.id}
                    election={election}
                    candidates={candidates}
                    onVote={handleVote}
                  />
                ))
              ) : (
                <Card className="glass-card p-8 text-center">
                  <p className="text-muted-foreground">There are no upcoming elections at this time.</p>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="animate-fade-in space-y-6">
              {pastElections.length > 0 || completedElections.length > 0 ? (
                <>
                  {pastElections.map((election) => (
                    <Card key={election.id} className="glass-card p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 capitalize mb-2">
                            {election.status}
                          </span>
                          <h3 className="text-xl font-semibold">{election.title}</h3>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        {election.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div className="flex items-center text-sm">
                          <span className="text-muted-foreground mr-2">Voting Period:</span>
                          <span>
                            {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-start md:justify-end">
                          <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1.5" />
                            Participated
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {activeElections
                    .filter(election => completedElections.includes(election.id))
                    .map((election) => (
                      <Card key={election.id} className="glass-card p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 capitalize mb-2">
                              {election.status}
                            </span>
                            <h3 className="text-xl font-semibold">{election.title}</h3>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">
                          {election.description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                          <div className="flex items-center text-sm">
                            <span className="text-muted-foreground mr-2">Voting Period:</span>
                            <span>
                              {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-start md:justify-end">
                            <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1.5" />
                              Participated
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                </>
              ) : (
                <Card className="glass-card p-8 text-center">
                  <p className="text-muted-foreground">You haven't participated in any elections yet.</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Vote;
