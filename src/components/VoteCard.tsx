import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Vote, ChevronRight, ClipboardCheck, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import CandidateProfile from './CandidateProfile';

interface Candidate {
  id: string;
  name: string;
  position: string;
  party: string;
  bio: string;
  image: string;
  experience: string;
}

interface VoteCardProps {
  election: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 'upcoming' | 'active' | 'ended';
  };
  candidates: Candidate[];
  onVote: (electionId: string, candidateId: string) => void;
}

const VoteCard = ({ election, candidates, onVote }: VoteCardProps) => {
  const [step, setStep] = useState<'info' | 'selection' | 'confirmation' | 'success'>('info');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  
  const handleCandidateSelect = (id: string) => {
    setSelectedCandidate(id);
  };
  
  const handleVoteSubmit = () => {
    if (selectedCandidate) {
      // Pass the IDs to the parent component
      onVote(election.id, selectedCandidate);
      setStep('success');
    }
  };
  
  const getStatusColor = (status: 'upcoming' | 'active' | 'ended') => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'ended':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };
  
  return (
    <Card className="glass-card overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", 
              getStatusColor(election.status)
            )}>
              {election.status}
            </span>
            <h2 className="text-2xl font-semibold mt-2">{election.title}</h2>
          </div>
        </div>
        
        {step === 'info' && (
          <div className="animate-fade-in">
            <p className="text-muted-foreground mb-4">
              {election.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground mr-2">Start Date:</span>
                <span>
                  {new Date(election.startDate).toLocaleDateString('en-US', {
                    timeZone: 'Africa/Nairobi', // EAT timezone
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground mr-2">End Date:</span>
                <span>
                  {new Date(election.endDate).toLocaleDateString('en-US', {
                    timeZone: 'Africa/Nairobi', // EAT timezone
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={() => setStep('selection')}
              disabled={election.status !== 'active'}
              className="btn-primary flex items-center"
            >
              {election.status === 'active' ? (
                <>
                  <Vote className="mr-2 h-4 w-4" />
                  Proceed to Vote
                </>
              ) : election.status === 'upcoming' ? (
                'Voting Not Started Yet'
              ) : (
                'Voting Period Ended'
              )}
              {election.status === 'active' && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        )}
        
        {step === 'selection' && (
          <div className="animate-fade-in">
            <p className="text-sm text-muted-foreground mb-6">
              Please select a candidate to cast your vote. Your vote is anonymous and secure.
            </p>
            
            <div className="grid grid-cols-1 gap-4 mb-6">
              {candidates.map((candidate) => (
                <div 
                  key={candidate.id}
                  className="border border-border rounded-lg overflow-hidden transition-all hover:border-primary/50 cursor-pointer"
                  onClick={() => handleCandidateSelect(candidate.id)}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-24 h-24 bg-muted">
                      <img 
                        src={candidate.image} 
                        alt={candidate.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">{candidate.party}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                          selectedCandidate === candidate.id 
                            ? "border-primary bg-primary text-primary-foreground" 
                            : "border-muted-foreground/30"
                        )}>
                          {selectedCandidate === candidate.id && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                      <p className="text-sm mt-2 line-clamp-2">{candidate.bio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep('info')}
              >
                Back
              </Button>
              <Button 
                onClick={() => selectedCandidate && setStep('confirmation')}
                disabled={!selectedCandidate}
                className="btn-primary"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
        
        {step === 'confirmation' && selectedCandidate && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                <ClipboardCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Confirm Your Vote</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Please review your selection before submitting your final vote.
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Your Selection:</h4>
              <div className="border border-border rounded-lg overflow-hidden">
                {candidates
                  .filter(candidate => candidate.id === selectedCandidate)
                  .map(candidate => (
                    <div key={candidate.id} className="p-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                          <img 
                            src={candidate.image} 
                            alt={candidate.name}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">{candidate.party}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground mb-6">
              <p>Important Note:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Your vote is final and cannot be changed after submission.</li>
                <li>The voting system ensures your privacy and the integrity of your vote.</li>
              </ul>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep('selection')}
              >
                Back
              </Button>
              <Button 
                onClick={handleVoteSubmit}
                className="btn-primary"
              >
                Confirm and Submit Vote
              </Button>
            </div>
          </div>
        )}
        
        {step === 'success' && (
          <div className="animate-fade-in text-center py-8">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6">
              <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-medium mb-2">Vote Successful!</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Your vote has been securely recorded and encrypted. Thank you for participating in this election.
            </p>
            <Button 
              onClick={() => setStep('info')}
              className="btn-primary"
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VoteCard;
