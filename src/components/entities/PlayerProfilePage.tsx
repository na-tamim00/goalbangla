import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Trophy, Activity, ArrowLeft, ArrowRight, 
  Flame, Award, Star, Calendar, CheckCircle2 
} from 'lucide-react';
import { Player, Club, Article, Transfer } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface PlayerProfilePageProps {
  slug: string;
  onNavigate: (view: string, param?: string) => void;
  onBack: () => void;
}

export const PlayerProfilePage: React.FC<PlayerProfilePageProps> = ({ slug, onNavigate, onBack }) => {
  const { language, toBanglaNumber, formatDate } = useLanguage();
  const [player, setPlayer] = useState<Player | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getPlayerDetails(slug)
      .then(res => {
        setPlayer(res.player);
        setClub(res.club);
        setArticles(res.articles);
        setTransfers(res.transfers);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">প্লেয়ার প্রোফাইল লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">খেলোয়াড়টি পাওয়া যায়নি</h2>
        <button onClick={onBack} className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-sm">
          পেছনে যান
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>পেছনে যান</span>
      </button>

      {/* Player Bio Hero */}
      <div className="bg-gradient-to-r from-[#091120] via-slate-900 to-[#0e1628] border border-slate-700/80 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="relative">
            <img 
              src={player.photo} 
              alt={player.name} 
              className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border-2 border-slate-700 shadow-2xl shrink-0" 
            />
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-lg bg-emerald-500 text-black font-extrabold text-xs">
              #{player.jerseyNumber}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold text-xs border border-cyan-500/40 uppercase">
                {language === 'en' ? player.position : player.banglaPosition}
              </span>
              <span className="text-xs text-slate-400">
                জাতীয়তা: <strong>{player.nationality}</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">
                বয়স: {language === 'bn' ? toBanglaNumber(player.age) : player.age} বছর
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white">
              {language === 'en' ? player.name : player.banglaName}
            </h1>

            {club && (
              <div 
                onClick={() => onNavigate('club', club.slug)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 cursor-pointer transition-colors"
              >
                <img src={club.logo} alt="" className="w-4 h-4 rounded-full object-cover" />
                <span className="text-xs font-bold text-slate-200">
                  {language === 'en' ? club.name : club.banglaName}
                </span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 text-center shrink-0 w-full md:w-44">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
              মার্কেট ভ্যালু (Market Value)
            </span>
            <span className="text-xl font-black text-emerald-400 font-mono block mt-1">
              {player.marketValue}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              চুক্তির মেয়াদ: ২০২৮
            </span>
          </div>
        </div>

        {/* Season Telemetry Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">ম্যাচ খেলেছেন</span>
            <span className="text-xl font-black font-mono text-white mt-1 block">
              {language === 'bn' ? toBanglaNumber(player.stats.appearances) : player.stats.appearances}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">গোল (Goals)</span>
            <span className="text-xl font-black font-mono text-emerald-400 mt-1 block">
              {language === 'bn' ? toBanglaNumber(player.stats.goals) : player.stats.goals}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">অ্যাসিস্ট (Assists)</span>
            <span className="text-xl font-black font-mono text-cyan-400 mt-1 block">
              {language === 'bn' ? toBanglaNumber(player.stats.assists) : player.stats.assists}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">পাস অ্যাকুরেসি</span>
            <span className="text-xl font-black font-mono text-amber-400 mt-1 block">
              {language === 'bn' ? toBanglaNumber(player.stats.passAccuracy) : player.stats.passAccuracy}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">গড় রেটিং</span>
            <span className="text-xl font-black font-mono text-purple-400 mt-1 block">
              {player.stats.rating}
            </span>
          </div>
        </div>
      </div>

      {/* Related News & Reports */}
      {articles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Flame className="w-4 h-4 text-emerald-400" />
            {player.banglaName} সম্পর্কিত সর্বশেষ খবর ও বিশ্লেষণ
          </h3>

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
        </div>
      )}

    </div>
  );
};
