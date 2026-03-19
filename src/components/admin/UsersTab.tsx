
"use client";

import React from 'react';
import { 
  Plus, 
  Edit, 
  Trash2 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface UsersTabProps {
  users: any[];
  onEdit: (user: any) => void;
  onDelete: (email: string) => void;
  onAdd: () => void;
}

export function UsersTab({ users, onEdit, onDelete, onAdd }: UsersTabProps) {
  return (
    <Card className="border-none shadow-sm animate-in slide-in-from-bottom-4 duration-500 bg-white">
      <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50">
        <div>
          <CardTitle className="font-black text-2xl text-slate-900">Users</CardTitle>
          <CardDescription>Platform access and account control</CardDescription>
        </div>
        <Button onClick={onAdd} className="rounded-full gap-2 font-bold shadow-lg">
          <Plus className="w-4 h-4" /> New Account
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u, i) => (
              <TableRow key={i} className="group">
                <TableCell className="font-black text-slate-700">{u.name}</TableCell>
                <TableCell className="font-medium text-slate-500">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="font-bold uppercase tracking-wider text-[10px]">
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(u)} className="rounded-full">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(u.email)} className="rounded-full text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
