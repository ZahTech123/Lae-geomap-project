import { useState, useEffect } from 'react';
import { useAuth, UserRole, Profile } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RoleBadge } from '@/components/auth/RoleBadge';
import { toast } from 'sonner';
import { Shield, Search, RefreshCw } from 'lucide-react';
import { getRoleName } from '@/lib/permissions';
import { Navigate } from 'react-router-dom';

const AdminPage = () => {
  const { role, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [owners, setOwners] = useState<Array<{ owner_id: string; owner_name: string }>>([]);

  // Redirect if not admin
  if (!authLoading && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchUsers();
    fetchOwners();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('owner_id, owner_name')
        .order('owner_name');

      if (error) throw error;
      setOwners(data || []);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const linkUserToOwner = async (userId: string, ownerId: string | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ owner_id: ownerId })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Owner link updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error linking user to owner:', error);
      toast.error('Failed to link user to owner');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage user roles and permissions
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View and manage user roles and owner associations
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Owner Link</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || 'N/A'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    {user.role === 'client_user' ? (
                      <Select
                        value={user.owner_id || 'none'}
                        onValueChange={(value) =>
                          linkUserToOwner(user.id, value === 'none' ? null : value)
                        }
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No owner</SelectItem>
                          {owners.map((owner) => (
                            <SelectItem key={owner.owner_id} value={owner.owner_id}>
                              {owner.owner_name || owner.owner_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => updateUserRole(user.id, value as UserRole)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{getRoleName('admin')}</SelectItem>
                        <SelectItem value="finance_editor">{getRoleName('finance_editor')}</SelectItem>
                        <SelectItem value="planning_editor">{getRoleName('planning_editor')}</SelectItem>
                        <SelectItem value="asset_editor">{getRoleName('asset_editor')}</SelectItem>
                        <SelectItem value="client_user">{getRoleName('client_user')}</SelectItem>
                        <SelectItem value="public_viewer">{getRoleName('public_viewer')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
