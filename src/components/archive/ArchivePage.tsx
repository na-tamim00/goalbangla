import React, { useState, useEffect } from 'react';
import { Archive, Calendar, Tag, ArrowRight, Search } from 'lucide-react';
import { Article } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface ArchivePageProps {
  onSelectArticle: (slug: string) => void;
}

export const ArchivePage: React.FC<ArchivePageProps> = ({ onSelectArticle }) => {
  const { language, toBanglaNumber, formatDate } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getArticles({ limit: 50 })
      .then(res => setArticles(res?.items || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const safeArticles = Array.isArray(articles) ? articles : [];
  const allTags = Array.from(new Set(safeArticles.flatMap(a => (a && a.tags) || [])));

  const filtered = safeArticles.filter(a => {
    if (!a) return false;
    if (selectedTag !== 'all' && (!a.tags || !a.tags.includes(selectedTag))) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-extrabold text-white">
              {language === 'en' ? 'Newsroom Archive' : 'সংবাদ আর্কাইভ'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'en' ? 'Explore all published football reports, columns and match analysis' : 'পূর্বে প্রকাশিত সকল প্রতিবেদন ও বিশ্লেষণের সংগ্রহশালা'}
          </p>
        </div>
      </div>

      {/* Tag Chips */}
      <div className="flex flex-wrap items-center gap-2 p-4 rounded-2xl bg-[#090e18] border border-slate-800">
        <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5" />
          ট্যাগ ফিল্টার:
        </span>
        <button
          onClick={() => setSelectedTag('all')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            selectedTag === 'all' ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          সব ({articles.length})
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              selectedTag === tag ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Articles Archive List */}
      <div className="space-y-3">
        {filtered.map(art => (
          <div
            key={art.id}
            onClick={() => onSelectArticle(art.slug)}
            className="group p-4 rounded-2xl bg-[#0b101a] hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <img src={art.featuredImage} alt="" className="w-20 h-14 rounded-xl object-cover shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  {art.category}
                </span>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {language === 'en' && art.translations?.en?.title ? art.translations.en.title : art.title}
                </h3>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {formatDate(art.publishedAt)} • {language === 'bn' ? `${toBanglaNumber(art.readTimeMinutes)} মিনিট` : `${art.readTimeMinutes} min`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>পড়ুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
