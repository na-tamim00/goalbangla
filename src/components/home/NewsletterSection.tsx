import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const NewsletterSection: React.FC = () => {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubmitted(true);
  };

  return (
    <section className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/50 border border-emerald-500/30 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
      <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          {language === 'en' ? 'Weekly Tactical Briefing' : 'সাপ্তাহিক ফুটবল ইন্টেলিজেন্স নিউজলেটার'}
        </div>

        <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
          {language === 'en' 
            ? 'The Inside Track on European & Bangladesh Football' 
            : 'ইউরোপীয় লিগ ও বাংলাদেশ ফুটবলের ইনসাইড অ্যানালিসিস সরাসরি আপনার ইনবক্সে'}
        </h2>

        <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          {language === 'en'
            ? 'Get weekly tactical breakdowns, exclusive transfer scoops, and deep data telemetry delivered every Friday.'
            : 'প্রতি শুক্রবার সকালে সেরা ট্যাকটিক্যাল ডিকোড, দলবদল ইনসাইট ও এক্সক্লুসিভ কলাম এক ক্লিকে পড়ার সুযোগ নিন।'}
        </p>

        {isSubmitted ? (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center justify-center gap-2 max-w-md mx-auto">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>
              {language === 'en' 
                ? 'Thank you! You have subscribed to GoalBangla Intelligence.'
                : 'ধন্যবাদ! গোলবাংলা সাপ্তাহিক নিউজলেটারে যুক্ত হয়েছেন।'}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'en' ? 'Enter your email address...' : 'আপনার ইমেইল ঠিকানা লিখুন...'}
                className="w-full pl-10 pr-4 py-3 bg-[#070b12] border border-slate-700 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>{language === 'en' ? 'Subscribe' : 'সাবস্ক্রাইব'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {language === 'en' ? 'No Spam Ever' : 'কোনো স্প্যাম নয়'}
          </span>
          <span>•</span>
          <span>{language === 'en' ? 'Unsubscribe Anytime' : 'যেকোনো সময় আনসাবস্ক্রাইব করার সুবিধা'}</span>
        </div>
      </div>
    </section>
  );
};
