
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Vote, Shield, User, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { sqlService } from '@/services/sql';

const Login = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'admin' | 'voter' | 'candidate'>('voter');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Call the actual backend authentication API
      const result = await sqlService.loginUser({ email, password });
      
      if (result.success) {
        toast.success('Logged in successfully!');
        
        // Redirect based on user role from the API response
        switch (result.user.role) {
          case 'admin':
            navigate('/dashboard');
            break;
          case 'voter':
            navigate('/vote');
            break;
          case 'candidate':
            navigate('/results');
            break;
          default:
            navigate('/');
        }
      } else {
        toast.error(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle user type selection and populate demo credentials
  const handleUserTypeSelect = (type: 'admin' | 'voter' | 'candidate') => {
    setUserType(type);
    
    // Populate with demo credentials based on type
    switch (type) {
      case 'admin':
        setEmail('admin@votex.com');
        setPassword('admin123');
        break;
      case 'voter':
        setEmail('voter@example.com');
        setPassword('voter123');
        break;
      case 'candidate':
        setEmail('candidate@example.com');
        setPassword('candidate123');
        break;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16 flex items-center justify-center p-4 md:p-6">
        <Card className="glass-card w-full max-w-md p-6 animate-scale-in">
          <div className="text-center mb-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Vote className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Welcome to VoteX</h1>
            <p className="text-muted-foreground mt-1">
              Sign in to access your account
            </p>
          </div>
          
          <Tabs 
            defaultValue="voter" 
            value={userType}
            onValueChange={(value) => handleUserTypeSelect(value as 'admin' | 'voter' | 'candidate')}
            className="mb-6"
          >
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="voter" className="flex items-center justify-center">
                <User className="h-4 w-4 mr-2" />
                <span>Voter</span>
              </TabsTrigger>
              <TabsTrigger value="candidate" className="flex items-center justify-center">
                <Users className="h-4 w-4 mr-2" />
                <span>Candidate</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center justify-center">
                <Shield className="h-4 w-4 mr-2" />
                <span>Admin</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="voter" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <a 
                      href="#" 
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="candidate" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate-email">Email</Label>
                  <Input
                    id="candidate-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="candidate-password">Password</Label>
                    <a 
                      href="#" 
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="candidate-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="admin" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@votex.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="admin-password">Password</Label>
                    <a 
                      href="#" 
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="text-center mt-6 space-y-4">
            <div className="text-sm text-muted-foreground">
              <span>Don't have an account? </span>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/signup')}
            >
              Register as Voter or Candidate
            </Button>
          </div>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
