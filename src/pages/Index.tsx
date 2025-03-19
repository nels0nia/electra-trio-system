
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Vote, ShieldCheck, BarChart, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5" />
          <div className="absolute inset-0 z-10 backdrop-blur-[100px]" />
          
          <div className="container relative z-20 px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="max-w-xl space-y-6 animate-fade-up">
                <div className="chip bg-primary/20 text-primary">
                  Modern Voting Solution
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                  Secure &amp; Transparent Electronic Voting
                </h1>
                <p className="text-lg text-muted-foreground">
                  Experience a new era of democracy with our advanced e-voting platform.
                  Designed for security, transparency, and accessibility.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="btn-primary"
                    onClick={() => navigate('/login')}
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outline" 
                    className="btn-outline"
                    onClick={() => navigate('/candidates')}
                  >
                    View Candidates
                  </Button>
                </div>
              </div>
              
              <div className="relative mx-auto aspect-square max-w-md animate-float">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-primary/10 blur-3xl" />
                <div className="glass-card rounded-3xl overflow-hidden h-full flex items-center justify-center relative z-10">
                  <div className="p-8">
                    <Vote className="h-32 w-32 text-primary mx-auto mb-4" />
                    <h2 className="text-xl font-medium text-center">VoteX Platform</h2>
                    <p className="text-muted-foreground text-center mt-2">
                      Empowering democracy through technology
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16 animate-fade-up">
              <h2 className="text-3xl font-bold mb-4">Key Features</h2>
              <p className="text-muted-foreground">
                Our platform combines cutting-edge technology with a user-friendly interface
                to deliver a seamless voting experience.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card p-6 transition-all duration-300 hover:shadow-lg animate-fade-up" style={{ animationDelay: '100ms' }}>
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Voting</h3>
                <p className="text-muted-foreground">
                  End-to-end encryption ensures your vote remains private and tamper-proof.
                  Advanced security measures protect against fraud and manipulation.
                </p>
              </Card>
              
              <Card className="glass-card p-6 transition-all duration-300 hover:shadow-lg animate-fade-up" style={{ animationDelay: '200ms' }}>
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Results</h3>
                <p className="text-muted-foreground">
                  Watch election results unfold in real-time with beautiful visualizations.
                  Transparent counting process visible to all participants.
                </p>
              </Card>
              
              <Card className="glass-card p-6 transition-all duration-300 hover:shadow-lg animate-fade-up" style={{ animationDelay: '300ms' }}>
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Candidate Profiles</h3>
                <p className="text-muted-foreground">
                  Access detailed information about candidates to make informed decisions.
                  Compare policies, backgrounds, and qualifications seamlessly.
                </p>
              </Card>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-up">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground">
                Our voting process is designed to be simple, secure, and accessible to all.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-border" />
              
              {/* Steps */}
              <div className="relative glass-card p-6 text-center animate-fade-up" style={{ animationDelay: '100ms' }}>
                <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="text-primary-foreground font-medium">1</span>
                </div>
                <h3 className="font-semibold mb-2">Register</h3>
                <p className="text-sm text-muted-foreground">
                  Create your secure account with proper verification
                </p>
              </div>
              
              <div className="relative glass-card p-6 text-center animate-fade-up" style={{ animationDelay: '200ms' }}>
                <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="text-primary-foreground font-medium">2</span>
                </div>
                <h3 className="font-semibold mb-2">Authenticate</h3>
                <p className="text-sm text-muted-foreground">
                  Log in with secure multi-factor authentication
                </p>
              </div>
              
              <div className="relative glass-card p-6 text-center animate-fade-up" style={{ animationDelay: '300ms' }}>
                <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="text-primary-foreground font-medium">3</span>
                </div>
                <h3 className="font-semibold mb-2">Vote</h3>
                <p className="text-sm text-muted-foreground">
                  Cast your vote easily in active elections
                </p>
              </div>
              
              <div className="relative glass-card p-6 text-center animate-fade-up" style={{ animationDelay: '400ms' }}>
                <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="text-primary-foreground font-medium">4</span>
                </div>
                <h3 className="font-semibold mb-2">Track Results</h3>
                <p className="text-sm text-muted-foreground">
                  View real-time results and final outcomes
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="glass-card overflow-hidden rounded-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div className="p-8 md:p-12 space-y-5">
                  <h2 className="text-3xl font-bold">Ready to experience modern voting?</h2>
                  <p className="text-muted-foreground">
                    Join thousands of users who have already discovered the future of democratic participation.
                    Sign up today to get started.
                  </p>
                  <div className="pt-2">
                    <Button 
                      className="btn-primary"
                      onClick={() => navigate('/login')}
                    >
                      Get Started Now
                    </Button>
                  </div>
                </div>
                <div className="aspect-video w-full h-full relative overflow-hidden lg:rounded-l-3xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Vote className="h-24 w-24 text-white mx-auto mb-4" />
                      <h3 className="text-2xl font-semibold text-white">VoteX</h3>
                      <p className="text-white/80 mt-2">Secure. Transparent. Accessible.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
