import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Clock, CheckCircle2, Shield } from 'lucide-react';
import { Injury, Player, Club } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export const InjuriesPage: React.FC = () => {
  const { language, toBanglaNumber } = useLanguage();
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [clubs, setClubs] = useState<Record<string, Club>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getInjuries(),
      api.getPlayers(),
      api.getClubs()
    ]).then(([injData, plData, clData]) => {
      setInjuries(injData);

      const plMap: Record<string, Player> = {};
      plData.forEach(p => { plMap[p.id] = p; });
      setPlayers(plMap);

      const clMap: Record<string, Club> = {};
      clData.forEach(c => { clMap[c.id] = c; });
      setClubs(clMap);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 rounded-3xl p-8 shadow-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
          <Activity className="w-4 h-4" />
          <span>{language === 'en' ? 'Medical Room & Suspensions' : 'ইনজুরি ইনডেক্স ও সাসপেনশন লিস্ট'}</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white">
          {language === 'en' ? 'Player Injuries & Expected Return Dates' : 'আহত খেলোয়াড়দের আপডেট ও প্রত্যাশিত ফেরার সময়'}
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          {language === 'en'
            ? 'Track hamstring, ACL, muscle strain injuries, medical clearance and suspension bans across top European clubs.'
            : 'শীর্ষ ফুটবল ক্লাবগুলোর ইনজুরি রিপোর্ট, চিকিৎসকদের মূল্যায়ন এবং অনুশীলনে ফেরার হালনাগাদ তথ্য।'}
        </p>
      </div>

      {/* Injury Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {injuries.map(inj => {
          const player = players[inj.playerId];
          const club = clubs[inj.clubId];

          return (
            <div
              key={inj.id}
              className="bg-[#0b101a] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-rose-500/40 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={player?.photo} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-slate-700" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {language === 'en' ? player?.name : player?.banglaName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <img src={club?.logo} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                      <span>{language === 'en' ? club?.name : club?.banglaName}</span>
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-extrabold uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {inj.severity}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">ইনজুরির ধরন:</span>
                  <span className="font-bold text-white">{language === 'en' ? inj.injuryType : inj.banglaInjuryType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">প্রত্যাশিত প্রত্যাবর্তন:</span>
                  <span className="font-bold text-emerald-400">{inj.expectedReturn}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'en' ? inj.notes : inj.banglaNotes}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
};
