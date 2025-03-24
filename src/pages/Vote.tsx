
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Helmet } from 'react-helmet';
import { AlertCircle, Check, ThumbsUp } from 'lucide-react';
import { sqlService } from '@/services/sql';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Candidate {
  id: number;
  name: string;
  party: string;
  platform: string;
  bio: string;
  profile_image?: string;
  email: string;
}

interface Election {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
}

const Vote = () => {
  const navigate = useNavigate();
  const [activeElections, setActiveElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = sqlService.getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchElectionsAndVotes();
  }, [navigate, currentUser]);

  const fetchElectionsAndVotes = async () => {
    setIsLoading(true);
    try {
      // Fetch active elections
      const electionsData = await sqlService.getElections();
      const now = new Date();
      const active = electionsData.filter(
        (election: Election) => 
          new Date(election.start_date) <= now && 
          new Date(election.end_date) >= now &&
          election.status === 'active'
      );
      
      setActiveElections(active);
      
      if (active.length > 0) {
        setSelectedElection(active[0].id);
        
        // Fetch candidates for the first election
        const candidatesData = await sqlService.getCandidates(active[0].id);
        setCandidates(candidatesData);
        
        // Check if user has already voted in this election
        const votes = await sqlService.getUserVotes();
        const hasAlreadyVoted = votes.some((vote: any) => vote.election_id === active[0].id);
        setHasVoted(hasAlreadyVoted);
      }
    } catch (error) {
      console.error('Error fetching elections data:', error);
      toast.error('Failed to load elections data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleElectionChange = async (electionId: string) => {
    const electionIdNum = parseInt(electionId);
    setSelectedElection(electionIdNum);
    setSelectedCandidate(null);
    
    try {
      // Fetch candidates for the selected election
      const candidatesData = await sqlService.getCandidates(electionIdNum);
      setCandidates(candidatesData);
      
      // Check if user has already voted in this election
      const votes = await sqlService.getUserVotes();
      const hasAlreadyVoted = votes.some((vote: any) => vote.election_id === electionIdNum);
      setHasVoted(hasAlreadyVoted);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidates');
    }
  };

  const handleVote = async () => {
    if (!selectedElection || !selectedCandidate || !currentUser) return;
    
    setIsSubmitting(true);
    try {
      const result = await sqlService.castVote({
        voterId: currentUser.id,
        candidateId: selectedCandidate,
        electionId: selectedElection
      });
      
      if (result.success) {
        setIsSuccess(true);
        setHasVoted(true);
        toast.success('Your vote has been cast successfully!');
      } else {
        throw new Error(result.error || 'Failed to cast vote');
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cast vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Vote | VoteX</title>
        </Helmet>
        <h1 className="text-3xl font-bold mb-6">Cast Your Vote</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-5 w-5 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (activeElections.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Vote | VoteX</title>
        </Helmet>
        <h1 className="text-3xl font-bold mb-6">Cast Your Vote</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Active Elections</AlertTitle>
          <AlertDescription>
            There are no active elections at the moment. Please check back later.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => navigate('/dashboard')} 
          className="mt-4"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Vote Successful | VoteX</title>
        </Helmet>
        <h1 className="text-3xl font-bold mb-6">Vote Successful</h1>
        <Card>
          <CardContent className="pt-6 text-center">
            <ThumbsUp className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-semibold">Thank You for Voting!</h2>
            <p className="text-muted-foreground mt-2 mb-4">
              Your vote has been securely recorded and encrypted.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/results')}>
                View Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Vote | VoteX</title>
      </Helmet>
      <h1 className="text-3xl font-bold mb-6">Cast Your Vote</h1>
      
      {hasVoted && (
        <Alert className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/30">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle>You've Already Voted</AlertTitle>
          <AlertDescription>
            You have already cast your vote in this election. Each voter is allowed only one vote per election.
          </AlertDescription>
        </Alert>
      )}
      
      {activeElections.length > 1 && (
        <Tabs defaultValue={activeElections[0].id.toString()} value={selectedElection?.toString()} onValueChange={handleElectionChange} className="mb-6">
          <TabsList>
            {activeElections.map((election) => (
              <TabsTrigger key={election.id} value={election.id.toString()}>
                {election.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedElection && activeElections.find(e => e.id === selectedElection)?.title}
          </CardTitle>
          <CardDescription>
            {selectedElection && activeElections.find(e => e.id === selectedElection)?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-medium mb-4">Select a Candidate</h3>
          {candidates.length === 0 ? (
            <p className="text-muted-foreground">No candidates available for this election.</p>
          ) : (
            <RadioGroup 
              value={selectedCandidate?.toString()} 
              onValueChange={value => setSelectedCandidate(parseInt(value))}
              className="space-y-4"
            >
              {candidates.map((candidate) => (
                <div key={candidate.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/20">
                  <RadioGroupItem 
                    value={candidate.id.toString()} 
                    id={`candidate-${candidate.id}`} 
                    disabled={hasVoted}
                  />
                  <div className="grid gap-1.5">
                    <Label 
                      htmlFor={`candidate-${candidate.id}`} 
                      className="text-lg font-medium cursor-pointer"
                    >
                      {candidate.name} 
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {candidate.party}
                      </span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {candidate.platform || candidate.bio || 'No candidate information available.'}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleVote} 
            disabled={!selectedCandidate || hasVoted || isSubmitting}
            className="flex items-center"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Vote'}
            {!isSubmitting && <Check className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Vote;
