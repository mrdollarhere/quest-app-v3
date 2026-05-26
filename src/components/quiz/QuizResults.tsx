"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, RotateCcw, ArrowRight, FileBadge, Clock, Target, Trophy, Zap, CheckCircle2, Sparkles } from "lucide-react";
import Link from 'next/link';
import { getVerdictData } from '@/lib/quiz-config';
import { useSettings } from '@/context/settings-context';
import { PerformanceGauge } from './PerformanceGauge';
import { BenchmarkingSection } from './BenchmarkingSection';
import { StepAnalytics } from './StepAnalytics';
import { generateCertificatePDF } from '@/lib/certificate-utils';
import { trackEvent } from '@/lib/tracker';
import confetti from 'canvas-confetti';
import { VerdictDisplay } from './results/VerdictDisplay';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { BackToTop } from '@/components/BackToTop';
import { SiteFooter } from '@/components/SiteFooter';
import { BugReportButton } from '@/components/shared/BugReportButton';
import { CardView } from '@/components/library/CardView';

export function QuizResults({ title, testId, score, totalQuestions, questions, responses, serverReviewData, userName, onRestart, startTime, endTime, testMetadata, certificateId, duration, allTests = [] }: any) {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'small'>('normal');
  const [isGenerating, setIsGenerating] = useState(false);

  const percentage = Math.round((score / (totalQuestions || 1)) * 100);
  const normalizedScore = Math.round((score / (totalQuestions || 1)) * 1000);
  
  const verdict = getVerdictData(percentage);
  const isPass = percentage >= Number(testMetadata?.passing_threshold || settings.default_pass_threshold || 70);

  useEffect(() => {
    if (isPass) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, [isPass]);

  const recommendations = useMemo(() => {
    if (!allTests.length) return [];
    const difficultyMap: Record<string, number> = { 'easy': 1, 'beginner': 1, 'medium': 2, 'intermediate': 2, 'hard': 3, 'advanced': 3 };
    const currentDiff = difficultyMap[String(testMetadata?.difficulty || '').toLowerCase()] || 2;
    const currentCat = testMetadata?.category || 'General';
    let pool = allTests.filter(t => String(t.id) !== String(testId));
    if (isPass) {
      let suggestions = pool.filter(t => t.category === currentCat && (difficultyMap[String(t.difficulty || '').toLowerCase()] || 2) >= currentDiff);
      if (suggestions.length < 2) suggestions = pool.filter(t => t.category === currentCat);
      if (suggestions.length < 2) suggestions = pool;
      return suggestions.slice(0, 3);
    } else {
      let suggestions = pool.filter(t => t.category === currentCat);
      if (suggestions.length < 2) suggestions = pool;
      return suggestions.slice(0, 3);
    }
  }, [allTests, testId, testMetadata, isPass]);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const handleDownload = async () => {
    if (!certificateId) return;
    setIsGenerating(true);
    await generateCertificatePDF({ studentName: userName, testName: title, score, total: totalQuestions, date: new Date(), certificateId: certificateId, platformName: String(settings.platform_name || "DNTRNG") });
    trackEvent('certificate_download', { test_id: testId, test_name: title, details: { score } });
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-12 transition-all duration-300">
      <div className="w-full max-w-5xl space-y-8 animate-in fade-in duration-700 px-4 md:px-8 mb-20">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-4 px-10 py-5 rounded-full bg-white border shadow-xl">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase text-slate-400">
                <span className="block">Student</span>
                <span className="block opacity-80 mt-0.5">Học sinh</span>
              </p>
              <h1 className="text-3xl font-black text-slate-900 uppercase">{userName}</h1>
            </div>
          </div>
          <h2 className="text-xl font-black text-slate-400 uppercase tracking-[0.5em]">{title}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <StatCard icon={Trophy} label="Score / Điểm" value={`${percentage}%`} color="blue" />
          <StatCard icon={Zap} label="Points / Điểm số" value={normalizedScore} color="orange" />
          <StatCard icon={CheckCircle2} label="Correct / Đúng" value={score} color="green" />
          <StatCard icon={Target} label="Questions / Câu hỏi" value={totalQuestions} color="purple" />
          <StatCard icon={Clock} label="Time / Thời gian" value={formatDuration(duration || 0)} color="rose" />
        </div>

        <Card className="p-8 md:p-10 border-none shadow-2xl rounded-[3rem] bg-white flex flex-col md:flex-row items-center gap-10">
          <PerformanceGauge percentage={percentage} score={score} totalQuestions={totalQuestions} compact={true} />
          <div className="flex-1 flex flex-col gap-6">
            <VerdictDisplay verdict={verdict} />
          </div>
        </Card>

        <BenchmarkingSection testId={testId} percentage={percentage} />

        {certificateId && isPass && (
          <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center gap-6">
              <FileBadge className="w-12 h-12 text-primary" />
              <div>
                <h4 className="text-primary font-black uppercase text-[10px]">
                  <span className="block">Certificate Ready</span>
                  <span className="block opacity-80 mt-0.5">Chứng chỉ sẵn sàng</span>
                </h4>
                <div className="space-y-1">
                  <p className="text-xl font-bold">You passed! Download your certificate.</p>
                  <p className="text-sm font-medium opacity-80 italic">Bạn đã qua! Tải chứng chỉ của bạn.</p>
                </div>
              </div>
            </div>
            <Button onClick={handleDownload} disabled={isGenerating} className="h-14 rounded-full px-10 bg-primary font-black uppercase text-xs">
              {isGenerating ? 'Generating...' : <div className="flex flex-col items-center"><span className="block">Download Certificate</span><span className="block opacity-80 mt-0.5">Tải Chứng Chỉ</span></div>}
            </Button>
          </div>
        )}

        <div className={cn("grid gap-5", user ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2")}>
          <Button onClick={onRestart} variant="outline" className="h-20 rounded-full border-2">
            <RotateCcw className="mr-3 w-5 h-5 text-slate-400" />
            <div className="flex items-start text-left flex-col"><span className="block font-black uppercase text-xs">Try Again</span><span className="block font-bold uppercase text-[10px] opacity-70">Làm Lại</span></div>
          </Button>
          <Link href="/tests" className="w-full">
            <Button className="w-full h-20 rounded-full bg-primary text-white border-none shadow-xl shadow-primary/20"><div className="flex flex-col items-center"><span className="block font-black uppercase text-xs">All Tests</span><span className="block font-bold uppercase text-[10px] opacity-70">Tất Cả Bài</span></div><ArrowRight className="ml-3 w-5 h-5" /></Button>
          </Link>
          {user && (
            <Link href="/profile" className="w-full">
              <Button variant="secondary" className="w-full h-20 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10"><User className="mr-3 w-5 h-5 text-primary" /><div className="flex items-start text-left flex-col"><span className="block font-black uppercase text-xs">My Profile</span><span className="block font-bold uppercase text-[10px] opacity-70">Hồ sơ của tôi</span></div></Button>
            </Link>
          )}
        </div>

        {recommendations.length > 0 && (
          <div className="space-y-8 pt-12 pb-8 border-t border-slate-200">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary animate-pulse" /><span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary"><span className="block">Learning Path</span><span className="block opacity-80 mt-0.5">Lộ trình học</span></span></div>
                <div className="space-y-1"><h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none">{isPass ? "Great job! Try these next:" : "Keep practicing:"}</h3><p className="text-xl font-bold text-slate-400 uppercase tracking-tight leading-none">{isPass ? "Làm tốt lắm! Thử tiếp theo:" : "Tiếp tục luyện tập:"}</p></div>
              </div>
              <Link href="/tests"><Button variant="ghost" className="rounded-full h-14 px-6 hover:bg-white transition-all"><div className="flex flex-col items-end text-right mr-3"><span className="block font-black uppercase text-[10px] tracking-widest text-slate-400">View Full Library</span><span className="block font-bold uppercase text-[9px] tracking-widest text-slate-300">Xem tất cả bài</span></div><ArrowRight className="w-4 h-4 text-primary" /></Button></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"><CardView tests={recommendations} /></div>
          </div>
        )}

        <StepAnalytics questions={questions} responses={responses} serverReviewData={serverReviewData} textSize={textSize} />
      </div>
      
      <SiteFooter className="w-full" />
      <BackToTop />
      <BugReportButton 
        testId={testId} 
        context={{ score, total: totalQuestions }}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors: Record<string, string> = { blue: "bg-blue-50 text-blue-600 border-blue-100", green: "bg-emerald-50 text-emerald-600 border-emerald-100", purple: "bg-purple-50 text-purple-600 border-purple-100", orange: "bg-orange-50 text-orange-600 border-orange-100", rose: "bg-rose-50 text-rose-600 border-rose-100" };
  const [en, vi] = String(label).split(' / ');
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 group hover:shadow-md transition-all">
      <div className={cn("p-3.5 rounded-xl border-2 transition-transform group-hover:scale-110", colors[color])}><Icon className="w-5 h-5" /></div>
      <div><div className="mb-1 leading-none"><span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">{en}</span>{vi && <span className="block text-[8px] font-bold uppercase tracking-widest text-slate-400/70 mt-0.5">{vi}</span>}</div><p className="text-2xl font-black text-slate-900 tabular-nums leading-none">{value}</p></div>
    </div>
  );
}
