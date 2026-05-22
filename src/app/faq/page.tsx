"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { SiteFooter } from '@/components/SiteFooter';
import { HelpCircle, ArrowLeft, BookOpen, Lock, Database, UserCheck } from 'lucide-react';
import { useSettings } from '@/context/settings-context';

export default function FAQPage() {
  const { settings } = useSettings();
  const brandName = String(settings.platform_name || "DNTRNG");

  const FAQ_REGISTRY = [
    {
      q: "Is my assessment data secure?",
      a: "Yes. DNTRNG uses a Zero-Infrastructure protocol. All test data, student identities, and results are stored directly in YOUR personal Google Sheet. Our platform acts only as a secure interface and does not persist your data on third-party servers.",
      icon: Lock
    },
    {
      q: "How many students can participate in a Live Session?",
      a: "The platform is optimized for groups of up to 50 concurrent student nodes per session. This limit ensures sub-second synchronization and registry stability using the Pusher websocket protocol.",
      icon: Database
    },
    {
      q: "What is Whitelist Mode?",
      a: "Whitelist Mode allows teachers to restrict entry to only students on a pre-approved roster. When enabled, students must enter their name exactly as it appears in the administrative registry to initialize a mission.",
      icon: UserCheck
    },
    {
      q: "Can I use images in my questions?",
      a: "Absolutely. All interaction modules support visual assets. You can provide an external image URL, and the engine will forensicallly render it, including support for spatial hotspot identification.",
      icon: BookOpen
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <header className="py-6 px-12 border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Terminal Return</span>
          </Link>
          <Image src="/brand/logo-horizontal.png" alt={brandName} width={120} height={30} priority />
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-24 space-y-16">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-slate-900">Intelligence FAQ</h1>
          <p className="text-slate-500 font-medium">Common technical and operational protocols for the DNTRNG platform.</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden p-8 md:p-16">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {FAQ_REGISTRY.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-none bg-slate-50/50 rounded-2xl px-6 hover:bg-slate-50 transition-colors">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <faq.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-lg font-bold text-slate-900 leading-tight">{faq.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-8 text-slate-500 font-medium leading-relaxed text-base pl-12 border-t border-slate-200/50 pt-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-5"><Zap className="w-32 h-32 text-white" /></div>
           <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 relative z-10">Still have questions?</h3>
           <p className="text-slate-400 font-medium mb-10 relative z-10">Access our full setup guide or contact the dev node.</p>
           <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
             <Link href="/setup-guide">
               <Button className="h-14 px-8 rounded-full bg-white text-slate-900 font-black uppercase text-xs tracking-widest border-none">View Setup Guide</Button>
             </Link>
             <Link href="/contact">
               <Button variant="outline" className="h-14 px-8 rounded-full border-white/20 text-white font-black uppercase text-xs tracking-widest hover:bg-white/5">Contact Support</Button>
             </Link>
           </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
