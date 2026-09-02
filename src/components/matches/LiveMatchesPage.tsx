import React, { useState, useEffect } from 'react';
import { Radio, Trophy, Calendar, Clock, RefreshCw, ArrowRight } from 'lucide-react';
import { Match, Competition, Club } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface LiveMatchesPageProps {
  onSelectMatch: (matchId: string) => void;
  onSelectClub?: (clubSlug: string) => void;
  onNavigate?: (view: string, param?: string) => void;
}

export const LiveMatchesPage: React.FC<LiveMatchesPageProps> = ({ onSelectMatch, onSelectClub, onNavigate }) => {
  const { language, toBanglaNumber, formatDate, t } = useLanguage();
  const [matches, setMatches] = useState<Match[]>([]);
  const [competitions, setCompetitions] = useState<Record<string, Competition>>({});
  const [clubs, setClubs] = useState<Record<string, Club>>({});
  const [selectedCompFilter, setSelectedCompFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'ft'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      const [mList, cList, compList] = await Promise.all([
        api.getMatches(),
        api.getClubs(),
        api.getCompetitions()
      ]);
      setMatches(Array.isArray(mList) ? mList : []);

      const clMap: Record<string, Club> = {};
      (cList || []).forEach(c => { if (c) clMap[c.id] = c; });
      setClubs(clMap);

      const compMap: Record<string, Competition> = {};
      (compList || []).forEach(comp => { if (comp) compMap[comp.id] = comp; });
      setCompetitions(compMap);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 8000);
    return () => clearInterval(interval);
  }, []);

  const safeMatches = Array.isArray(matches) ? matches : [];
  const filteredMatches = safeMatches.filter(m => {
    if (!m) return false;
    if (selectedCompFilter !== 'all' && m.competitionId !== selectedCompFilter) return false;
    if (selectedStatusFilter === 'live' && m.status !== 'live' && m.status !== 'ht') return false;
    if (selectedStatusFilter === 'upcoming' && m.status !== 'upcoming') return false;
    if (selectedStatusFilter === 'ft' && m.status !== 'ft') return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <h1 className="text-2xl font-extrabold text-white">
              {language === 'en' ? 'Live Match Centre & Fixtures' : 'লাইভ ম্যাচ সেন্টার ও ফিক্সচার'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'en' ? 'Real-time scores, lineups, xG analytics, and match timelines' : 'লাইভ স্কোর, একাদশ, গোল পরিসংখ্যান ও বিশ্লেষণ'}
          </p>
        </div>

        <button
          onClick={fetchMatches}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>হালনাগাদ</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#090e18] border border-slate-800">
        {/* Status Pills */}
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: language === 'en' ? 'All Matches' : 'সকল ম্যাচ' },
            { id: 'live', label: language === 'en' ? 'Live Now' : 'চলমান ম্যাচ', isLive: true },
            { id: 'upcoming', label: language === 'en' ? 'Upcoming' : 'আসন্ন' },
            { id: 'ft', label: language === 'en' ? 'Finished' : 'সমাপ্ত' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setSelectedStatusFilter(st.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedStatusFilter === st.id
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st.isLive && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
              <span>{st.label}</span>
            </button>
          ))}
        </div>

        {/* Competition Dropdown / Pills */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCompFilter}
            onChange={(e) => setSelectedCompFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="all">{language === 'en' ? 'All Competitions' : 'সকল প্রতিযোগিতা'}</option>
            {(Object.values(competitions) as Competition[]).map(comp => (
              <option key={comp.id} value={comp.id}>
                {language === 'en' ? comp.name : comp.banglaName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Match Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMatches.map(match => {
          const homeClub = clubs[match.homeClubId];
          const awayClub = clubs[match.awayClubId];
          const comp = competitions[match.competitionId];
          const isLive = match.status === 'live';
          const isHT = match.status === 'ht';
          const isFT = match.status === 'ft';

          return (
            <div
              key={match.id}
              onClick={() => onSelectMatch(match.id)}
              className="group bg-[#0b101a] hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all cursor-pointer shadow-lg space-y-4"
            >
              {/* Competition Header */}
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <img src={comp?.logo} alt="" className="w-4 h-4 rounded-full object-cover" />
                  <span className="font-semibold text-slate-300 truncate">
                    {language === 'en' ? comp?.name : comp?.banglaName}
                  </span>
                  <span>•</span>
                  <span>{match.roundOrGameweek}</span>
                </div>

                <div>
                  {isLive && (
                    <span className="px-2 py-0.5 rounded bg-rose-600/20 text-rose-400 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                      {language === 'bn' ? `${toBanglaNumber(match.minute)}'` : `${match.minute}'`}
                    </span>
                  )}
                  {isHT && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[11px] font-bold">
                      হাফ টাইম
                    </span>
                  )}
                  {isFT && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-bold">
                      ফুল টাইম
                    </span>
                  )}
                  {match.status === 'upcoming' && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px]">
                      {formatDate(match.dateTime)}
                    </span>
                  )}
                </div>
              </div>

              {/* Teams & Score Row */}
              <div className="flex items-center justify-between py-2">
                {/* Home */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img src={homeClub?.logo} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                    {language === 'en' ? homeClub?.name : homeClub?.banglaName}
                  </span>
                </div>

                {/* Score */}
                <div className="px-4 py-1.5 rounded-xl bg-[#060a10] border border-slate-800 text-center shrink-0">
                  <div className="text-lg font-black font-mono text-emerald-400">
                    {match.status === 'upcoming' 
                      ? 'VS' 
                      : (language === 'bn' ? `${toBanglaNumber(match.homeScore)} - ${toBanglaNumber(match.awayScore)}` : `${match.homeScore} - ${match.awayScore}`)}
                  </div>
                </div>

                {/* Away */}
                <div className="flex items-center justify-end gap-3 min-w-0 flex-1 text-right">
                  <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                    {language === 'en' ? awayClub?.name : awayClub?.banglaName}
                  </span>
                  <img src={awayClub?.logo} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/80">
                <span className="truncate">{match.venue}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>{language === 'en' ? 'Match Centre' : 'ম্যাচ সেন্টার'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
