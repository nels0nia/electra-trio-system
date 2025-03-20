import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, Plus, Users, Vote, ArrowUpDown, MoreHorizontal, Calendar as CalendarIcon2, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { sqlService } from '@/services/sql';

const electionSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
  allowedVoters: z.array(z.string()).optional(),
  allowedCandidates: z.array(z.string()).optional(),
});

type ElectionFormData = z.infer<typeof electionSchema>;

const mockVoters = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com' },
  { id: '3', name: 'Charlie Davis', email: 'charlie@example.com' },
  { id: '4', name: 'Diana Evans', email: 'diana@example.com' },
  { id: '5', name: 'Evan Harris', email: 'evan@example.com' },
];

const mockCandidates = [
  { id: '1', name: 'Alex Morgan', party: 'Progress Party', email: 'alex@example.com' },
  { id: '2', name: 'Blake Jordan', party: 'Unity Alliance', email: 'blake@example.com' },
  { id: '3', name: 'Casey Reynolds', party: 'Independent', email: 'casey@example.com' },
];

const mockElections = [
  {
    id: '1',
    title: 'Student Council President',
    description: 'Election for the position of Student Council President for the 2025 academic year.',
    startDate: new Date('2025-04-10'),
    endDate: new Date('2025-04-15'),
    status: 'upcoming',
    candidates: 3,
    voters: 120,
  },
  {
    id: '2',
    title: 'Class Representative',
    description: 'Select your class representative for the Fall semester.',
    startDate: new Date('2025-03-25'),
    endDate: new Date('2025-03-28'),
    status: 'active',
    candidates: 4,
    voters: 45,
  },
  {
    id: '3',
    title: 'Faculty Board Member',
    description: 'Vote for faculty board members to represent student interests.',
    startDate: new Date('2025-02-15'),
    endDate: new Date('2025-02-20'),
    status: 'ended',
    candidates: 5,
    voters: 200,
    results: [
      { candidateId: '1', candidateName: 'Dr. Maxwell', votes: 85 },
      { candidateId: '2', candidateName: 'Prof. Sanders', votes: 65 },
      { candidateId: '3', candidateName: 'Dr. Walker', votes: 50 },
    ]
  },
];

const ElectionManagement = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const form = useForm<ElectionFormData>({
    resolver: zodResolver(electionSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      allowedVoters: [],
      allowedCandidates: [],
    }
  });
  
  const onSubmit = async (data: ElectionFormData) => {
    try {
      console.log('Election form data:', data);
      
      const result = await sqlService.createElection(data);
      
      if (result.success) {
        toast.success('Election created successfully!');
        
        form.reset();
        setIsDialogOpen(false);
        setIsDrawerOpen(false);
      } else {
        throw new Error('Failed to create election');
      }
      
    } catch (error) {
      console.error('Error creating election:', error);
      toast.error('Failed to create election. Please try again.');
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'ended':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
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
                      disabled={(date) => date < new Date()}
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
          name="allowedVoters"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Eligible Voters</FormLabel>
                <FormDescription>
                  Select which registered voters can participate in this election.
                </FormDescription>
              </div>
              <div className="space-y-2">
                {mockVoters.map((voter) => (
                  <FormField
                    key={voter.id}
                    control={form.control}
                    name="allowedVoters"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={voter.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(voter.id)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                return checked
                                  ? field.onChange([...currentValues, voter.id])
                                  : field.onChange(currentValues.filter((id) => id !== voter.id));
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium">
                              {voter.name}
                            </FormLabel>
                            <FormDescription className="text-xs">
                              {voter.email}
                            </FormDescription>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="allowedCandidates"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Eligible Candidates</FormLabel>
                <FormDescription>
                  Select which registered candidates can participate in this election.
                </FormDescription>
              </div>
              <div className="space-y-2">
                {mockCandidates.map((candidate) => (
                  <FormField
                    key={candidate.id}
                    control={form.control}
                    name="allowedCandidates"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={candidate.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(candidate.id)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                return checked
                                  ? field.onChange([...currentValues, candidate.id])
                                  : field.onChange(currentValues.filter((id) => id !== candidate.id));
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium">
                              {candidate.name}
                            </FormLabel>
                            <FormDescription className="text-xs">
                              {candidate.party} • {candidate.email}
                            </FormDescription>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">Create Election</Button>
      </form>
    </Form>
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Election Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage elections, candidates, and voters.
          </p>
        </div>
        
        {isMobile ? (
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <Plus className="mr-2 h-4 w-4" /> Create Election
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Create New Election</DrawerTitle>
                <DrawerDescription>
                  Fill in the details to schedule a new election.
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
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Election
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Election</DialogTitle>
                <DialogDescription>
                  Fill in the details to schedule a new election.
                </DialogDescription>
              </DialogHeader>
              <CreateElectionForm />
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="ended">Ended</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {mockElections.filter(e => e.status === 'upcoming').map((election) => (
            <ElectionCard key={election.id} election={election} />
          ))}
          {mockElections.filter(e => e.status === 'upcoming').length === 0 && (
            <div className="text-center p-8 border rounded-lg">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Upcoming Elections</h3>
              <p className="text-muted-foreground mt-1">
                There are no upcoming elections scheduled at the moment.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => isMobile ? setIsDrawerOpen(true) : setIsDialogOpen(true)}
              >
                Create Election
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {mockElections.filter(e => e.status === 'active').map((election) => (
            <ElectionCard key={election.id} election={election} />
          ))}
          {mockElections.filter(e => e.status === 'active').length === 0 && (
            <div className="text-center p-8 border rounded-lg">
              <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Active Elections</h3>
              <p className="text-muted-foreground mt-1">
                There are no elections currently in progress.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="ended" className="space-y-4">
          {mockElections.filter(e => e.status === 'ended').map((election) => (
            <ElectionCard key={election.id} election={election} />
          ))}
          {mockElections.filter(e => e.status === 'ended').length === 0 && (
            <div className="text-center p-8 border rounded-lg">
              <MoreHorizontal className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Past Elections</h3>
              <p className="text-muted-foreground mt-1">
                There are no completed elections to display.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ElectionCardProps {
  election: {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: string;
    candidates: number;
    voters: number;
    results?: Array<{ candidateId: string; candidateName: string; votes: number }>;
  };
}

const ElectionCard = ({ election }: ElectionCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'ended':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
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
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium">Start Date</p>
            <p className="text-sm text-muted-foreground">
              {format(election.startDate, "PPP")}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">End Date</p>
            <p className="text-sm text-muted-foreground">
              {format(election.endDate, "PPP")}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{election.candidates} Candidates</span>
          </div>
          <div className="flex items-center">
            <Vote className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{election.voters} Voters</span>
          </div>
        </div>
        
        {election.status === 'ended' && election.results && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Results:</p>
            <div className="space-y-2">
              {election.results.map((result) => (
                <div key={result.candidateId} className="flex justify-between items-center">
                  <span className="text-sm">{result.candidateName}</span>
                  <span className="text-sm font-medium">{result.votes} votes</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          {election.status === 'upcoming' ? 'Edit' : 
           election.status === 'active' ? 'View Live' : 'View Details'}
        </Button>
        {election.status === 'ended' && (
          <Button size="sm">
            Export Results
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ElectionManagement;
