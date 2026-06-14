import React, { useState } from 'react';
import { Copy, Check, Sparkles, Tag } from 'lucide-react';
import { PROMO_BANNER } from '../data';

export const PromoBanner: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(PROMO_BANNER.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white min-h-[180px] md:min-h-[220px] flex flex-col md:flex-row items-center justify-between p-6 md:p-8 border border-red-500/10 mb-8"
      id="promo-banner"
    >
      {/* Absolute Decorative patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full scale-110 pointer-events-none" />
      <div className="absolute bottom-[-50px] left-[-30px] w-48 h-48 bg-white/5 rounded-full pointer-events-none" />

      {/* Text Info */}
      <div className="flex-1 min-w-0 z-10 text-center md:text-left md:pr-4 space-y-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-black uppercase tracking-widest bg-amber-400 text-slate-900 px-3 py-1 rounded-full shadow-inner">
          <Sparkles size={12} fill="currentColor" />
          <span>PROMO CODE</span>
        </span>
        <h2 className="text-2xl md:text-3.5xl font-black tracking-tight leading-none text-white drop-shadow-xs">
          {PROMO_BANNER.title}
        </h2>
        <p className="text-xs md:text-sm text-rose-50 opacity-90 max-w-lg leading-relaxed">
          {PROMO_BANNER.subtitle}
        </p>

        {/* Coupon Code copy bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 justify-center md:justify-start">
          <div className="bg-slate-900/60 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2.5 shadow-md">
            <Tag size={13} className="text-amber-300" />
            <span className="text-xs font-bold font-mono tracking-wider">{PROMO_BANNER.code}</span>
            <button 
              onClick={handleCopyCode}
              className="p-1 text-slate-300 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              title="ຄລິກເພື່ອຄັດລອກລະຫັດ"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>
          <span className="text-[11px] font-bold text-amber-200 bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5">
            {PROMO_BANNER.discountText}
          </span>
        </div>
      </div>

      {/* Decorative Promotional Illustration */}
      <div className="hidden md:flex items-center justify-center p-4 z-10 w-44 md:w-56 h-auto self-stretch relative">
        <img
          src={PROMO_BANNER.image}
          alt="Sale Banner"
          referrerPolicy="no-referrer"
          className="max-h-full object-contain rounded-2xl drop-shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300"
        />
      </div>
    </div>
  );
};
