
"use client";

import React from 'react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, LayoutGrid, ShieldCheck, LogIn } from "lucide-react";
import Link from 'next/link';
import { useUserRole } from '@/hooks/use-user-role';

export function UserNav() {
  const { user } = useUser();
  const { auth } = useAuth();
  const { role } = useUserRole();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  if (!user) {
    return (
      <Link href="/login">
        <Button size="sm" className="rounded-full shadow-sm">
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all p-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
            <AvatarFallback className="bg-primary/5 text-primary font-bold">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 mt-2 rounded-2xl shadow-2xl p-2" align="right" forceMount>
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-black leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground font-medium">{user.email}</p>
            {role && (
              <div className="pt-2">
                <span className="bg-primary/10 text-primary text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  {role}
                </span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="opacity-50" />
        <Link href="/tests">
          <DropdownMenuItem className="rounded-lg p-2.5 font-bold cursor-pointer">
            <LayoutGrid className="mr-2 h-4 w-4 text-primary" />
            <span>Browse Library</span>
          </DropdownMenuItem>
        </Link>
        {role === 'admin' && (
          <Link href="/admin">
            <DropdownMenuItem className="rounded-lg p-2.5 font-bold cursor-pointer">
              <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
              <span>Admin Panel</span>
            </DropdownMenuItem>
          </Link>
        )}
        <DropdownMenuSeparator className="opacity-50" />
        <DropdownMenuItem onClick={handleLogout} className="rounded-lg p-2.5 font-bold cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
