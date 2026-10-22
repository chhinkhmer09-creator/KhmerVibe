import React, { useState, useEffect } from 'react';
import { Users, Check, Plus, Film } from 'lucide-react';
import { User, Video } from '../types';
import { VideoCard } from '../components/VideoCard';
import { dbService, SEED_CREATORS } from '../services/database';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface FollowingPageProps {
  onSelectVideo: (video: Video) => void;
  onCreatorClick: (creatorId: string) => void;
  onExplore: () => void;
}

export const FollowingPage: React.FC<FollowingPageProps> = ({
  onSelectVideo,
  onCreatorClick,
  onExplore,
}) => {
  const { currentUser } = useAuth();
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'creators' | 'suggested'>('creators');
  const [creators, setCreators] = useState<User[]>([]);
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});
  const [videos, setVideos] = useState<Video[]>([]);

  const loadData = () => {
    const allCreators = dbService.getCreators();
    setCreators(allCreators);

    const map: Record<string, boolean> = {};
    allCreators.forEach((c) => {
      map[c.uid] = dbService.isFollowing(c.uid, currentUser?.uid || 'guest');
    });
    setFollowedMap(map);

    const vids = dbService.getVideos({ type: 'long' });
    setVideos(vids);
  };

  useEffect(() => {
    loadData();
    const unsub = dbService.subscribe(loadData);
    return () => unsub();
  }, [currentUser]);

  const handleToggleFollow = (creatorId: string) => {
    if (!currentUser) return;
    const isNow = dbService.toggleFollow(creatorId, {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
    });
    setFollowedMap((prev) => ({ ...prev, [creatorId]: isNow }));
  };

  const followedCreators = creators.filter((c) => followedMap[c.uid]);
  const displayCreators = activeTab === 'creators' ? followedCreators : creators;
  const followingVideos = videos.filter((v) => followedMap[v.ownerId]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header matching design reference: អ្នកតាមដាន */}
      <div className="flex items-center justify-between border-b border-indigo-950 pb-3">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white">
            អ្នកតាមដាន & ឆានែល
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            ទិន្នន័យមនុស្សពិត ១០០% • ចាប់ផ្ដើមពីចំណុចសូន្យ (០) ឡើងទៅ
          </p>
        </div>
      </div>

      {/* Tabs: កំពុងតាមដាន / តម្រូវអ្នកតាមដាន */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('creators')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'creators'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-[#0F172A] text-neutral-400 hover:text-white border border-indigo-950'
          }`}
        >
          កំពុងតាមដាន ({followedCreators.length})
        </button>
        <button
          onClick={() => setActiveTab('suggested')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'suggested'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-[#0F172A] text-neutral-400 hover:text-white border border-indigo-950'
          }`}
        >
          តម្រូវអ្នកបង្កើត ({creators.length})
        </button>
      </div>

      {/* Creator List matching design reference */}
      {displayCreators.length === 0 ? (
        <div className="text-center py-12 px-6 rounded-2xl bg-[#0F172A]/50 border border-indigo-950 space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-950/60 border border-indigo-900/40 text-indigo-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              អ្នកមិនទាន់បានតាមដាននរណាម្នាក់នៅឡើយទេ (០ នាក់)
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              សូមចុចលើផ្ទាំង "តម្រូវអ្នកបង្កើត" ខាងលើដើម្បីតាមដានអ្នកបង្កើតមាតិកាដែលអ្នកចូលចិត្ត
            </p>
          </div>
          <button
            onClick={() => setActiveTab('suggested')}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
          >
            ស្វែងរកអ្នកបង្កើតមាតិកា
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayCreators.map((c) => {
            const isFollowed = followedMap[c.uid];
            const followerCount = dbService.getFollowersCount(c.uid);
            return (
              <div
                key={c.uid}
                onClick={() => onCreatorClick(c.uid)}
                className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-[#0F172A]/80 hover:bg-indigo-950/40 border border-indigo-950 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={c.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={c.displayName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/40"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white hover:text-indigo-400 transition-colors">
                      {c.displayName}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {followerCount} អ្នកតាមដានពិត
                    </p>
                  </div>
                </div>

                {/* Follow Button matching reference: កំពុងតាមដាន */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFollow(c.uid);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isFollowed
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                  }`}
                >
                  {isFollowed ? 'កំពុងតាមដាន' : 'តាមដាន'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Videos from following channels */}
      <div className="pt-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Film className="w-4 h-4 text-indigo-400" />
          <span>វីដេអូពីអ្នកបង្កើតដែលអ្នកតាមដាន</span>
        </h2>
        {followingVideos.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl bg-[#0F172A]/40 border border-indigo-950">
            <p className="text-xs text-neutral-400">
              {followedCreators.length === 0
                ? 'តាមដានអ្នកបង្កើតមាតិកាដើម្បីមើលវីដេអូថ្មីៗរបស់ពួកគេនៅទីនេះ'
                : 'អ្នកបង្កើតដែលអ្នកតាមដានមិនទាន់បានបង្ហោះវីដេអូនៅឡើយទេ'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {followingVideos.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                onClick={onSelectVideo}
                onCreatorClick={onCreatorClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
