
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Clock, BarChart, ListChecks, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AVAILABLE_TESTS } from '@/app/lib/demo-data';

export default function TestsLibrary() {
  const [search, setSearch] = useState("");

  const filteredTests = AVAILABLE_TESTS.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Test Library</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">Select an assessment to begin your journey</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or category..." 
                  className="pl-10 rounded-full bg-slate-50 border-slate-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-full md:hidden">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <Card key={test.id} className="group flex flex-col overflow-hidden border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={test.image} 
                  alt={test.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white/95 text-primary hover:bg-white shadow-sm border-none backdrop-blur-sm">
                    {test.category}
                  </Badge>
                </div>
              </div>

              <CardHeader className="flex-1 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                    {test.title}
                  </CardTitle>
                </div>
                <CardDescription className="line-clamp-2 mt-2 text-slate-600">
                  {test.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-4">
                <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-primary" />
                    <span>{test.questions} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{test.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BarChart className="w-4 h-4 text-primary" />
                    <span className={
                      test.difficulty === 'Beginner' ? 'text-green-600' :
                      test.difficulty === 'Intermediate' ? 'text-orange-600' : 'text-red-600'
                    }>
                      {test.difficulty}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 border-t border-slate-50 bg-slate-50/30">
                <Link href={`/quiz?id=${test.id}`} className="w-full pt-4">
                  <Button className="w-full rounded-full font-semibold shadow-sm group-hover:shadow-md transition-all">
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Start Assessment
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">No quizzes found</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">We couldn't find any results for "{search}". Try checking your spelling or using different keywords.</p>
            <Button variant="link" onClick={() => setSearch("")} className="mt-4 text-primary font-semibold">
              Clear all filters
            </Button>
          </div>
        )}
      </main>

      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            QuestFlow • {new Date().getFullYear()} • Dynamic Learning Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
