import React, { useState, useEffect } from 'react';
import { Trophy, Shield, Calendar, ArrowRight, Flame } from 'lucide-react';
import { Article, Match, Club, StandingRow } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface BangladeshFootballPageProps {
  onSelectArticle: (slug: string) => void;
  onSelectMatch: (matchId: string) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const BangladeshFootballPage: React.FC<BangladeshFootballPageProps> = ({ 
  onSelectArticle, 
  onSelectMatch, 
  onNavigate 
}) => {
  const { language, toBanglaNumber, formatDate } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [clubs, setClubs] = useState<Record<string, Club>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getArticles({ category: 'bangladesh-football' }),
      api.getMatches({ competitionId: 'comp-bpl' }),
      api.getStandings('comp-bpl'),
      api.getClubs()
    ]).then(([artRes, mRes, stRes, clRes]) => {
      setArticles(artRes.items);
      setMatches(mRes);
      setStandings(stRes);

      const cMap: Record<string, Club> = {};
      clRes.forEach(c => { cMap[c.id] = c; });
      setClubs(cMap);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-[#071710] to-[#0a1220] border border-emerald-500/40 rounded-3xl p-8 shadow-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
          <span>বাংলাদেশ ফুটবল হাব • BPL & জাতীয় দল</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white">
          {language === 'en' 
            ? 'Bangladesh Premier League & National Football' 
            : 'বাংলাদেশ প্রিমিয়ার লিগ (BPL), বসুন্ধরা কিংস ও লাল-সবুজ ফুটবল'}
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          {language === 'en'
            ? 'Dedicated coverage of domestic Bangladesh clubs, AFC competitions, BFF league standings and national team reports.'
            : 'ঘরোয়া ফুটবলের এক্সক্লুসিভ রিপোর্ট, বসুন্ধরা কিংসের এএফসি অভিযান, জাতীয় দলের প্রস্তুতি ও বিপিএল পয়েন্ট তালিকা।'}
        </p>
      </div>

      {/* Grid: Matches & Standings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Standings (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b101a] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              বাংলাদেশ প্রিমিয়ার লিগ টেবিল (২০২৪-২৫)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[11px] font-bold">
                  <th className="py-2 px-2 text-center w-8">#</th>
                  <th className="py-2 px-2">ক্লাব</th>
                  <th className="py-2 px-2 text-center">ম্যাচ</th>
                  <th className="py-2 px-2 text-center">জয়</th>
                  <th className="py-2 px-2 text-center">ড্র</th>
                  <th className="py-2 px-2 text-center">হার</th>
                  <th className="py-2 px-2 text-center">GD</th>
                  <th className="py-2 px-2 text-center font-bold text-emerald-400">পয়েন্ট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {standings.map(row => {
                  const club = clubs[row.clubId];
                  return (
                    <tr 
                      key={row.clubId}
                      onClick={() => onNavigate('club', club?.slug || row.clubId)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-2 text-center font-bold text-slate-400">
                        {language === 'bn' ? toBanglaNumber(row.position) : row.position}
                      </td>
                      <td className="py-2.5 px-2 font-semibold text-slate-200">
                        <div className="flex items-center gap-2">
                          <img src={club?.logo} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                          <span className="truncate">{language === 'en' ? club?.name : club?.banglaName}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">{language === 'bn' ? toBanglaNumber(row.played) : row.played}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{language === 'bn' ? toBanglaNumber(row.won) : row.won}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{language === 'bn' ? toBanglaNumber(row.drawn) : row.drawn}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{language === 'bn' ? toBanglaNumber(row.lost) : row.lost}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-semibold text-slate-300">
                        {language === 'bn' ? `+${toBanglaNumber(row.goalDifference)}` : `+${row.goalDifference}`}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-emerald-400">
                        {language === 'bn' ? toBanglaNumber(row.points) : row.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Domestic Matches (5 cols) */}
        <div className="lg:col-span-5 bg-[#0b101a] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              সাম্প্রতিক ও আসন্ন বিপিএল ম্যাচ
            </h3>
          </div>

          <div className="space-y-3">
            {matches.map(m => {
              const hClub = clubs[m.homeClubId];
              const aClub = clubs[m.awayClubId];
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMatch(m.id)}
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800/60 pb-1">
                    <span>{m.roundOrGameweek}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                      {m.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={hClub?.logo} alt="" className="w-4 h-4 rounded-full object-cover" />
                      <span className="font-semibold text-white">{language === 'en' ? hClub?.name : hClub?.banglaName}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {language === 'bn' ? `${toBanglaNumber(m.homeScore)} - ${toBanglaNumber(m.awayScore)}` : `${m.homeScore} - ${m.awayScore}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{language === 'en' ? aClub?.name : aClub?.banglaName}</span>
                      <img src={aClub?.logo} alt="" className="w-4 h-4 rounded-full object-cover" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bangladesh News Stories */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Flame className="w-4 h-4 text-emerald-400" />
          বাংলাদেশ ফুটবলের সর্বশেষ সংবাদ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map(art => (
            <div
              key={art.id}
              onClick={() => onSelectArticle(art.slug)}
              className="group bg-[#0b101a] border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all flex flex-col justify-between shadow-lg"
            >
              <div className="aspect-[16/9] overflow-hidden bg-slate-950">
                <img 
                  src={art.featuredImage} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    {art.subcategory || 'BPL'}
                  </span>
                  <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                    {language === 'en' && art.translations?.en?.title ? art.translations.en.title : art.title}
                  </h4>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{formatDate(art.publishedAt)}</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    পড়ুন <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
