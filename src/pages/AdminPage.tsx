import React, { useState, useEffect } from 'react';
import {
  Shield,
  Film,
  Users,
  Eye,
  Trash2,
  Edit2,
  CheckCircle,
  Database,
  Cloud
} from 'lucide-react';
import { Video, Report } from '../types';
import { dbService } from '../services/database';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatViews, formatTimeAgo } from '../utils/formatters';

export const AdminPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { lang } = useLanguage();

  const [videos, setVideos] = useState<Video[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalFollows, setTotalFollows] = useState(0);

  const loadData = () => {
    if (!isAdmin) return;
    setVideos(dbService.getVideos({ includePrivate: true, isAdmin: true }));
    setReports(dbService.getReports());
    setTotalUsers(dbService.getUsers().length);
    setTotalFollows(dbService.getAllFollowsCount());
  };

  useEffect(() => {
    loadData();
    const unsub = dbService.subscribe(loadData);
    return () => unsub();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[#0F172A] border border-rose-500/30 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white">
          អ្នកមិនមានសិទ្ធិចូលមើលផ្ទាំងនេះទេ (សម្រាប់តែ Administrator)
        </h2>
        <p className="text-xs text-neutral-400">
          This restricted administrative area is accessible exclusively to verified platform administrators.
        </p>
      </div>
    );
  }

  const handleDeleteVideo = (videoId: string) => {
    if (confirm('តើអ្នកប្រាកដជាចង់លុបវីដេអូនេះមែនទេ?')) {
      if (currentUser) {
        dbService.deleteVideo(videoId, currentUser.uid, true);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header matching design reference: ផ្ទាំងគ្រប់គ្រង (Admin) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-950 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            ផ្ទាំងគ្រប់គ្រង (Admin)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            គណនីគ្រប់គ្រង: <span className="font-mono text-indigo-400">{currentUser?.email}</span>
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('តើអ្នកចង់សម្អាត និងលុបទិន្នន័យវីដេអូទាំងអស់ចេញពីប្រព័ន្ធមែនទេ?')) {
              dbService.clearAllVideos();
            }
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border border-neutral-800 transition-colors"
        >
          សម្អាតវីដេអូទាំងអស់ (Clear All)
        </button>
      </div>

      {/* 4 Stat KPI Cards matching the screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A]/80 border border-indigo-950 text-center space-y-1">
          <p className="text-xs font-semibold text-neutral-400">វីដេអូពិតសរុប</p>
          <p className="text-2xl sm:text-3xl font-black text-white">{videos.length}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A]/80 border border-indigo-950 text-center space-y-1">
          <p className="text-xs font-semibold text-neutral-400">គណនីអ្នកបង្កើត</p>
          <p className="text-2xl sm:text-3xl font-black text-white">{totalUsers}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A]/80 border border-indigo-950 text-center space-y-1">
          <p className="text-xs font-semibold text-neutral-400">អ្នកតាមដានពិតសរុប</p>
          <p className="text-2xl sm:text-3xl font-black text-white">{totalFollows}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A]/80 border border-indigo-950 text-center space-y-1">
          <p className="text-xs font-semibold text-neutral-400">បណ្ដឹងរាយការណ៍</p>
          <p className="text-2xl sm:text-3xl font-black text-white">{reports.length}</p>
        </div>
      </div>

      {/* Video Moderation Table matching screenshot */}
      <div className="bg-[#0F172A]/80 border border-indigo-950 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090D16] text-neutral-400 border-b border-indigo-950 font-bold">
              <tr>
                <th className="p-4">វីដេអូ</th>
                <th className="p-4">អ្នកបង្កើត</th>
                <th className="p-4">ស្ថានភាព</th>
                <th className="p-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-950/60 text-neutral-300">
              {videos.map((vid) => (
                <tr key={vid.id} className="hover:bg-indigo-950/20 transition-colors">
                  <td className="p-4 flex items-center gap-3 min-w-[240px]">
                    <img
                      src={vid.thumbnailUrl}
                      alt=""
                      className="w-16 aspect-video object-cover rounded-lg bg-neutral-900 border border-indigo-950 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-white line-clamp-1">{vid.title}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {formatViews(vid.viewCount, lang)} {lang === 'km' ? 'ចំនួនមើល' : 'views'} • {formatTimeAgo(vid.createdAt, lang)}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap font-medium text-neutral-200">
                    {vid.ownerName}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                      សកម្ម
                    </span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => alert(`Reviewing video: ${vid.title}`)}
                      className="p-1.5 rounded-lg bg-[#090D16] hover:bg-indigo-950 text-neutral-300 hover:text-white"
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => alert(`Editing video: ${vid.title}`)}
                      className="p-1.5 rounded-lg bg-[#090D16] hover:bg-indigo-950 text-neutral-300 hover:text-amber-400"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(vid.id)}
                      className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backend & Firebase Status note */}
      <div className="p-5 rounded-2xl bg-[#0F172A]/40 border border-indigo-950 space-y-2 text-xs text-neutral-300">
        <h3 className="font-bold text-indigo-300 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>ការភ្ជាប់ Backend & សេវាផ្ទុកវីដេអូ</span>
        </h3>
        <p className="text-neutral-400 leading-relaxed">
          ប្រព័ន្ធកំពុងដំណើរការលើ Node.js Express Backend ជាមួយ Multer Video Object Storage និង HTTP 206 Streaming។ កូដ Firestore Blueprint (<code>firebase-blueprint.json</code>) និង Security Rules (<code>firestore.rules</code>) ត្រូវបានរៀបចំស្រេចរួចរាល់សម្រាប់ការភ្ជាប់ Cloud Firebase ផ្ទាល់។
        </p>
      </div>
    </div>
  );
};
