import React, { useState, useEffect } from 'react';
import { Trophy, ArrowRight, Table, Newspaper, ChevronRight } from 'lucide-react';
import { Competition, StandingRow, Club, Article } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface LeagueSpotlightProps {
  onSelectArticle: (slug: string) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const LeagueSpotlight: React.FC<LeagueSpotlightProps> = ({ onSelectArticle, onNavigate }) => {
  const { language, toBanglaNumber, t } = useLanguage();
  const [activeComp, setActiveComp] = useState<string>('comp-epl');
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [clubs, setClubs] = useState<Record<string, Club>>({});
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    Promise.all([
      api.getCompetitions(),
      api.getClubs()
    ]).then(([compsData, clubsData]) => {
      setCompetitions(compsData);

      const clubMap: Record<string, Club> = {};
      clubsData.forEach(c => { clubMap[c.id] = c; });
      setClubs(clubMap);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!activeComp) return;
    Promise.all([
      api.getStandings(activeComp),
      api.getArticles({ competitionId: activeComp, limit: 3 })
    ]).then(([stData, artData]) => {
      setStandings(stData);
      setArticles(artData.items);
    }).catch(console.error);
  }, [activeComp]);

  const currentCompObj = competitions.find(c => c.id === activeComp);

  return (
    <div className="bg-[#0b101a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" />
            {language === 'en' ? 'League Hub & Standings' : 'লিগ স্পটলাইট ও পয়েন্ট টেবিল'}
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'en' ? 'Live tables, form guides and top stories' : 'শীর্ষ লিগের হালনাগাদ টেবিল ও বিশ্লেষণ'}
          </p>
        </div>

        {/* Competition Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {competitions.slice(0, 4).map(comp => (
            <button
              key={comp.id}
              onClick={() => setActiveComp(comp.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeComp === comp.id
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {language === 'en' ? comp.name : comp.banglaName}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid: Left Standings Table (7 cols) + Right League News (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Standings Table */}
        <div className="lg:col-span-7 bg-[#070b12] border border-slate-800/80 rounded-xl p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5 text-emerald-400" />
              {language === 'en' ? `${currentCompObj?.name} Standings` : `${currentCompObj?.banglaName} পয়েন্ট তালিকা`}
            </span>
            <button
              onClick={() => onNavigate('standings')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>{t('common.view_all', 'সম্পূর্ণ টেবিল')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800/60 text-[11px] font-bold">
                  <th className="py-2 px-2 text-center w-8">#</th>
                  <th className="py-2 px-2">ক্লাব</th>
                  <th className="py-2 px-2 text-center">ম্যাচ</th>
                  <th className="py-2 px-2 text-center">জয়</th>
                  <th className="py-2 px-2 text-center">ড্র</th>
                  <th className="py-2 px-2 text-center">হার</th>
                  <th className="py-2 px-2 text-center">GD</th>
                  <th className="py-2 px-2 text-center font-bold text-slate-300">পয়েন্ট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {standings.map((row) => {
                  const club = clubs[row.clubId];
                  return (
                    <tr 
                      key={row.clubId}
                      onClick={() => onNavigate('club', club?.slug || row.clubId)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-2 text-center font-bold text-slate-400">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
                          row.position === 1 ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/40' : 'text-slate-400'
                        }`}>
                          {language === 'bn' ? toBanglaNumber(row.position) : row.position}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-semibold text-slate-200">
                        <div className="flex items-center gap-2">
                          <img src={club?.logo} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {language === 'en' ? club?.name : club?.banglaName || club?.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-400 font-mono">
                        {language === 'bn' ? toBanglaNumber(row.played) : row.played}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-400 font-mono">
                        {language === 'bn' ? toBanglaNumber(row.won) : row.won}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-400 font-mono">
                        {language === 'bn' ? toBanglaNumber(row.drawn) : row.drawn}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-400 font-mono">
                        {language === 'bn' ? toBanglaNumber(row.lost) : row.lost}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-semibold text-slate-300">
                        {language === 'bn' ? (row.goalDifference >= 0 ? `+${toBanglaNumber(row.goalDifference)}` : toBanglaNumber(row.goalDifference)) : (row.goalDifference >= 0 ? `+${row.goalDifference}` : row.goalDifference)}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-extrabold text-emerald-400 text-sm">
                        {language === 'bn' ? toBanglaNumber(row.points) : row.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* League Specific Stories */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
              {language === 'en' ? 'Latest League News' : 'লিগের সর্বশেষ সংবাদ'}
            </span>
          </div>

          <div className="space-y-3">
            {articles.map(art => (
              <div
                key={art.id}
                onClick={() => onSelectArticle(art.slug)}
                className="group bg-[#070b12] hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/40 rounded-xl p-3 transition-all cursor-pointer flex gap-3"
              >
                <img 
                  src={art.featuredImage} 
                  alt="" 
                  className="w-20 h-16 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform" 
                />
                <div className="flex flex-col justify-between min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {language === 'en' && art.translations?.en?.title ? art.translations.en.title : art.title}
                  </h5>
                  <span className="text-[10px] text-slate-500">
                    {art.subcategory || art.category} • {language === 'bn' ? `${toBanglaNumber(art.readTimeMinutes)} মিনিট` : `${art.readTimeMinutes} min`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('competition', activeComp)}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>{language === 'en' ? `Explore Full ${currentCompObj?.name} Hub` : `সম্পূর্ণ ${currentCompObj?.banglaName} হাব দেখুন`}</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>

      </div>
    </div>
  );
};
