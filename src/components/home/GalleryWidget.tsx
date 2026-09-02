import React, { useState, useEffect } from 'react';
import { Camera, ArrowRight, Play, Eye } from 'lucide-react';
import { Gallery, VideoItem } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface MediaWidgetsProps {
  onNavigate: (view: string, param?: string) => void;
}

export const GalleryWidget: React.FC<MediaWidgetsProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [galleries, setGalleries] = useState<Gallery[]>([]);

  useEffect(() => {
    api.getGalleries().then(setGalleries).catch(console.error);
  }, []);

  if (galleries.length === 0) return null;
  const gal = galleries[0];

  return (
    <div className="bg-[#0b101a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">
            {language === 'en' ? 'Photo Journalism' : 'ফটোগ্যালারি ও ম্যাচ চিত্র'}
          </h3>
        </div>
        <button
          onClick={() => onNavigate('galleries')}
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
        >
          <span>{language === 'en' ? 'View All' : 'সব গ্যালারি'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div 
        onClick={() => onNavigate('galleries')}
        className="group relative rounded-xl overflow-hidden aspect-[16/9] cursor-pointer bg-slate-950"
      >
        <img 
          src={gal.coverImage} 
          alt="" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <span className="px-2 py-0.5 rounded bg-emerald-500 text-black text-[10px] font-extrabold uppercase mb-2 inline-block">
            {language === 'en' ? `${gal.images.length} PHOTOS` : `${gal.images.length}টি ছবি`}
          </span>
          <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
            {language === 'en' ? gal.title : gal.banglaTitle}
          </h4>
          <p className="text-[11px] text-slate-300 mt-1">
            ছবি: {gal.photographer}
          </p>
        </div>
      </div>
    </div>
  );
};

export const VideoWidget: React.FC<MediaWidgetsProps> = ({ onNavigate }) => {
  const { language, toBanglaNumber } = useLanguage();
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    api.getVideos().then(setVideos).catch(console.error);
  }, []);

  if (videos.length === 0) return null;

  return (
    <div className="bg-[#0b101a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center">
            <Play className="w-3.5 h-3.5 fill-current" />
          </div>
          <h3 className="text-base font-bold text-white">
            {language === 'en' ? 'GoalBangla TV & Videos' : 'গোলবাংলা টিভি ও হাইলাইটস'}
          </h3>
        </div>
        <button
          onClick={() => onNavigate('videos')}
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
        >
          <span>{language === 'en' ? 'All Videos' : 'সব ভিডিও'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {videos.slice(0, 2).map(vid => (
          <div
            key={vid.id}
            onClick={() => onNavigate('videos')}
            className="group bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 rounded-xl p-3 transition-all flex gap-3 cursor-pointer"
          >
            <div className="relative w-28 h-20 rounded-lg overflow-hidden bg-slate-950 shrink-0">
              <img src={vid.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between min-w-0 flex-1">
              <h5 className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition-colors line-clamp-2">
                {language === 'en' ? vid.title : vid.banglaTitle}
              </h5>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{vid.category}</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {language === 'bn' ? toBanglaNumber(vid.viewsCount) : vid.viewsCount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
