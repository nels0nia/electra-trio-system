
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VoteCard from '@/components/VoteCard';
import { Calendar, Vote as VoteIcon, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { sqlService } from '@/services/sql';

const Vote = () => {
  const navigate = useNavigate();
  const [completedElections, setCompletedElections] = useState<string[]>([]);
  const [activeElections, setActiveElections] = useState<any[]>([]);
  const [upcomingElections, setUpcomingElections] = useState<any[]>([]);
  const [pastElections, setPastElections] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Check if user is voter or candidate, redirect if not
  useEffect(() => {
    const currentUser = sqlService.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'voter' && currentUser.role !== 'candidate')) {
      toast.error('Unauthorized access. Please log in as voter or candidate.');
      navigate('/login');
    } else {
      loadElections();
      loadCandidates();
      loadCompletedElections();
    }
  }, [navigate]);
  
  const loadElections = async () => {
    setLoading(true);
    try {
      const allElections = await sqlService.getElections();
      
      if (allElections) {
        setActiveElections(allElections.filter(e => e.status === 'active') || []);
        setUpcomingElections(allElections.filter(e => e.status === 'upcoming') || []);
        setPastElections(allElections.filter(e => e.status === 'ended') || []);
      }
    } catch (error) {
      console.error('Failed to load elections:', error);
      toast.error('Failed to load elections. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const loadCandidates = async () => {
    try {
      const allCandidates = await sqlService.getCandidates();
      setCandidates(allCandidates || []);
    } catch (error) {
      console.error('Failed to load candidates:', error);
      toast.error('Failed to load candidates. Please try again.');
    }
  };
  
  const loadCompletedElections = async () => {
    try {
      const userVotes = await sqlService.getUserVotes();
      if (userVotes) {
        const electionIds = userVotes.map(vote => vote.election_id);
        setCompletedElections(electionIds);
      }
    } catch (error) {
      console.error('Failed to load completed elections:', error);
    }
  };
  
  const handleVote = async (electionId: string, candidateId: string, encryptedVote: string) => {
    try {
      // Submit encrypted vote to the server
      const result = await sqlService.castVote({
        electionId,
        candidateId,
        encryptedVote
      });
      
      if (result.success) {
        setCompletedElections([...completedElections, electionId]);
        toast.success('Your vote has been securely recorded!');
      } else {
        throw new Error(result.error || 'Failed to cast vote');
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error('Failed to cast vote. Please try again.');
    }
  };
  
  const hasVoted = (electionId: string) => {
    return completedElections.includes(electionId);
  };
  
  const getElectionCandidates = (electionId: string) => {
    return candidates.filter(candidate => candidate.election_id === electionId);
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
              {loading ? (
                <Card className="glass-card p-8 text-center">
                  <p className="text-muted-foreground">Loading elections...</p>
                </Card>
              ) : activeElections.length > 0 ? (
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
                        candidates={getElectionCandidates(election.id)}
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
              {loading ? (
                <Card className="glass-card p-8 text-center">
                  <p className="text-muted-foreground">Loading elections...</p>
                </Card>
              ) : upcomingElections.length > 0 ? (
                upcomingElections.map((election) => (
                  <VoteCard
                    key={election.id}
                    election={election}
                    candidates={getElectionCandidates(election.id)}
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
              {loading ? (
                <Card className="glass-card p-8 text-center">
                  <p className="text-muted-foreground">Loading elections...</p>
                </Card>
              ) : pastElections.length > 0 || completedElections.length > 0 ? (
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
                            {new Date(election.startDate).toLocaleDateString('en-US', { 
                              timeZone: 'Africa/Nairobi',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric' 
                            })} - {new Date(election.endDate).toLocaleDateString('en-US', { 
                              timeZone: 'Africa/Nairobi',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-start md:justify-end">
                          {hasVoted(election.id) ? (
                            <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1.5" />
                              Participated
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                              Did not participate
                            </span>
                          )}
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
                              {new Date(election.startDate).toLocaleDateString('en-US', { 
                                timeZone: 'Africa/Nairobi',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric' 
                              })} - {new Date(election.endDate).toLocaleDateString('en-US', { 
                                timeZone: 'Africa/Nairobi',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric' 
                              })}
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
