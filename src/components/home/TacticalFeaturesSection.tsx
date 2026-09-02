import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowRight, BookOpen, Quote, Shield } from 'lucide-react';
import { Article } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface TacticalFeaturesProps {
  articles?: Article[];
  onSelectArticle: (slug: string) => void;
  onNavigate?: (view: string, param?: string) => void;
}

export const TacticalFeaturesSection: React.FC<TacticalFeaturesProps> = ({ 
  articles: propArticles, 
  onSelectArticle, 
  onNavigate 
}) => {
  const { language, toBanglaNumber, formatDate } = useLanguage();
  const [internalArticles, setInternalArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (!propArticles || propArticles.length === 0) {
      api.getArticles({ limit: 12 })
        .then(res => {
          setInternalArticles(res?.items || []);
        })
        .catch(console.error);
    }
  }, [propArticles]);

  const articles = (propArticles && propArticles.length > 0) ? propArticles : internalArticles;

  const tacticalArticles = (articles || []).filter(a => 
    a && (a.category === 'tactical-analysis' || a.category === 'opinion' || a.category === 'features')
  );

  if (tacticalArticles.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {language === 'en' ? 'Tactical Intelligence & Editorial Columns' : 'কৌশলগত বিশ্লেষণ ও দীর্ঘ প্রতিবেদন'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'en' ? 'Formations, pressing models, expected goals (xG), and expert columns' : 'ফর্মেশন ব্রেকডাউন, ডাটা মেট্রিক্স ও অভিজ্ঞ কলামিস্টদের মতামতের সমন্বয়'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('tactics')}
          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
        >
          <span>{language === 'en' ? 'Explore Analysis Hub' : 'অ্যানালিসিস হাব'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tacticalArticles.slice(0, 3).map(art => (
          <div
            key={art.id}
            onClick={() => onSelectArticle(art.slug)}
            className="group bg-[#0b111e] border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden transition-all flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-cyan-950/20"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
              <img 
                src={art.featuredImage} 
                alt="" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold uppercase tracking-wider">
                {art.subcategory || 'Tactics'}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[11px] text-slate-500 font-semibold block">
                  {formatDate(art.publishedAt)} • {language === 'bn' ? `${toBanglaNumber(art.readTimeMinutes)} মিনিট পাঠ` : `${art.readTimeMinutes} min read`}
                </span>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                  {language === 'en' && art.translations?.en?.title ? art.translations.en.title : art.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {language === 'en' && art.translations?.en?.excerpt ? art.translations.en.excerpt : art.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-semibold">
                <span>{language === 'en' ? 'Read Deep Dive' : 'বিশদ পড়ুন'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
