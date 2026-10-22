import React, { useState, useEffect } from 'react';
import { Zap, Upload } from 'lucide-react';
import { ShortsFeed } from '../components/ShortsFeed';
import { Video } from '../types';
import { dbService } from '../services/database';

interface ShortsPageProps {
  initialVideoId?: string;
  onCreatorClick: (creatorId: string) => void;
  onOpenShare: (video: Video) => void;
  onOpenUpload?: () => void;
}

export const ShortsPage: React.FC<ShortsPageProps> = ({
  initialVideoId,
  onCreatorClick,
  onOpenShare,
  onOpenUpload,
}) => {
  const [shortsVideos, setShortsVideos] = useState<Video[]>([]);

  const loadData = () => {
    const shorts = dbService.getVideos({ type: 'short' });
    setShortsVideos(shorts);
  };

  useEffect(() => {
    loadData();
    const unsub = dbService.subscribe(loadData);
    return () => unsub();
  }, []);

  if (shortsVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-fuchsia-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
          <Zap className="w-8 h-8 fill-current" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white">
            មិនទាន់មានវីដេអូខ្លី Shorts នៅឡើយទេ
          </h2>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            ជាមនុស្សដំបូងគេដែលចែករំលែកវីដេអូខ្លី (9:16 Vertical) ជាមួយសហគមន៍ KhmerVibe! គាំទ្រវីដេអូរហូតដល់ ១០ នាទី។
          </p>
        </div>
        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 text-white shadow-xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>បង្ហោះវីដេអូខ្លី Shorts ឥឡូវនេះ</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full -mt-2.5 sm:-mt-0">
      <ShortsFeed
        videos={shortsVideos}
        initialVideoId={initialVideoId}
        onCreatorClick={onCreatorClick}
        onShareClick={onOpenShare}
        onOpenUpload={onOpenUpload}
      />
    </div>
  );
};
