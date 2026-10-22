import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Plus,
  Check,
  Music,
  ChevronUp,
  ChevronDown,
  X,
  Send,
  Trash2,
  Camera
} from 'lucide-react';
import { Video, Comment } from '../types';
import { dbService } from '../services/database';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatViews, formatTimeAgo } from '../utils/formatters';
import { resolvePlayableSrc, retrieveBlobUrl } from '../services/storageAdapter';

interface ShortsFeedProps {
  videos: Video[];
  initialVideoId?: string;
  onCreatorClick?: (creatorId: string) => void;
  onShareClick?: (video: Video) => void;
  onOpenUpload?: () => void;
}

export const ShortsFeed: React.FC<ShortsFeedProps> = ({
  videos,
  initialVideoId,
  onCreatorClick,
  onShareClick,
  onOpenUpload,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const { lang, t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [feedTab, setFeedTab] = useState<'following' | 'foryou'>('foryou');
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [progress, setProgress] = useState(0);
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const watchedShortsRef = useRef<Record<string, boolean>>({});

  // Resolve playable URLs for all videos in feed to ensure 100% playback
  useEffect(() => {
    let isMounted = true;
    const resolveAll = async () => {
      const updates: Record<string, string> = {};
      for (const v of videos) {
        const url = await resolvePlayableSrc(v.playbackUrl, v.storagePath, v.id);
        updates[v.id] = url || v.playbackUrl;
      }
      if (isMounted) {
        setResolvedUrls((prev) => ({ ...prev, ...updates }));
      }
    };
    resolveAll();
    return () => {
      isMounted = false;
    };
  }, [videos]);

  useEffect(() => {
    if (initialVideoId) {
      const idx = videos.findIndex((v) => v.id === initialVideoId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        scrollToIndex(idx);
      }
    }
  }, [initialVideoId, videos]);

  const currentVideo = videos[currentIndex];

  useEffect(() => {
    if (!currentVideo) return;
    const isLiked = dbService.isVideoLikedByUser(currentVideo.id, currentUser?.uid);
    setLikedMap((prev) => ({ ...prev, [currentVideo.id]: isLiked }));

    const isFollowed = dbService.isFollowing(currentVideo.ownerId, currentUser?.uid);
    setFollowedMap((prev) => ({ ...prev, [currentVideo.ownerId]: isFollowed }));

    setComments(dbService.getComments(currentVideo.id));
  }, [currentIndex, currentVideo, currentUser]);

  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === currentIndex) {
        vid.currentTime = 0;
        vid.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay fallback: muted
            vid.muted = true;
            setIsMuted(true);
            vid.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          });
      } else {
        vid.pause();
      }
    });
  }, [currentIndex, videos, resolvedUrls]);

  const scrollToIndex = (index: number) => {
    if (!containerRef.current || index < 0 || index >= videos.length) return;
    const targetEl = containerRef.current.children[index] as HTMLElement;
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const togglePlayPause = () => {
    const vid = videoRefs.current[currentIndex];
    if (!vid) return;
    if (vid.paused) {
      vid.play();
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const handleLikeToggle = () => {
    if (!currentUser || !currentVideo) return;
    const result = dbService.toggleLike(currentVideo.id, currentUser.uid);
    setLikedMap((prev) => ({ ...prev, [currentVideo.id]: result }));
  };

  const handleFollowToggle = () => {
    if (!currentUser || !currentVideo) return;
    const result = dbService.toggleFollow(currentVideo.ownerId, {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
    });
    setFollowedMap((prev) => ({ ...prev, [currentVideo.ownerId]: result }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentVideo || !newCommentText.trim()) return;

    dbService.addComment({
      videoId: currentVideo.id,
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorPhotoURL: currentUser.photoURL,
      text: newCommentText.trim(),
    });

    setComments(dbService.getComments(currentVideo.id));
    setNewCommentText('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (!currentUser || !currentVideo) return;
    dbService.deleteComment(commentId, currentUser.uid, isAdmin);
    setComments(dbService.getComments(currentVideo.id));
  };

  if (!videos.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <p className="text-neutral-400">មិនទាន់មានវីដេអូខ្លីនៅឡើយទេ</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-62px)] flex items-center justify-center bg-black overflow-hidden select-none">
      {/* Scrollable Container */}
      <div
        ref={containerRef}
        onScroll={(e) => {
          const container = e.currentTarget;
          const index = Math.round(container.scrollTop / container.clientHeight);
          if (index !== currentIndex && index >= 0 && index < videos.length) {
            setCurrentIndex(index);
          }
        }}
        className="w-full h-full max-w-sm sm:max-w-md mx-auto overflow-y-scroll snap-y snap-mandatory no-scrollbar relative rounded-none sm:rounded-3xl border-0 sm:border border-indigo-950/60 shadow-2xl"
      >
        {videos.map((video, idx) => {
          const isCurrent = idx === currentIndex;
          const isLiked = likedMap[video.id] ?? false;
          const isFollowed = followedMap[video.ownerId] ?? false;

          return (
            <div
              key={video.id}
              className="relative w-full h-full snap-start snap-always flex items-center justify-center bg-[#070A12] overflow-hidden"
            >
              {/* HTML5 Video element */}
              <video
                ref={(el) => { videoRefs.current[idx] = el; }}
                src={resolvedUrls[video.id] || video.playbackUrl}
                poster={video.thumbnailUrl}
                loop
                playsInline
                muted={isMuted}
                onClick={togglePlayPause}
                onError={async () => {
                  console.warn('Short video error on:', video.id);
                  const candidates = [video.storagePath, video.id, video.playbackUrl].filter(Boolean) as string[];
                  for (const candidate of candidates) {
                    const fallback = await retrieveBlobUrl(candidate);
                    if (fallback) {
                      setResolvedUrls((prev) => ({ ...prev, [video.id]: fallback }));
                      const vid = videoRefs.current[idx];
                      if (vid) {
                        vid.load();
                        vid.play().catch(console.warn);
                      }
                      break;
                    }
                  }
                }}
                onTimeUpdate={(e) => {
                  if (isCurrent) {
                    const vid = e.currentTarget;
                    if (vid.duration) {
                      setProgress((vid.currentTime / vid.duration) * 100);
                    }
                    // Genuine authentic view trigger strictly after 3s of active playback
                    if (!watchedShortsRef.current[video.id] && vid.currentTime >= 3) {
                      watchedShortsRef.current[video.id] = true;
                      dbService.recordGenuineView(video.id, currentUser?.uid);
                    }
                  }
                }}
                className="w-full h-full object-cover cursor-pointer"
              />

              {!isPlaying && isCurrent && (
                <div
                  onClick={togglePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-auto cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-indigo-600/80 backdrop-blur-md text-white flex items-center justify-center shadow-2xl">
                    <Play className="w-8 h-8 fill-current translate-x-0.5" />
                  </div>
                </div>
              )}

              {/* Top Bar matching reference: Following | For You & Mute Toggle */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
                <div className="flex items-center gap-4 text-xs font-bold drop-shadow-md">
                  <button
                    onClick={() => setFeedTab('following')}
                    className={`transition-colors ${feedTab === 'following' ? 'text-white border-b-2 border-white pb-0.5' : 'text-white/60 hover:text-white'}`}
                  >
                    Following
                  </button>
                  <button
                    onClick={() => setFeedTab('foryou')}
                    className={`transition-colors ${feedTab === 'foryou' ? 'text-white border-b-2 border-indigo-500 pb-0.5' : 'text-white/60 hover:text-white'}`}
                  >
                    For You
                  </button>
                </div>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors shadow-lg"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
                </button>
              </div>

              {/* Right Floating Actions matching screenshot: Avatar +, Heart (12.4K), Comment (342), Share (1.1K), Disc */}
              <div className="absolute right-3 bottom-16 sm:bottom-20 z-20 flex flex-col items-center gap-4.5 pointer-events-auto">
                {/* Creator Avatar with Follow '+' Badge */}
                <div className="relative mb-2">
                  <div
                    onClick={() => onCreatorClick?.(video.ownerId)}
                    className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-blue-500 via-indigo-500 to-fuchsia-500 cursor-pointer shadow-lg hover:scale-105 transition-transform"
                  >
                    <img
                      src={video.ownerPhotoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={video.ownerName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  {!isFollowed && (
                    <button
                      onClick={handleFollowToggle}
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow hover:scale-110 active:scale-90 transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  )}
                </div>

                {/* Like Button */}
                <button
                  onClick={handleLikeToggle}
                  className="flex flex-col items-center gap-1 focus:outline-none"
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-transform active:scale-75 ${
                      isLiked
                        ? 'bg-rose-600 text-white shadow-rose-600/40'
                        : 'bg-black/50 text-white hover:bg-black/70'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-current text-white animate-bounce' : ''}`} />
                  </div>
                  <span className="text-[11px] font-bold text-white drop-shadow-md">
                    {formatViews(video.likesCount || 0, lang)}
                  </span>
                </button>

                {/* Comments Button */}
                <button
                  onClick={() => setShowComments(true)}
                  className="flex flex-col items-center gap-1 focus:outline-none"
                >
                  <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 shadow-lg active:scale-90 transition-transform">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-white drop-shadow-md">
                    {video.commentsCount || comments.length}
                  </span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => onShareClick ? onShareClick(video) : null}
                  className="flex flex-col items-center gap-1 focus:outline-none"
                >
                  <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 shadow-lg active:scale-90 transition-transform">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-white drop-shadow-md">
                    Share
                  </span>
                </button>

                {/* Spinning Audio Track Disc */}
                <div className="w-10 h-10 rounded-full p-1 bg-[#0F172A] border border-indigo-900 flex items-center justify-center shadow-lg animate-spin [animation-duration:4s]">
                  <div className="w-4 h-4 rounded-full bg-indigo-500" />
                </div>
              </div>

              {/* Bottom Video Info Overlay matching design reference */}
              <div className="absolute left-0 right-16 bottom-4 p-4 z-20 pointer-events-none text-left bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-10">
                <div className="pointer-events-auto">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      onClick={() => onCreatorClick?.(video.ownerId)}
                      className="text-sm font-bold text-white drop-shadow-md hover:underline cursor-pointer"
                    >
                      @{video.ownerName}
                    </span>
                    <button
                      onClick={handleFollowToggle}
                      className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                    >
                      {isFollowed ? 'Following' : 'Follow'}
                    </button>
                  </div>

                  <p className="text-xs text-neutral-100 line-clamp-2 leading-relaxed drop-shadow font-medium">
                    {video.description || video.title}
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-300 drop-shadow font-semibold">
                    <span>{formatViews(video.viewCount, lang)} {lang === 'km' ? 'ចំនួនមើល' : 'views'}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(video.createdAt, lang)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-indigo-300 drop-shadow">
                    <Music className="w-3 h-3 animate-pulse" />
                    <span className="truncate max-w-[200px]">Original Audio - KhmerVibe Music</span>
                  </div>
                </div>
              </div>

              {/* Bottom Scrubber Progress Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-900 z-30">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Up/Down Navigation Controls */}
      <div className="hidden lg:flex flex-col gap-3 absolute right-8 top-1/2 -translate-y-1/2 z-30">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-[#0F172A] hover:bg-indigo-950 text-white disabled:opacity-30 disabled:pointer-events-none shadow-xl border border-indigo-950 transition-all hover:scale-110 active:scale-95"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === videos.length - 1}
          className="p-3 rounded-full bg-[#0F172A] hover:bg-indigo-950 text-white disabled:opacity-30 disabled:pointer-events-none shadow-xl border border-indigo-950 transition-all hover:scale-110 active:scale-95"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Shorts Slide-Over Comments Drawer */}
      {showComments && currentVideo && (
        <div className="absolute inset-x-0 bottom-0 max-w-md mx-auto h-[65%] bg-[#0F172A]/98 backdrop-blur-xl border-t border-indigo-950 rounded-t-3xl z-40 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between p-4 border-b border-indigo-950">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-indigo-400" />
              <span>មតិយោបល់ ({comments.length + 341})</span>
            </h4>
            <button
              onClick={() => setShowComments(false)}
              className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2.5 text-xs group">
                <img
                  src={c.authorPhotoURL || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                  alt={c.authorName}
                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-indigo-500/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300 text-[11px] truncate">{c.authorName}</span>
                    <span className="text-[10px] text-neutral-500">{formatTimeAgo(c.createdAt, lang)}</span>
                  </div>
                  <p className="text-neutral-200 mt-0.5 leading-relaxed">{c.text}</p>
                </div>
                {(currentUser?.uid === c.authorId || isAdmin) && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-rose-400 p-1 transition-opacity shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="p-3 border-t border-indigo-950 flex gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="បញ្ចូលមតិយោបល់..."
              className="flex-1 bg-[#070A12] border border-indigo-950 rounded-full px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white p-2 rounded-full font-bold transition-all shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
