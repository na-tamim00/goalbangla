import React, { useState, useEffect } from 'react';
import { Trophy, Table, TrendingUp, ChevronRight } from 'lucide-react';
import { Competition, StandingRow, Club } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface StandingsPageProps {
  onNavigate: (view: string, param?: string) => void;
  defaultCompId?: string;
}

export const StandingsPage: React.FC<StandingsPageProps> = ({ onNavigate, defaultCompId }) => {
  const { language, toBanglaNumber } = useLanguage();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [activeComp, setActiveComp] = useState<string>(defaultCompId || 'comp-epl');
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [clubs, setClubs] = useState<Record<string, Club>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getCompetitions(),
      api.getClubs()
    ]).then(([compList, clubList]) => {
      setCompetitions(compList);
      const cMap: Record<string, Club> = {};
      clubList.forEach(c => { cMap[c.id] = c; });
      setClubs(cMap);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (defaultCompId) setActiveComp(defaultCompId);
  }, [defaultCompId]);

  useEffect(() => {
    if (!activeComp) return;
    setIsLoading(true);
    api.getStandings(activeComp)
      .then(setStandings)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [activeComp]);

  const currentComp = competitions.find(c => c.id === activeComp);

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-extrabold text-white">
              {language === 'en' ? 'League Tables & Standings' : 'পয়েন্ট টেবিল ও লিগ র‍্যাঙ্কিং'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'en' ? 'Official football league standings with recent form guides and goal difference' : 'ইউরোপীয় ও ঘরোয়া লিগের সর্বশেষ অফিশিয়াল পয়েন্ট তালিকা'}
          </p>
        </div>

        {/* Competition Picker */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {competitions.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveComp(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeComp === c.id
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {language === 'en' ? c.name : c.banglaName}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#0b101a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <img src={currentComp?.logo} alt="" className="w-7 h-7 rounded-full object-cover" />
            <div>
              <h2 className="text-base font-bold text-white">
                {language === 'en' ? currentComp?.name : currentComp?.banglaName}
              </h2>
              <span className="text-xs text-slate-400">
                সিজন {currentComp?.currentSeason} • {currentComp?.country}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-10">পজিশন</th>
                <th className="py-3 px-3">ক্লাব</th>
                <th className="py-3 px-3 text-center">ম্যাচ (P)</th>
                <th className="py-3 px-3 text-center">জয় (W)</th>
                <th className="py-3 px-3 text-center">ড্র (D)</th>
                <th className="py-3 px-3 text-center">হার (L)</th>
                <th className="py-3 px-3 text-center">গোল ব্যবধান (GD)</th>
                <th className="py-3 px-3 text-center font-bold text-white">পয়েন্ট (PTS)</th>
                <th className="py-3 px-3 text-center">সাম্প্রতিক ফর্ম (Form)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {standings.map((row) => {
                const club = clubs[row.clubId];
                const isUCLZone = row.position <= 4;
                const isRelegationZone = row.position >= 18;

                return (
                  <tr 
                    key={row.clubId}
                    onClick={() => onNavigate('club', club?.slug || row.clubId)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    {/* Position */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                        row.position === 1 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                          : isUCLZone 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                          : isRelegationZone 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'text-slate-400'
                      }`}>
                        {language === 'bn' ? toBanglaNumber(row.position) : row.position}
                      </span>
                    </td>

                    {/* Club */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img src={club?.logo} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                        <div>
                          <span className="font-bold text-white hover:text-emerald-400 transition-colors block">
                            {language === 'en' ? club?.name : club?.banglaName || club?.name}
                          </span>
                          <span className="text-[10px] text-slate-500">{club?.stadium}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center text-slate-300 font-mono">
                      {language === 'bn' ? toBanglaNumber(row.played) : row.played}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-300 font-mono">
                      {language === 'bn' ? toBanglaNumber(row.won) : row.won}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-300 font-mono">
                      {language === 'bn' ? toBanglaNumber(row.drawn) : row.drawn}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-300 font-mono">
                      {language === 'bn' ? toBanglaNumber(row.lost) : row.lost}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-200">
                      {language === 'bn' ? (row.goalDifference >= 0 ? `+${toBanglaNumber(row.goalDifference)}` : toBanglaNumber(row.goalDifference)) : (row.goalDifference >= 0 ? `+${row.goalDifference}` : row.goalDifference)}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-black text-emerald-400 text-sm">
                      {language === 'bn' ? toBanglaNumber(row.points) : row.points}
                    </td>

                    {/* Form Guide Pills */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {row.form?.map((result, idx) => (
                          <span 
                            key={idx}
                            className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center ${
                              result === 'W' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                : result === 'D' 
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {result}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>চ্যাম্পিয়ন্স লিগ কোয়ালিফিকেশন (টপ ৪)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span>রেলিগেশন জোন</span>
          </div>
        </div>
      </div>

    </div>
  );
};
