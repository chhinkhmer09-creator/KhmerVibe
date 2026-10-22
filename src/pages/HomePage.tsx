import React, { useState, useEffect } from 'react';
import { Play, Upload, Sparkles, Film } from 'lucide-react';
import { Video } from '../types';
import { CATEGORIES } from '../data/categories';
import { VideoCard } from '../components/VideoCard';
import { dbService } from '../services/database';
import { useLanguage } from '../context/LanguageContext';

interface HomePageProps {
  searchQuery: string;
  onSelectVideo: (video: Video) => void;
  onOpenShorts: (initialVideoId?: string) => void;
  onCreatorClick: (creatorId: string) => void;
  onOpenUpload?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  searchQuery,
  onSelectVideo,
  onCreatorClick,
  onOpenUpload,
}) => {
  const { lang, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [videos, setVideos] = useState<Video[]>([]);

  const loadData = () => {
    const list = dbService.getVideos({
      type: 'long',
      category: selectedCategory,
      search: searchQuery,
    });
    setVideos(list);
  };

  useEffect(() => {
    loadData();
    const unsub = dbService.subscribe(loadData);
    return () => unsub();
  }, [selectedCategory, searchQuery]);

  const featuredVideo = videos[0];

  return (
    <div className="space-y-6 pb-16">
      {/* Hero Banner matching the design reference */}
      {!searchQuery && (
        <div className="relative w-full rounded-3xl overflow-hidden border border-indigo-950/80 bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] shadow-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=1600&auto=format&fit=crop&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070A12] via-[#070A12]/70 to-transparent" />

          <div className="relative z-10 p-6 sm:p-10 max-w-2xl space-y-3">
            <h1 className="text-xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              មើលរឿងភាគខ្មែរ<br />
              និងវីដេអូថ្មីៗ
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 font-medium leading-relaxed">
              រីករាយជាមួយវីដេអូគុណភាពខ្ពស់រៀងរាល់ថ្ងៃ • គាំទ្រការបង្ហោះរហូតដល់ ១០ នាទី
            </p>
            <div className="pt-2 flex items-center gap-3">
              {featuredVideo ? (
                <button
                  onClick={() => onSelectVideo(featuredVideo)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>មើលវីដេអូឥឡូវ</span>
                </button>
              ) : null}

              {onOpenUpload && (
                <button
                  onClick={onOpenUpload}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>បង្ហោះវីដេអូផ្ទាល់ខ្លួន</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Pills matching design reference */}
      <div className="sticky top-[58px] z-30 bg-[#070A12]/95 backdrop-blur-md py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-indigo-950/60 overflow-x-auto no-scrollbar flex items-center gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-[#0F172A] hover:bg-indigo-950 text-neutral-300 border border-indigo-950'
              }`}
            >
              {lang === 'km' ? cat.nameKm : cat.nameEn}
            </button>
          );
        })}
      </div>

      {/* "វីដេអូថ្មីៗ" Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
            {searchQuery ? `ស្វែងរក: "${searchQuery}"` : 'វីដេអូថ្មីៗ'}
          </h2>
          {videos.length > 0 && (
            <span className="text-xs text-neutral-400 font-medium">
              វីដេអូពិតសរុប {videos.length}
            </span>
          )}
        </div>

        {videos.length === 0 ? (
          /* Clean, real empty state inviting real video upload */
          <div className="text-center py-16 px-6 rounded-3xl bg-[#0F172A]/50 border border-indigo-950 max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-900/60 text-indigo-400 flex items-center justify-center mx-auto shadow-xl">
              <Film className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                មិនទាន់មានវីដេអូបង្ហោះនៅឡើយទេ
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                KhmerVibe ជាវេទិកាពិតប្រាកដ ១០០% សម្រាប់ប្រជាជនកម្ពុជា។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីបង្ហោះវីដេអូពិតដំបូងពីទូរស័ព្ទ ឬកុំព្យូទ័ររបស់អ្នក (រហូតដល់ ១០ នាទី • 1GB)។
              </p>
            </div>
            {onOpenUpload && (
              <div className="pt-2">
                <button
                  onClick={onOpenUpload}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>បង្ហោះវីដេអូពិតដំបូងរបស់អ្នក</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={onSelectVideo}
                onCreatorClick={onCreatorClick}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
