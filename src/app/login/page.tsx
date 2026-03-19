
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Database, LogIn, Loader2, ArrowLeft } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function LoginPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({
        title: "Welcome back!",
        description: "Successfully signed in with Google.",
      });
      router.push('/tests');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Could not sign in with Google.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8">
        <Button variant="ghost" className="rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Button>
      </Link>

      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2rem] overflow-hidden">
        <div className="h-2 bg-primary" />
        <CardHeader className="text-center pt-10">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight">QuestFlow Login</CardTitle>
          <CardDescription className="text-base">Sign in to access assessments and track your progress.</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <Button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full h-14 rounded-full text-lg font-bold shadow-lg transition-all hover:scale-[1.02]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <LogIn className="w-5 h-5 mr-2" />
            )}
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="bg-slate-50/50 p-6 flex justify-center">
          <p className="text-xs text-muted-foreground font-medium text-center px-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
