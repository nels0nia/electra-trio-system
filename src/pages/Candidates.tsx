
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CandidateProfile from '@/components/CandidateProfile';
import { Search, Users, Filter } from 'lucide-react';

// Mock data for candidates
const mockCandidates = [
  {
    id: '1',
    name: 'Alex Johnson',
    position: 'Presidential Candidate',
    party: 'Progressive Party',
    bio: 'Former state senator with a focus on healthcare reform and environmental protection. Committed to creating a more equitable society through policy change.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    experience: '12 years in politics',
    electionId: '1'
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    position: 'Presidential Candidate',
    party: 'Conservative Alliance',
    bio: 'Business leader and community advocate focusing on economic growth, job creation, and strong national security policies.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    experience: '20 years in business',
    electionId: '1'
  },
  {
    id: '3',
    name: 'James Wilson',
    position: 'City Council',
    party: 'Independent',
    bio: 'Committed to sustainable urban development and improving public transportation infrastructure for all citizens.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    experience: '8 years in local government',
    electionId: '2'
  },
  {
    id: '4',
    name: 'Emily Parker',
    position: 'City Council',
    party: 'Progressive Alliance',
    bio: 'Focused on affordable housing, education reform, and creating equitable opportunities for all community members.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    experience: '5 years as community organizer',
    electionId: '2'
  },
  {
    id: '5',
    name: 'Robert Chen',
    position: 'City Council',
    party: 'Citizens Party',
    bio: 'Dedicated to economic development, public safety, and transparent governance that serves citizens first.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    experience: '12 years in business leadership',
    electionId: '2'
  },
  {
    id: '6',
    name: 'Sarah Chen',
    position: 'Student Body President',
    party: 'Student First',
    bio: 'Advocate for student rights, mental health resources, and creating an inclusive campus environment for all students.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    experience: '3 years in student government',
    electionId: '3'
  },
  {
    id: '7',
    name: 'David Park',
    position: 'Student Body President',
    party: 'Campus Reform',
    bio: 'Working to improve campus facilities, increase study spaces, and create more opportunities for student-faculty collaboration.',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    experience: '2 years as class representative',
    electionId: '3'
  },
  {
    id: '8',
    name: 'Jessica Lee',
    position: 'Student Body President',
    party: 'Independent',
    bio: 'Passionate about academic excellence, diversity initiatives, and creating stronger connections between students and administration.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    experience: '4 years in campus leadership',
    electionId: '3'
  }
];

// Mock data for elections
const elections = [
  { id: '1', name: 'Presidential Election 2024' },
  { id: '2', name: 'City Council Election' },
  { id: '3', name: 'Student Body President' }
];

const Candidates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeElection, setActiveElection] = useState<string | 'all'>('all');
  
  // Filter candidates based on search term and active election
  const filteredCandidates = mockCandidates.filter(candidate => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesElection = activeElection === 'all' || candidate.electionId === activeElection;
    
    return matchesSearch && matchesElection;
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Candidates</h1>
              <p className="text-muted-foreground mt-1">
                Explore the candidates running in various elections
              </p>
            </div>
            
            <div className="w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  className="pl-10 w-full md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by election:</span>
            </div>
            
            <Tabs 
              defaultValue="all" 
              value={activeElection} 
              onValueChange={(value) => setActiveElection(value as string | 'all')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="all" className="flex items-center justify-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>All Elections</span>
                </TabsTrigger>
                {elections.map((election) => (
                  <TabsTrigger 
                    key={election.id} 
                    value={election.id}
                    className="flex items-center justify-center"
                  >
                    {election.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          {filteredCandidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map((candidate, index) => (
                <div key={candidate.id} className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CandidateProfile
                    id={candidate.id}
                    name={candidate.name}
                    position={candidate.position}
                    party={candidate.party}
                    bio={candidate.bio}
                    image={candidate.image}
                    experience={candidate.experience}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card className="glass-card p-8 text-center">
              <p className="text-muted-foreground">
                No candidates found matching your search criteria.
              </p>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Candidates;
