import React from 'react';
import { Home, PlaySquare, Zap, Users, Upload, Folder, Shield, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onOpenUpload }) => {
  const { t } = useLanguage();
  const { isAdmin, currentUser } = useAuth();

  const navItems = [
    { id: 'home', label: 'ទំព័រដើម', icon: Home },
    { id: 'videos', label: 'វីដេអូ', icon: PlaySquare, action: () => onNavigate('home') },
    { id: 'shorts', label: 'Shorts', icon: Zap },
    { id: 'following', label: 'អ្នកតាមដាន', icon: Users },
    { id: 'upload', label: 'បង្ហោះវីដេអូ', icon: Upload, action: onOpenUpload },
    { id: 'channel', label: 'បណ្ណាល័យ', icon: Folder, params: { userId: currentUser?.uid } },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'ផ្ទាំង Admin', icon: Shield });
  }

  return (
    <>
      {/* Desktop Left Sidebar matching design reference */}
      <aside className="hidden md:flex flex-col w-56 lg:w-60 shrink-0 border-r border-indigo-950/60 bg-[#090D16]/90 p-3 justify-between min-h-[calc(100vh-62px)] select-none">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    onNavigate(item.id, item.params);
                  }
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs lg:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-neutral-400 hover:text-white hover:bg-indigo-950/40'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom User Pill */}
        <div className="border-t border-indigo-950/80 pt-3">
          <div
            onClick={() => onNavigate('channel', { userId: currentUser?.uid })}
            className="flex items-center gap-2.5 p-2 rounded-2xl bg-[#0F172A]/80 hover:bg-indigo-950/60 border border-indigo-900/40 cursor-pointer transition-colors"
          >
            <img
              src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentUser?.displayName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.displayName || 'SokhaTraveller'}
              </p>
              <p className="text-[10px] text-indigo-300/70 truncate">
                @{currentUser?.displayName?.toLowerCase().replace(/\s+/g, '_') || 'sokhatraveller'}
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090D16]/95 backdrop-blur-xl border-t border-indigo-950/80 px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center p-1 text-[10px] ${
            currentPage === 'home' ? 'text-indigo-400 font-bold' : 'text-neutral-400'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>ទំព័រដើម</span>
        </button>

        <button
          onClick={() => onNavigate('shorts')}
          className={`flex flex-col items-center p-1 text-[10px] ${
            currentPage === 'shorts' ? 'text-indigo-400 font-bold' : 'text-neutral-400'
          }`}
        >
          <Zap className="w-5 h-5 mb-0.5" />
          <span>Shorts</span>
        </button>

        {/* Center glowing Upload button matching the design reference (+) */}
        <button
          onClick={onOpenUpload}
          className="-mt-5 w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-transform"
        >
          <Upload className="w-5 h-5" />
        </button>

        <button
          onClick={() => onNavigate('following')}
          className={`flex flex-col items-center p-1 text-[10px] ${
            currentPage === 'following' ? 'text-indigo-400 font-bold' : 'text-neutral-400'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>អ្នកតាមដាន</span>
        </button>

        <button
          onClick={() => onNavigate('channel', { userId: currentUser?.uid })}
          className={`flex flex-col items-center p-1 text-[10px] ${
            currentPage === 'channel' ? 'text-indigo-400 font-bold' : 'text-neutral-400'
          }`}
        >
          <Folder className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </button>
      </nav>
    </>
  );
};
