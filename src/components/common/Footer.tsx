import React from 'react';
import { 
  Shield, Globe, Mail, Send, Award, Heart, Newspaper, Radio,
  TrendingUp, Users, FileText, CheckCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="bg-[#06090e] border-t border-slate-800 text-slate-400 text-xs mt-20">
      {/* Editorial Trust & Ethics Banner */}
      <div className="bg-[#090e17] border-b border-slate-800/80 py-6 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">
                {language === 'en' ? 'Editorial Integrity & Sports Intelligence' : 'সাংবাদিকতার নীতি ও নির্ভরযোগ্য তথ্য'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'en' 
                  ? 'All match analytics, transfers, and tactical reports are cross-verified by licensed football journalists.'
                  : 'প্রতিটি ম্যাচ রিপোর্ট, দলবদল গুঞ্জন ও পরিসংখ্যান অপটা ও নিজস্ব ক্রীড়া সাংবাদিকদের দ্বারা যাচাইকৃত।'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-emerald-300 font-semibold border border-slate-700 text-xs">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Bangla-First Architecture
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        
        {/* Col 1: Brand */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-cyan-400 p-0.5">
              <div className="w-full h-full bg-[#0b0f17] rounded-[6px] flex items-center justify-center">
                <span className="font-extrabold text-sm text-emerald-400">GB</span>
              </div>
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">GoalBangla</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
            {t('footer.about')}
          </p>

          <div className="pt-2">
            <span className="text-[11px] text-slate-500 block mb-2 font-semibold uppercase tracking-wider">
              {language === 'en' ? 'Available Languages:' : 'ভাষা নির্বাচন:'}
            </span>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setLanguage('bn')}
                className={`px-2.5 py-1 rounded border text-xs font-semibold ${
                  language === 'bn' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                বাংলা (ডিফল্ট)
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded border text-xs font-semibold ${
                  language === 'en' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('es')}
                className={`px-2.5 py-1 rounded border text-xs font-semibold ${
                  language === 'es' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Español
              </button>
              <button 
                onClick={() => setLanguage('ar')}
                className={`px-2.5 py-1 rounded border text-xs font-semibold ${
                  language === 'ar' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                العربية
              </button>
            </div>
          </div>
        </div>

        {/* Col 2: Football Hubs */}
        <div className="space-y-3">
          <h5 className="font-bold text-white text-xs uppercase tracking-wider">
            {language === 'en' ? 'Competitions' : 'প্রতিযোগিতা ও লিগ'}
          </h5>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onNavigate('competition', 'comp-epl')} className="hover:text-emerald-400 transition-colors">
                Premier League (EPL)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('competition', 'comp-laliga')} className="hover:text-emerald-400 transition-colors">
                La Liga EA Sports
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('competition', 'comp-ucl')} className="hover:text-emerald-400 transition-colors">
                UEFA Champions League
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('bangladesh-football')} className="hover:text-emerald-400 transition-colors text-emerald-300 font-semibold">
                Bangladesh Premier League
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('standings')} className="hover:text-emerald-400 transition-colors">
                {t('nav.standings', 'পয়েন্ট টেবিল')}
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Editorial & Intel */}
        <div className="space-y-3">
          <h5 className="font-bold text-white text-xs uppercase tracking-wider">
            {language === 'en' ? 'Intelligence & Analysis' : 'বিশ্লেষণ ও সংবাদ'}
          </h5>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onNavigate('tactics')} className="hover:text-emerald-400 transition-colors">
                {t('nav.tactics', 'ট্যাকটিক্যাল অ্যানালিসিস')}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('transfers')} className="hover:text-emerald-400 transition-colors">
                {t('nav.transfers', 'দলবদল বাজার ও গুঞ্জন')}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('injuries')} className="hover:text-emerald-400 transition-colors">
                {t('nav.injuries', 'ইনজুরি ইনডেক্স')}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('galleries')} className="hover:text-emerald-400 transition-colors">
                {t('nav.gallery', 'ফটোগ্যালারি')}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('videos')} className="hover:text-emerald-400 transition-colors">
                {t('nav.videos', 'ভিডিও হাইলাইটস')}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('archive')} className="hover:text-emerald-400 transition-colors">
                {t('nav.archive', 'আর্কাইভ')}
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Platform & CMS */}
        <div className="space-y-3">
          <h5 className="font-bold text-white text-xs uppercase tracking-wider">
            {language === 'en' ? 'Newsroom' : 'নিউজ রুম'}
          </h5>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onNavigate('admin')} className="text-emerald-400 font-bold hover:underline flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                {t('nav.admin', 'নিউজ রুম এডিটরিয়াল সিএমএস')}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('admin', 'articles')} className="hover:text-slate-200">
                {language === 'en' ? 'Article Management' : 'প্রতিবেদন ব্যবস্থাপনা'}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('admin', 'breaking')} className="hover:text-slate-200">
                {language === 'en' ? 'Breaking News Alerts' : 'ব্রেকিং নিউজ নিয়ন্ত্রণ'}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('admin', 'live-controller')} className="hover:text-slate-200">
                {language === 'en' ? 'Live Match Scoreboard' : 'লাইভ স্কোর কন্ট্রোলার'}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('admin', 'media')} className="hover:text-slate-200">
                {language === 'en' ? 'Media Asset Library' : 'মিডিয়া লাইব্রেরি'}
              </button>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-slate-800/80 py-6 px-4 lg:px-8 text-center text-slate-500 text-xs">
        <p>{t('footer.copyright')}</p>
        <p className="mt-1 text-[11px] text-slate-600">
          Powered by Express REST Engine, Modern TypeScript, Modular Sports Entity Architecture & Gemini AI Editorial Support.
        </p>
      </div>
    </footer>
  );
};
