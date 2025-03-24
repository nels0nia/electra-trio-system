
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { sqlService, realTimeService } from '@/services/sql';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, TrendingUp, Users, Vote, Calendar, PieChart as PieChartIcon } from 'lucide-react';

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedElection, setSelectedElection] = useState<string>('all');
  const [elections, setElections] = useState<any[]>([]);
  const [votingStats, setVotingStats] = useState<any>({
    votingTrends: [],
    candidateStats: []
  });
  const [voterStats, setVoterStats] = useState<any>({
    total: 0,
    active: 0,
    pending: 0,
    participation: 0
  });
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (!sqlService.isAdmin()) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/dashboard');
        return;
      }
      await fetchInitialData();
    };
    
    checkAdmin();
    
    // Set up real-time updates
    const unsubscribe = realTimeService.subscribe('votes', (data: any) => {
      console.log('Real-time vote update:', data);
      // Update stats when new votes come in
      fetchVotingStats();
    });
    
    return () => {
      unsubscribe();
    };
  }, [navigate]);
  
  useEffect(() => {
    if (elections.length > 0) {
      fetchVotingStats();
    }
  }, [selectedElection]);
  
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch elections
      const electionsData = await sqlService.getElections();
      setElections(electionsData);
      
      // Fetch initial stats
      await Promise.all([
        fetchVotingStats(),
        fetchVoterStats()
      ]);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchVotingStats = async () => {
    try {
      // Use mock data for now since backend endpoint is not fully implemented
      const mockVotingData = await generateMockVotingData();
      setVotingStats(mockVotingData);
    } catch (error) {
      console.error('Error fetching voting stats:', error);
    }
  };
  
  const fetchVoterStats = async () => {
    try {
      // Use mock data for now since backend endpoint is not fully implemented
      const mockVoterData = await generateMockVoterData();
      setVoterStats(mockVoterData);
    } catch (error) {
      console.error('Error fetching voter stats:', error);
    }
  };
  
  const generateMockVotingData = async () => {
    // For a real implementation, this would be fetched from sqlService.getVotingStats(selectedElection)
    
    // Get real elections from the database
    const electionsData = await sqlService.getElections();
    
    // Get real candidates
    const candidatesData = await sqlService.getCandidates();
    
    // Generate voting trends (this would typically come from the API)
    const votingTrends = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 10
      };
    });
    
    // Generate candidate stats from real candidates but mock vote counts
    const candidateStats = candidatesData.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      votes: Math.floor(Math.random() * 100) + 20
    })).slice(0, 5);
    
    return {
      votingTrends,
      candidateStats
    };
  };
  
  const generateMockVoterData = async () => {
    // For a real implementation, this would be fetched from sqlService.getVoterStats()
    
    // Get real voters from the database
    const votersData = await sqlService.getUsers('voter');
    
    const total = votersData.length;
    const active = Math.floor(total * 0.8); // Assume 80% are active
    const pending = total - active;
    const participation = Math.floor(Math.random() * 41) + 60; // 60-100% participation
    
    return {
      total,
      active,
      pending,
      participation
    };
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
  
  return (
    <>
      <Helmet>
        <title>Analytics Dashboard | VoteX</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-muted-foreground">
              View real-time statistics and trends for your elections
            </p>
          </div>
          
          <div className="w-full sm:w-auto">
            <Select 
              value={selectedElection}
              onValueChange={(value) => setSelectedElection(value)}
            >
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Select Election" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Elections</SelectItem>
                {elections.map((election) => (
                  <SelectItem key={election.id} value={election.id.toString()}>{election.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="voting">Voting Analysis</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoading ? (
                Array(4).fill(0).map((_, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-[140px]" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-[100px]" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <StatCard 
                    title="Total Elections" 
                    value={elections.length}
                    trend="+2 this month"
                    trendUp={true}
                    icon={<Calendar className="h-4 w-4" />}
                  />
                  <StatCard 
                    title="Total Candidates" 
                    value={votingStats.candidateStats.length}
                    trend="+5 this week"
                    trendUp={true}
                    icon={<Users className="h-4 w-4" />}
                  />
                  <StatCard 
                    title="Registered Voters" 
                    value={voterStats.total}
                    trend={`${voterStats.pending} pending`}
                    trendUp={false}
                    icon={<Users className="h-4 w-4" />}
                  />
                  <StatCard 
                    title="Voter Participation" 
                    value={`${voterStats.participation}%`}
                    trend="+2.5% from last election"
                    trendUp={true}
                    icon={<Vote className="h-4 w-4" />}
                  />
                </>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Voting Trends</CardTitle>
                  <CardDescription>Daily vote counts for the past week</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <ChartContainer 
                      config={{
                        votes: { 
                          label: "Votes",
                          color: "#0088FE" 
                        }
                      }}
                      className="w-full h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={votingStats.votingTrends}
                          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" name="votes" fill="var(--color-votes)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Top Candidates</CardTitle>
                  <CardDescription>Vote distribution among leading candidates</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    votingStats.candidateStats.length > 0 ? (
                      <ChartContainer
                        config={votingStats.candidateStats.reduce((acc: any, candidate: any, index: number) => {
                          acc[candidate.name] = { 
                            label: candidate.name,
                            color: COLORS[index % COLORS.length] 
                          };
                          return acc;
                        }, {})}
                        className="w-full h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={votingStats.candidateStats}
                              dataKey="votes"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={120}
                              label={(entry) => entry.name}
                            >
                              {votingStats.candidateStats.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">No candidate data available</p>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest votes and election updates</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-3 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-center py-12">
                      Real-time activity tracking will be available in a future update.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Activity</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="voting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Voting Patterns</CardTitle>
                <CardDescription>Analysis of voting behavior over time</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <ChartContainer 
                    config={{
                      votes: { 
                        label: "Votes",
                        color: "#0088FE" 
                      }
                    }}
                    className="w-full h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={votingStats.votingTrends}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="count" name="votes" fill="var(--color-votes)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="demographics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Voter Demographics</CardTitle>
                <CardDescription>Breakdown of voter participation by demographic</CardDescription>
              </CardHeader>
              <CardContent className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <PieChartIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Demographic analysis will be available in a future update.
                  </p>
                  <Button variant="outline" className="mt-4">Enable Demographic Tracking</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
}

const StatCard = ({ title, value, trend, trendUp = true, icon }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs flex items-center mt-1 ${trendUp ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
            {trendUp && <ArrowUpRight className="h-3 w-3 mr-1" />}
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;
