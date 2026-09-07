import React, { useState, useEffect } from 'react';
import { 
  Clock, Share2, Globe, Bookmark, Heart, MessageSquare, 
  ArrowLeft, ArrowRight, Shield, Award, CheckCircle, Tag,
  ExternalLink, User, Trophy, Flame
} from 'lucide-react';
import { Article, Author, Club, Player, Match } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { BlockRenderer } from './BlockRenderer';

interface ArticleDetailPageProps {
  slug: string;
  onNavigate: (view: string, param?: string) => void;
  onBack: () => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({ slug, onNavigate, onBack }) => {
  const { language, setLanguage, toBanglaNumber, formatDate, t } = useLanguage();
  const [article, setArticle] = useState<Article | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [clubs, setClubs] = useState<Record<string, Club>>({});
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [selectedLanguageTab, setSelectedLanguageTab] = useState<'current' | 'en' | 'bn'>('current');
  const [comments, setComments] = useState<Array<{ name: string; text: string; time: string }>>([
    { name: 'রাফিদ হাসান', text: 'অসাধারণ ট্যাকটিক্যাল অ্যানালিসিস। সাকার মুভমেন্ট সিটি ডিফেন্সকে পুরো এলোমেলো করে দিয়েছিল।', time: '১ ঘণ্টা আগে' },
    { name: 'Kazi Momin', text: 'Arteta’s tactical adjustments after 60 mins won them the game. Great match report GoalBangla!', time: '২ ঘণ্টা আগে' }
  ]);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentName, setNewCommentName] = useState('');

