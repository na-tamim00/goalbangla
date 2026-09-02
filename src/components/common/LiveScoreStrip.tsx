import React, { useState, useEffect } from 'react';
import { Radio, ChevronRight, RefreshCw, Trophy } from 'lucide-react';
import { api } from '../../services/api';
import { Match, Club, Competition } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface LiveScoreStripProps {
  onSelectMatch: (matchId: string) => void;
  onViewAllMatches: () => void;
}

export const LiveScoreStrip: React.FC<LiveScoreStripProps> = ({ onSelectMatch, onViewAllMatches }) => {
  const { language, toBanglaNumber, t } = useLanguage();
  const [matches, setMatches] = useState<Match[]>([]);
  const [clubs, setClubs] = useState<Record<string, Club>>({});
  const [competitions, setCompetitions] = useState<Record<string, Competition>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [matchesData, clubsData, compsData] = await Promise.all([
        api.getMatches(),
        api.getClubs(),
        api.getCompetitions()
      ]);
      setMatches(matchesData);

      const clubMap: Record<string, Club> = {};
      clubsData.forEach(c => { clubMap[c.id] = c; });
      setClubs(clubMap);

      const compMap: Record<string, Competition> = {};
      compsData.forEach(c => { compMap[c.id] = c; });
      setCompetitions(compMap);
    } catch (err) {
      console.error('Failed to load score strip:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000); // Poll live scores
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#080d14] border-b border-slate-800/80 py-2.5 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left header tag */}
        <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="hidden sm:inline">{t('nav.live', 'লাইভ স্কোর')}</span>
          </div>
          <button 
            onClick={fetchData} 
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            title="Refresh Live Scores"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* Scrollable Matches Row */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5 flex-1">
          {matches.map(match => {
            const homeClub = clubs[match.homeClubId];
            const awayClub = clubs[match.awayClubId];
            const comp = competitions[match.competitionId];
            const isLive = match.status === 'live';
            const isHT = match.status === 'ht';
            const isFT = match.status === 'ft';

            return (
              <button
                key={match.id}
                onClick={() => onSelectMatch(match.id)}
                className="group shrink-0 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-2.5 transition-all text-left w-60 md:w-64 shadow-sm hover:shadow-emerald-950/20 cursor-pointer"
              >
                {/* Match Subhead */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 pb-1 border-b border-slate-800/60">
                  <span className="truncate font-medium">
                    {language === 'en' ? comp?.name : comp?.banglaName}
                  </span>
                  <div>
                    {isLive && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-600/20 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                        {language === 'bn' ? `${toBanglaNumber(match.minute)}'` : `${match.minute}'`}
                      </span>
                    )}
                    {isHT && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                        HT
                      </span>
                    )}
                    {isFT && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                        FT
                      </span>
                    )}
                    {match.status === 'upcoming' && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {language === 'bn' ? 'আসন্ন' : 'Upcoming'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Teams & Scores */}
                <div className="space-y-1">
                  {/* Home Team */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <img 
                        src={homeClub?.logo || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=40&q=80'} 
                        alt="" 
                        className="w-4 h-4 rounded-full object-cover shrink-0" 
                      />
                      <span className={`text-xs font-semibold truncate ${match.homeScore > match.awayScore && isFT ? 'text-white font-bold' : 'text-slate-200'}`}>
                        {language === 'en' ? homeClub?.name : homeClub?.banglaName || homeClub?.name}
                      </span>
                    </div>
                    <span className="text-sm font-extrabold font-mono text-emerald-400">
                      {language === 'bn' ? toBanglaNumber(match.homeScore) : match.homeScore}
                    </span>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <img 
                        src={awayClub?.logo || 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=40&q=80'} 
                        alt="" 
                        className="w-4 h-4 rounded-full object-cover shrink-0" 
                      />
                      <span className={`text-xs font-semibold truncate ${match.awayScore > match.homeScore && isFT ? 'text-white font-bold' : 'text-slate-200'}`}>
                        {language === 'en' ? awayClub?.name : awayClub?.banglaName || awayClub?.name}
                      </span>
                    </div>
                    <span className="text-sm font-extrabold font-mono text-emerald-400">
                      {language === 'bn' ? toBanglaNumber(match.awayScore) : match.awayScore}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* View All Matches Button */}
        <button
          onClick={onViewAllMatches}
          className="shrink-0 flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 pl-3 border-l border-slate-800 transition-colors cursor-pointer"
        >
          <span className="hidden md:inline">{t('common.view_all', 'সকল ম্যাচ')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
