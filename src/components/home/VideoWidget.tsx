import React, { useState, useEffect } from 'react';
import { Play, Eye, ArrowRight, Video } from 'lucide-react';
import { VideoItem } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface VideoWidgetProps {
  onSelectVideo?: (videoId: string) => void;
}

export const VideoWidget: React.FC<VideoWidgetProps> = ({ onSelectVideo }) => {
  const { language, toBanglaNumber } = useLanguage();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getVideos()
      .then(res => setVideos(res.slice(0, 3)))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {language === 'en' ? 'Video Highlights & Tactical Reels' : 'ভিডিও হাইলাইটস ও গোল রিল'}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'en' ? 'Crucial match moments, post-match reactions and player showcases' : 'ম্যাচের রোমাঞ্চকর গোল, নাটকীয় সেভ এবং ট্যাকটিকাল বিশ্লেষণ ভিডিও'}
            </p>
          </div>
        </div>

        {onSelectVideo && (
          <button
            onClick={() => onSelectVideo('all')}
            className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition-colors"
          >
            <span>{language === 'en' ? 'All Videos' : 'সকল ভিডিও'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {videos.map(vid => (
          <div
            key={vid.id}
            onClick={() => onSelectVideo && onSelectVideo(vid.id)}
            className="group bg-[#0b101a] border border-slate-800 hover:border-rose-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all shadow-lg flex flex-col justify-between"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
              <img 
                src={vid.thumbnail} 
                alt={vid.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-mono rounded">
                {Math.floor(vid.durationSeconds / 60)}:{(vid.durationSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="p-4 space-y-2">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                {vid.category}
              </span>
              <h3 className="text-xs md:text-sm font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-2 leading-snug">
                {language === 'en' ? vid.title : vid.banglaTitle}
              </h3>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {language === 'bn' ? `${toBanglaNumber(vid.viewsCount)} ভিউ` : `${vid.viewsCount} views`}
                </span>
                <span>{vid.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
