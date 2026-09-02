import React, { useState, useEffect } from 'react';
import { TrendingUp, BookOpen, Clock, ArrowRight, Shield, Activity, Target } from 'lucide-react';
import { Article } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface TacticsPageProps {
  onSelectArticle: (slug: string) => void;
}

export const TacticsPage: React.FC<TacticsPageProps> = ({ onSelectArticle }) => {
  const { language, toBanglaNumber, formatDate } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getArticles({ category: 'tactical-analysis' })
      .then(res => setArticles(res.items))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-3xl p-8 shadow-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" />
          <span>{language === 'en' ? 'Football Science & Masterclasses' : 'কৌশলগত বিশ্লেষণ ও ফুটবল ট্যাকটিক্স'}</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white">
          {language === 'en' ? 'Tactical Blueprints, Formations & xG Telemetry' : 'ফর্মেশন ব্রেকডাউন, প্রেসিং মডেল ও ট্যাকটিক্যাল ডিপ-ডাইভ'}
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          {language === 'en'
            ? 'Detailed tactical breakdowns, manager systems (Guardiola, Arteta, Ancelotti), defensive structures and attacking patterns.'
            : 'ম্যানেজারদের দর্শন, আক্রমণ গঠনের প্যাটার্ন, জোনাল মার্কিং এবং অ্যাডভান্সড মেট্রিক্সের বিশদ পোস্ট-ম্যাচ অ্যানালিসিস।'}
        </p>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(art => (
          <div
            key={art.id}
            onClick={() => onSelectArticle(art.slug)}
            className="group bg-[#0b101a] border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all flex flex-col justify-between shadow-xl"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
              <img 
                src={art.featuredImage} 
                alt="" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold uppercase tracking-wider">
                {art.subcategory || 'ট্যাকটিক্স'}
              </div>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[11px] text-slate-400 font-semibold block">
                  {formatDate(art.publishedAt)} • {language === 'bn' ? `${toBanglaNumber(art.readTimeMinutes)} মিনিট পাঠ` : `${art.readTimeMinutes} min`}
                </span>
                <h3 className="text-sm md:text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                  {language === 'en' && art.translations?.en?.title ? art.translations.en.title : art.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {language === 'en' && art.translations?.en?.excerpt ? art.translations.en.excerpt : art.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-semibold">
                <span>{language === 'en' ? 'Read Tactical Blueprint' : 'বিশ্লেষণ পড়ুন'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
