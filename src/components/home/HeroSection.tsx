import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Flame, ArrowRight, Shield, Award, Sparkles } from 'lucide-react';
import { Article } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface HeroSectionProps {
  articles?: Article[];
  onSelectArticle: (slug: string) => void;
  onSelectCategory?: (category: string) => void;
  onSelectMatch?: (matchId: string) => void;
  onNavigate?: (view: string, param?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  articles: propArticles, 
  onSelectArticle, 
  onSelectCategory,
  onSelectMatch,
  onNavigate 
}) => {
  const { language, toBanglaNumber, formatDate } = useLanguage();
  const [internalArticles, setInternalArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!propArticles || propArticles.length === 0) {
      setIsLoading(true);
      api.getArticles({ limit: 12 })
        .then(res => {
          setInternalArticles(res?.items || []);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [propArticles]);

  const articles = (propArticles && propArticles.length > 0) ? propArticles : internalArticles;

  if (!articles || articles.length === 0) {
    if (isLoading) {
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    return null;
  }

  const featured = articles.find(a => a?.isFeatured) || articles[0];
  if (!featured) return null;

  const sideArticles = (articles || []).filter(a => a && a.id !== featured.id).slice(0, 3);
  const trendingArticles = (articles || []).filter(a => a && a.id !== featured.id && !sideArticles.some(s => s.id === a.id)).slice(0, 4);

  const getTitle = (art: Article) => {
    if (language === 'en' && art.translations?.en?.title) return art.translations.en.title;
    return art.title;
  };

  const getExcerpt = (art: Article) => {
    if (language === 'en' && art.translations?.en?.excerpt) return art.translations.en.excerpt;
    return art.excerpt;
  };

  return (
    <section className="space-y-8">
      {/* Main Grid: Left Big Hero + Right Secondary Stories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Big Hero Story (7 cols) */}
        <div className="lg:col-span-7">
          <div 
            onClick={() => onSelectArticle(featured.slug)}
            className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all cursor-pointer shadow-xl flex flex-col h-full"
          >
            {/* Image Container with Editorial Badge */}
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
              <img 
                src={featured.featuredImage} 
                alt={getTitle(featured)} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-[#0b0f17]/40 to-transparent"></div>
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {featured.isBreaking && (
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-950/40">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    {language === 'en' ? 'Breaking Report' : 'ব্রেকিং প্রতিবেদন'}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-black font-extrabold text-[11px] uppercase tracking-wider">
                  {featured.subcategory || (language === 'en' ? 'Lead Story' : 'প্রধান শিরোনাম')}
                </span>
              </div>

              {/* Photo Credit Overlay */}
              {featured.imageCredit && (
                <span className="absolute bottom-2 right-3 text-[10px] text-slate-400/80 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                  {featured.imageCredit}
                </span>
              )}
            </div>

            {/* Editorial Content */}
            <div className="p-6 md:p-8 flex flex-col justify-between flex-1 bg-[#0e1420]">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-semibold text-emerald-400 uppercase tracking-wider">
                    {featured.category.replace('-', ' ')}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {language === 'bn' ? `${toBanglaNumber(featured.readTimeMinutes)} মিনিট পাঠ` : `${featured.readTimeMinutes} min read`}
                  </span>
                  <span>•</span>
                  <span>{formatDate(featured.publishedAt)}</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-tight">
                  {getTitle(featured)}
                </h1>

                {featured.subtitle && (
                  <p className="text-sm font-semibold text-slate-300">
                    {featured.subtitle}
                  </p>
                )}

                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                  {getExcerpt(featured)}
                </p>
              </div>

              {/* Tags & Action CTA */}
              <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {(featured.tags || []).slice(0, 3).map(tag => (
                    <span key={tag} className="text-[11px] px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>

                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
                  <span>{language === 'en' ? 'Full Analysis' : 'পূর্ণাঙ্গ রিপোর্ট'}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stories Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {language === 'en' ? 'Top Newsroom Selection' : 'নিউজ রুম নির্বাচিত বিশেষ সংবাদ'}
            </h3>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-between">
            {sideArticles.map(art => (
              <div
                key={art.id}
                onClick={() => onSelectArticle(art.slug)}
                className="group bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 transition-all flex gap-4 cursor-pointer"
              >
                <img 
                  src={art.featuredImage} 
                  alt={getTitle(art)} 
                  className="w-28 h-24 md:w-32 md:h-24 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform" 
                />
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                      {art.category.replace('-', ' ')}
                    </span>
                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                      {getTitle(art)}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>{formatDate(art.publishedAt)}</span>
                    <span className="text-slate-400 group-hover:text-emerald-400 flex items-center gap-1 font-semibold">
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Trending Horizontal Stories Bar */}
      {trendingArticles.length > 0 && (
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {language === 'en' ? 'Trending Stories Across Leagues' : 'সবচেয়ে পঠিত ও আলোচিত খবর'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingArticles.map((art, idx) => (
              <div
                key={art.id}
                onClick={() => onSelectArticle(art.slug)}
                className="group bg-[#0d131f] hover:bg-slate-800/70 border border-slate-800/80 hover:border-emerald-500/40 rounded-xl p-3.5 transition-all cursor-pointer flex gap-3"
              >
                <span className="text-2xl font-black text-slate-700 group-hover:text-emerald-400 transition-colors font-mono">
                  {language === 'bn' ? toBanglaNumber(idx + 1) : `0${idx + 1}`}
                </span>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    {art.category}
                  </span>
                  <h5 className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {getTitle(art)}
                  </h5>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
