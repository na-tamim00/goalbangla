import React, { useState, useEffect } from 'react';
import { Camera, Play, Eye, Calendar, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Gallery, VideoItem } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface MediaHubPageProps {
  defaultTab?: 'galleries' | 'videos';
}

export const MediaHubPage: React.FC<MediaHubPageProps> = ({ defaultTab = 'galleries' }) => {
  const { language, toBanglaNumber, formatDate } = useLanguage();
  const [activeTab, setActiveTab] = useState<'galleries' | 'videos'>(defaultTab);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [galleryImgIdx, setGalleryImgIdx] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    Promise.all([
      api.getGalleries(),
      api.getVideos()
    ]).then(([gData, vData]) => {
      setGalleries(gData);
      setVideos(vData);
    }).catch(console.error);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {language === 'en' ? 'Photo Galleries & Video Highlights' : 'মিডিয়া হাব • ফটোগ্যালারি ও ম্যাচ হাইলাইটস'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'en' ? 'High-definition football photography and curated match action clips' : 'ফুটবল ম্যাচের রুদ্ধশ্বাস মুহূর্তের আলোকচিত্র ও ভিডিও হাইলাইটস'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('galleries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'galleries' ? 'bg-emerald-500 text-black shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{language === 'en' ? 'Photo Galleries' : 'ফটোগ্যালারি'}</span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'videos' ? 'bg-emerald-500 text-black shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{language === 'en' ? 'Videos' : 'ভিডিও হাইলাইটস'}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Photo Galleries Grid */}
      {activeTab === 'galleries' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {galleries.map(gal => (
            <div
              key={gal.id}
              onClick={() => {
                setSelectedGallery(gal);
                setGalleryImgIdx(0);
              }}
              className="group bg-[#0b101a] border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all shadow-xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                <img src={gal.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500 text-black text-[10px] font-extrabold uppercase mb-2 inline-block">
                    {gal.images.length}টি ছবি
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {language === 'en' ? gal.title : gal.banglaTitle}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    ফটোগ্রাফার: {gal.photographer} • {formatDate(gal.publishedAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Videos Grid */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(vid => (
            <div
              key={vid.id}
              onClick={() => setSelectedVideo(vid)}
              className="group bg-[#0b101a] border border-slate-800 hover:border-rose-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all flex flex-col justify-between shadow-xl"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
                <img src={vid.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-mono rounded">
                  {vid.duration}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                  {vid.category}
                </span>
                <h3 className="text-xs md:text-sm font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-2">
                  {language === 'en' ? vid.title : vid.banglaTitle}
                </h3>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {language === 'bn' ? `${toBanglaNumber(vid.viewsCount)} ভিউ` : `${vid.viewsCount} views`}
                  </span>
                  <span>{formatDate(vid.publishedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gallery Lightbox Modal */}
      {selectedGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-[#090e18] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {language === 'en' ? selectedGallery.title : selectedGallery.banglaTitle}
                </h3>
                <p className="text-xs text-slate-400">
                  ছবি {galleryImgIdx + 1} / {selectedGallery.images.length}
                </p>
              </div>
              <button 
                onClick={() => setSelectedGallery(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[350px]">
              <img 
                src={selectedGallery.images[galleryImgIdx]?.url} 
                alt="" 
                className="max-h-[60vh] max-w-full object-contain" 
              />
              
              {/* Prev Button */}
              {galleryImgIdx > 0 && (
                <button
                  onClick={() => setGalleryImgIdx(prev => prev - 1)}
                  className="absolute left-4 p-3 rounded-full bg-black/60 text-white hover:bg-emerald-500 hover:text-black transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Next Button */}
              {galleryImgIdx < selectedGallery.images.length - 1 && (
                <button
                  onClick={() => setGalleryImgIdx(prev => prev + 1)}
                  className="absolute right-4 p-3 rounded-full bg-black/60 text-white hover:bg-emerald-500 hover:text-black transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 text-xs text-slate-300 flex justify-between items-center">
              <p>{selectedGallery.images[galleryImgIdx]?.caption}</p>
              <span className="text-slate-500">ছবি: {selectedGallery.photographer}</span>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-[#090e18] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {language === 'en' ? selectedVideo.title : selectedVideo.banglaTitle}
              </h3>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId || 'dQw4w9WgXcQ'}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
