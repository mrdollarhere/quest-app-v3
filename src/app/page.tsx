
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Play, Settings, Database, Smartphone, CheckCircle, LayoutGrid, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-6 px-4 md:px-8 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
              <Database className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">QuestFlow</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/tests" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                <LayoutGrid className="w-4 h-4 mr-2" />
                Browse Library
              </Button>
            </Link>
            <Link href="/setup-guide">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Developer Setup
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-5xl mx-auto px-4 py-12 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-foreground">
            Dynamic Quizzes Powered by <span className="text-primary">Google Sheets</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Build, manage, and deploy responsive surveys and assessments without a dedicated backend server. Fast, flexible, and completely serverless.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/tests">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:scale-105 transition-transform bg-primary">
                <LayoutGrid className="w-5 h-5 mr-2" />
                Explore Test Library
              </Button>
            </Link>
            <Link href="/quiz?id=demo-1">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full hover:bg-muted/50 border-primary text-primary">
                <Play className="w-5 h-5 mr-2" />
                Quick Demo
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Sheets Backend",
              description: "Use your existing Google Sheets to manage questions, options, and logic.",
              icon: Database
            },
            {
              title: "Rich Interactions",
              description: "Hotspots, ordering, matching, ratings, and more question types supported.",
              icon: CheckCircle
            },
            {
              title: "Mobile First",
              description: "Optimized for seamless performance across smartphones and tablets.",
              icon: Smartphone
            }
          ].map((feature, i) => (
            <Card key={i} className="border-none shadow-sm bg-white/60 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>

      <footer className="py-12 text-center text-muted-foreground border-t bg-white/30">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-sm font-semibold hover:text-primary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Admin Dashboard
            </Link>
            <Link href="/setup-guide" className="text-sm font-semibold hover:text-primary flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Developer Guide
            </Link>
          </div>
          <p>© {new Date().getFullYear()} QuestFlow. Built with Next.js & Google Apps Script.</p>
        </div>
      </footer>
    </div>
  );
}
