
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Loader2, 
  User as UserIcon, 
  Mail, 
  Shield, 
  Calendar, 
  Activity, 
  Trophy, 
  Target,
  Clock,
  ExternalLink,
  ChevronRight,
  Database,
  BarChart3
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { API_URL } from '@/lib/api-config';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const email = decodeURIComponent(params.email as string);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);

  const fetchData = async () => {
    if (!API_URL || !email) return;
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        fetch(`${API_URL}?action=getUsers`),
        fetch(`${API_URL}?action=getResponses`)
      ]);
      
      const uData = await uRes.json();
      const rData = await rRes.json();
      
      const foundUser = uData.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      const userResponses = rData.filter((r: any) => r['User Email']?.toLowerCase() === email.toLowerCase());
      
      setUser(foundUser);
      setResponses(userResponses);
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Error", description: "Could not load user profile." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [email]);

  const stats = useMemo(() => {
    if (responses.length === 0) return { total: 0, passed: 0, avg: 0, best: 0 };
    
    let totalScore = 0;
    let totalPossible = 0;
    let passed = 0;
    const percentages = responses.map(r => {
      const p = (Number(r.Score) / (Number(r.Total) || 1)) * 100;
      totalScore += Number(r.Score);
      totalPossible += Number(r.Total);
      if (p >= 70) passed++;
      return p;
    });

    return {
      total: responses.length,
      passed,
      avg: Math.round((totalScore / totalPossible) * 100),
      best: Math.round(Math.max(...percentages))
    };
  }, [responses]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Operator Intelligence...</p>
    </div>
  );

  if (!user) return (
    <div className="text-center py-32 space-y-6">
      <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
        <UserIcon className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">Identity Not Found</h2>
      <p className="text-slate-500 font-medium max-w-xs mx-auto">The requested identity key could not be located in the DNTRNG registry.</p>
      <Button onClick={() => router.back()} className="rounded-full px-8">Return to Registry</Button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-full font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Identity Card */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
            <div className="h-32 bg-slate-900 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
              <div className="absolute top-0 right-0 p-6 opacity-5"><Target className="w-24 h-24 text-white" /></div>
            </div>
            <div className="px-8 pb-10 -mt-16 relative z-10 text-center">
              <div className="w-32 h-32 rounded-full border-8 border-white bg-slate-100 mx-auto mb-6 flex items-center justify-center font-black text-4xl text-primary shadow-xl">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">{user.name}</h2>
              <Badge className="rounded-full bg-primary/10 text-primary font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none">
                {user.role} Operator
              </Badge>

              <div className="mt-10 space-y-4 text-left">
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Mail className="w-4 h-4 text-slate-400" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Communication Key</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Shield className="w-4 h-4 text-slate-400" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Access Profile</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{user.role === 'admin' ? 'Root Administrator' : 'Standard Student'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 space-y-6">
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Registry Clearance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-slate-500">Progress to Goal</span>
                <span className="text-slate-900">{stats.passed} / {stats.total} Cleared</span>
              </div>
              <Progress value={(stats.passed / (stats.total || 1)) * 100} className="h-2 rounded-full" />
              <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                Structural achievement score calculated from all verified assessment logs.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Stats & Logs */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatSmall icon={Database} label="Sessions" value={stats.total} color="blue" />
            <StatSmall icon={Activity} label="Mean Score" value={`${stats.avg}%`} color="green" />
            <StatSmall icon={Trophy} label="Peak Record" value={`${stats.best}%`} color="purple" />
          </div>

          <Card className="border-none shadow-sm rounded-[3rem] overflow-hidden bg-white min-h-[500px] flex flex-col">
            <CardHeader className="bg-slate-50/50 border-b p-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">Intelligence Log</CardTitle>
                <CardDescription className="font-medium">Historical session history for this identity</CardDescription>
              </div>
              <BarChart3 className="w-6 h-6 text-slate-200" />
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {responses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="px-8 font-black uppercase text-[9px] tracking-widest">Timestamp</TableHead>
                      <TableHead className="font-black uppercase text-[9px] tracking-widest">Assessment</TableHead>
                      <TableHead className="font-black uppercase text-[9px] tracking-widest text-center">Score</TableHead>
                      <TableHead className="px-8 text-right font-black uppercase text-[9px] tracking-widest">Efficiency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responses.map((resp, i) => {
                      const score = Number(resp.Score) || 0;
                      const total = Number(resp.Total) || 1;
                      const pct = Math.round((score / total) * 100);
                      
                      return (
                        <TableRow key={i} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-none">
                          <TableCell className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-slate-300" />
                              <span className="text-[10px] font-bold text-slate-400">
                                {new Date(resp.Timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-black text-slate-700 text-sm">
                            {resp['Test ID']}
                          </TableCell>
                          <TableCell className="text-center font-bold text-slate-500">
                            {score} <span className="text-[10px] text-slate-300 mx-1">/</span> {total}
                          </TableCell>
                          <TableCell className="px-8 text-right">
                            <Badge className={cn(
                              "font-black px-3 py-1 rounded-full border-none shadow-sm text-[9px] uppercase tracking-widest",
                              pct >= 80 ? "bg-green-100 text-green-700" : pct >= 50 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                            )}>
                              {pct}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center px-10">
                  <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6">
                    <Database className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No Session Data</h3>
                  <p className="text-slate-500 font-medium max-w-xs mt-2">This operator has not initialized any intelligence modules in this registry cycle.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatSmall({ icon: Icon, label, value, color }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100"
  };
  
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all rounded-[2.5rem]">
      <CardContent className="pt-6 flex items-center gap-5">
        <div className={cn("p-4 rounded-2xl border-2 transition-transform group-hover:scale-110", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
