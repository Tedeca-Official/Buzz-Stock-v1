
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/contexts/AuthContext";
import { Users as UsersIcon, UserPlus, Trash2, UserCog } from "lucide-react";

const Users = () => {
  const { userDatabase, updateUserDatabase } = useAuth();
  const { toast } = useToast();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string, email: string, password: string, role: UserRole} | null>(null);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as UserRole;
    
    // Check if email already exists
    if (userDatabase.some(user => user.email === email)) {
      toast({
        title: "Error",
        description: "A user with this email already exists",
        variant: "destructive",
      });
      return;
    }
    
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role,
    };
    
    const updatedUsers = [...userDatabase, newUser];
    updateUserDatabase(updatedUsers);
    
    toast({
      title: "User added",
      description: `${name} has been added as a ${role}`,
    });
    
    setOpenAddDialog(false);
  };
  
  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    const name = formData.get("edit-name") as string;
    const email = formData.get("edit-email") as string;
    const password = formData.get("edit-password") as string || selectedUser.password;
    const role = formData.get("edit-role") as UserRole;
    
    // Check if email already exists for other users
    if (email !== selectedUser.email && userDatabase.some(user => user.email === email)) {
      toast({
        title: "Error",
        description: "A user with this email already exists",
        variant: "destructive",
      });
      return;
    }
    
    const updatedUser = {
      ...selectedUser,
      name,
      email,
      password,
      role,
    };
    
    const updatedUsers = userDatabase.map(user => 
      user.id === selectedUser.id ? updatedUser : user
    );
    
    updateUserDatabase(updatedUsers);
    
    toast({
      title: "User updated",
      description: `${name}'s information has been updated`,
    });
    
    setOpenEditDialog(false);
    setSelectedUser(null);
  };
  
  const handleDeleteUser = (userId: string, userName: string) => {
    // Don't allow deleting if only one user left
    if (userDatabase.length <= 1) {
      toast({
        title: "Error",
        description: "Cannot delete the last user",
        variant: "destructive",
      });
      return;
    }
    
    const updatedUsers = userDatabase.filter(user => user.id !== userId);
    updateUserDatabase(updatedUsers);
    
    toast({
      title: "User deleted",
      description: `${userName} has been removed from the system`,
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-savvy-primary hover:bg-savvy-primary/90 dark:bg-savvy-accent dark:hover:bg-savvy-accent/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700">
            <form onSubmit={handleAddUser}>
              <DialogHeader>
                <DialogTitle className="dark:text-white">Add New User</DialogTitle>
                <DialogDescription className="dark:text-gray-400">
                  Create a new user account
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right dark:text-white">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Full Name"
                    className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right dark:text-white">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="email@example.com"
                    className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                    type="email"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right dark:text-white">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right dark:text-white">Role</Label>
                  <Select name="role" defaultValue="worker" required>
                    <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="worker">Worker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit"
                  className="bg-savvy-primary hover:bg-savvy-primary/90 dark:bg-savvy-accent dark:hover:bg-savvy-accent/90"
                >
                  Add User
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700">
            {selectedUser && (
              <form onSubmit={handleEditUser}>
                <DialogHeader>
                  <DialogTitle className="dark:text-white">Edit User</DialogTitle>
                  <DialogDescription className="dark:text-gray-400">
                    Update user information
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right dark:text-white">Name</Label>
                    <Input
                      id="edit-name"
                      name="edit-name"
                      defaultValue={selectedUser.name}
                      className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-email" className="text-right dark:text-white">Email</Label>
                    <Input
                      id="edit-email"
                      name="edit-email"
                      defaultValue={selectedUser.email}
                      className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                      type="email"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-password" className="text-right dark:text-white">Password</Label>
                    <Input
                      id="edit-password"
                      name="edit-password"
                      type="password"
                      placeholder="Leave blank to keep current password"
                      className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-role" className="text-right dark:text-white">Role</Label>
                    <Select name="edit-role" defaultValue={selectedUser.role} required>
                      <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="worker">Worker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit"
                    className="bg-savvy-primary hover:bg-savvy-primary/90 dark:bg-savvy-accent dark:hover:bg-savvy-accent/90"
                  >
                    Update User
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-savvy-primary dark:text-savvy-accent" />
            <CardTitle className="dark:text-white">System Users</CardTitle>
          </div>
          <CardDescription className="dark:text-gray-400">
            Manage users and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="dark:border-gray-700">
                <TableHead className="dark:text-gray-400">Name</TableHead>
                <TableHead className="dark:text-gray-400">Email</TableHead>
                <TableHead className="dark:text-gray-400">Role</TableHead>
                <TableHead className="text-right dark:text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userDatabase.map((user) => (
                <TableRow key={user.id} className="dark:border-gray-700">
                  <TableCell className="font-medium dark:text-white">{user.name}</TableCell>
                  <TableCell className="dark:text-white">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      user.role === "admin" 
                        ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800" 
                        : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                    }>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => {
                        setSelectedUser(user);
                        setOpenEditDialog(true);
                      }}
                    >
                      <UserCog className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-red-500 dark:border-gray-700 dark:hover:bg-gray-700"
                      onClick={() => handleDeleteUser(user.id, user.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {userDatabase.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No users found. Add your first user.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
