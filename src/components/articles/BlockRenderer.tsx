import React, { useState, useEffect } from 'react';
import { Quote, AlertCircle, TrendingUp, Trophy, ArrowRight, Table, Flame } from 'lucide-react';
import { ContentBlock, Match, Player, Club } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface BlockRendererProps {
  blocks?: ContentBlock[];
  onNavigate: (view: string, param?: string) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks = [], onNavigate }) => {
  const { language, toBanglaNumber } = useLanguage();
  const [cachedMatches, setCachedMatches] = useState<Record<string, Match>>({});
  const [cachedPlayers, setCachedPlayers] = useState<Record<string, Player>>({});
  const [cachedClubs, setCachedClubs] = useState<Record<string, Club>>({});

  useEffect(() => {
    const safeBlocks = Array.isArray(blocks) ? blocks : [];
    // Find all referenced match and player IDs
    const matchIds = safeBlocks.filter(b => b?.type === 'match_card' && b.data?.matchId).map(b => b.data!.matchId!);
    const playerIds = safeBlocks.filter(b => b?.type === 'player_card' && b.data?.playerId).map(b => b.data!.playerId!);

    if (matchIds.length > 0) {
      matchIds.forEach(id => {
        api.getMatchById(id).then(m => {
          setCachedMatches(prev => ({ ...prev, [id]: m }));
        }).catch(console.error);
      });
    }

    if (playerIds.length > 0) {
      playerIds.forEach(id => {
        api.getPlayerDetails(id).then(res => {
          if (res?.player) setCachedPlayers(prev => ({ ...prev, [id]: res.player }));
        }).catch(console.error);
      });
    }

    api.getClubs().then(clubsList => {
      const cMap: Record<string, Club> = {};
      clubsList.forEach(c => { cMap[c.id] = c; });
      setCachedClubs(cMap);
    }).catch(console.error);
  }, [blocks]);

  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-6 text-slate-200 text-base md:text-lg leading-relaxed">
      {blocks.map(block => {
        switch (block.type) {
          case 'heading': {
            const level = block.data?.level || 2;
            if (level === 2) {
              return (
                <h2 key={block.id} className="text-xl md:text-2xl font-extrabold text-white mt-8 mb-4 border-l-4 border-emerald-400 pl-3">
                  {block.content}
                </h2>
              );
            }
            return (
              <h3 key={block.id} className="text-lg md:text-xl font-bold text-emerald-300 mt-6 mb-3">
                {block.content}
              </h3>
            );
          }

          case 'paragraph':
            return (
              <p key={block.id} className="text-slate-300 font-normal leading-relaxed">
                {block.content}
              </p>
            );

          case 'quote':
            return (
              <blockquote key={block.id} className="my-6 p-6 rounded-2xl bg-[#0e1522] border-l-4 border-emerald-400 relative">
                <Quote className="w-8 h-8 text-emerald-500/20 absolute right-4 top-4" />
                <p className="text-base md:text-lg italic font-medium text-slate-200">
                  "{block.content}"
                </p>
                {block.data?.author && (
                  <footer className="mt-3 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>— {block.data.author}</span>
                    {block.data.quoteTitle && (
                      <span className="text-slate-400 font-normal">({block.data.quoteTitle})</span>
                    )}
                  </footer>
                )}
              </blockquote>
            );

          case 'callout': {
            const isBreaking = block.data?.calloutType === 'breaking';
            return (
              <div 
                key={block.id}
                className={`p-4 md:p-5 rounded-xl border my-6 flex items-start gap-3.5 ${
                  isBreaking 
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' 
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                }`}
              >
                <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isBreaking ? 'text-rose-400' : 'text-emerald-400'}`} />
                <div className="text-sm font-semibold leading-relaxed">
                  {block.content}
                </div>
              </div>
            );
          }

          case 'image':
            return (
              <figure key={block.id} className="my-6 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                <img 
                  src={block.data?.url || block.content} 
                  alt={block.data?.alt || 'Editorial photo'} 
                  className="w-full max-h-[480px] object-cover" 
                />
                {(block.data?.caption || block.data?.credit) && (
                  <figcaption className="p-3 bg-[#070b12] text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>{block.data.caption}</span>
                    {block.data.credit && (
                      <span className="text-slate-500 text-[11px] font-mono">
                        ছবি: {block.data.credit}
                      </span>
                    )}
                  </figcaption>
                )}
              </figure>
            );

          case 'match_card': {
            const match = block.data?.matchId ? cachedMatches[block.data.matchId] : null;
            if (!match) {
              return (
                <div key={block.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                  ম্যাচ ডেটা লোড হচ্ছে...
                </div>
              );
            }
            const homeClub = cachedClubs[match.homeClubId];
            const awayClub = cachedClubs[match.awayClubId];

            return (
              <div 
                key={block.id}
                onClick={() => onNavigate('match', match.id)}
                className="my-6 p-5 rounded-2xl bg-[#090e18] border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer shadow-lg space-y-4"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-semibold text-emerald-400">{match.roundOrGameweek}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                    {match.status === 'live' ? `LIVE ${match.minute}'` : match.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-around py-2">
                  {/* Home */}
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <img src={homeClub?.logo} alt="" className="w-12 h-12 rounded-full object-cover" />
                    <span className="text-sm font-bold text-white">
                      {language === 'en' ? homeClub?.name : homeClub?.banglaName}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black font-mono text-emerald-400">
                      {language === 'bn' ? toBanglaNumber(match.homeScore) : match.homeScore}
                    </span>
                    <span className="text-slate-600 font-bold">-</span>
                    <span className="text-3xl font-black font-mono text-emerald-400">
                      {language === 'bn' ? toBanglaNumber(match.awayScore) : match.awayScore}
                    </span>
                  </div>

                  {/* Away */}
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <img src={awayClub?.logo} alt="" className="w-12 h-12 rounded-full object-cover" />
                    <span className="text-sm font-bold text-white">
                      {language === 'en' ? awayClub?.name : awayClub?.banglaName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>ভেন্যু: {match.venue}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    ম্যাচ সেন্টারে যান <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          }

          case 'player_card': {
            const player = block.data?.playerId ? cachedPlayers[block.data.playerId] : null;
            if (!player) return null;
            const club = cachedClubs[player.clubId];

            return (
              <div 
                key={block.id}
                onClick={() => onNavigate('player', player.slug)}
                className="my-6 p-4 rounded-2xl bg-[#090e18] border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img src={player.photo} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-cyan-500/40" />
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                      {block.content || 'প্লেয়ার স্পটলাইট'}
                    </span>
                    <h4 className="text-base font-bold text-white">
                      {language === 'en' ? player.name : player.banglaName}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {language === 'en' ? club?.name : club?.banglaName} • {language === 'en' ? player.position : player.banglaPosition}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-emerald-400">
                    রেটিং: {player.stats.rating}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {language === 'bn' ? `${toBanglaNumber(player.stats.goals)} গোল • ${toBanglaNumber(player.stats.assists)} অ্যাসিস্ট` : `${player.stats.goals} Goals • ${player.stats.assists} Ast`}
                  </div>
                </div>
              </div>
            );
          }

          case 'divider':
            return <hr key={block.id} className="my-8 border-slate-800" />;

          default:
            return (
              <p key={block.id} className="text-slate-300">
                {block.content}
              </p>
            );
        }
      })}
    </div>
  );
};
