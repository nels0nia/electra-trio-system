
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Vote, 
  Users, 
  BarChart, 
  Menu, 
  X, 
  LogOut,
  User
} from 'lucide-react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // This would come from your auth context in a real app
  const userType = localStorage.getItem('userType') || 'none'; // admin, voter, candidate, none
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleLogin = () => {
    navigate('/login');
  };
  
  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('userType');
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <NavLink to="/" className="flex items-center space-x-2">
          <Vote className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">VoteX</span>
        </NavLink>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink 
            to="/" 
            className={({isActive}) => cn("nav-link", isActive && "active")}
            end
          >
            Home
          </NavLink>
          
          {userType === 'admin' && (
            <>
              <NavLink 
                to="/dashboard" 
                className={({isActive}) => cn("nav-link", isActive && "active")}
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/results" 
                className={({isActive}) => cn("nav-link", isActive && "active")}
              >
                Results
              </NavLink>
            </>
          )}
          
          {userType === 'voter' && (
            <NavLink 
              to="/vote" 
              className={({isActive}) => cn("nav-link", isActive && "active")}
            >
              Vote
            </NavLink>
          )}
          
          {userType === 'candidate' && (
            <NavLink 
              to="/results" 
              className={({isActive}) => cn("nav-link", isActive && "active")}
            >
              Results
            </NavLink>
          )}
          
          <NavLink 
            to="/candidates" 
            className={({isActive}) => cn("nav-link", isActive && "active")}
          >
            Candidates
          </NavLink>
        </nav>
        
        <div className="hidden md:flex items-center space-x-3">
          {userType === 'none' ? (
            <Button onClick={handleLogin} variant="default" className="btn-primary">
              Log In
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground capitalize">{userType}</span>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="ghost" 
                size="icon"
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-md text-foreground"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-border/50 animate-fade-in">
          <div className="px-4 py-3 space-y-3">
            <NavLink 
              to="/" 
              className={({isActive}) => cn(
                "block py-2.5 px-3 rounded-lg", 
                isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
              )}
              onClick={toggleMobileMenu}
              end
            >
              Home
            </NavLink>
            
            {userType === 'admin' && (
              <>
                <NavLink 
                  to="/dashboard" 
                  className={({isActive}) => cn(
                    "block py-2.5 px-3 rounded-lg", 
                    isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                  )}
                  onClick={toggleMobileMenu}
                >
                  Dashboard
                </NavLink>
                <NavLink 
                  to="/results" 
                  className={({isActive}) => cn(
                    "block py-2.5 px-3 rounded-lg", 
                    isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                  )}
                  onClick={toggleMobileMenu}
                >
                  Results
                </NavLink>
              </>
            )}
            
            {userType === 'voter' && (
              <NavLink 
                to="/vote" 
                className={({isActive}) => cn(
                  "block py-2.5 px-3 rounded-lg", 
                  isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                )}
                onClick={toggleMobileMenu}
              >
                Vote
              </NavLink>
            )}
            
            {userType === 'candidate' && (
              <NavLink 
                to="/results" 
                className={({isActive}) => cn(
                  "block py-2.5 px-3 rounded-lg", 
                  isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                )}
                onClick={toggleMobileMenu}
              >
                Results
              </NavLink>
            )}
            
            <NavLink 
              to="/candidates" 
              className={({isActive}) => cn(
                "block py-2.5 px-3 rounded-lg", 
                isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
              )}
              onClick={toggleMobileMenu}
            >
              Candidates
            </NavLink>
            
            <div className="pt-2 border-t border-border/50">
              {userType === 'none' ? (
                <Button onClick={() => { handleLogin(); toggleMobileMenu(); }} className="w-full btn-primary">
                  Log In
                </Button>
              ) : (
                <Button 
                  onClick={() => { handleLogout(); toggleMobileMenu(); }} 
                  variant="outline" 
                  className="w-full flex items-center justify-center space-x-2 text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log Out</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
