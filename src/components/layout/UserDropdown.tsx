import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Settings as SettingsIcon, Shield } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { RoleBadge } from '@/components/auth/RoleBadge';
import { RoleGate } from '@/components/auth/RoleGate';

const UserDropdown = () => {
  const { user, profile, role, signOut } = useAuth();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/01.png" alt="@shadcn" />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">
              {profile?.full_name || user?.email || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            {role && <RoleBadge role={role} className="w-fit" />}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <NavLink to="/settings" className="flex items-center">
            <SettingsIcon className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </NavLink>
        </DropdownMenuItem>
        <RoleGate allowedRoles={['admin']}>
          <DropdownMenuItem asChild>
            <NavLink to="/admin" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              <span>User Management</span>
            </NavLink>
          </DropdownMenuItem>
        </RoleGate>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
