import React, { useState, useEffect } from 'react';
import { 
  Shield, FileText, Flame, Radio, Shuffle, Camera, 
  Plus, Edit, Trash2, CheckCircle2, Clock, AlertCircle, 
  Search, Globe, User, Activity, RefreshCw, Trophy
} from 'lucide-react';
import { 
  Article, BreakingNews, Match, Transfer, UserRole, 
  Club, Player 
} from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ArticleEditorModal } from './ArticleEditorModal';

interface AdminDashboardProps {
  onNavigate: (view: string, param?: string) => void;
  defaultSection?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, defaultSection = 'articles' }) => {
  const { currentUser, setCurrentRole, can } = useAuth();
  const { language, toBanglaNumber, formatDate } = useLanguage();

  const [activeTab, setActiveTab] = useState<string>(defaultSection);
  const [articles, setArticles] = useState<Article[]>([]);
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [clubs, setClubs] = useState<Record<string, Club>>({});
  const [players, setPlayers] = useState<Record<string, Player>>({});

  // Editor Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // New Breaking News Form
  const [newBreakingHeadline, setNewBreakingHeadline] = useState('');
  const [newBreakingPriority, setNewBreakingPriority] = useState<'urgent' | 'high' | 'normal'>('urgent');

  // Live match control state
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [matchHomeScore, setMatchHomeScore] = useState<number>(0);
  const [matchAwayScore, setMatchAwayScore] = useState<number>(0);
  const [matchMinute, setMatchMinute] = useState<number>(0);
  const [matchStatus, setMatchStatus] = useState<Match['status']>('live');
  const [commentaryText, setCommentaryText] = useState<string>('');
  const [commentaryMinute, setCommentaryMinute] = useState<number>(45);

  const fetchDashboardData = async () => {
    try {
      const [artRes, brkData, mData, trData, clData, plData] = await Promise.all([
        api.getArticles({ limit: 50 }),
        api.getBreakingNews(true),
        api.getMatches(),
        api.getTransfers(),
        api.getClubs(),
        api.getPlayers()
      ]);

      setArticles(Array.isArray(artRes?.items) ? artRes.items : []);
      setBreakingNews(Array.isArray(brkData) ? brkData : []);
      setMatches(Array.isArray(mData) ? mData : []);
      setTransfers(Array.isArray(trData) ? trData : []);

      const clMap: Record<string, Club> = {};
      (clData || []).forEach(c => { if (c) clMap[c.id] = c; });
      setClubs(clMap);

      const plMap: Record<string, Player> = {};
      (plData || []).forEach(p => { if (p) plMap[p.id] = p; });
      setPlayers(plMap);

      const safeMatches = Array.isArray(mData) ? mData : [];
      if (safeMatches.length > 0 && !selectedMatchId) {
        const liveOrFirst = safeMatches.find(m => m?.status === 'live') || safeMatches[0];
        if (liveOrFirst) {
          setSelectedMatchId(liveOrFirst.id);
          setMatchHomeScore(liveOrFirst.homeScore);
          setMatchAwayScore(liveOrFirst.awayScore);
          setMatchMinute(liveOrFirst.minute);
          setMatchStatus(liveOrFirst.status);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const roles: Array<{ role: UserRole; title: string; desc: string }> = [
    { role: 'Super Admin', title: 'Super Admin', desc: 'Full System & Publishing Control' },
    { role: 'Editor', title: 'Editor', desc: 'Publish, Review & Breaking News' },
    { role: 'Writer', title: 'Writer / Reporter', desc: 'Draft Creation & Entity Linking' },
    { role: 'Translator', title: 'Translator', desc: 'English & Multilingual Adaptation' },
    { role: 'Data Operator', title: 'Data Operator', desc: 'Live Scores, Stats & Match Events' },
    { role: 'Media Manager', title: 'Media Manager', desc: 'Galleries & Video Library' }
  ];

  const handleCreateArticle = () => {
    setEditingArticle(null);
    setIsEditorOpen(true);
  };

  const handleEditArticle = (art: Article) => {
    setEditingArticle(art);
    setIsEditorOpen(true);
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে প্রতিবেদনটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteArticle(id, currentUser);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBreaking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBreakingHeadline.trim()) return;
    try {
      await api.createBreakingNews({
        headline: newBreakingHeadline,
        banglaHeadline: newBreakingHeadline,
        priority: newBreakingPriority,
        status: 'active',
        category: 'breaking',
        timestamp: new Date().toISOString()
      }, currentUser);
      setNewBreakingHeadline('');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBreaking = async (id: string, currentStatus: string) => {
    try {
      await api.updateBreakingNews(id, { 
        status: currentStatus === 'active' ? 'archived' : 'active' 
      }, currentUser);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMatchScoreboard = async () => {
    if (!selectedMatchId) return;
    try {
      await api.updateMatchScore(selectedMatchId, {
        homeScore: Number(matchHomeScore),
        awayScore: Number(matchAwayScore),
        minute: Number(matchMinute),
        status: matchStatus
      }, currentUser);
      alert('ম্যাচ স্কোর সফলভাবে আপডেট হয়েছে!');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCommentaryEntry = async () => {
    if (!selectedMatchId || !commentaryText.trim()) return;
    try {
      await api.addMatchEvent(selectedMatchId, {
        minute: Number(commentaryMinute),
        type: 'var',
        clubId: activeMatchObj?.homeClubId || '',
        playerId: '',
        description: commentaryText,
        banglaDescription: commentaryText
      }, currentUser);
      setCommentaryText('');
      alert('ধারাবিবরণী যুক্ত হয়েছে!');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const activeMatchObj = matches.find(m => m.id === selectedMatchId);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner: Newsroom Header & Role Simulator */}
      <div className="bg-[#0b101a] border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-500 p-0.5 shadow-lg shadow-emerald-900/40">
              <div className="w-full h-full bg-[#060a12] rounded-[14px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-white">
                  GoalBangla Newsroom CMS
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                  RBAC Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ভূমিকা: <strong className="text-white uppercase">{currentUser.role}</strong> ({currentUser.name})
              </p>
            </div>
          </div>

          {/* Role Switcher Toolbar */}
          <div className="bg-[#060a12] p-2 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 px-2 uppercase tracking-wider">
              ভূমিকা টেস্ট করুন:
            </span>
            {roles.map(r => (
              <button
                key={r.role}
                onClick={() => setCurrentRole(r.role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentUser.role === r.role
                    ? 'bg-emerald-500 text-black shadow-md font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title={r.desc}
              >
                {r.title}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">মোট প্রতিবেদন</span>
            <span className="text-xl font-black font-mono text-white mt-1 block">{(articles || []).length}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">প্রকাশিত (Published)</span>
            <span className="text-xl font-black font-mono text-emerald-400 mt-1 block">
              {(articles || []).filter(a => a?.status === 'published').length}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">ব্রেকিং অ্যালার্ট</span>
            <span className="text-xl font-black font-mono text-rose-400 mt-1 block">
              {(breakingNews || []).filter(b => b?.status === 'active').length}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">লাইভ ম্যাচ সক্রিয়</span>
            <span className="text-xl font-black font-mono text-cyan-400 mt-1 block">
              {(matches || []).filter(m => m?.status === 'live').length}
            </span>
          </div>
        </div>
      </div>

      {/* Main CMS Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-800 pb-2">
        {[
          { id: 'articles', label: 'প্রতিবেদন ও এডিটোরিয়াল (Articles)', icon: FileText },
          { id: 'breaking', label: 'ব্রেকিং নিউজ টিকার (Breaking Alerts)', icon: Flame },
          { id: 'live-controller', label: 'লাইভ ম্যাচ কন্ট্রোলার (Match Scoreboard)', icon: Radio },
          { id: 'transfers', label: 'দলবদল হাব কন্ট্রোলার (Transfers)', icon: Shuffle }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Articles Management */}
      {activeTab === 'articles' && (
        <div className="bg-[#0b101a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">প্রতিবেদন ব্যবস্থাপনা</h2>
              <p className="text-xs text-slate-400">খসড়া তৈরি, এডিটিং, অনুবাদের স্তর ও পাবলিশিং ওয়ার্কফ্লো</p>
            </div>

            {can('article:create') && (
              <button
                onClick={handleCreateArticle}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন প্রতিবেদন লিখুন</span>
              </button>
            )}
          </div>

          {/* Articles Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[11px] font-bold uppercase">
                  <th className="py-3 px-3">শিরোনাম</th>
                  <th className="py-3 px-3">ক্যাটাগরি</th>
                  <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-3 text-center">ইংরেজি অনুবাদ</th>
                  <th className="py-3 px-3 text-center">তারিখ</th>
                  <th className="py-3 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {articles.map(art => (
                  <tr key={art.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img src={art.featuredImage} alt="" className="w-12 h-9 rounded-lg object-cover shrink-0" />
                        <div>
                          <span 
                            onClick={() => onNavigate('article', art.slug)}
                            className="font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer block line-clamp-1 max-w-md"
                          >
                            {art.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{art.slug}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {art.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        art.status === 'published' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {art.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {art.translations?.en ? (
                        <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          EN Ready
                        </span>
                      ) : (
                        <span className="text-slate-500">অনুবাদ নেই</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center text-slate-400">
                      {formatDate(art.publishedAt)}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {can('article:edit') && (
                          <button
                            onClick={() => handleEditArticle(art)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-black text-slate-300 transition-colors"
                            title="সম্পাদনা করুন"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {can('article:delete') && (
                          <button
                            onClick={() => handleDeleteArticle(art.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: Breaking News Ticker Manager */}
      {activeTab === 'breaking' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Create Alert Form (5 cols) */}
          <div className="lg:col-span-5 bg-[#0b101a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              নতুন ব্রেকিং নিউজ অ্যালার্ট
            </h3>

            <form onSubmit={handleAddBreaking} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  ব্রেকিং শিরোনাম
                </label>
                <textarea
                  required
                  rows={3}
                  value={newBreakingHeadline}
                  onChange={(e) => setNewBreakingHeadline(e.target.value)}
                  placeholder="যেমন: আনুষ্ঠানিকভাবে কিলিয়ান এমবাপ্পের সঙ্গে চুক্তি ঘোষণা করল রিয়াল মাদ্রিদ..."
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  জরুরি স্তর (Priority)
                </label>
                <select
                  value={newBreakingPriority}
                  onChange={(e) => setNewBreakingPriority(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="urgent">জরুরি (Urgent Flash Alert)</option>
                  <option value="high">উচ্চ অগ্রাধিকার (High Priority)</option>
                  <option value="normal">সাধারণ (Standard Update)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!can('breaking:manage')}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 disabled:opacity-40 cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                <span>ব্রেকিং টিকার প্রকাশ করুন</span>
              </button>
            </form>
          </div>

          {/* Active Alerts List (7 cols) */}
          <div className="lg:col-span-7 bg-[#0b101a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">বিদ্যমান ব্রেকিং অ্যালার্টসমূহ</h3>

            <div className="space-y-3">
              {breakingNews.map(brk => (
                <div 
                  key={brk.id}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                    brk.status === 'active' ? 'bg-rose-950/20 border-rose-500/40' : 'bg-slate-900/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        brk.priority === 'urgent' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-black'
                      }`}>
                        {brk.priority}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(brk.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white leading-relaxed">
                      {brk.banglaHeadline}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleBreaking(brk.id, brk.status)}
                    disabled={!can('breaking:manage')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                      brk.status === 'active' 
                        ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50 hover:bg-rose-600 hover:text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {brk.status === 'active' ? 'টিকার বন্ধ করুন' : 'পুনরায় সক্রিয় করুন'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SECTION 3: Live Match Controller */}
      {activeTab === 'live-controller' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Match Picker (4 cols) */}
          <div className="lg:col-span-4 bg-[#0b101a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              নিয়ন্ত্রণাধীন ম্যাচ নির্বাচন
            </h3>

            <div className="space-y-2">
              {matches.map(m => {
                const hClub = clubs[m.homeClubId];
                const aClub = clubs[m.awayClubId];
                const isSelected = m.id === selectedMatchId;

                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMatchId(m.id);
                      setMatchHomeScore(m.homeScore);
                      setMatchAwayScore(m.awayScore);
                      setMatchMinute(m.minute);
                      setMatchStatus(m.status);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected 
                        ? 'bg-emerald-950/60 border-emerald-500 text-white' 
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>{m.roundOrGameweek}</span>
                      <span className="uppercase font-bold text-emerald-400">{m.status}</span>
                    </div>
                    <div className="text-xs font-bold flex justify-between">
                      <span>{hClub?.banglaName} vs {aClub?.banglaName}</span>
                      <span className="font-mono">{m.homeScore} - {m.awayScore}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Match Score & Minute Trigger (8 cols) */}
          <div className="lg:col-span-8 bg-[#0b101a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white">
                রিয়েলটাইম স্কোর ও মিনিট কন্ট্রোলার
              </h3>
              <p className="text-xs text-slate-400">
                স্কোর পরিবর্তনের সঙ্গে সঙ্গে ফ্রন্টএন্ড এবং লাইভ স্ট্রিমে ডাটা সিঙ্ক হবে
              </p>
            </div>

            {activeMatchObj && (
              <div className="space-y-6">
                {/* Score Controls */}
                <div className="grid grid-cols-3 gap-4 text-center items-center">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-white block truncate">
                      {clubs[activeMatchObj.homeClubId]?.banglaName}
                    </span>
                    <input
                      type="number"
                      value={matchHomeScore}
                      onChange={(e) => setMatchHomeScore(Number(e.target.value))}
                      className="w-20 mx-auto text-center text-3xl font-black font-mono p-3 bg-slate-900 border border-slate-700 rounded-2xl text-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 block">মিনিট / স্ট্যাটাস</span>
                    <input
                      type="number"
                      value={matchMinute}
                      onChange={(e) => setMatchMinute(Number(e.target.value))}
                      className="w-20 mx-auto text-center text-2xl font-bold font-mono p-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                    />
                    <select
                      value={matchStatus}
                      onChange={(e) => setMatchStatus(e.target.value as any)}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    >
                      <option value="upcoming">আসন্ন (Upcoming)</option>
                      <option value="live">লাইভ চলমান (Live)</option>
                      <option value="ht">হাফ টাইম (HT)</option>
                      <option value="ft">সমাপ্ত (FT)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-white block truncate">
                      {clubs[activeMatchObj.awayClubId]?.banglaName}
                    </span>
                    <input
                      type="number"
                      value={matchAwayScore}
                      onChange={(e) => setMatchAwayScore(Number(e.target.value))}
                      className="w-20 mx-auto text-center text-3xl font-black font-mono p-3 bg-slate-900 border border-slate-700 rounded-2xl text-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleUpdateMatchScoreboard}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  স্কোরবোর্ড হালনাগাদ করুন
                </button>

                {/* Add Live Commentary */}
                <div className="pt-6 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    লাইভ ধারাবিবরণী যুক্ত করুন
                  </h4>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={commentaryMinute}
                      onChange={(e) => setCommentaryMinute(Number(e.target.value))}
                      className="w-16 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-center text-white text-xs font-mono font-bold"
                    />
                    <input
                      type="text"
                      value={commentaryText}
                      onChange={(e) => setCommentaryText(e.target.value)}
                      placeholder="যেমন: অসাধারণ সেভ গোলরক্ষক ডেভিড রায়ার..."
                      className="flex-1 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleAddCommentaryEntry}
                      className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shrink-0 cursor-pointer"
                    >
                      যুক্ত করুন
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* SECTION 4: Transfer Hub Manager */}
      {activeTab === 'transfers' && (
        <div className="bg-[#0b101a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">দলবদল বাজার ডাটাবেজ</h2>
              <p className="text-xs text-slate-400">ট্রান্সফার গুঞ্জন, কনফার্মড সাইনিং ও বিশ্বাসযোগ্যতা স্কোর</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transfers.map(tr => {
              const player = players[tr.playerId];
              const fromClub = clubs[tr.fromClubId];
              const toClub = clubs[tr.toClubId];

              return (
                <div key={tr.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">
                      {player?.banglaName || player?.name}
                    </span>
                    <span className="text-xs font-bold text-amber-400">{tr.banglaFee}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {fromClub?.banglaName} ➔ {toClub?.banglaName}
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                    <span>সূত্র: {tr.source}</span>
                    <span className="text-emerald-400 font-semibold">কনফিডেন্স: {tr.confidence}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Article Editor Modal Component */}
      <ArticleEditorModal
        article={editingArticle}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaved={fetchDashboardData}
      />

    </div>
  );
};
