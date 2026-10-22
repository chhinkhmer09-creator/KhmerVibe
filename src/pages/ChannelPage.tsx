import React, { useState, useEffect } from 'react';
import {
  Film,
  Zap,
  Info,
  Edit2,
  Trash2,
  Check,
  Plus,
  Shield,
  Save,
  X,
  Users
} from 'lucide-react';
import { Video, FollowRecord } from '../types';
import { VideoCard } from '../components/VideoCard';
import { dbService, SEED_CREATORS } from '../services/database';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatViews, formatTimeAgo } from '../utils/formatters';

interface ChannelPageProps {
  userId?: string;
  onSelectVideo: (video: Video) => void;
  onOpenShorts: (initialVideoId?: string) => void;
}

export const ChannelPage: React.FC<ChannelPageProps> = ({
  userId,
  onSelectVideo,
  onOpenShorts,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const { lang } = useLanguage();

  const targetUid = userId || currentUser?.uid || 'creator_sokha';
  const isOwner = currentUser?.uid === targetUid;
  const canManage = isOwner || isAdmin;

  const [activeTab, setActiveTab] = useState<'long' | 'short' | 'followers' | 'about'>('long');
  const [channelVideos, setChannelVideos] = useState<Video[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followersList, setFollowersList] = useState<FollowRecord[]>([]);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editVisibility, setEditVisibility] = useState<'public' | 'unlisted' | 'private'>('public');

  const creatorInfo = SEED_CREATORS.find((c) => c.uid === targetUid) || {
    uid: targetUid,
    displayName: isOwner ? currentUser?.displayName || 'SokhaTraveller' : 'SokhaTraveller',
    photoURL: isOwner ? currentUser?.photoURL : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    subscribersCount: 0,
  };

  const loadData = () => {
    const vids = dbService.getVideos({
      ownerId: targetUid,
      includePrivate: canManage,
      viewerId: currentUser?.uid,
      isAdmin,
    });
    setChannelVideos(vids);
    setIsFollowing(dbService.isFollowing(targetUid, currentUser?.uid || 'guest'));
    setFollowersCount(dbService.getFollowersCount(targetUid));
    setFollowersList(dbService.getFollowers(targetUid));
  };

  useEffect(() => {
    loadData();
    const unsub = dbService.subscribe(loadData);
    return () => unsub();
  }, [targetUid, currentUser]);

  const longs = channelVideos.filter((v) => v.type === 'long');
  const shorts = channelVideos.filter((v) => v.type === 'short');
  const totalViews = channelVideos.reduce((acc, v) => acc + (v.viewCount || 0), 0);

  const handleToggleFollow = () => {
    if (!currentUser) return;
    const res = dbService.toggleFollow(targetUid, {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
    });
    setIsFollowing(res);
  };

  const handleDeleteVideo = (video: Video) => {
    if (!currentUser) return;
    if (confirm('តើអ្នកប្រាកដជាចង់លុបវីដេអូនេះមែនទេ?')) {
      try {
        dbService.deleteVideo(video.id, currentUser.uid, isAdmin);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleStartEdit = (video: Video) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDesc(video.description || '');
    setEditVisibility(video.visibility);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    dbService.updateVideo(editingVideo.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      visibility: editVisibility,
    });
    setEditingVideo(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Profile Header matching the design reference screenshot */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A]/80 border border-indigo-950 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <img
              src={creatorInfo.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={creatorInfo.displayName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-indigo-500/40 shadow-xl"
            />
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {creatorInfo.displayName}
                </h1>
                {isAdmin && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-300/80 font-medium mt-0.5">
                @{creatorInfo.displayName.toLowerCase().replace(/\s+/g, '')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleFollow}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                isFollowing
                  ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30 hover:scale-105 active:scale-95'
              }`}
            >
              {isFollowing ? 'កំពុងតាមដាន' : 'Follow'}
            </button>
          </div>
        </div>

        {/* Stats Row matching screenshot: Real followers starting from 0, real videos, real views */}
        <div className="grid grid-cols-3 divide-x divide-indigo-950 border-t border-indigo-950 pt-4 text-center">
          <div>
            <p className="text-base sm:text-xl font-black text-white">{followersCount}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">អ្នកតាមដាន</p>
          </div>
          <div>
            <p className="text-base sm:text-xl font-black text-white">{channelVideos.length}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">វីដេអូ</p>
          </div>
          <div>
            <p className="text-base sm:text-xl font-black text-white">{formatViews(totalViews, lang)}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">ចំនួនមើល</p>
          </div>
        </div>
      </div>

      {/* Tabs matching screenshot + Real Followers Tab */}
      <div className="flex gap-4 border-b border-indigo-950 text-xs sm:text-sm font-bold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('long')}
          className={`pb-3 relative transition-colors whitespace-nowrap ${
            activeTab === 'long' ? 'text-indigo-400 font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          វីដេអូ ({longs.length})
          {activeTab === 'long' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500" />}
        </button>

        <button
          onClick={() => setActiveTab('short')}
          className={`pb-3 relative transition-colors whitespace-nowrap ${
            activeTab === 'short' ? 'text-indigo-400 font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Shorts ({shorts.length})
          {activeTab === 'short' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500" />}
        </button>

        <button
          onClick={() => setActiveTab('followers')}
          className={`pb-3 relative transition-colors whitespace-nowrap ${
            activeTab === 'followers' ? 'text-indigo-400 font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          អ្នកតាមដាន ({followersCount})
          {activeTab === 'followers' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500" />}
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`pb-3 relative transition-colors whitespace-nowrap ${
            activeTab === 'about' ? 'text-indigo-400 font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          អំពីគណនី
          {activeTab === 'about' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500" />}
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'long' && (
          <div>
            {longs.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-[#0F172A]/50 border border-indigo-950">
                <p className="text-sm font-semibold text-neutral-300">មិនទាន់មានវីដេអូវែងនៅឡើយទេ</p>
                <p className="text-xs text-neutral-500 mt-1">វីដេអូដែលបង្ហោះពិតប្រាកដនឹងបង្ហាញនៅទីនេះ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {longs.map((video) => (
                  <div key={video.id} className="relative group">
                    <VideoCard video={video} onClick={onSelectVideo} />
                    {canManage && (
                      <div className="absolute top-2 right-2 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 p-1 rounded-lg">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(video);
                          }}
                          className="p-1 text-neutral-300 hover:text-amber-400"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVideo(video);
                          }}
                          className="p-1 text-neutral-300 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'short' && (
          <div>
            {shorts.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-[#0F172A]/50 border border-indigo-950">
                <p className="text-sm font-semibold text-neutral-300">មិនទាន់មានវីដេអូខ្លី Shorts នៅឡើយទេ</p>
                <p className="text-xs text-neutral-500 mt-1">វីដេអូខ្លី 9:16 ដែលបង្ហោះពិតនឹងបង្ហាញនៅទីនេះ</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {shorts.map((short) => (
                  <div
                    key={short.id}
                    onClick={() => onOpenShorts(short.id)}
                    className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer bg-[#0F172A] border border-indigo-950 group"
                  >
                    <img src={short.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                      <p className="text-xs font-bold text-white line-clamp-2">{short.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>អ្នកតាមដានពិតប្រាកដ ({followersCount} នាក់)</span>
              </h3>
              <span className="text-[11px] text-neutral-400">
                ចាប់ផ្ដើមពីចំណុចសូន្យ (០) ឡើងទៅ
              </span>
            </div>

            {followersList.length === 0 ? (
              <div className="text-center py-14 px-6 rounded-2xl bg-[#0F172A]/50 border border-indigo-950 space-y-3">
                <div className="w-14 h-14 rounded-full bg-indigo-950/60 border border-indigo-900/50 text-indigo-400 flex items-center justify-center mx-auto">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">មិនទាន់មានអ្នកតាមដាននៅឡើយទេ</h4>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1 leading-relaxed">
                    គណនីនេះចាប់ផ្ដើមពីចំណុចសូន្យ (0 Followers)។ មនុស្សពិតដែលចុច "Follow" នឹងត្រូវកត់ត្រា និងបង្ហាញឈ្មោះនៅទីនេះភ្លាមៗ។
                  </p>
                </div>
                {!isOwner && (
                  <button
                    onClick={handleToggleFollow}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ក្លាយជាអ្នកតាមដានពិតប្រាកដដំបូងគេ</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {followersList.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0F172A]/80 border border-indigo-950 hover:border-indigo-800/60 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={f.followerPhotoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{f.followerName || 'អ្នកប្រើប្រាស់ KhmerVibe'}</p>
                        <p className="text-[10px] text-neutral-400">
                          បានតាមដាន {formatTimeAgo(f.createdAt, lang)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      ✓ មនុស្សពិត
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="p-6 rounded-2xl bg-[#0F172A]/60 border border-indigo-950 text-xs sm:text-sm text-neutral-300 space-y-3 leading-relaxed">
            <h3 className="text-base font-bold text-white">អំពីគណនី {creatorInfo.displayName}</h3>
            <p className="text-neutral-400">
              {creatorInfo.displayName} ផលិតករវីដេអូខ្មែរលើវេទិកា KhmerVibe ចែករំលែកវីដេអូវប្បធម៌ និងដំណើរកម្សាន្តស្រុកខ្មែរ 🇰🇭
            </p>
            <div className="pt-2 text-xs space-y-1 text-neutral-400">
              <p>• ចូលរួម: ២០២៥</p>
              <p>• ប្រទេស: កម្ពុជា</p>
              <p>• សរុបការទស្សនា: {formatViews(totalViews, lang)} views</p>
              <p>• អ្នកតាមដានពិតប្រាកដ: {followersCount} នាក់</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-lg bg-[#0F172A] border border-indigo-950 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-indigo-950">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                <span>កែប្រែព័ត៌មានវីដេអូ</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingVideo(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1">ចំណងជើង</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-[#070A12] border border-indigo-950 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1">ការពិពណ៌នា</label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-[#070A12] border border-indigo-950 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingVideo(null)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
              >
                រក្សាទុក
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
