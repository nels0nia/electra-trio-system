
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarClock, Users, VoteIcon, Award, BarChart3 } from 'lucide-react';
import { sqlService } from '@/services/sql';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface Election {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  candidate_count: number;
  vote_count: number;
}

interface Stats {
  totalElections: number;
  activeElections: number;
  totalCandidates: number;
  totalVoters: number;
  totalVotes: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalElections: 0,
    activeElections: 0,
    totalCandidates: 0,
    totalVoters: 0,
    totalVotes: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const user = sqlService.getCurrentUser();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch elections
      const electionsData = await sqlService.getElections();
      setElections(electionsData);

      // Calculate statistics
      const now = new Date();
      const activeElections = electionsData.filter(e => 
        new Date(e.start_date) <= now && new Date(e.end_date) >= now
      ).length;

      // Get voter and candidate counts
      const voters = await sqlService.getUsers('voter');
      const candidates = await sqlService.getCandidates();

      // Calculate total votes from all elections
      const totalVotes = electionsData.reduce((sum, election) => sum + (election.vote_count || 0), 0);

      setStats({
        totalElections: electionsData.length,
        activeElections,
        totalCandidates: candidates.length,
        totalVoters: voters.length,
        totalVotes
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getElectionStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'ended':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
      default:
        return '';
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | VoteX</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {isAdmin ? 'Admin Dashboard' : 'Voter Dashboard'}
        </h1>

        {isAdmin && (
          <div className="mb-8 flex flex-wrap gap-4">
            <Button onClick={() => navigate('/admin/elections')}>
              Manage Elections
            </Button>
            <Button onClick={() => navigate('/admin/candidates')}>
              Manage Candidates
            </Button>
            <Button onClick={() => navigate('/admin/users')}>
              Manage Voters
            </Button>
            <Button onClick={() => navigate('/admin/analytics')}>
              View Analytics
            </Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="elections">Elections</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-20" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <StatCard 
                    title="Total Elections" 
                    value={stats.totalElections}
                    icon={<CalendarClock className="h-5 w-5" />}
                  />
                  <StatCard 
                    title={stats.activeElections === 1 ? "Active Election" : "Active Elections"} 
                    value={stats.activeElections}
                    icon={<VoteIcon className="h-5 w-5" />}
                    highlight={stats.activeElections > 0}
                  />
                  <StatCard 
                    title="Registered Candidates" 
                    value={stats.totalCandidates}
                    icon={<Award className="h-5 w-5" />}
                  />
                  <StatCard 
                    title="Registered Voters" 
                    value={stats.totalVoters}
                    icon={<Users className="h-5 w-5" />}
                  />
                </>
              )}
            </div>

            {stats.activeElections > 0 && (
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30">
                <VoteIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle>Active Elections</AlertTitle>
                <AlertDescription>
                  There {stats.activeElections === 1 ? 'is' : 'are'} currently {stats.activeElections} active election{stats.activeElections === 1 ? '' : 's'}.
                  {!isAdmin && <> Go to the <Button onClick={() => navigate('/vote')} variant="link" className="p-0 h-auto text-green-600 dark:text-green-400">voting page</Button> to cast your vote.</>}
                </AlertDescription>
              </Alert>
            )}

            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest events on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      ))
                    ) : (
                      stats.totalVotes === 0 ? (
                        <p className="text-muted-foreground">No recent voting activity recorded yet.</p>
                      ) : (
                        <p className="text-muted-foreground">A total of {stats.totalVotes} votes have been cast across all elections.</p>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="elections" className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">All Elections</h2>
            
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="mb-4">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : elections.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No elections have been created yet.</p>
                  {isAdmin && (
                    <div className="text-center mt-4">
                      <Button onClick={() => navigate('/admin/elections')}>Create an Election</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              elections.map((election) => (
                <Card key={election.id} className="mb-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mb-2 ${getElectionStatusClass(election.status)}`}>
                          {election.status}
                        </span>
                        <CardTitle>{election.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription>{election.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
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
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{election.candidate_count || 0} Candidates</span>
                      </div>
                      <div className="flex items-center">
                        <VoteIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{election.vote_count || 0} Votes</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {election.status === 'active' && !isAdmin && (
                      <Button onClick={() => navigate('/vote')}>
                        Vote Now
                      </Button>
                    )}
                    {isAdmin && (
                      <Button onClick={() => navigate(`/admin/elections?edit=${election.id}`)}>
                        Manage
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/results?election=${election.id}`)}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Results
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  highlight?: boolean;
}

const StatCard = ({ title, value, icon, highlight }: StatCardProps) => (
  <Card className={highlight ? 'border-green-400 dark:border-green-600' : ''}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default Dashboard;
