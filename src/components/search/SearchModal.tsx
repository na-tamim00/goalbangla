import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Trophy, Shield, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Article, Player, Club, Competition, Match } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, param?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    articles: Article[];
    players: Player[];
    clubs: Club[];
    competitions: Competition[];
    matches: Match[];
  }>({ articles: [], players: [], clubs: [], competitions: [], matches: [] });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults({ articles: [], players: [], clubs: [], competitions: [], matches: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ articles: [], players: [], clubs: [], competitions: [], matches: [] });
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      api.searchGlobal(query, language)
        .then(data => {
          setResults(data);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query, language]);

  if (!isOpen) return null;

  const hasAnyResults = 
    results.articles.length > 0 ||
    results.players.length > 0 ||
    results.clubs.length > 0 ||
    results.competitions.length > 0 ||
    results.matches.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-700/80 flex items-center gap-3 bg-[#0b0f19]">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder', 'সংবাদ, খেলোয়াড়, ক্লাব, লিগ অনুসন্ধান করুন...')}
            className="w-full bg-transparent text-white text-base placeholder:text-slate-500 focus:outline-none"
          />
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
          ) : query ? (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button 
            onClick={onClose}
            className="px-2 py-1 text-xs bg-slate-800 text-slate-400 rounded-md border border-slate-700 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-5 divide-y divide-slate-800/80">
          {!query && (
            <div className="text-center py-8 text-slate-500 text-xs">
              <p className="font-semibold text-slate-400 mb-1">
                {language === 'en' ? 'Quick suggestions:' : 'জনপ্রিয় অনুসন্ধানসমূহ:'}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {['আর্সেনাল', 'রিয়াল মাদ্রিদ', 'এমবাপ্পে', 'বসুন্ধরা কিংস', 'হালান্ড', 'প্রিমিয়ার লিগ'].map(item => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-emerald-950 hover:text-emerald-300 border border-slate-700 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && !isLoading && !hasAnyResults && (
            <div className="text-center py-10 text-slate-400 text-sm">
              <p className="font-medium text-slate-300">
                {language === 'en' ? `No results found for "${query}"` : `"${query}" এর জন্য কোনো ফলাফল পাওয়া যায়নি`}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'en' ? 'Try searching for club names, player names or tournament titles.' : 'অন্য কোনো নাম বা দল দিয়ে অনুসন্ধান করে দেখুন।'}
              </p>
            </div>
          )}

          {/* Articles Results */}
          {results.articles.length > 0 && (
            <div className="space-y-2 pt-2 first:pt-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {language === 'en' ? 'Articles & Reports' : 'প্রতিবেদন ও সংবাদ'}
              </div>
              <div className="space-y-1.5">
                {results.articles.map(article => (
                  <button
                    key={article.id}
                    onClick={() => {
                      onNavigate('article', article.slug);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 hover:border-emerald-500/40 transition-all flex items-start gap-3 group"
                  >
                    <img 
                      src={article.featuredImage} 
                      alt="" 
                      className="w-14 h-11 rounded-lg object-cover shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 line-clamp-1">
                        {language === 'en' && article.translations?.en?.title ? article.translations.en.title : article.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {language === 'en' && article.translations?.en?.excerpt ? article.translations.en.excerpt : article.excerpt}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 self-center" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Players Results */}
          {results.players.length > 0 && (
            <div className="space-y-2 pt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {language === 'en' ? 'Players' : 'খেলোয়াড়বৃন্দ'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.players.map(player => (
                  <button
                    key={player.id}
                    onClick={() => {
                      onNavigate('player', player.slug);
                      onClose();
                    }}
                    className="text-left p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 hover:border-cyan-500/40 transition-all flex items-center gap-2.5 group"
                  >
                    <img 
                      src={player.photo} 
                      alt="" 
                      className="w-9 h-9 rounded-full object-cover shrink-0" 
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 block truncate">
                        {language === 'en' ? player.name : player.banglaName}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {language === 'en' ? player.position : player.banglaPosition} • {player.marketValue}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clubs Results */}
          {results.clubs.length > 0 && (
            <div className="space-y-2 pt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                {language === 'en' ? 'Clubs' : 'ক্লাব ও দলসমূহ'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.clubs.map(club => (
                  <button
                    key={club.id}
                    onClick={() => {
                      onNavigate('club', club.slug);
                      onClose();
                    }}
                    className="text-left p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 hover:border-amber-500/40 transition-all flex items-center gap-2.5 group"
                  >
                    <img 
                      src={club.logo} 
                      alt="" 
                      className="w-8 h-8 rounded-full object-cover shrink-0" 
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 block truncate">
                        {language === 'en' ? club.name : club.banglaName}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {club.stadium}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Competitions */}
          {results.competitions.length > 0 && (
            <div className="space-y-2 pt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                {language === 'en' ? 'Competitions' : 'প্রতিযোগিতা ও টুর্নামেন্ট'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.competitions.map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      onNavigate('competition', comp.id);
                      onClose();
                    }}
                    className="text-left p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 hover:border-purple-500/40 transition-all flex items-center gap-2.5 group"
                  >
                    <img 
                      src={comp.logo} 
                      alt="" 
                      className="w-7 h-7 rounded-full object-cover shrink-0" 
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 block truncate">
                        {language === 'en' ? comp.name : comp.banglaName}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {comp.currentSeason} • {comp.country}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
