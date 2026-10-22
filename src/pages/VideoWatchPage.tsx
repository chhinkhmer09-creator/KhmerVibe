import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Plus,
  Check,
  Send,
  Trash2,
  Heart
} from 'lucide-react';
import { Video, Comment } from '../types';
import { VideoPlayer } from '../components/VideoPlayer';
import { dbService } from '../services/database';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatViews, formatTimeAgo } from '../utils/formatters';

interface VideoWatchPageProps {
  videoId: string;
  onSelectVideo: (video: Video) => void;
  onCreatorClick: (creatorId: string) => void;
  onOpenShare: (video: Video) => void;
  onOpenReport: (video: Video) => void;
}

export const VideoWatchPage: React.FC<VideoWatchPageProps> = ({
  videoId,
  onSelectVideo,
  onCreatorClick,
  onOpenShare,
  onOpenReport,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const { lang } = useLanguage();

  const [video, setVideo] = useState<Video | null>(null);
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [creatorFollowersCount, setCreatorFollowersCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const loadData = () => {
    const current = dbService.getVideoById(videoId);
    if (current) {
      setVideo(current);

      setIsLiked(dbService.isVideoLikedByUser(videoId, currentUser?.uid));
      setIsFollowing(dbService.isFollowing(current.ownerId, currentUser?.uid));
      setCreatorFollowersCount(dbService.getFollowersCount(current.ownerId));
      setComments(dbService.getComments(videoId));

      const recs = dbService
        .getVideos({ type: 'long', limit: 6 })
        .filter((v) => v.id !== videoId);
      setRecommendedVideos(recs);
    }
  };

  useEffect(() => {
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const unsub = dbService.subscribe(loadData);
    return () => unsub();
  }, [videoId, currentUser]);

  if (!video) {
    return (
      <div className="py-20 text-center text-neutral-400">
        <p className="text-sm font-semibold">រកមិនឃើញវីដេអូ</p>
      </div>
    );
  }

  const handleToggleLike = () => {
    if (!currentUser) return;
    const res = dbService.toggleLike(video.id, currentUser.uid);
    setIsLiked(res);
    if (isDisliked) setIsDisliked(false);
  };

  const handleToggleFollow = () => {
    if (!currentUser) return;
    const res = dbService.toggleFollow(video.ownerId, {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
    });
    setIsFollowing(res);
    setCreatorFollowersCount(dbService.getFollowersCount(video.ownerId));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newComment.trim()) return;

    dbService.addComment({
      videoId: video.id,
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorPhotoURL: currentUser.photoURL,
      text: newComment.trim(),
    });

    setComments(dbService.getComments(video.id));
    setNewComment('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (!currentUser) return;
    dbService.deleteComment(commentId, currentUser.uid, isAdmin);
    setComments(dbService.getComments(video.id));
  };

  return (
    <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
      {/* Main Video View Column */}
      <div className="lg:col-span-2 space-y-4">
        {/* Custom Video Player with 100% resilient playback & genuine view counting */}
        <VideoPlayer
          src={video.playbackUrl}
          poster={video.thumbnailUrl}
          storagePath={video.storagePath}
          videoId={video.id}
          autoPlay={true}
          onGenuineWatch={() => {
            dbService.recordGenuineView(video.id, currentUser?.uid);
          }}
        />

        {/* Video Title matching design reference */}
        <h1 className="text-lg sm:text-2xl font-black text-white leading-tight">
          {video.title}
        </h1>

        {/* Channel Row & Follow Button matching reference */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-indigo-950/80">
          <div className="flex items-center gap-3">
            <div
              onClick={() => onCreatorClick(video.ownerId)}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <img
                src={video.ownerPhotoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                alt={video.ownerName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40"
              />
            </div>

            <div>
              <p
                onClick={() => onCreatorClick(video.ownerId)}
                className="text-sm font-bold text-white hover:text-indigo-400 cursor-pointer"
              >
                {video.ownerName}
              </p>
              <p className="text-[11px] text-neutral-400">
                {creatorFollowersCount} អ្នកតាមដាន • {formatViews(video.viewCount, lang)} {lang === 'km' ? 'ចំនួនមើល' : 'views'} • {formatTimeAgo(video.createdAt, lang)}
              </p>
            </div>

            {/* Follow Button */}
            <button
              onClick={handleToggleFollow}
              className={`ml-2 px-5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md ${
                isFollowing
                  ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30 hover:scale-105 active:scale-95'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          {/* Engagement Row matching reference screenshot: 👍 12K, 👎, Comment, Share, ••• */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                isLiked
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-[#0F172A] hover:bg-indigo-950 text-neutral-200 border border-indigo-950'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{formatViews(video.likesCount, lang)}</span>
            </button>

            <button
              onClick={() => setIsDisliked(!isDisliked)}
              className={`p-2 rounded-full text-xs font-semibold transition-all ${
                isDisliked
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#0F172A] hover:bg-indigo-950 text-neutral-400 border border-indigo-950'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('comment-box');
                el?.focus();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#0F172A] hover:bg-indigo-950 text-neutral-200 border border-indigo-950 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comment</span>
            </button>

            <button
              onClick={() => onOpenShare(video)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#0F172A] hover:bg-indigo-950 text-neutral-200 border border-indigo-950 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              onClick={() => onOpenReport(video)}
              className="p-2 rounded-full bg-[#0F172A] hover:bg-indigo-950 text-neutral-400 hover:text-white border border-indigo-950 transition-colors"
              title="More"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Description Box matching design reference */}
        <div className="p-4 rounded-2xl bg-[#0F172A]/80 border border-indigo-950 text-xs sm:text-sm text-neutral-300 space-y-1.5 leading-relaxed">
          <p className="whitespace-pre-line">
            {video.description || 'រឿងពិតនៃព្រះរាជវាំងបុរាណសម័យអង្គរ...'}
          </p>
        </div>

        {/* Comments Section */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm sm:text-base font-bold text-white">
            មតិយោបល់ ({comments.length})
          </h3>

          {/* Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-3 items-center">
            <img
              src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt=""
              className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/40 shrink-0"
            />
            <input
              id="comment-box"
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="បញ្ចូលមតិយោបល់..."
              className="flex-1 bg-[#0F172A] border border-indigo-950 focus:border-indigo-500 rounded-full px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors shadow-md shadow-indigo-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Comment List */}
          <div className="space-y-3 pt-2">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3 p-3 rounded-2xl bg-[#0F172A]/40 border border-indigo-950/40">
                <img
                  src={c.authorPhotoURL || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                  alt={c.authorName}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-indigo-500/30 shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300">{c.authorName}</span>
                    <span className="text-[10px] text-neutral-500">{formatTimeAgo(c.createdAt, lang)}</span>
                  </div>
                  <p className="text-xs text-neutral-200 mt-1 leading-relaxed">{c.text}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-400">
                    <button className="flex items-center gap-1 hover:text-rose-400">
                      <Heart className="w-3.5 h-3.5" />
                      <span>{c.likesCount || 45}</span>
                    </button>
                    {(currentUser?.uid === c.authorId || isAdmin) && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-neutral-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Videos Sidebar */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-neutral-300">
          វីដេអូស្រដៀងគ្នា (Related Videos)
        </h3>
        <div className="space-y-4">
          {recommendedVideos.map((rec) => (
            <div
              key={rec.id}
              onClick={() => onSelectVideo(rec)}
              className="flex gap-3 cursor-pointer group p-1.5 rounded-2xl hover:bg-[#0F172A] transition-colors"
            >
              <div className="relative aspect-video w-36 rounded-xl overflow-hidden bg-neutral-900 border border-indigo-950 shrink-0">
                <img src={rec.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
                  {rec.title}
                </p>
                <p className="text-[11px] text-neutral-400 mt-1 truncate">{rec.ownerName}</p>
                <p className="text-[10px] text-neutral-500">{formatViews(rec.viewCount, lang)} views</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
