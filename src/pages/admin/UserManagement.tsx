
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { User, UserPlus, Edit, Trash2, Search, MoreHorizontal } from 'lucide-react';
import { sqlService } from '@/services/sql';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const userSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(["voter", "candidate", "admin"]),
  bio: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'voter',
      bio: '',
    }
  });

  // Check if user is admin
  useEffect(() => {
    const currentUser = sqlService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Unauthorized access. Please log in as admin.');
      navigate('/login');
    } else {
      loadUsers();
    }
  }, [navigate]);

  const loadUsers = async (role?: string) => {
    setLoading(true);
    try {
      const fetchedUsers = await sqlService.getUsers(role as any);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'all') {
      loadUsers();
    } else {
      loadUsers(tab);
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    form.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const result = await sqlService.deleteUser(selectedUser.id);
      
      if (result.success) {
        toast.success(`User ${selectedUser.name} deleted successfully`);
        setIsDeleteDialogOpen(false);
        loadUsers(activeTab === 'all' ? undefined : activeTab);
      } else {
        throw new Error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user. Please try again.');
    }
  };

  const onSubmitEdit = async (data: UserFormData) => {
    if (!selectedUser) return;
    
    try {
      const result = await sqlService.updateUser(selectedUser.id, data);
      
      if (result.success) {
        toast.success(`User ${data.name} updated successfully`);
        setIsEditDialogOpen(false);
        loadUsers(activeTab === 'all' ? undefined : activeTab);
      } else {
        throw new Error(result.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user. Please try again.');
    }
  };

  const filteredUsers = searchTerm
    ? users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'candidate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'voter':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, voters, and candidates
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users by name or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="voter">Voters</TabsTrigger>
          <TabsTrigger value="candidate">Candidates</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <UserTable 
            users={filteredUsers} 
            loading={loading} 
            onEdit={handleEditUser} 
            onDelete={handleDeleteUser}
            getRoleBadgeColor={getRoleBadgeColor}
          />
        </TabsContent>

        <TabsContent value="voter" className="space-y-4">
          <UserTable 
            users={filteredUsers} 
            loading={loading} 
            onEdit={handleEditUser} 
            onDelete={handleDeleteUser}
            getRoleBadgeColor={getRoleBadgeColor}
          />
        </TabsContent>

        <TabsContent value="candidate" className="space-y-4">
          <UserTable 
            users={filteredUsers} 
            loading={loading} 
            onEdit={handleEditUser} 
            onDelete={handleDeleteUser}
            getRoleBadgeColor={getRoleBadgeColor}
          />
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <UserTable 
            users={filteredUsers} 
            loading={loading} 
            onEdit={handleEditUser} 
            onDelete={handleDeleteUser}
            getRoleBadgeColor={getRoleBadgeColor}
          />
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="voter">Voter</SelectItem>
                        <SelectItem value="candidate">Candidate</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="User bio (optional)" 
                        className="h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user "{selectedUser?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteUser}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface UserTableProps {
  users: any[];
  loading: boolean;
  onEdit: (user: any) => void;
  onDelete: (user: any) => void;
  getRoleBadgeColor: (role: string) => string;
}

const UserTable = ({ users, loading, onEdit, onDelete, getRoleBadgeColor }: UserTableProps) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Users Found</h3>
          <p className="text-muted-foreground mt-1">
            There are no users matching your criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Registered
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-gray-200 dark:divide-gray-800">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-muted/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium">{user.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={getRoleBadgeColor(user.role)} variant="outline">
                  {user.role}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {new Date(user.registered_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(user)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
