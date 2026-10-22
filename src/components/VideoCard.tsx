import React from 'react';
import { Play } from 'lucide-react';
import { Video } from '../types';
import { formatViews, formatDuration, formatTimeAgo } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
  onCreatorClick?: (creatorId: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick, onCreatorClick }) => {
  const { lang } = useLanguage();

  return (
    <div
      onClick={() => onClick(video)}
      className="group flex flex-col cursor-pointer transition-all duration-200"
    >
      {/* 16:9 Thumbnail Frame */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#0F172A] border border-indigo-950 shadow-md group-hover:border-indigo-500/50 group-hover:shadow-indigo-500/10 transition-all group-hover:scale-[1.01]">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Play Icon Hover Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          </div>
        </div>

        {/* Duration badge matching reference screenshot */}
        {video.duration ? (
          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-md shadow">
            {formatDuration(video.duration)}
          </div>
        ) : null}
      </div>

      {/* Video Details */}
      <div className="flex gap-2.5 mt-2.5 items-start">
        {/* Creator Avatar with KhmerVibe blue ring */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (onCreatorClick) onCreatorClick(video.ownerId);
          }}
          className="shrink-0 mt-0.5 transition-transform hover:scale-105"
        >
          {video.ownerPhotoURL ? (
            <img
              src={video.ownerPhotoURL}
              alt={video.ownerName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center">
              {video.ownerName.charAt(0)}
            </div>
          )}
        </div>

        {/* Title, Channel & Stats */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 leading-snug group-hover:text-indigo-400 transition-colors">
            {video.title}
          </h3>

          <p
            onClick={(e) => {
              e.stopPropagation();
              if (onCreatorClick) onCreatorClick(video.ownerId);
            }}
            className="text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors mt-0.5 truncate"
          >
            {video.ownerName}
          </p>

          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-0.5">
            <span>{formatViews(video.viewCount, lang)} {lang === 'km' ? 'ចំនួនមើល' : 'views'}</span>
            <span>•</span>
            <span>{formatTimeAgo(video.createdAt, lang)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
