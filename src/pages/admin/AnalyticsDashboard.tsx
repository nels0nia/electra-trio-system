
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { CalendarDays, Users, Vote, TrendingUp, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { sqlService } from '@/services/sql';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [selectedElection, setSelectedElection] = useState<string>('all');
  const [elections, setElections] = useState<any[]>([]);
  const [votingData, setVotingData] = useState<any[]>([]);
  const [candidateData, setCandidateData] = useState<any[]>([]);
  const [voterStats, setVoterStats] = useState<any>({
    total: 0,
    active: 0,
    pending: 0,
    participation: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds
  
  // Check if user is admin
  useEffect(() => {
    const currentUser = sqlService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Unauthorized access. Please log in as admin.');
      navigate('/login');
    } else {
      loadData();
      
      // Set up real-time refresh
      const intervalId = setInterval(() => {
        loadData();
      }, refreshInterval * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [navigate, refreshInterval, selectedElection]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load elections
      const fetchedElections = await sqlService.getElections();
      setElections(fetchedElections || []);
      
      // Load voting data for the selected election or all elections
      const votingStats = await sqlService.getVotingStats(selectedElection);
      setVotingData(votingStats?.votingTrends || []);
      setCandidateData(votingStats?.candidateStats || []);
      
      // Load voter statistics
      const voterStatistics = await sqlService.getVoterStats();
      setVoterStats(voterStatistics || {
        total: 0,
        active: 0,
        pending: 0,
        participation: 0
      });
      
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('Failed to load analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = () => {
    toast.info(`Refreshing data...`);
    loadData();
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time voting analytics and statistics
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          <Select value={selectedElection} onValueChange={setSelectedElection}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select Election" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Elections</SelectItem>
              {elections.map(election => (
                <SelectItem key={election.id} value={election.id.toString()}>
                  {election.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Refresh Rate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Refresh: 10s</SelectItem>
              <SelectItem value="30">Refresh: 30s</SelectItem>
              <SelectItem value="60">Refresh: 1m</SelectItem>
              <SelectItem value="300">Refresh: 5m</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Voters</p>
                <h3 className="text-2xl font-bold">{voterStats.total}</h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Voters</p>
                <h3 className="text-2xl font-bold">{voterStats.active}</h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                <Vote className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Elections</p>
                <h3 className="text-2xl font-bold">
                  {elections.filter(e => e.status === 'active').length}
                </h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Participation Rate</p>
                <h3 className="text-2xl font-bold">{voterStats.participation}%</h3>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">Candidate Performance</TabsTrigger>
          <TabsTrigger value="trends">Voting Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voter Participation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Loading data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Voted', value: voterStats.active },
                          { name: 'Not Voted', value: voterStats.total - voterStats.active }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Voted', value: voterStats.active },
                          { name: 'Not Voted', value: voterStats.total - voterStats.active }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Elections Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">Loading data...</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Active', value: elections.filter(e => e.status === 'active').length },
                            { name: 'Upcoming', value: elections.filter(e => e.status === 'upcoming').length },
                            { name: 'Ended', value: elections.filter(e => e.status === 'ended').length }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Active', value: elections.filter(e => e.status === 'active').length },
                            { name: 'Upcoming', value: elections.filter(e => e.status === 'upcoming').length },
                            { name: 'Ended', value: elections.filter(e => e.status === 'ended').length }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">Loading data...</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Voters', count: voterStats.total || 0 },
                          { name: 'Candidates', count: candidateData.length || 0 },
                          { name: 'Admins', count: 1 }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Vote Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Loading data...</p>
                  </div>
                ) : candidateData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={candidateData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="votes" fill="#8884d8" name="Votes" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No candidate data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voting Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Loading data...</p>
                  </div>
                ) : votingData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={votingData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="votes" fill="#82ca9d" name="Votes" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No voting trend data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
