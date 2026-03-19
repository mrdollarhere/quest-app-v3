"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  BarChart, 
  ListChecks, 
  Search, 
  Loader2, 
  LayoutGrid, 
  List,
  ChevronRight,
  Database
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { API_URL } from '@/lib/api-config';
import { AVAILABLE_TESTS as DEMO_TESTS } from '@/app/lib/demo-data';
import { cn } from "@/lib/utils";

export default function TestsLibrary() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      if (API_URL) {
        const res = await fetch(`${API_URL}?action=getTests`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setTests(data);
        } else {
          setTests(DEMO_TESTS);
        }
      } else {
        setTests(DEMO_TESTS);
      }
    } catch (err) {
      console.error("Failed to fetch tests", err);
      setTests(DEMO_TESTS);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(t => 
    (t.title?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (t.category?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (t.id?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-white flex flex-col">
      {/* Header Section */}
      <header className="bg-white/80 backdrop-blur-xl border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 h-12 w-12 border-2 border-transparent hover:border-slate-100 transition-all">
                  <ArrowLeft className="w-6 h-6 text-slate-900" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Intelligence Library</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  DNTRNG™ Registry Active
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Query by name, ID or classification..." 
                  className="pl-11 h-12 rounded-full bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-primary/40 font-bold text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-full border shadow-inner">
                <Button 
                  variant={viewMode === 'card' ? 'secondary' : 'ghost'} 
                  size="icon" 
                  onClick={() => setViewMode('card')}
                  className={cn("rounded-full h-10 w-10 transition-all", viewMode === 'card' ? "bg-white shadow-md text-primary" : "text-slate-400")}
                >
                  <LayoutGrid className="w-5 h-5" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                  size="icon" 
                  onClick={() => setViewMode('list')}
                  className={cn("rounded-full h-10 w-10 transition-all", viewMode === 'list' ? "bg-white shadow-md text-primary" : "text-slate-400")}
                >
                  <List className="w-5 h-5" />
                </Button>
              </div>

              <Button variant="outline" size="icon" onClick={fetchTests} className="rounded-full h-12 w-12 border-2 hover:bg-slate-50">
                <Loader2 className={cn("w-5 h-5", loading ? "animate-spin text-primary" : "text-slate-400")} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-20 h-20 mb-6">
              <Loader2 className="w-20 h-20 animate-spin text-primary absolute top-0 left-0" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Database className="w-8 h-8 text-slate-200" />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 animate-pulse">Syncing DNTRNG™ Modules</p>
          </div>
        ) : (
          <>
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {filteredTests.map((test) => (
                  <Card key={test.id} className="group flex flex-col overflow-hidden border-none shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-[3rem] bg-white">
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      <img 
                        src={test.image_url || `https://picsum.photos/seed/${test.id}/800/450`} 
                        alt={test.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/95 text-primary hover:bg-white shadow-xl border-none backdrop-blur-md font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-full">
                          {test.category || "General"}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="flex-1 px-8 pt-8 pb-4">
                      <CardTitle className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight line-clamp-1">
                        {test.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-4 font-medium text-slate-500 text-sm leading-relaxed">
                        {test.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pb-6">
                      <div className="flex items-center justify-between pt-6 border-t border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2">
                          <ListChecks className="w-4 h-4 text-primary opacity-30" />
                          <span>{test.questions_count || '--'} Items</span>
                        </div>
                        <div className="h-4 w-px bg-slate-100" />
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary opacity-30" />
                          <span>{test.duration || '15m'} Session</span>
                        </div>
                        <div className="h-4 w-px bg-slate-100" />
                        <div className="flex items-center gap-2">
                          <BarChart className="w-4 h-4 text-primary opacity-30" />
                          <span className={cn(
                            test.difficulty === 'Beginner' ? 'text-green-600' :
                            test.difficulty === 'Intermediate' ? 'text-orange-600' : 'text-red-600'
                          )}>
                            {test.difficulty || 'Beginner'}
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="px-8 pb-8 pt-0 mt-auto">
                      <Link href={`/quiz?id=${test.id}`} className="w-full">
                        <Button className="w-full h-14 rounded-full font-black text-xs uppercase tracking-widest shadow-xl group-hover:shadow-primary/20 transition-all hover:scale-[1.02] bg-primary">
                          <Play className="w-4 h-4 mr-2 fill-current" />
                          Initialize Module
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] shadow-xl border border-slate-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
                      <TableHead className="font-black uppercase text-[10px] tracking-widest px-10 py-6">Assessment Module</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Classification</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Efficiency</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest text-right px-10 min-w-[200px]">Access</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTests.map((test, i) => (
                      <TableRow key={i} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none">
                        <TableCell className="px-10 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 group-hover:text-primary transition-colors text-lg">{test.title}</span>
                            <span className="text-xs font-medium text-slate-400 line-clamp-1 max-w-md">{test.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
                            {test.category || "General"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.duration || '15m'}</span>
                            <span className="flex items-center gap-1"><ListChecks className="w-3 h-3" /> {test.questions_count || '--'} items</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-10">
                          <div className="flex justify-end items-center">
                            <Link href={`/quiz?id=${test.id}`}>
                              <Button 
                                className="rounded-full h-11 px-6 bg-primary text-white font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 shadow-lg shadow-primary/20"
                              >
                                Start Assessment
                                <Play className="w-3 h-3 ml-2 fill-current" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}

        {!loading && filteredTests.length === 0 && (
          <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100">
            <div className="bg-white w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Search className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">No Intelligence Matches</h3>
            <p className="text-slate-500 mt-4 font-medium max-w-xs mx-auto text-lg">The DNTRNG™ registry found no modules matching your specific query parameters.</p>
            <Button variant="link" onClick={() => setSearch("")} className="mt-6 font-black text-primary uppercase tracking-widest text-xs">Clear Search Filters</Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
            © {new Date().getFullYear()} DNTRNG™ PLATFORM • CORE REGISTRY ACCESS
          </p>
        </div>
      </footer>
    </div>
  );
}
