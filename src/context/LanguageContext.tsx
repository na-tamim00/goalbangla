import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
  toBanglaNumber: (num: number | string) => string;
  formatDate: (dateStr: string) => string;
}

const translationsDict: Record<Language, Record<string, string>> = {
  bn: {
    'nav.home': 'হোম',
    'nav.news': 'সংবাদ',
    'nav.live': 'লাইভ স্কোর',
    'nav.matches': 'ম্যাচ সেন্টার',
    'nav.transfers': 'দলবদল',
    'nav.injuries': 'ইনজুরি ইনডেক্স',
    'nav.epl': 'প্রিমিয়ার লিগ',
    'nav.laliga': 'লা লিগা',
    'nav.ucl': 'চ্যাম্পিয়ন্স লিগ',
    'nav.bpl': 'বাংলাদেশ ফুটবল',
    'nav.standings': 'পয়েন্ট টেবিল',
    'nav.fixtures': 'সময়সূচি',
    'nav.tactics': 'কৌশলগত বিশ্লেষণ',
    'nav.opinion': 'মতামত',
    'nav.gallery': 'ফটোগ্যালারি',
    'nav.videos': 'ভিডিও',
    'nav.archive': 'আর্কাইভ',
    'nav.admin': 'নিউজ রুম সিএমএস',
    'search.placeholder': 'সংবাদ, খেলোয়াড়, ক্লাব, লিগ অনুসন্ধান করুন...',
    'breaking.tag': 'ব্রেকিং নিউজ',
    'live.pulse': 'সরাসরি',
    'common.read_more': 'বিস্তারিত পড়ুন',
    'common.share': 'শেয়ার করুন',
    'common.related': 'সম্পর্কিত সংবাদ',
    'common.comments': 'মন্তব্য ও প্রতিক্রিয়া',
    'common.standings': 'পয়েন্ট তালিকা',
    'common.view_all': 'সবগুলো দেখুন',
    'footer.about': 'গোলবাংলা — দক্ষিণ এশিয়ার প্রিমিয়াম বহুভাষিক ফুটবল মিডিয়া ও ইন্টেলিজেন্স প্ল্যাটফর্ম। নিরপেক্ষ সংবাদ ও গভীর কৌশলগত বিশ্লেষণ।',
    'footer.copyright': '© ২০২৬ গোলবাংলা মিডিয়া লিমিটেড। সর্বস্বত্ব সংরক্ষিত।'
  },
  en: {
    'nav.home': 'Home',
    'nav.news': 'News',
    'nav.live': 'Live Scores',
    'nav.matches': 'Match Centre',
    'nav.transfers': 'Transfers',
    'nav.injuries': 'Injury Index',
    'nav.epl': 'Premier League',
    'nav.laliga': 'La Liga',
    'nav.ucl': 'Champions League',
    'nav.bpl': 'Bangladesh Football',
    'nav.standings': 'Standings',
    'nav.fixtures': 'Fixtures',
    'nav.tactics': 'Tactical Analysis',
    'nav.opinion': 'Opinion',
    'nav.gallery': 'Gallery',
    'nav.videos': 'Videos',
    'nav.archive': 'Archive',
    'nav.admin': 'Editorial CMS',
    'search.placeholder': 'Search news, players, clubs, competitions...',
    'breaking.tag': 'BREAKING NEWS',
    'live.pulse': 'LIVE',
    'common.read_more': 'Read Full Story',
    'common.share': 'Share',
    'common.related': 'Related Stories',
    'common.comments': 'Comments & Discussion',
    'common.standings': 'League Standings',
    'common.view_all': 'View All',
    'footer.about': 'GoalBangla — Premier Multilingual Football News & Tactical Intelligence Platform. Delivering unbiased reporting, live match telemetry, and investigative journalism.',
    'footer.copyright': '© 2026 GoalBangla Media Ltd. All rights reserved.'
  },
  es: {
    'nav.home': 'Inicio',
    'nav.news': 'Noticias',
    'nav.live': 'Marcadores',
    'nav.matches': 'Centro de Partidos',
    'nav.transfers': 'Fichajes',
    'nav.injuries': 'Lesiones',
    'nav.epl': 'Premier League',
    'nav.laliga': 'La Liga',
    'nav.ucl': 'Champions League',
    'nav.bpl': 'Fútbol Bangladesh',
    'nav.standings': 'Clasificación',
    'nav.fixtures': 'Partidos',
    'nav.tactics': 'Análisis Táctico',
    'nav.opinion': 'Opinión',
    'nav.gallery': 'Galería',
    'nav.videos': 'Videos',
    'nav.archive': 'Archivo',
    'nav.admin': 'CMS Editorial',
    'search.placeholder': 'Buscar noticias, jugadores, clubes...',
    'breaking.tag': 'ÚLTIMA HORA',
    'live.pulse': 'EN VIVO',
    'common.read_more': 'Leer más',
    'common.share': 'Compartir',
    'common.related': 'Noticias Relacionadas',
    'common.comments': 'Comentarios',
    'common.standings': 'Clasificación',
    'common.view_all': 'Ver todo',
    'footer.about': 'GoalBangla — Plataforma de periodismo e inteligencia futbolística.',
    'footer.copyright': '© 2026 GoalBangla Media Ltd. Todos los derechos reservados.'
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.news': 'الأخبار',
    'nav.live': 'مباشر',
    'nav.matches': 'مركز المباريات',
    'nav.transfers': 'الانتقالات',
    'nav.injuries': 'الإصابات',
    'nav.epl': 'الدوري الإنجليزي',
    'nav.laliga': 'الدوري الإسباني',
    'nav.ucl': 'دوري أبطال أوروبا',
    'nav.bpl': 'كرة بنغلاديش',
    'nav.standings': 'الترتيب',
    'nav.fixtures': 'المباريات',
    'nav.tactics': 'التحليل التكتيكي',
    'nav.opinion': 'آراء',
    'nav.gallery': 'الصور',
    'nav.videos': 'فيديو',
    'nav.archive': 'الأرشيف',
    'nav.admin': 'غرفة التحرير',
    'search.placeholder': 'بحث عن أخبار، لاعبين، أندية...',
    'breaking.tag': 'عاجل',
    'live.pulse': 'مباشر',
    'common.read_more': 'اقرأ المزيد',
    'common.share': 'مشاركة',
    'common.related': 'أخبار ذات صلة',
    'common.comments': 'التعليقات',
    'common.standings': 'جدول الترتيب',
    'common.view_all': 'عرض الكل',
    'footer.about': 'غول بنغلا — المنصة الرائدة لأخبار وتحليلات كرة القدم.',
    'footer.copyright': '© 2026 GoalBangla Media Ltd. جميع الحقوق محفوظة.'
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.news': 'Actualités',
    'nav.live': 'En direct',
    'nav.matches': 'Centre de Match',
    'nav.transfers': 'Transferts',
    'nav.injuries': 'Blessures',
    'nav.epl': 'Premier League',
    'nav.laliga': 'La Liga',
    'nav.ucl': 'Ligue des Champions',
    'nav.bpl': 'Football Bangladesh',
    'nav.standings': 'Classement',
    'nav.fixtures': 'Calendrier',
    'nav.tactics': 'Analyse Tactique',
    'nav.opinion': 'Opinions',
    'nav.gallery': 'Galerie',
    'nav.videos': 'Vidéos',
    'nav.archive': 'Archives',
    'nav.admin': 'CMS Rédaction',
    'search.placeholder': 'Rechercher actualités, joueurs, clubs...',
    'breaking.tag': 'DERNIÈRE MINUTE',
    'live.pulse': 'DIRECT',
    'common.read_more': 'Lire la suite',
    'common.share': 'Partager',
    'common.related': 'Articles connexes',
    'common.comments': 'Commentaires',
    'common.standings': 'Classement',
    'common.view_all': 'Voir tout',
    'footer.about': 'GoalBangla — Plateforme internationale d’actualités et d’analyses tactiques de football.',
    'footer.copyright': '© 2026 GoalBangla Media Ltd. Tous droits réservés.'
  }
};

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBanglaNumber(num: number | string): string {
  return String(num).replace(/[0-9]/g, (w) => bnDigits[+w]);
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check initial language from pathname or default to 'bn'
  const [language, setLanguageState] = useState<Language>(() => {
    const path = (typeof window !== 'undefined' && window.location && window.location.pathname) || '';
    if (path.startsWith('/en')) return 'en';
    if (path.startsWith('/es')) return 'es';
    if (path.startsWith('/ar')) return 'ar';
    if (path.startsWith('/fr')) return 'fr';
    return 'bn';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, defaultText: string = ''): string => {
    return translationsDict[language]?.[key] || translationsDict['en']?.[key] || defaultText || key;
  };

  const formatDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      if (language === 'bn') {
        const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
        const day = toBanglaNumber(d.getDate());
        const month = months[d.getMonth()];
        const year = toBanglaNumber(d.getFullYear());
        const hours = toBanglaNumber(d.getHours().toString().padStart(2, '0'));
        const minutes = toBanglaNumber(d.getMinutes().toString().padStart(2, '0'));
        return `${day} ${month}, ${year} • ${hours}:${minutes}`;
      } else {
        return d.toLocaleDateString(language === 'en' ? 'en-US' : language, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch {
      return dateStr;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toBanglaNumber, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
