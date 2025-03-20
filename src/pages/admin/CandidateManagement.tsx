
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Users, UserPlus, Edit, Trash2, Search, MoreHorizontal, AlertCircle } from 'lucide-react';
import { sqlService } from '@/services/sql';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const candidateSchema = z.object({
  userId: z.number().or(z.string().transform(val => parseInt(val))),
  electionId: z.number().or(z.string().transform(val => parseInt(val))),
  party: z.string(),
  platform: z.string(),
  approved: z.boolean().default(true),
});

type CandidateFormData = z.infer<typeof candidateSchema>;

const CandidateManagement = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const addForm = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      party: '',
      platform: '',
      approved: true,
    }
  });

  const editForm = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      party: '',
      platform: '',
      approved: true,
    }
  });

  // Check if user is admin
  useEffect(() => {
    const currentUser = sqlService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Unauthorized access. Please log in as admin.');
      navigate('/login');
    } else {
      loadCandidates();
      loadUsers();
      loadElections();
    }
  }, [navigate]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const fetchedCandidates = await sqlService.getCandidates();
      setCandidates(fetchedCandidates || []);
    } catch (error) {
      console.error('Failed to load candidates:', error);
      toast.error('Failed to load candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const fetchedUsers = await sqlService.getUsers('voter');
      setUsers(fetchedUsers || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users. Please try again.');
    }
  };

  const loadElections = async () => {
    try {
      const fetchedElections = await sqlService.getElections();
      setElections(fetchedElections || []);
    } catch (error) {
      console.error('Failed to load elections:', error);
      toast.error('Failed to load elections. Please try again.');
    }
  };

  const handleAddCandidate = async (data: CandidateFormData) => {
    try {
      const result = await sqlService.createCandidate({
        userId: Number(data.userId),
        electionId: Number(data.electionId),
        party: data.party,
        platform: data.platform,
      });
      
      if (result.success) {
        toast.success('Candidate created successfully');
        setIsAddDialogOpen(false);
        addForm.reset();
        loadCandidates();
      } else {
        throw new Error(result.error || 'Failed to create candidate');
      }
    } catch (error) {
      console.error('Error creating candidate:', error);
      toast.error('Failed to create candidate. Please try again.');
    }
  };

  const handleEditCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    editForm.reset({
      userId: candidate.user_id,
      electionId: candidate.election_id,
      party: candidate.party || '',
      platform: candidate.platform || '',
      approved: candidate.approved,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCandidate = async () => {
    if (!selectedCandidate) return;
    
    try {
      const result = await sqlService.deleteCandidate(selectedCandidate.id);
      
      if (result.success) {
        toast.success('Candidate deleted successfully');
        setIsDeleteDialogOpen(false);
        loadCandidates();
      } else {
        throw new Error(result.error || 'Failed to delete candidate');
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate. Please try again.');
    }
  };

  const onSubmitEdit = async (data: CandidateFormData) => {
    if (!selectedCandidate) return;
    
    try {
      const result = await sqlService.updateCandidate(selectedCandidate.id, {
        party: data.party,
        platform: data.platform,
        approved: data.approved,
      });
      
      if (result.success) {
        toast.success('Candidate updated successfully');
        setIsEditDialogOpen(false);
        loadCandidates();
      } else {
        throw new Error(result.error || 'Failed to update candidate');
      }
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast.error('Failed to update candidate. Please try again.');
    }
  };

  const filteredCandidates = searchTerm
    ? candidates.filter(candidate => 
        candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.party?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : candidates;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidate Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage election candidates
          </p>
        </div>
        
        <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4 md:mt-0">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Candidate
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search candidates by name or party..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>Loading candidates...</p>
          </CardContent>
        </Card>
      ) : filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Candidates Found</h3>
            <p className="text-muted-foreground mt-1">
              There are no candidates in the system yet.
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              variant="outline" 
              className="mt-4"
            >
              Add Candidate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onEdit={() => handleEditCandidate(candidate)}
              onDelete={() => handleDeleteCandidate(candidate)}
            />
          ))}
        </div>
      )}

      {/* Add Candidate Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
            <DialogDescription>
              Create a new candidate for an election.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddCandidate)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="electionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Election</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an election" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {elections.map(election => (
                          <SelectItem key={election.id} value={election.id.toString()}>
                            {election.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="party"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Party or affiliation" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Candidate's platform or mission statement" 
                        className="h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Candidate</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Candidate Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Candidate</DialogTitle>
            <DialogDescription>
              Update candidate information.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="party"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Party or affiliation" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Candidate's platform or mission statement" 
                        className="h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Candidate Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this candidate? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteCandidate}
            >
              Delete Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface CandidateCardProps {
  candidate: any;
  onEdit: () => void;
  onDelete: () => void;
}

const CandidateCard = ({ candidate, onEdit, onDelete }: CandidateCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{candidate.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-sm text-muted-foreground mt-1">{candidate.party || 'Independent'}</div>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          <div className="flex items-start">
            <div className="mr-2">Email:</div>
            <div className="text-muted-foreground">{candidate.email}</div>
          </div>
          <div className="flex items-start">
            <div className="mr-2">Election:</div>
            <div className="text-muted-foreground">{candidate.election_title || 'Unknown'}</div>
          </div>
          {candidate.platform && (
            <div className="mt-3">
              <div className="mb-1">Platform:</div>
              <p className="text-muted-foreground text-sm line-clamp-3">{candidate.platform}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateManagement;
