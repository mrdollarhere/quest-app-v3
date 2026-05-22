"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { sendMessageToAssistant } from '@/app/actions/chatbot';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Welcome to the mission registry. I am your Intelligence Assistant. How can I help you navigate the DNTRNG platform today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ 
        role: m.role === 'model' ? 'model' : 'user' as any, 
        text: m.text 
      }));
      
      const result = await sendMessageToAssistant({
        message: userMessage,
        history
      });

      if (result.success) {
        setMessages(prev => [...prev, { role: 'model', text: result.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: "Registry Handshake Failure. AI node unreachable." }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Error: Could not transmit signal to intelligence engine." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-4 right-20 z-[90] h-12 w-12 rounded-full shadow-2xl transition-all duration-500",
          isOpen ? "bg-slate-900 rotate-90" : "bg-primary hover:scale-110"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </Button>

      {/* Chat Terminal */}
      <div className={cn(
        "fixed bottom-20 right-4 z-[100] w-[380px] max-w-[calc(100vw-2rem)] transition-all duration-500 origin-bottom-right",
        isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
      )}>
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white flex flex-col h-[500px]">
          <CardHeader className="bg-slate-900 p-6 text-white flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-black uppercase tracking-tight">AI Assistant</CardTitle>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocol Active</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white rounded-full">
              <ChevronDown className="w-5 h-5" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50/50">
            <div ref={scrollRef} className="h-full overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  m.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                    m.role === 'user' ? "bg-primary text-white" : "bg-white text-slate-400 border"
                  )}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-4 text-sm font-medium leading-relaxed",
                    m.role === 'user' 
                      ? "bg-primary text-white rounded-[1.5rem] rounded-br-none shadow-lg shadow-primary/10" 
                      : "bg-white text-slate-700 rounded-[1.5rem] rounded-bl-none border border-slate-100 shadow-sm"
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-end gap-2 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                  <div className="bg-white p-4 rounded-[1.5rem] rounded-bl-none border border-slate-100 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="p-4 bg-white border-t shrink-0">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex w-full items-center gap-2"
            >
              <Input 
                placeholder="Ask about DNTRNG..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 border-none ring-1 ring-slate-100 font-medium text-sm"
                disabled={loading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim() || loading}
                className="h-12 w-12 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
