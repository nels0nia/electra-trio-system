
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { CalendarIcon, Plus, Users, VoteIcon, Calendar as CalendarIcon2, Settings, Trash2, Edit, Download } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays, isBefore, isAfter, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { sqlService } from '@/services/sql';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Define the Election type
interface Election {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  created_by: number;
  creator_name?: string;
  candidate_count?: number;
  vote_count?: number;
}

interface Voter {
  id: number;
  name: string;
  email: string;
}

interface Candidate {
  id: number;
  name: string;
  party: string;
  email: string;
}

// Form schema
const electionSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
  status: z.enum(["draft", "upcoming", "active", "ended"]),
});

type ElectionFormData = z.infer<typeof electionSchema>;

const ElectionManagement = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editElectionId = searchParams.get('edit') ? parseInt(searchParams.get('edit') || '0') : null;
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [elections, setElections] = useState<Election[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentElection, setCurrentElection] = useState<Election | null>(null);
  
  const form = useForm<ElectionFormData>({
    resolver: zodResolver(electionSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      status: 'upcoming',
    }
  });
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (!sqlService.isAdmin()) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/dashboard');
        return;
      }
      await fetchData();
    };
    
    checkAdmin();
  }, [navigate]);
  
  useEffect(() => {
    if (editElectionId) {
      const election = elections.find(e => e.id === editElectionId);
      if (election) {
        setCurrentElection(election);
        form.reset({
          title: election.title,
          description: election.description,
          startDate: parseISO(election.start_date),
          endDate: parseISO(election.end_date),
          status: election.status as any,
        });
        
        if (isMobile) {
          setIsDrawerOpen(true);
        } else {
          setIsDialogOpen(true);
        }
      }
    }
  }, [editElectionId, elections, form, isMobile]);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [electionsData, votersData, candidatesData] = await Promise.all([
        sqlService.getElections(),
        sqlService.getUsers('voter'),
        sqlService.getCandidates()
      ]);
      
      setElections(electionsData);
      setVoters(votersData);
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load election data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = async (data: ElectionFormData) => {
    try {
      const electionData = {
        title: data.title,
        description: data.description,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        status: data.status,
        createdBy: sqlService.getCurrentUser()?.id
      };
      
      let result;
      
      if (currentElection) {
        // Update existing election
        result = await sqlService.updateElection(currentElection.id, electionData);
        if (result.success) {
          toast.success('Election updated successfully!');
        }
      } else {
        // Create new election
        result = await sqlService.createElection(electionData);
        if (result.success) {
          toast.success('Election created successfully!');
        }
      }
      
      if (result?.success) {
        await fetchData();
        form.reset();
        setIsDialogOpen(false);
        setIsDrawerOpen(false);
        setCurrentElection(null);
        
        // Clear the edit parameter from URL
        if (editElectionId) {
          navigate('/admin/elections');
        }
      } else {
        throw new Error('Failed to save election');
      }
      
    } catch (error) {
      console.error('Error saving election:', error);
      toast.error('Failed to save election. Please try again.');
    }
  };
  
  const handleDeleteElection = async () => {
    if (!currentElection) return;
    
    try {
      const result = await sqlService.deleteElection(currentElection.id);
      
      if (result.success) {
        toast.success('Election deleted successfully!');
        await fetchData();
        setIsDeleteDialogOpen(false);
        setCurrentElection(null);
        
        // Clear the edit parameter from URL
        if (editElectionId) {
          navigate('/admin/elections');
        }
      } else {
        throw new Error('Failed to delete election');
      }
    } catch (error) {
      console.error('Error deleting election:', error);
      toast.error('Failed to delete election. Please try again.');
    }
  };
  
  const resetForm = () => {
    form.reset({
      title: '',
      description: '',
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      status: 'upcoming',
    });
    setCurrentElection(null);
  };
  
  const handleNewElection = () => {
    resetForm();
    if (isMobile) {
      setIsDrawerOpen(true);
    } else {
      setIsDialogOpen(true);
    }
  };
  
  const handleEditElection = (election: Election) => {
    setCurrentElection(election);
    form.reset({
      title: election.title,
      description: election.description,
      startDate: parseISO(election.start_date),
      endDate: parseISO(election.end_date),
      status: election.status as any,
    });
    
    if (isMobile) {
      setIsDrawerOpen(true);
    } else {
      setIsDialogOpen(true);
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'upcoming': return 'Upcoming';
      case 'active': return 'Active';
      case 'ended': return 'Ended';
      default: return 'Unknown';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'ended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return '';
    }
  };
  
  const CreateElectionForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Election Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Student Council Election" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the purpose and details of this election..." 
                  className="min-h-32"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon2 className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon2 className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < form.getValues().startDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The current status of this election
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          {currentElection && (
            <Button 
              type="button" 
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          )}
          <Button type="submit">{currentElection ? 'Update' : 'Create'} Election</Button>
        </div>
      </form>
    </Form>
  );
  
  const filteredElections = () => {
    return elections.filter(election => {
      if (activeTab === 'all') return true;
      return election.status === activeTab;
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Election Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage elections, view results and statistics.
          </p>
        </div>
        
        <Button className="mt-4 md:mt-0" onClick={handleNewElection}>
          <Plus className="mr-2 h-4 w-4" /> Create Election
        </Button>
      </div>
      
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full md:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="ended">Ended</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Skeleton className="h-5 w-20 mb-2" />
                      <Skeleton className="h-6 w-64" />
                      <Skeleton className="h-4 w-72 mt-1" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32 mt-1" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32 mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-28" />
                </CardFooter>
              </Card>
            ))
          ) : filteredElections().length === 0 ? (
            <ElectionEmptyState activeTab={activeTab} onCreateClick={handleNewElection} />
          ) : (
            filteredElections().map((election) => (
              <ElectionCard 
                key={election.id} 
                election={election} 
                onEditClick={() => handleEditElection(election)}
                onViewResultsClick={() => navigate(`/results?election=${election.id}`)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
      
      {/* Dialog for Desktop */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentElection ? 'Edit' : 'Create New'} Election</DialogTitle>
            <DialogDescription>
              {currentElection 
                ? 'Update the details of this election.'
                : 'Fill in the details to schedule a new election.'}
            </DialogDescription>
          </DialogHeader>
          <CreateElectionForm />
        </DialogContent>
      </Dialog>
      
      {/* Drawer for Mobile */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{currentElection ? 'Edit' : 'Create New'} Election</DrawerTitle>
            <DrawerDescription>
              {currentElection 
                ? 'Update the details of this election.'
                : 'Fill in the details to schedule a new election.'}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto max-h-[70vh]">
            <CreateElectionForm />
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the election "{currentElection?.title}".
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteElection} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface ElectionCardProps {
  election: Election;
  onEditClick: () => void;
  onViewResultsClick: () => void;
}

const ElectionCard = ({ election, onEditClick, onViewResultsClick }: ElectionCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'ended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return '';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mb-2", 
              getStatusColor(election.status)
            )}>
              {election.status}
            </span>
            <CardTitle>{election.title}</CardTitle>
            <CardDescription className="mt-1">{election.description}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onEditClick}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium">Start Date</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(election.start_date), "PPP")}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">End Date</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(election.end_date), "PPP")}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{election.candidate_count || 0} Candidates</span>
          </div>
          <div className="flex items-center">
            <VoteIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{election.vote_count || 0} Votes</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onEditClick}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        
        <div className="flex space-x-2">
          {election.status === 'ended' && (
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          <Button size="sm" onClick={onViewResultsClick}>
            View Results
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

interface EmptyStateProps {
  activeTab: string;
  onCreateClick: () => void;
}

const ElectionEmptyState = ({ activeTab, onCreateClick }: EmptyStateProps) => {
  let icon = <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />;
  let title = '';
  let description = '';
  
  switch (activeTab) {
    case 'draft':
      title = 'No Draft Elections';
      description = 'There are no elections in draft mode.';
      break;
    case 'upcoming':
      title = 'No Upcoming Elections';
      description = 'There are no upcoming elections scheduled.';
      break;
    case 'active':
      icon = <VoteIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />;
      title = 'No Active Elections';
      description = 'There are no elections currently in progress.';
      break;
    case 'ended':
      title = 'No Past Elections';
      description = 'There are no completed elections.';
      break;
    default:
      title = 'No Elections Found';
      description = 'There are no elections in the system.';
  }
  
  return (
    <div className="text-center p-8 border rounded-lg">
      {icon}
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground mt-1">{description}</p>
      <Button variant="outline" className="mt-4" onClick={onCreateClick}>
        Create Election
      </Button>
    </div>
  );
};

export default ElectionManagement;
