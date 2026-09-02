import React, { useState, useEffect } from 'react';
import { 
  Shield, Trophy, MapPin, User, ArrowLeft, ArrowRight, 
  Calendar, Award, Star, Activity 
} from 'lucide-react';
import { Club, Player, Article, Match } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface ClubProfilePageProps {
  slug: string;
  onNavigate: (view: string, param?: string) => void;
  onBack: () => void;
}

export const ClubProfilePage: React.FC<ClubProfilePageProps> = ({ slug, onNavigate, onBack }) => {
  const { language, toBanglaNumber, formatDate } = useLanguage();
  const [club, setClub] = useState<Club | null>(null);
  const [squad, setSquad] = useState<Player[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<'squad' | 'matches' | 'news'>('squad');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getClubDetails(slug)
      .then(res => {
        setClub(res.club);
        setSquad(res.squad);
        setArticles(res.articles);
        setMatches(res.matches);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">ক্লাব প্রোফাইল লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">ক্লাবটি পাওয়া যায়নি</h2>
        <button onClick={onBack} className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-sm">
          পেছনে যান
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>পেছনে যান</span>
      </button>

      {/* Club Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 bg-gradient-to-r from-[#0a1120] via-slate-900 to-[#0e1626] p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <img 
            src={club.logo} 
            alt={club.name} 
            className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover p-2 bg-slate-900 border-2 border-slate-700 shadow-xl shrink-0" 
          />
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs border border-emerald-500/40 uppercase">
                {club.country}
              </span>
              <span className="text-xs text-slate-400">
                প্রতিষ্ঠিত: {language === 'bn' ? toBanglaNumber(club.foundedYear) : club.foundedYear}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white">
              {language === 'en' ? club.name : club.banglaName}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {club.stadium} (ধারণক্ষমতা: {language === 'bn' ? toBanglaNumber(club.stadiumCapacity) : club.stadiumCapacity})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-cyan-400" />
                কোচ: <strong>{language === 'en' ? club.manager : club.banglaManager}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Major Trophies Showcase */}
        {club.trophies && club.trophies.length > 0 && (
          <div className="pt-6 border-t border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
              প্রধান অর্জন ও ট্রফি রেকর্ড
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {club.trophies.map((tr, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{tr.name}</span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      {language === 'bn' ? `${toBanglaNumber(tr.count)} বার` : `${tr.count}x`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('squad')}
          className={`px-6 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'squad' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          দল ও খেলোয়াড় তালিকা (Squad)
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-6 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'matches' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          ম্যাচ ও সূচি (Fixtures)
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`px-6 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'news' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          ক্লাব বিষয়ক সংবাদ (News)
        </button>
      </div>

      {/* Tab 1: Squad */}
      {activeTab === 'squad' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {squad.map(player => (
            <div
              key={player.id}
              onClick={() => onNavigate('player', player.slug)}
              className="group bg-[#0b101a] hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <img src={player.photo} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {language === 'en' ? player.name : player.banglaName}
                  </h4>
                  <span className="text-[11px] text-slate-400 block">
                    #{player.jerseyNumber} • {language === 'en' ? player.position : player.banglaPosition}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-emerald-400 block">
                  {player.marketValue}
                </span>
                <span className="text-[10px] text-slate-500">
                  {player.nationality}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Matches */}
      {activeTab === 'matches' && (
        <div className="space-y-3">
          {matches.map(m => (
            <div
              key={m.id}
              onClick={() => onNavigate('match', m.id)}
              className="p-4 rounded-xl bg-[#0b101a] hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center justify-between"
            >
              <span className="text-xs text-slate-400">{m.roundOrGameweek}</span>
              <div className="flex items-center gap-4 text-xs font-bold text-white">
                <span>{m.status === 'live' ? `LIVE ${m.minute}'` : m.status.toUpperCase()}</span>
                <span className="font-mono text-emerald-400 text-sm">
                  {m.homeScore} - {m.awayScore}
                </span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                ম্যাচ সেন্টার <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: News */}
      {activeTab === 'news' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map(art => (
            <div
              key={art.id}
              onClick={() => onNavigate('article', art.slug)}
              className="group bg-[#0b101a] border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all flex flex-col justify-between shadow-lg"
            >
              <div className="aspect-[16/9] overflow-hidden bg-slate-950">
                <img src={art.featuredImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-4 space-y-2">
                <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-emerald-300 line-clamp-2">
                  {language === 'en' && art.translations?.en?.title ? art.translations.en.title : art.title}
                </h4>
                <span className="text-[10px] text-slate-500 block">
                  {formatDate(art.publishedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
