
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Vote } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SignupForm from '@/components/signup/SignupForm';

const Signup = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16 flex items-center justify-center p-4 md:p-6">
        <Card className="glass-card w-full max-w-md p-6 animate-scale-in">
          <div className="text-center mb-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Vote className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Create an Account</h1>
            <p className="text-muted-foreground mt-1">
              Join VoteX as a voter or candidate
            </p>
          </div>
          
          <SignupForm />
          
          <div className="text-center text-sm text-muted-foreground mt-6">
            <span>Already have an account? </span>
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Signup;
