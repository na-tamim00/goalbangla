import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Plus, Trash2, Globe, Check, AlertCircle, 
  Save, Eye, ArrowUp, ArrowDown, Image, Quote, FileText, 
  Activity, Trophy, User, Shield
} from 'lucide-react';
import { Article, ContentBlock, ContentBlockType, ArticleCategory, ArticleStatus, Club, Player, Match } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface ArticleEditorModalProps {
  article: Article | null; // null if creating new
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({ article, isOpen, onClose, onSaved }) => {
  const { language } = useLanguage();
  const { currentUser, can } = useAuth();

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('matches');
  const [subcategory, setSubcategory] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageCredit, setImageCredit] = useState('');
  const [readTimeMinutes, setReadTimeMinutes] = useState(3);
  const [status, setStatus] = useState<ArticleStatus>('draft');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  
  // Blocks
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  // English translation fields
  const [enTitle, setEnTitle] = useState('');
  const [enSubtitle, setEnSubtitle] = useState('');
  const [enExcerpt, setEnExcerpt] = useState('');

  // Related entities
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);

  // AI Assistant states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'translation' | 'entities' | 'settings'>('content');

  useEffect(() => {
    Promise.all([
      api.getClubs(),
      api.getPlayers(),
      api.getMatches()
    ]).then(([clData, plData, mData]) => {
      setAllClubs(clData);
      setAllPlayers(plData);
      setAllMatches(mData);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setSubtitle(article.subtitle || '');
      setSlug(article.slug);
      setCategory(article.category);
      setSubcategory(article.subcategory || '');
      setExcerpt(article.excerpt);
      setFeaturedImage(article.featuredImage);
      setImageCaption(article.imageCaption || '');
      setImageCredit(article.imageCredit || '');
      setReadTimeMinutes(article.readTimeMinutes);
      setStatus(article.status);
      setIsBreaking(article.isBreaking || false);
      setIsFeatured(article.isFeatured || false);
      setTagsInput((article.tags || []).join(', '));
      setBlocks(article.blocks || []);
      
      if (article.translations?.en) {
        setEnTitle(article.translations.en.title || '');
        setEnSubtitle(article.translations.en.subtitle || '');
        setEnExcerpt(article.translations.en.excerpt || '');
      }

      setSelectedClubs(article.relatedClubIds || []);
      setSelectedPlayers(article.relatedPlayerIds || []);
      setSelectedMatches(article.relatedMatchIds || []);
    } else {
      // Reset defaults
      setTitle('');
      setSubtitle('');
      setSlug('');
      setCategory('matches');
      setSubcategory('');
      setExcerpt('');
      setFeaturedImage('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80');
      setImageCaption('');
      setImageCredit('GoalBangla Media Desk');
      setReadTimeMinutes(4);
      setStatus('draft');
      setIsBreaking(false);
      setIsFeatured(false);
      setTagsInput('প্রিমিয়ার লিগ, ফুটবল');
      setBlocks([
        { id: 'b1', type: 'paragraph', content: 'ম্যাচের শুরু থেকেই দুর্দান্ত আক্রমণাত্মক মেজাজে মাঠে নামে দুই দল...' },
        { id: 'b2', type: 'heading', content: 'ম্যাচ বিশ্লেষণ ও টার্নিং পয়েন্ট', data: { level: 2 } }
      ]);
      setEnTitle('');
      setEnSubtitle('');
      setEnExcerpt('');
      setSelectedClubs([]);
      setSelectedPlayers([]);
      setSelectedMatches([]);
    }
  }, [article, isOpen]);

  if (!isOpen) return null;

  const handleAddBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlock = {
      id: 'blk_' + Date.now(),
      type,
      content: type === 'heading' ? 'নতুন শিরোনাম' : type === 'quote' ? 'উদ্ধৃতি এখানে লিখুন...' : '',
      data: type === 'heading' ? { level: 2 } : type === 'callout' ? { calloutType: 'info' } : {}
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const handleUpdateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newBlocks.length) return;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;
    setBlocks(newBlocks);
  };

  const handleAutoSlug = (text: string) => {
    setTitle(text);
    if (!article) {
      const generated = text
        .toLowerCase()
        .replace(/[^a-z0-9\u0980-\u09FF\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 60);
      setSlug(generated || 'article-' + Date.now());
    }
  };

  const handleCallAiAssist = async (action: 'translate' | 'headline' | 'summary' | 'tactical_analysis') => {
    setIsAiLoading(true);
    setAiSuggestions(null);
    try {
      const content = blocks.map(b => b.content).join('\n\n');
      const textToAnalyze = action === 'headline' ? title : `${title}\n\n${content}`;
      const targetLang = action === 'translate' ? 'en' : 'bn';

      const result = await api.requestAIAssist(action, textToAnalyze, targetLang);
      setAiSuggestions({ action, data: result });

      if (action === 'translate' && result.result) {
        setEnTitle(result.result);
      }
      if (action === 'summary' && result.summary) {
        setExcerpt(result.summary);
      }
    } catch (err) {
      console.error('AI Editorial Assistant error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('শিরোনাম আবশ্যক');
      return;
    }

    const payload: Partial<Article> = {
      title,
      subtitle,
      slug: slug || 'article-' + Date.now(),
      category,
      subcategory,
      excerpt,
      featuredImage,
      imageCaption,
      imageCredit,
      readTimeMinutes: Number(readTimeMinutes) || 3,
      status,
      isBreaking,
      isFeatured,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      blocks,
      relatedClubIds: selectedClubs,
      relatedPlayerIds: selectedPlayers,
      relatedMatchIds: selectedMatches,
      authorId: article?.authorId || currentUser.id,
      publishedAt: article?.publishedAt || new Date().toISOString(),
      translations: {
        en: {
          language: 'en',
          title: enTitle || title,
          subtitle: enSubtitle,
          excerpt: enExcerpt || excerpt,
          slug: (slug || 'article') + '-en',
          blocks: blocks,
          status: status,
          seo: {
            title: enTitle || title,
            description: enExcerpt || excerpt
          },
          updatedAt: new Date().toISOString()
        }
      }
    };

    try {
      if (article?.id) {
        await api.updateArticle(article.id, payload, currentUser);
      } else {
        await api.createArticle(payload, currentUser);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
      alert('সংরক্ষণ ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-5xl bg-[#090e18] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#060a12]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {article ? 'প্রতিবেদন সম্পাদনা (Editorial Block Editor)' : 'নতুন প্রতিবেদন তৈরি'}
              </h2>
              <span className="text-xs text-slate-400">
                ভূমিকা: <strong>{currentUser.role}</strong> • {currentUser.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>সংরক্ষণ করুন</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-[#080d16] gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'content' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            মূল বিষয়বস্তু ও ব্লক (Content)
          </button>
          <button
            onClick={() => setActiveTab('translation')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'translation' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            ইংরেজি রূপান্তর (Translation)
          </button>
          <button
            onClick={() => setActiveTab('entities')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'entities' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            সম্পর্কিত ক্লাব/প্লেয়ার (Entities)
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'settings' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            পাবলিশিং সেটিংস ও SEO
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#090e18]">
          
          {/* TAB 1: Content Blocks */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              
              {/* Title & Subtitle */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  বাংলা প্রধান শিরোনাম (Lead Headline) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleAutoSlug(e.target.value)}
                  placeholder="যেমন: ম্যানচেস্টার সিটিকে স্তব্ধ করে আর্সেনালের অবিশ্বাস্য জয়..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-base font-bold placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />

                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="উপ-শিরোনাম (ঐচ্ছিক)"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Excerpt / Lead Paragraph */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    ভূমিকা / লিড প্যারাগ্রাফ (Excerpt)
                  </label>
                  <button
                    onClick={() => handleCallAiAssist('summary')}
                    disabled={isAiLoading}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3 h-3" />
                    AI দিয়ে সারাংশ তৈরি
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="প্রতিবেদনের প্রথম সংক্ষিপ্ত বিবরণী..."
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* AI Assistant Quick Suggestions Panel */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">
                      Gemini AI এডিটরিয়াল অ্যাসিস্ট্যান্ট
                    </span>
                  </div>
                  {isAiLoading && (
                    <span className="text-[10px] text-emerald-400 animate-pulse">
                      প্রসেস হচ্ছে...
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCallAiAssist('headline')}
                    disabled={isAiLoading}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                  >
                    শিরোনাম অপটিমাইজ করুন
                  </button>
                  <button
                    onClick={() => handleCallAiAssist('translate')}
                    disabled={isAiLoading}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                  >
                    ইংরেজি অনুবাদ জেনারেট করুন
                  </button>
                </div>

                {aiSuggestions?.data?.headlines && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">বিকল্প আকর্ষণীয় শিরোনাম:</span>
                    {aiSuggestions.data.headlines.map((hl: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between gap-2 text-slate-200">
                        <span>• {hl}</span>
                        <button
                          onClick={() => setTitle(hl)}
                          className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold"
                        >
                          ব্যবহার করুন
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Block List Builder */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    প্রতিবেদনের মূল বডি ব্লকসমূহ ({blocks.length}টি ব্লক)
                  </h3>
                  
                  {/* Add Block Toolbar */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAddBlock('paragraph')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium"
                    >
                      + প্যারাগ্রাফ
                    </button>
                    <button
                      onClick={() => handleAddBlock('heading')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium"
                    >
                      + সাব-হেডিং
                    </button>
                    <button
                      onClick={() => handleAddBlock('quote')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium"
                    >
                      + উক্তি
                    </button>
                    <button
                      onClick={() => handleAddBlock('callout')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium"
                    >
                      + কলআউট
                    </button>
                    <button
                      onClick={() => handleAddBlock('image')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium"
                    >
                      + ছবি
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {blocks.map((blk, idx) => (
                    <div 
                      key={blk.id}
                      className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                        <span className="font-bold uppercase text-emerald-400">
                          ব্লক #{idx + 1} ({blk.type})
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveBlock(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 hover:text-white disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveBlock(idx, 'down')}
                            disabled={idx === blocks.length - 1}
                            className="p-1 hover:text-white disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlock(blk.id)}
                            className="p-1 text-rose-400 hover:text-rose-300 ml-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Block Input */}
                      {blk.type === 'heading' && (
                        <input
                          type="text"
                          value={blk.content}
                          onChange={(e) => handleUpdateBlock(blk.id, { content: e.target.value })}
                          placeholder="সাব-হেডিং লিখুন..."
                          className="w-full p-2 bg-[#060a10] border border-slate-700 rounded-lg text-white font-bold text-sm"
                        />
                      )}

                      {blk.type === 'paragraph' && (
                        <textarea
                          rows={3}
                          value={blk.content}
                          onChange={(e) => handleUpdateBlock(blk.id, { content: e.target.value })}
                          placeholder="অনুচ্ছেদ লিখুন..."
                          className="w-full p-2.5 bg-[#060a10] border border-slate-700 rounded-lg text-slate-200 text-xs"
                        />
                      )}

                      {blk.type === 'quote' && (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={blk.content}
                            onChange={(e) => handleUpdateBlock(blk.id, { content: e.target.value })}
                            placeholder="উদ্ধৃতি..."
                            className="w-full p-2 bg-[#060a10] border border-slate-700 rounded-lg text-slate-200 text-xs italic"
                          />
                          <input
                            type="text"
                            value={blk.data?.author || ''}
                            onChange={(e) => handleUpdateBlock(blk.id, { data: { ...blk.data, author: e.target.value } })}
                            placeholder="বক্তার নাম (যেমন: পেপ গার্দিওলা)..."
                            className="w-full p-2 bg-[#060a10] border border-slate-700 rounded-lg text-xs text-slate-300"
                          />
                        </div>
                      )}

                      {blk.type === 'image' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={blk.data?.url || blk.content}
                            onChange={(e) => handleUpdateBlock(blk.id, { content: e.target.value, data: { ...blk.data, url: e.target.value } })}
                            placeholder="ছবির URL লিঙ্ক..."
                            className="w-full p-2 bg-[#060a10] border border-slate-700 rounded-lg text-xs text-slate-200"
                          />
                          <input
                            type="text"
                            value={blk.data?.caption || ''}
                            onChange={(e) => handleUpdateBlock(blk.id, { data: { ...blk.data, caption: e.target.value } })}
                            placeholder="ছবির ক্যাপশন..."
                            className="w-full p-2 bg-[#060a10] border border-slate-700 rounded-lg text-xs text-slate-300"
                          />
                        </div>
                      )}

                      {blk.type === 'callout' && (
                        <textarea
                          rows={2}
                          value={blk.content}
                          onChange={(e) => handleUpdateBlock(blk.id, { content: e.target.value })}
                          placeholder="গুরুত্বপূর্ণ তথ্য বা ব্রেকিং টেক্সট..."
                          className="w-full p-2 bg-[#060a10] border border-slate-700 rounded-lg text-xs text-emerald-300"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Translation (English) */}
          {activeTab === 'translation' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  English Multi-Language Localization
                </span>
                <p className="text-xs text-slate-400">
                  Provide English titles and content for international readers and search engines.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  English Title (Translated)
                </label>
                <input
                  type="text"
                  value={enTitle}
                  onChange={(e) => setEnTitle(e.target.value)}
                  placeholder="e.g. Arsenal stun Manchester City in title race thriller..."
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  English Excerpt
                </label>
                <textarea
                  rows={2}
                  value={enExcerpt}
                  onChange={(e) => setEnExcerpt(e.target.value)}
                  placeholder="English introductory excerpt..."
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Entity Linking */}
          {activeTab === 'entities' && (
            <div className="space-y-6">
              {/* Clubs Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  সম্পর্কিত ক্লাব যুক্ত করুন
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allClubs.map(c => {
                    const isSelected = selectedClubs.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) setSelectedClubs(prev => prev.filter(id => id !== c.id));
                          else setSelectedClubs(prev => [...prev, c.id]);
                        }}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all text-left ${
                          isSelected ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <img src={c.logo} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                        <span className="truncate">{c.banglaName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Players Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  সম্পর্কিত খেলোয়াড় যুক্ত করুন
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allPlayers.map(p => {
                    const isSelected = selectedPlayers.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) setSelectedPlayers(prev => prev.filter(id => id !== p.id));
                          else setSelectedPlayers(prev => [...prev, p.id]);
                        }}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all text-left ${
                          isSelected ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <img src={p.photo} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                        <span className="truncate">{p.banglaName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Settings & SEO */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category & Status */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    ক্যাটাগরি *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="matches">ম্যাচ রিপোর্ট (Match Reports)</option>
                    <option value="tactical-analysis">ট্যাকটিক্যাল অ্যানালিসিস (Tactics)</option>
                    <option value="transfers">দলবদল বাজার (Transfers)</option>
                    <option value="bangladesh-football">বাংলাদেশ ফুটবল (BPL)</option>
                    <option value="opinion">মতামত ও কলাম (Opinion)</option>
                    <option value="features">বিশেষ ফিচার (Features)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    পাবলিকেশন স্ট্যাটাস (Workflow)
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="draft">খসড়া (Draft)</option>
                    <option value="review">রিভিউতে আছে (In Review)</option>
                    <option value="approved">অনুমোদিত (Approved)</option>
                    <option value="scheduled">শিডিউলড (Scheduled)</option>
                    <option value="published">প্রকাশিত (Published)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    URL স্লাগ (Slug)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    ট্যাগ (কমা দিয়ে আলাদা করুন)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Featured Image & Checkboxes */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    ফিচার্ড ইমেজ লিঙ্ক (URL)
                  </label>
                  <input
                    type="text"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs"
                  />
                  {featuredImage && (
                    <img src={featuredImage} alt="Preview" className="w-full h-32 object-cover rounded-xl mt-2 border border-slate-800" />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    ফটোগ্রাফার / ছবির ক্রেডিট
                  </label>
                  <input
                    type="text"
                    value={imageCredit}
                    onChange={(e) => setImageCredit(e.target.value)}
                    placeholder="যেমন: গেটি ইমেজেস / গোলবাংলা ডেস্ক"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs"
                  />
                </div>

                <div className="pt-2 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={isBreaking}
                      onChange={(e) => setIsBreaking(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 bg-slate-900 border-slate-700"
                    />
                    <span>ব্রেকিং নিউজ হিসেবে চিহ্নিত করুন</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700"
                    />
                    <span>হোমপেজের প্রধান লিড স্টোরি হিসেবে দেখান</span>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
