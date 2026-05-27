/**
 * FeatureGrid.tsx
 * 
 * Purpose: Displays the modular capabilities of the assessment engine.
 * Compliance: Protocol v18.9.7 - Rectangular Geometry Enforced.
 * Updated: v19.8.0 - Stacked Bilingual Presentation (EN/VI).
 */

"use client";

import React from 'react';
import { Layers, BarChart3, Database, LayoutGrid } from "lucide-react";
import { en } from '@/locales/en';
import { vi } from '@/locales/vi';

interface FeatureGridProps {
  t: (key: string) => string;
}

export function FeatureGrid({ t }: FeatureGridProps) {
  return (
    <section className="py-32 bg-white border-y border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-20 relative z-10">
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center">
            <p className="text-[10px] font-black uppercase text-primary tracking-[0.5em]">{en.statusActive}</p>
            <p className="text-[9px] font-bold uppercase text-primary/60 tracking-[0.5em] mt-1">{vi.statusActive}</p>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-slate-900 leading-none">The Core Intelligence Engine.</h2>
            <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-slate-300 leading-none">Công Cụ Thông Minh Cốt Lõi.</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={Layers} 
            title="11+ Interaction Types" 
            titleVi="11+ Loại Tương Tác"
            desc="From spatial hotspots to complex matrix mapping, our engine supports every assessment modality." 
            descVi="Từ điểm nóng không gian đến bản đồ ma trận phức tạp, công cụ hỗ trợ mọi hình thức đánh giá."
          />
          <FeatureCard 
            icon={BarChart3} 
            title="Precision Analytics" 
            titleVi="Phân Tích Chính Xác"
            desc="Deep-dive into your performance with 1000-point Intel Indexes and step-by-step diagnostic audits." 
            descVi="Tìm hiểu sâu về hiệu suất của bạn với Chỉ số Thông minh 1000 điểm và kiểm tra chẩn đoán."
          />
          <FeatureCard 
            icon={Database} 
            title="Registry Synchronized" 
            titleVi="Đồng Bộ Sổ Cái"
            desc="Powered by Google Sheets, ensuring total data ownership and sub-second registry handshakes." 
            descVi="Đảm bảo quyền sở hữu dữ liệu hoàn toàn và kết nối sổ cái dưới một giây với Google Sheets."
          />
          <FeatureCard 
            icon={LayoutGrid} 
            title="Identity Tracking" 
            titleVi="Theo Dõi Danh Tính"
            desc="A centralized interaction history that documents your growth across every assessment mission." 
            descVi="Lịch sử tương tác tập trung ghi lại sự phát triển của bạn qua mọi nhiệm vụ đánh giá."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, titleVi, desc, descVi }: any) {
  return (
    <div className="space-y-6 p-10 rounded-none bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all group">
      <div className="w-16 h-16 rounded-none bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-none">{title}</h3>
          <p className="text-sm font-bold uppercase tracking-tight text-slate-400 leading-none">{titleVi}</p>
        </div>
        <div className="space-y-2">
          <p className="text-slate-500 font-medium leading-relaxed text-sm">{desc}</p>
          <p className="text-slate-400 font-medium leading-relaxed text-xs italic opacity-80">{descVi}</p>
        </div>
      </div>
    </div>
  );
}
