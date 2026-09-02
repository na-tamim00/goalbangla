import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle2, TrendingUp, AlertCircle, ArrowRight, Filter, Shield } from 'lucide-react';
import { Transfer, Player, Club } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface TransfersPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const TransfersPage: React.FC<TransfersPageProps> = ({ onNavigate }) => {
  const { language, toBanglaNumber, formatDate } = useLanguage();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [clubs, setClubs] = useState<Record<string, Club>>({});
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'negotiation' | 'rumour'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getTransfers(),
      api.getPlayers(),
      api.getClubs()
    ]).then(([trData, plData, clData]) => {
      setTransfers(Array.isArray(trData) ? trData : []);

      const plMap: Record<string, Player> = {};
      (plData || []).forEach(p => { if (p) plMap[p.id] = p; });
      setPlayers(plMap);

      const clMap: Record<string, Club> = {};
      (clData || []).forEach(c => { if (c) clMap[c.id] = c; });
      setClubs(clMap);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const safeTransfers = Array.isArray(transfers) ? transfers : [];
  const filtered = safeTransfers.filter(tr => {
    if (!tr) return false;
    if (statusFilter !== 'all' && tr.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-8 shadow-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <Flame className="w-4 h-4 fill-amber-400" />
          <span>{language === 'en' ? 'Verified Football Transfer Market' : 'ট্রান্সফার হাব ও দলবদল বাজার'}</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white">
          {language === 'en' ? 'Transfers, Done Deals & Insider Scoops' : 'চুক্তি সম্পন্ন, চুক্তি আলোচনা ও এক্সক্লুসিভ গুঞ্জন'}
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          {language === 'en'
            ? 'Track every confirmed fee, contract duration, medical test, and club negotiation with confidence index scoring.'
            : 'প্রতিটি দলবদলের নির্ভরযোগ্যতা স্কোর, সাইনিং ফি, চুক্তির মেয়াদ ও ক্লাব স্টেটমেন্টের পুঙ্খানুপুঙ্খ বিবরণ।'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#090e18] border border-slate-800">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: language === 'en' ? 'All Transfers' : 'সকল দলবদল' },
            { id: 'completed', label: language === 'en' ? 'Done Deals' : 'চুক্তি সম্পন্ন (Done Deals)' },
            { id: 'negotiation', label: language === 'en' ? 'Advanced Talks' : 'অগ্রবর্তী আলোচনা' },
            { id: 'rumour', label: language === 'en' ? 'Rumours' : 'গুঞ্জন' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          মোট {language === 'bn' ? toBanglaNumber(filtered.length) : filtered.length}টি দলবদল রেকর্ড
        </span>
      </div>

      {/* Transfer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(tr => {
          const player = players[tr.playerId];
          const fromClub = clubs[tr.fromClubId];
          const toClub = clubs[tr.toClubId];

          return (
            <div
              key={tr.id}
              className="bg-[#0b101a] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-amber-500/40 transition-all"
            >
              {/* Player and Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <img 
                    src={player?.photo} 
                    alt="" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 shrink-0" 
                  />
                  <div>
                    <h3 
                      onClick={() => player && onNavigate('player', player.slug)}
                      className="text-sm font-bold text-white hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      {language === 'en' ? player?.name : player?.banglaName || player?.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {language === 'en' ? player?.position : player?.banglaPosition} • বয়স: {player?.age}
                    </p>
                  </div>
                </div>

                <div>
                  {tr.status === 'completed' && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      DONE DEAL
                    </span>
                  )}
                  {tr.status === 'negotiation' && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      TALKS ONGOING
                    </span>
                  )}
                  {tr.status === 'rumour' && (
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-extrabold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      RUMOUR
                    </span>
                  )}
                </div>
              </div>

              {/* Clubs Transition Banner */}
              <div className="p-3 rounded-xl bg-[#060a10] border border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div 
                  onClick={() => fromClub && onNavigate('club', fromClub.slug)}
                  className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300 min-w-0"
                >
                  <img src={fromClub?.logo} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                  <span className="truncate font-semibold">{language === 'en' ? fromClub?.name : fromClub?.banglaName}</span>
                </div>

                <div className="flex flex-col items-center shrink-0 px-2">
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase">
                    {language === 'en' ? tr.fee : tr.banglaFee}
                  </span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </div>

                <div 
                  onClick={() => toClub && onNavigate('club', toClub.slug)}
                  className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300 min-w-0 justify-end"
                >
                  <span className="truncate font-bold text-white">{language === 'en' ? toClub?.name : toClub?.banglaName}</span>
                  <img src={toClub?.logo} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'en' ? tr.details : tr.banglaDetails}
              </p>

              {/* Confidence meter & Source */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>সূত্র: <strong className="text-slate-200">{tr.source}</strong></span>
                <div className="flex items-center gap-2">
                  <span>নির্ভরযোগ্যতা:</span>
                  <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      style={{ width: `${tr.confidence}%` }} 
                      className={`h-full ${tr.confidence >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    ></div>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">
                    {language === 'bn' ? toBanglaNumber(tr.confidence) : tr.confidence}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
