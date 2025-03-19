
import React from 'react';
import { Card } from '@/components/ui/card';
import { User, Award, Briefcase, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CandidateProfileProps {
  id: string;
  name: string;
  position: string;
  party: string;
  bio: string;
  votes?: number;
  image: string;
  experience: string;
  showVotes?: boolean;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

const CandidateProfile = ({
  id,
  name,
  position,
  party,
  bio,
  votes,
  image,
  experience,
  showVotes = false,
  className,
  onClick,
  selected = false,
}: CandidateProfileProps) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 h-full glass-card",
        selected && "ring-2 ring-primary",
        onClick && "cursor-pointer hover:shadow-lg transform hover:-translate-y-1",
        className
      )}
      onClick={onClick}
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="object-cover w-full h-full transition-transform duration-500 hover:scale-105" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <span className="chip bg-primary/90 text-primary-foreground">
            {party}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-semibold mb-1">{name}</h3>
        <p className="text-muted-foreground text-sm mb-4 flex items-center">
          <Award className="h-4 w-4 mr-1 text-primary" />
          {position}
        </p>
        
        <div className="space-y-3 mb-4">
          <p className="text-sm line-clamp-3">
            {bio}
          </p>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4 mr-1.5" />
            <span>{experience}</span>
          </div>
        </div>
        
        {showVotes && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Votes</span>
              <span className="font-semibold text-lg">{votes}</span>
            </div>
          </div>
        )}

        {selected && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-center text-primary">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="ml-2 text-sm font-medium">Selected</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CandidateProfile;
