"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteFooter } from '@/components/SiteFooter';
import { Mail, MessageSquare, ArrowLeft, Send, Globe } from 'lucide-react';
import { useSettings } from '@/context/settings-context';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const { settings } = useSettings();
  const { toast } = useToast();
  const brandName = String(settings.platform_name || "DNTRNG");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Transmission Received",
      description: "Your inquiry has been logged in the support registry."
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="py-6 px-12 border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Back</span>
          </Link>
          <Image src="/brand/logo-horizontal.png" alt={brandName} width={120} height={30} priority />
        </div>
      </header>

      <main className="flex-1 py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl font-black uppercase tracking-tight text-slate-900 leading-none">Support <br /> <span className="text-primary">Registry.</span></h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                Connect with the DNTRNG core developers for technical inquiries, license calibration, or feedback.
              </p>
            </div>

            <div className="space-y-6">
              <ContactInfo icon={Mail} label="Official Email" value={settings.support_email || "support@dntrng.com"} />
              <ContactInfo icon={Globe} label="Region" value="Viet Nam / Global" />
            </div>

            <div className="p-8 bg-slate-900 rounded-[2rem] text-white space-y-4">
              <h3 className="text-xl font-black uppercase tracking-tight">Enterprise Calibration</h3>
              <p className="text-sm text-slate-400 font-medium">Looking for a custom version of DNTRNG for your school or business? We offer forensic deployments tailored to your specific infrastructure.</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Name</Label>
                    <Input placeholder="John Doe" required className="h-14 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 font-bold" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Node</Label>
                    <Input type="email" placeholder="john@example.com" required className="h-14 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 font-bold" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</Label>
                  <Input placeholder="How can we help?" required className="h-14 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 font-bold" />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Transmission Data</Label>
                  <Textarea placeholder="Type your message here..." required className="min-h-[180px] rounded-[2rem] bg-slate-50 border-none ring-1 ring-slate-100 p-6 font-medium" />
                </div>

                <Button type="submit" className="w-full h-20 rounded-full bg-primary text-white font-black text-xl uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-transform">
                  <Send className="w-6 h-6 mr-3" /> Initialize Handshake
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function ContactInfo({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