  useEffect(() => {
    setIsLoading(true);
    api.getArticleBySlug(slug)
      .then(async (art) => {
        setArticle(art);
        setLikesCount(art.likesCount || 0);

        // Fetch author
        if (art.authorId) {
          api.getAuthors().then(authors => {
            const found = authors.find(a => a.id === art.authorId);
            if (found) setAuthor(found);
          }).catch(console.error);
        }

        // Fetch related articles
        api.getArticles({ category: art.category, limit: 4 })
          .then(res => {
            const items = res?.items || [];
            setRelatedArticles(items.filter(a => a && a.id !== art.id).slice(0, 3));
          }).catch(console.error);

        // Fetch related entities (clubs & players)
        const [clData, plData] = await Promise.all([api.getClubs(), api.getPlayers()]);
        const clMap: Record<string, Club> = {};
        (clData || []).forEach(c => { if (c) clMap[c.id] = c; });
        setClubs(clMap);

        const plMap: Record<string, Player> = {};
        (plData || []).forEach(p => { if (p) plMap[p.id] = p; });
        setPlayers(plMap);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [slug]);

  // Determine active translation view
  const hasEnTranslation = !!article?.translations?.en;
  const isViewingEn = selectedLanguageTab === 'en' || (language === 'en' && selectedLanguageTab !== 'bn');

  const displayTitle = (isViewingEn && article?.translations?.en?.title) ? article.translations.en.title : (article?.title || '');
  const displaySubtitle = (isViewingEn && article?.translations?.en?.subtitle) ? article.translations.en.subtitle : (article?.subtitle || '');
  const displayExcerpt = (isViewingEn && article?.translations?.en?.excerpt) ? article.translations.en.excerpt : (article?.excerpt || '');
  const displayBlocks = (isViewingEn && article?.translations?.en?.blocks && article.translations.en.blocks.length > 0) 
    ? article.translations.en.blocks 
    : (article?.blocks || []);

  // Dynamic SEO Title and NewsArticle JSON-LD structured data (Hooks must always execute unconditionally)
  useEffect(() => {
    if (!article) return;
    const prevTitle = document.title;
    document.title = `${displayTitle} | GoalBangla`;

    let scriptTag = document.getElementById('json-ld-news-article') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-news-article';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      'headline': displayTitle,
      'description': displayExcerpt,
      'image': [article.featuredImage],
      'datePublished': article.publishedAt,
      'dateModified': article.updatedAt || article.publishedAt,
      'author': {
        '@type': 'Person',
        'name': author?.name || 'GoalBangla Sports Desk'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'GoalBangla',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80'
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': window.location.href
      }
    };
    scriptTag.textContent = JSON.stringify(jsonLd);

    return () => {
      document.title = prevTitle;
      const el = document.getElementById('json-ld-news-article');
      if (el) el.remove();
    };
  }, [article, displayTitle, displayExcerpt, author]);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikesCount(prev => prev + 1);
    } else {
      setLiked(false);
      setLikesCount(prev => prev - 1);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    setComments(prev => [
      {
        name: newCommentName.trim() || (language === 'en' ? 'Football Fan' : 'ফুটবল ভক্ত'),
        text: newCommentText.trim(),
        time: language === 'en' ? 'Just now' : 'এইমাত্র'
      },
      ...prev
    ]);
    setNewCommentText('');
    setNewCommentName('');
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">প্রতিবেদন লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">প্রতিবেদনটি পাওয়া যায়নি</h2>
        <p className="text-slate-400 text-sm">সম্ভবত লিংকটি পরিবর্তিত হয়েছে অথবা সরিয়ে নেওয়া হয়েছে।</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-sm"
        >
          হোমপেজে ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'en' ? 'Back to News Feed' : 'পেছনে যান'}</span>
        </button>

        {/* Translation Switcher Bar */}
        {hasEnTranslation && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-700 rounded-xl text-xs">
            <Globe className="w-3.5 h-3.5 text-emerald-400 ml-1.5" />
            <button
              onClick={() => setSelectedLanguageTab('bn')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                !isViewingEn 
                  ? 'bg-emerald-500 text-black shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              বাংলায় পড়ুন
            </button>
            <button
              onClick={() => setSelectedLanguageTab('en')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                isViewingEn 
                  ? 'bg-emerald-500 text-black shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Read in English
            </button>
          </div>
        )}
      </div>

      {/* Article Header & Typography */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold uppercase tracking-wider border border-emerald-500/30">
            {article.subcategory || article.category.replace('-', ' ')}
          </span>
          {article.isBreaking && (
            <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-extrabold uppercase tracking-wider">
              {language === 'en' ? 'BREAKING NEWS' : 'ব্রেকিং নিউজ'}
            </span>
          )}
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {language === 'bn' ? `${toBanglaNumber(article.readTimeMinutes)} মিনিট পাঠ` : `${article.readTimeMinutes} min read`}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
          {displayTitle}
        </h1>

        {displaySubtitle && (
          <p className="text-lg md:text-xl font-semibold text-slate-300 leading-snug">
            {displaySubtitle}
          </p>
        )}

        {/* Author Bio Row & Publication Metadata */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
              alt="" 
              className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/40" 
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">
                  {language === 'en' ? author?.name : author?.banglaName || author?.name || 'তানভীর আহমেদ'}
                </span>
                {author?.isVerified && (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                )}
              </div>
              <p className="text-xs text-slate-400">
                {language === 'en' ? author?.role : author?.banglaRole || 'প্রধান ফুটবল প্রতিবেদক'}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 sm:text-right">
            <div>{formatDate(article.publishedAt)}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {language === 'en' ? 'Verified by GoalBangla Sports Desk' : 'গোলবাংলা ক্রীড়া বিভাগ দ্বারা যাচাইকৃত'}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Main Image */}
      <div className="space-y-2">
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl aspect-[16/9]">
          <img 
            src={article.featuredImage} 
            alt={displayTitle} 
            className="w-full h-full object-cover" 
          />
        </div>
        {(article.imageCaption || article.imageCredit) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-400 px-1">
            <p className="italic">{article.imageCaption}</p>
            {article.imageCredit && (
              <span className="text-slate-500 text-[11px] font-mono">
                ছবি সৌজন্য: {article.imageCredit}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Article Excerpt Lead Paragraph */}
      <div className="p-5 rounded-2xl bg-[#090e18] border-l-4 border-emerald-400 text-base md:text-lg font-medium text-slate-200 leading-relaxed shadow-sm">
        {displayExcerpt}
      </div>

      {/* Structured Content Blocks */}
      <div className="prose prose-invert max-w-none">
        <BlockRenderer blocks={displayBlocks} onNavigate={onNavigate} />
      </div>

      {/* Related Entity Chips (Clubs & Players & Matches) */}
      {((article.relatedClubIds && article.relatedClubIds.length > 0) || (article.relatedPlayerIds && article.relatedPlayerIds.length > 0)) && (
        <div className="p-5 rounded-2xl bg-[#0b101a] border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            {language === 'en' ? 'Related Football Entities in this Story' : 'এই প্রতিবেদনে উল্লেখিত দল ও খেলোয়াড়'}
          </h4>

          <div className="flex flex-wrap gap-2">
            {article.relatedClubIds?.map(cid => {
              const club = clubs[cid];
              if (!club) return null;
              return (
                <button
                  key={cid}
                  onClick={() => onNavigate('club', club.slug)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <img src={club.logo} alt="" className="w-4 h-4 rounded-full object-cover" />
                  <span>{language === 'en' ? club.name : club.banglaName}</span>
                </button>
              );
            })}

            {article.relatedPlayerIds?.map(pid => {
              const player = players[pid];
              if (!player) return null;
              return (
                <button
                  key={pid}
                  onClick={() => onNavigate('player', player.slug)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-700/50 text-xs font-semibold text-cyan-300 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <img src={player.photo} alt="" className="w-4 h-4 rounded-full object-cover" />
                  <span>{language === 'en' ? player.name : player.banglaName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Social Engagement & Share Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0e1420] border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              liked 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span>{language === 'bn' ? toBanglaNumber(likesCount) : likesCount}</span>
          </button>

          <span className="text-xs text-slate-400 flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{language === 'bn' ? toBanglaNumber(comments.length) : comments.length} {t('common.comments', 'মন্তব্য')}</span>
          </span>
        </div>

        <button
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href);
              alert(language === 'en' ? 'Article link copied to clipboard!' : 'প্রতিবেদনের লিংক কপি করা হয়েছে!');
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>{t('common.share', 'শেয়ার')}</span>
        </button>
      </div>

      {/* Comments Section */}
      <div className="p-6 rounded-2xl bg-[#0b101a] border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          {language === 'en' ? 'Reader Discussion & Reactions' : 'পাঠক প্রতিক্রিয়া ও আলোচনা'}
        </h3>

        {/* Comment Input Form */}
        <form onSubmit={handleAddComment} className="space-y-3">
          <input
            type="text"
            value={newCommentName}
            onChange={(e) => setNewCommentName(e.target.value)}
            placeholder={language === 'en' ? 'Your Name...' : 'আপনার নাম লিখুন...'}
            className="w-full sm:w-64 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-500"
          />
          <div className="flex gap-2">
            <textarea
              required
              rows={2}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={language === 'en' ? 'Write your football opinion...' : 'ফুটবল বিষয়ক আপনার মতামত জানান...'}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs shrink-0 self-stretch flex items-center justify-center cursor-pointer"
            >
              {language === 'en' ? 'Post' : 'পাঠান'}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          {comments.map((c, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-300">{c.name}</span>
                <span className="text-[10px] text-slate-500">{c.time}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <div className="pt-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            {t('common.related', 'সম্পর্কিত আরও সংবাদ')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedArticles.map(rel => (
              <div
                key={rel.id}
                onClick={() => onNavigate('article', rel.slug)}
                className="group bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 rounded-xl overflow-hidden cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="aspect-[16/9] overflow-hidden bg-slate-950">
                  <img 
                    src={rel.featuredImage} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
                <div className="p-3.5 space-y-2">
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {language === 'en' && rel.translations?.en?.title ? rel.translations.en.title : rel.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 block">
                    {formatDate(rel.publishedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </article>
  );
};
