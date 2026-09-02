import React, { useState, useEffect } from 'react';
import { 
  Radio, Clock, Trophy, MapPin, User, Shield, Activity, 
  ArrowLeft, RefreshCw, BarChart2, Users, FileText, CheckCircle2,
  Share2, ArrowRight
} from 'lucide-react';
import { Match, Club, Competition, Player } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface MatchCentreProps {
  matchId: string;
  onNavigate: (view: string, param?: string) => void;
  onBack: () => void;
}

export const MatchCentre: React.FC<MatchCentreProps> = ({ matchId, onNavigate, onBack }) => {
  const { language, toBanglaNumber, formatDate } = useLanguage();
  const [match, setMatch] = useState<Match | null>(null);
  const [homeClub, setHomeClub] = useState<Club | null>(null);
  const [awayClub, setAwayClub] = useState<Club | null>(null);
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'lineups' | 'stats' | 'commentary'>('events');
  const [isLoading, setIsLoading] = useState(true);

  const fetchMatchData = async () => {
    try {
      const matchData = await api.getMatchById(matchId);
      setMatch(matchData);

      const [clData, compData] = await Promise.all([
        api.getClubs(),
        api.getCompetitions()
      ]);

      const hClub = clData.find(c => c.id === matchData.homeClubId) || null;
      const aClub = clData.find(c => c.id === matchData.awayClubId) || null;
      const comp = compData.find(c => c.id === matchData.competitionId) || null;

      setHomeClub(hClub);
      setAwayClub(aClub);
      setCompetition(comp);
    } catch (err) {
      console.error('Failed to load match centre:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchData();
    const interval = setInterval(fetchMatchData, 6000); // Polling for match live events
    return () => clearInterval(interval);
  }, [matchId]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">ম্যাচ সেন্টার লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">ম্যাচটি পাওয়া যায়নি</h2>
        <button onClick={onBack} className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-sm">
          পেছনে ফিরে যান
        </button>
      </div>
    );
  }

  const isLive = match.status === 'live';
  const isHT = match.status === 'ht';
  const isFT = match.status === 'ft';

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'en' ? 'Back to Fixtures' : 'ম্যাচ তালিকায় ফিরে যান'}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMatchData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>হালনাগাদ</span>
          </button>
        </div>
      </div>

      {/* Match Scoreboard Hero Card */}
      <div className="bg-gradient-to-b from-[#0e1626] to-[#080d15] border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* Match Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white text-sm">
              {language === 'en' ? competition?.name : competition?.banglaName}
            </span>
            <span>•</span>
            <span>{match.roundOrGameweek}</span>
          </div>

          <div className="flex items-center gap-2">
            {isLive && (
              <span className="px-3 py-1 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                {language === 'en' ? `LIVE • ${match.minute}'` : `লাইভ • ${toBanglaNumber(match.minute)}'`}
              </span>
            )}
            {isHT && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold">
                হাফ টাইম (HT)
              </span>
            )}
            {isFT && (
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold">
                ফুল টাইম (FT)
              </span>
            )}
            {match.status === 'upcoming' && (
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                {formatDate(match.dateTime)}
              </span>
            )}
          </div>
        </div>

        {/* Main Teams & Scoreboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 py-4">
          
          {/* Home Team (5 cols) */}
          <div className="md:col-span-5 flex flex-col md:flex-row items-center gap-4 text-center md:text-right justify-end">
            <div className="order-2 md:order-1">
              <button 
                onClick={() => onNavigate('club', homeClub?.slug || match.homeClubId)}
                className="text-lg md:text-xl font-black text-white hover:text-emerald-400 transition-colors"
              >
                {language === 'en' ? homeClub?.name : homeClub?.banglaName || homeClub?.name}
              </button>
              <p className="text-xs text-slate-400 mt-0.5">
                {match.homeLineup?.formation || '4-3-3'}
              </p>
            </div>
            <img 
              src={homeClub?.logo} 
              alt="" 
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-slate-700 order-1 md:order-2 shrink-0 p-1 bg-slate-900" 
            />
          </div>

          {/* Score & Status Badge (2 cols) */}
          <div className="md:col-span-2 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#05080e] border border-slate-800 shadow-inner">
              <span className="text-3xl md:text-4xl font-black font-mono text-emerald-400">
                {language === 'bn' ? toBanglaNumber(match.homeScore) : match.homeScore}
              </span>
              <span className="text-slate-600 font-bold text-2xl">:</span>
              <span className="text-3xl md:text-4xl font-black font-mono text-emerald-400">
                {language === 'bn' ? toBanglaNumber(match.awayScore) : match.awayScore}
              </span>
            </div>
            {isLive && (
              <span className="text-[11px] text-rose-400 font-semibold mt-2 animate-pulse">
                {language === 'bn' ? `${toBanglaNumber(match.minute)}তম মিনিট চলমান` : `Minute ${match.minute}' in play`}
              </span>
            )}
          </div>

          {/* Away Team (5 cols) */}
          <div className="md:col-span-5 flex flex-col md:flex-row items-center gap-4 text-center md:text-left justify-start">
            <img 
              src={awayClub?.logo} 
              alt="" 
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-slate-700 shrink-0 p-1 bg-slate-900" 
            />
            <div>
              <button 
                onClick={() => onNavigate('club', awayClub?.slug || match.awayClubId)}
                className="text-lg md:text-xl font-black text-white hover:text-emerald-400 transition-colors"
              >
                {language === 'en' ? awayClub?.name : awayClub?.banglaName || awayClub?.name}
              </button>
              <p className="text-xs text-slate-400 mt-0.5">
                {match.awayLineup?.formation || '4-2-3-1'}
              </p>
            </div>
          </div>

        </div>

        {/* Venue, Referee & xG Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {match.venue}
            </span>
            {match.referee && (
              <span className="flex items-center gap-1.5 hidden sm:flex">
                <User className="w-3.5 h-3.5 text-slate-500" />
                রেফারি: {match.referee}
              </span>
            )}
          </div>

          {match.stats?.homeExpectedGoals && (
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-500">xG:</span>
              <span className="text-emerald-400 font-bold">{match.stats.homeExpectedGoals}</span>
              <span className="text-slate-600">-</span>
              <span className="text-emerald-400 font-bold">{match.stats.awayExpectedGoals}</span>
            </div>
          )}
        </div>

      </div>

      {/* Match Sub-Navigation Tabs */}
      <div className="flex items-center justify-center border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'events'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {language === 'en' ? 'Events & Timeline' : 'টাইমলাইন ও গোলসমূহ'}
        </button>

        <button
          onClick={() => setActiveTab('lineups')}
          className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'lineups'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {language === 'en' ? 'Lineups & Tactical Pitch' : 'একাদশ ও কৌশলগত অবস্থান'}
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'stats'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {language === 'en' ? 'Match Statistics' : 'ম্যাচ পরিসংখ্যান (xG)'}
        </button>

        <button
          onClick={() => setActiveTab('commentary')}
          className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'commentary'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {language === 'en' ? 'Live Commentary' : 'ধারাবিবরণী'}
        </button>
      </div>

      {/* Tab 1: Timeline Events */}
      {activeTab === 'events' && (
        <div className="bg-[#0b101a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            {language === 'en' ? 'Key Match Events' : 'ম্যাচের গুরুত্বপূর্ণ ঘটনাবলী'}
          </h3>

          <div className="space-y-4">
            {match.events.map((ev) => {
              const isHomeEvent = ev.teamSide === 'home';
              return (
                <div 
                  key={ev.id} 
                  className={`flex items-center gap-4 p-3.5 rounded-xl border ${
                    isHomeEvent ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-900/80 border-slate-800 ml-auto'
                  }`}
                >
                  <span className="w-10 h-10 rounded-xl bg-[#060a10] border border-slate-700 flex items-center justify-center font-mono font-bold text-emerald-400 text-sm shrink-0">
                    {language === 'bn' ? `${toBanglaNumber(ev.minute)}'` : `${ev.minute}'`}
                  </span>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {language === 'en' ? ev.playerName : ev.banglaPlayerName}
                      </span>
                      {ev.type === 'goal' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                          GOAL ⚽
                        </span>
                      )}
                      {ev.type === 'yellow_card' && (
                        <span className="w-3 h-4 bg-amber-400 rounded-xs inline-block"></span>
                      )}
                      {ev.type === 'red_card' && (
                        <span className="w-3 h-4 bg-rose-600 rounded-xs inline-block"></span>
                      )}
                    </div>
                    {ev.description && (
                      <p className="text-xs text-slate-400 mt-1">
                        {language === 'en' ? ev.description : ev.banglaDescription}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Lineups & Tactical Pitch */}
      {activeTab === 'lineups' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Home Lineup */}
            <div className="bg-[#0b101a] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <img src={homeClub?.logo} alt="" className="w-6 h-6 rounded-full object-cover" />
                  <span className="font-bold text-white text-sm">
                    {language === 'en' ? homeClub?.name : homeClub?.banglaName}
                  </span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                  {match.homeLineup?.formation}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'en' ? 'Starting XI' : 'প্রথম একাদশ'}
                </h4>
                <div className="space-y-1.5">
                  {match.homeLineup?.startingXI.map((pl) => (
                    <div key={pl.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center text-[10px]">
                          {pl.jerseyNumber}
                        </span>
                        <span className="font-semibold text-slate-200">
                          {language === 'en' ? pl.name : pl.banglaName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{pl.position}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Away Lineup */}
            <div className="bg-[#0b101a] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <img src={awayClub?.logo} alt="" className="w-6 h-6 rounded-full object-cover" />
                  <span className="font-bold text-white text-sm">
                    {language === 'en' ? awayClub?.name : awayClub?.banglaName}
                  </span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                  {match.awayLineup?.formation}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'en' ? 'Starting XI' : 'প্রথম একাদশ'}
                </h4>
                <div className="space-y-1.5">
                  {match.awayLineup?.startingXI.map((pl) => (
                    <div key={pl.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center text-[10px]">
                          {pl.jerseyNumber}
                        </span>
                        <span className="font-semibold text-slate-200">
                          {language === 'en' ? pl.name : pl.banglaName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{pl.position}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 3: Match Statistics */}
      {activeTab === 'stats' && match.stats && (
        <div className="bg-[#0b101a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            {language === 'en' ? 'Detailed Match Analytics & Data' : 'ম্যাচ পরিসংখ্যান ও ডাটা অ্যানালিসিস'}
          </h3>

          <div className="space-y-5">
            {/* Possession */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400">{match.stats.possessionHome}%</span>
                <span className="text-slate-300">বল পজেশন (Possession)</span>
                <span className="text-cyan-400">{match.stats.possessionAway}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 flex overflow-hidden">
                <div style={{ width: `${match.stats.possessionHome}%` }} className="bg-emerald-500 h-full"></div>
                <div style={{ width: `${match.stats.possessionAway}%` }} className="bg-cyan-500 h-full"></div>
              </div>
            </div>

            {/* Expected Goals */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400">{match.stats.homeExpectedGoals}</span>
                <span className="text-slate-300">এক্সপেক্টেড গোলস (xG)</span>
                <span className="text-cyan-400">{match.stats.awayExpectedGoals}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 flex overflow-hidden">
                <div style={{ width: `${(match.stats.homeExpectedGoals / (match.stats.homeExpectedGoals + match.stats.awayExpectedGoals)) * 100}%` }} className="bg-emerald-500 h-full"></div>
                <div style={{ width: `${(match.stats.awayExpectedGoals / (match.stats.homeExpectedGoals + match.stats.awayExpectedGoals)) * 100}%` }} className="bg-cyan-500 h-full"></div>
              </div>
            </div>

            {/* Shots on target */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400">{match.stats.shotsOnTargetHome}</span>
                <span className="text-slate-300">টার্গেটে শট (Shots on Target)</span>
                <span className="text-cyan-400">{match.stats.shotsOnTargetAway}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 flex overflow-hidden">
                <div style={{ width: `${(match.stats.shotsOnTargetHome / (match.stats.shotsOnTargetHome + match.stats.shotsOnTargetAway || 1)) * 100}%` }} className="bg-emerald-500 h-full"></div>
                <div style={{ width: `${(match.stats.shotsOnTargetAway / (match.stats.shotsOnTargetHome + match.stats.shotsOnTargetAway || 1)) * 100}%` }} className="bg-cyan-500 h-full"></div>
              </div>
            </div>

            {/* Total shots */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400">{match.stats.shotsTotalHome}</span>
                <span className="text-slate-300">মোট শট (Total Shots)</span>
                <span className="text-cyan-400">{match.stats.shotsTotalAway}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 flex overflow-hidden">
                <div style={{ width: `${(match.stats.shotsTotalHome / (match.stats.shotsTotalHome + match.stats.shotsTotalAway || 1)) * 100}%` }} className="bg-emerald-500 h-full"></div>
                <div style={{ width: `${(match.stats.shotsTotalAway / (match.stats.shotsTotalHome + match.stats.shotsTotalAway || 1)) * 100}%` }} className="bg-cyan-500 h-full"></div>
              </div>
            </div>

            {/* Corners */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400">{match.stats.cornersHome}</span>
                <span className="text-slate-300">কর্নার কিক</span>
                <span className="text-cyan-400">{match.stats.cornersAway}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 flex overflow-hidden">
                <div style={{ width: `${(match.stats.cornersHome / (match.stats.cornersHome + match.stats.cornersAway || 1)) * 100}%` }} className="bg-emerald-500 h-full"></div>
                <div style={{ width: `${(match.stats.cornersAway / (match.stats.cornersHome + match.stats.cornersAway || 1)) * 100}%` }} className="bg-cyan-500 h-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Live Commentary */}
      {activeTab === 'commentary' && (
        <div className="bg-[#0b101a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            {language === 'en' ? 'Live Text Commentary' : 'লাইভ টেক্সট ধারাবিবরণী'}
          </h3>

          <div className="space-y-3">
            {match.commentary && match.commentary.length > 0 ? (
              match.commentary.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex gap-3 text-xs">
                  <span className="font-mono font-bold text-emerald-400 shrink-0">
                    {language === 'bn' ? `${toBanglaNumber(c.minute)}'` : `${c.minute}'`}
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {language === 'en' ? c.comment : c.banglaComment}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">ধারাবিবরণী প্রস্তুত করা হচ্ছে...</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
