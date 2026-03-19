
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Clock, BarChart, Layers, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const AVAILABLE_TESTS = [
  {
    id: "demo-1",
    title: "QuestFlow Essentials",
    description: "Learn the basics of our interactive quiz platform and standard question types.",
    category: "Product Tour",
    difficulty: "Easy",
    questions: 8,
    duration: "5 mins",
    image: "https://picsum.photos/seed/mountain1/800/450"
  },
  {
    id: "demo-2",
    title: "Advanced Interactions",
    description: "A deep dive into hotspots, ordering, and complex logic patterns.",
    category: "Technical",
    difficulty: "Hard",
    questions: 12,
    duration: "15 mins",
    image: "https://picsum.photos/seed/ui/800/450"
  },
  {
    id: "demo-3",
    title: "Data Visualization Quiz",
    description: "Test your knowledge on interpreting charts and complex data sets.",
    category: "Analytics",
    difficulty: "Medium",
    questions: 10,
    duration: "10 mins",
    image: "https://picsum.photos/seed/data/800/450"
  },
  {
    id: "demo-4",
    title: "Eco-Systems & Biology",
    description: "An educational survey regarding global ecosystems and climate data.",
    category: "Education",
    difficulty: "Easy",
    questions: 6,
    duration: "4 mins",
    image: "https://picsum.photos/seed/nature/800/450"
  }
];

export default function TestsLibrary() {
  const [search, setSearch] = React.useState("");

  const filteredTests = AVAILABLE_TESTS.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="py-8 px-4 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Test Library</h1>
              <p className="text-sm text-muted-foreground">Browse all available assessments and surveys</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search quizzes..." 
              className="pl-10 rounded-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTests.map((test) => (
            <Card key={test.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all flex flex-col">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={test.image} 
                  alt={test.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-white/90 text-primary hover:bg-white">{test.category}</Badge>
                </div>
              </div>
              <CardHeader className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{test.title}</CardTitle>
                </div>
                <CardDescription className="line-clamp-2">
                  {test.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Layers className="w-4 h-4 mr-1" />
                    {test.questions} Qs
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {test.duration}
                  </div>
                  <div className="flex items-center">
                    <BarChart className="w-4 h-4 mr-1" />
                    {test.difficulty}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/quiz" className="w-full">
                  <Button className="w-full rounded-full group-hover:bg-primary/90">
                    <Play className="w-4 h-4 mr-2" />
                    Start Assessment
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No tests found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filters.</p>
            <Button variant="link" onClick={() => setSearch("")}>Clear all filters</Button>
          </div>
        )}
      </main>
    </div>
  );
}
