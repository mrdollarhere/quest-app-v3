"use client";

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Terminal, 
  Zap, 
  ChevronDown, 
  Trash2,
  Clock,
  LayoutGrid,
  FileCode
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getAdminLogs, clearAdminLogs, AdminLog } from '@/lib/activity-log';
import { getChangelog } from '@/app/actions/changelog';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export function ChangelogPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminLog[]>([]);
  const [visibleEntries, setVisibleEntries] = useState(10);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    // Load Activity Logs
    setActivityLogs(getAdminLogs());

    // Load and Parse CHANGELOG.md
    const raw = await getChangelog();
    const entries = parseChangelog(raw);
    setChangelog(entries);
  };

  const parseChangelog = (md: string): ChangelogEntry[] => {
    const sections = md.split('## ').slice(1);
    return sections.map(section => {
      const lines = section.split('\n');
      const header = lines[0].split(' — ');
      const version = header[0];
      const date = header[1];
      const changes = lines
        .slice(1)
        .filter(l => l.trim().startsWith('-'))
        .map(l => l.trim().substring(2));
      
      return { version, date, changes };
    });
  };

  const handleClearLogs = () => {
    if (confirm("Permanently clear the local activity registry?")) {
      clearAdminLogs();
      setActivityLogs([]);
    }
  };

  const latest = changelog[0] || { version: 'v18.5', date: '---' };

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden mt-12 border dark:border-slate-800">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-0">
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-900 dark:bg-primary rounded-2xl shadow-lg">
                  <Terminal className="w-5 h-5 text-primary dark:text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    Changelog • <span className="text-primary">{latest.version}</span>
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                    System Audit Hub • Released {latest.date}
                  </CardDescription>
                </div>
              </div>
              <ChevronDown className={cn("w-6 h-6 text-slate-300 transition-transform duration-500", isOpen && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="p-8 pt-0">
            <Tabs defaultValue="system" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl h-12 mb-8">
                <TabsTrigger value="system" className="rounded-xl font-black uppercase text-[10px] tracking-widest">
                  System Updates
                </TabsTrigger>
                <TabsTrigger value="activity" className="rounded-xl font-black uppercase text-[10px] tracking-widest">
                  Activity Log
                </TabsTrigger>
              </TabsList>

              <TabsContent value="system" className="space-y-6">
                {changelog.length === 0 ? (
                  <div className="py-20 text-center opacity-20">
                    <FileCode className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-black uppercase tracking-[0.2em] text-xs">Parsing Registry...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-6">
                      {changelog.slice(0, visibleEntries).map((entry, idx) => (
                        <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 group hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <Badge className="bg-primary text-white font-black text-[10px] uppercase tracking-widest px-3">
                              {entry.version}
                            </Badge>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.date}</span>
                          </div>
                          <ul className="space-y-2">
                            {entry.changes.map((change, cIdx) => (
                              <li key={cIdx} className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    {changelog.length > visibleEntries && (
                      <Button 
                        variant="ghost" 
                        onClick={() => setVisibleEntries(prev => prev + 10)}
                        className="w-full h-12 rounded-full font-black uppercase text-[10px] tracking-widest text-slate-400"
                      >
                        Show Older Updates
                      </Button>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <div className="flex items-center justify-between mb-4 px-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Admin Mutations</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearLogs}
                    className="h-8 px-3 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-black uppercase text-[9px] tracking-widest"
                  >
                    <Trash2 className="w-3 h-3 mr-2" /> Clear Registry
                  </Button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {activityLogs.length === 0 ? (
                    <div className="py-20 text-center opacity-20">
                      <History className="w-12 h-12 mx-auto mb-4" />
                      <p className="font-black uppercase tracking-[0.2em] text-xs">No Mutations Recorded</p>
                    </div>
                  ) : (
                    activityLogs.map((log, idx) => (
                      <div key={idx} className="p-5 flex items-center justify-between group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            {log.action.includes('Test') ? <LayoutGrid className="w-4 h-4" /> : 
                             log.action.includes('Question') ? <Zap className="w-4 h-4" /> : 
                             <History className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                              {log.action}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 truncate max-w-[200px] sm:max-w-[400px]">
                              Target: {log.target}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tabular-nums">
                            {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function Badge({ children, className }: any) {
  return (
    <span className={cn("px-2 py-0.5 rounded-full", className)}>
      {children}
    </span>
  );
}
