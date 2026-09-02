import React, { useState, useEffect } from 'react';
import { 
  Flame, Search, Globe, Shield, Menu, X, Radio, ArrowRight,
  TrendingUp, Activity, User, Award, SlidersHorizontal
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { BreakingNews, Language } from '../../types';

interface HeaderProps {
  onNavigate: (view: string, param?: string) => void;
  currentView?: string;
  activeNav?: string;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentView, activeNav, onOpenSearch }) => {
  const active = currentView || activeNav || 'home';
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, setCurrentRole } = useAuth();
  const [breakingList, setBreakingList] = useState<BreakingNews[]>([]);
  const [currentBreakingIdx, setCurrentBreakingIdx] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  useEffect(() => {
    api.getBreakingNews().then(data => {
      if (data && data.length > 0) setBreakingList(data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (breakingList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBreakingIdx(prev => (prev + 1) % breakingList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [breakingList]);

  const navLinks = [
    { id: 'home', label: t('nav.home', 'হোম'), path: 'home' },
    { id: 'live', label: t('nav.live', 'লাইভ স্কোর'), path: 'live', isLive: true },
    { id: 'transfers', label: t('nav.transfers', 'দলবদল'), path: 'transfers', badge: 'HOT' },
    { id: 'epl', label: t('nav.epl', 'প্রিমিয়ার লিগ'), path: 'competition', param: 'comp-epl' },
    { id: 'laliga', label: t('nav.laliga', 'লা লিগা'), path: 'competition', param: 'comp-laliga' },
    { id: 'ucl', label: t('nav.ucl', 'চ্যাম্পিয়ন্স লিগ'), path: 'competition', param: 'comp-ucl' },
    { id: 'bpl', label: t('nav.bpl', 'বাংলাদেশ ফুটবল'), path: 'bangladesh-football', highlight: true },
    { id: 'tactics', label: t('nav.tactics', 'কৌশলগত বিশ্লেষণ'), path: 'tactics' },
    { id: 'standings', label: t('nav.standings', 'পয়েন্ট টেবিল'), path: 'standings' },
    { id: 'injuries', label: t('nav.injuries', 'ইনজুরি ইনডেক্স'), path: 'injuries' },
    { id: 'galleries', label: t('nav.gallery', 'গ্যালারি'), path: 'galleries' },
    { id: 'videos', label: t('nav.videos', 'ভিডিও'), path: 'videos' },
    { id: 'archive', label: t('nav.archive', 'আর্কাইভ'), path: 'archive' }
  ];

  const currentBreaking = breakingList[currentBreakingIdx];

  const languages: Array<{ code: Language; name: string; nativeName: string }> = [
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা (ডিফল্ট)' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'fr', name: 'French', nativeName: 'Français' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top Utility Masthead Bar */}
      <div className="bg-[#070a10] border-b border-slate-800/80 px-4 lg:px-8 py-1.5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Breaking News Ticker in Header */}
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-600/20 text-rose-400 border border-rose-500/30 font-bold uppercase tracking-wider text-[10px] shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              {t('breaking.tag', 'ব্রেকিং')}
            </div>

            {currentBreaking ? (
              <button 
                onClick={() => {
                  if (currentBreaking.relatedArticleSlug) {
                    onNavigate('article', currentBreaking.relatedArticleSlug);
                  }
                }}
                className="text-left text-slate-300 hover:text-white transition-colors truncate font-medium flex items-center gap-2 group cursor-pointer"
              >
                <span>{language === 'en' ? currentBreaking.headline : currentBreaking.banglaHeadline}</span>
                <ArrowRight className="w-3 h-3 text-rose-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ) : (
              <span className="text-slate-400 truncate">ফুটবল বিশ্বের সর্বশেষ লাইভ স্কোর ও নির্ভরযোগ্য বিশ্লেষণ...</span>
            )}
          </div>

          {/* Right side shortcuts */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="uppercase text-xs font-bold">{language}</span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  {languages.find(l => l.code === language)?.nativeName}
                </span>
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Select Language
                  </div>
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        language === lang.code ? 'text-emerald-400 font-bold bg-emerald-950/30' : 'text-slate-300'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      {language === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Direct CMS link */}
            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                (active || '').startsWith('admin') 
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('nav.admin', 'নিউজ রুম সিএমএস')}</span>
              <span className="sm:hidden">CMS</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Branding & Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between gap-6">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0b0f17] rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-lg text-emerald-400 tracking-tighter">GB</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  GoalBangla
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {language === 'en' ? 'Football Intelligence & News' : 'গোলবাংলা • ফুটবল নিউজ ও ইন্টেলিজেন্স'}
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 text-sm font-medium text-slate-300">
          {navLinks.slice(0, 9).map(link => {
            const isActive = active === link.path && (!link.param || true);
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.path, link.param)}
                className={`relative px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive 
                    ? 'text-white font-semibold bg-slate-800/80' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                } ${link.highlight ? 'text-emerald-300 font-semibold' : ''}`}
              >
                {link.isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/80 text-xs transition-all shadow-sm group cursor-pointer"
            title="Search football news (Ctrl + K)"
          >
            <Search className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-slate-400">{t('search.placeholder', 'অনুসন্ধান...').slice(0, 18)}...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-slate-900 border border-slate-700 rounded text-slate-400 font-mono">
              /
            </kbd>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Sub-bar for quick league links */}
      <div className="bg-[#0e1420] border-t border-slate-800/60 px-4 lg:px-8 py-2 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-4 text-xs">
          <span className="text-slate-500 uppercase tracking-wider font-bold text-[10px] shrink-0">
            {language === 'en' ? 'TOP HUBS:' : 'শীর্ষ কভারেজ:'}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => onNavigate('competition', 'comp-epl')}
              className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              Premier League
            </button>
            <button 
              onClick={() => onNavigate('competition', 'comp-laliga')}
              className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              La Liga
            </button>
            <button 
              onClick={() => onNavigate('competition', 'comp-ucl')}
              className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Champions League
            </button>
            <button 
              onClick={() => onNavigate('bangladesh-football')}
              className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 hover:text-white border border-emerald-500/40 transition-colors flex items-center gap-1.5 font-semibold"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              বাংলাদেশ ফুটবল (BPL)
            </button>
            <button 
              onClick={() => onNavigate('transfers')}
              className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1.5"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              {t('nav.transfers', 'দলবদল')}
            </button>
            <button 
              onClick={() => onNavigate('tactics')}
              className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-3 h-3 text-blue-400" />
              {t('nav.tactics', 'ট্যাকটিক্যাল অ্যানালিসিস')}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#070a10] border-b border-slate-800 px-4 py-4 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.path, link.param);
                  setIsMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-left transition-colors flex items-center justify-between ${
                  active === link.path ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{link.label}</span>
                {link.isLive && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                onNavigate('admin');
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              {t('nav.admin', 'নিউজ রুম এডিটরিয়াল সিএমএস')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
