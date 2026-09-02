import React, { useState, useEffect } from 'react';
import { Flame, ArrowRight, Shield, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { Transfer, Player, Club } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface TransferRadarWidgetProps {
  onNavigate: (view: string, param?: string) => void;
}

export const TransferRadarWidget: React.FC<TransferRadarWidgetProps> = ({ onNavigate }) => {
  const { language, toBanglaNumber, t } = useLanguage();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [clubs, setClubs] = useState<Record<string, Club>>({});

  useEffect(() => {
    Promise.all([
      api.getTransfers(),
      api.getPlayers(),
      api.getClubs()
    ]).then(([trData, plData, clData]) => {
      setTransfers(trData.slice(0, 4));

      const plMap: Record<string, Player> = {};
      plData.forEach(p => { plMap[p.id] = p; });
      setPlayers(plMap);

      const clMap: Record<string, Club> = {};
      clData.forEach(c => { clMap[c.id] = c; });
      setClubs(clMap);
    }).catch(console.error);
  }, []);

  const getStatusBadge = (status: Transfer['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {language === 'en' ? 'DONE DEAL' : 'চুক্তি সম্পন্ন'}
          </span>
        );
      case 'negotiation':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {language === 'en' ? 'ADVANCED TALKS' : 'অগ্রবর্তী আলোচনা'}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {language === 'en' ? 'RUMOUR' : 'দলবদল গুঞ্জন'}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0b101a] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {language === 'en' ? 'Transfer Radar & Deals' : 'ট্রান্সফার রাডার ও দলবদল বাজার'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'en' ? 'Verified Tier-1 & Tier-2 football scoops' : 'নির্ভরযোগ্য সূত্র ও ক্লাব ঘোষণার সমন্বিত ডিল'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('transfers')}
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
        >
          <span>{t('common.view_all', 'সম্পূর্ণ হাব')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Transfers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {transfers.map(tr => {
          const player = players[tr.playerId];
          const fromClub = clubs[tr.fromClubId];
          const toClub = clubs[tr.toClubId];

          return (
            <div
              key={tr.id}
              onClick={() => onNavigate('transfers')}
              className="group bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img 
                    src={player?.photo || 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=100&q=80'} 
                    alt="" 
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-700" 
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      {language === 'en' ? player?.name : player?.banglaName || player?.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {language === 'en' ? tr.fee : tr.banglaFee}
                    </span>
                  </div>
                </div>
                {getStatusBadge(tr.status)}
              </div>

              {/* Clubs Transition Arrow */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#070a10] text-xs">
                <div className="flex items-center gap-2">
                  <img src={fromClub?.logo} alt="" className="w-4 h-4 rounded-full object-cover" />
                  <span className="text-slate-300 truncate max-w-[80px]">
                    {language === 'en' ? fromClub?.name : fromClub?.banglaName}
                  </span>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />

                <div className="flex items-center gap-2">
                  <img src={toClub?.logo} alt="" className="w-4 h-4 rounded-full object-cover" />
                  <span className="text-slate-300 font-semibold truncate max-w-[80px]">
                    {language === 'en' ? toClub?.name : toClub?.banglaName}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>সূত্র: {tr.source}</span>
                <span className="text-emerald-400 font-semibold">
                  নির্ভরযোগ্যতা: {language === 'bn' ? toBanglaNumber(tr.confidence) : tr.confidence}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
