
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Menu, User, BarChart3, Settings, Vote, Users } from 'lucide-react';
import { sqlService } from '@/services/sql';
import { toast } from 'sonner';

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = sqlService.getCurrentUser();
  const isAdmin = user?.role === 'admin';
  const isLoggedIn = !!user;

  const handleLogout = () => {
    sqlService.clearToken();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="border-b bg-white dark:bg-gray-950">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center">
          <span className="self-center text-2xl font-semibold text-primary">VoteX</span>
        </Link>
        
        <div className="flex items-center md:order-2 space-x-3 rtl:space-x-reverse">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg" alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground mt-1 capitalize">
                      {user.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="w-full cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/elections" className="w-full cursor-pointer">
                        <Vote className="mr-2 h-4 w-4" />
                        <span>Election Management</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/users" className="w-full cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        <span>User Management</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/candidates" className="w-full cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Candidate Management</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/analytics" className="w-full cursor-pointer">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Analytics</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button onClick={() => navigate('/signup')}>
                Sign up
              </Button>
            </div>
          )}
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>VoteX</SheetTitle>
                <SheetDescription>
                  Secure Voting Platform
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col space-y-2">
                <Link 
                  to="/" 
                  className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                
                {isLoggedIn && (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/vote" 
                      className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Vote
                    </Link>
                    <Link 
                      to="/candidates" 
                      className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Candidates
                    </Link>
                    <Link 
                      to="/results" 
                      className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Results
                    </Link>
                    
                    {isAdmin && (
                      <>
                        <div className="my-2 border-t pt-2">
                          <p className="px-4 text-sm font-medium text-muted-foreground">Admin</p>
                        </div>
                        <Link 
                          to="/admin/elections" 
                          className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Election Management
                        </Link>
                        <Link 
                          to="/admin/users" 
                          className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          User Management
                        </Link>
                        <Link 
                          to="/admin/candidates" 
                          className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Candidate Management
                        </Link>
                        <Link 
                          to="/admin/analytics" 
                          className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Analytics
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
              
              {isLoggedIn ? (
                <Button 
                  variant="outline" 
                  className="mt-6 w-full" 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              ) : (
                <div className="mt-6 grid gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Log in
                  </Button>
                  <Button 
                    onClick={() => {
                      navigate('/signup');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="hidden w-full md:flex md:w-auto md:order-1">
          <div className="flex space-x-8 rtl:space-x-reverse">
            <Link to="/" className="py-2 text-gray-900 dark:text-white hover:text-primary">
              Home
            </Link>
            
            {isLoggedIn && (
              <>
                <Link to="/dashboard" className="py-2 text-gray-900 dark:text-white hover:text-primary">
                  Dashboard
                </Link>
                <Link to="/vote" className="py-2 text-gray-900 dark:text-white hover:text-primary">
                  Vote
                </Link>
                <Link to="/candidates" className="py-2 text-gray-900 dark:text-white hover:text-primary">
                  Candidates
                </Link>
                <Link to="/results" className="py-2 text-gray-900 dark:text-white hover:text-primary">
                  Results
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
