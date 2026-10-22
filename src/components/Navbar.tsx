import React, { useState } from 'react';
import { Search, Bell, Shield, User as UserIcon, LogOut, ChevronDown, Check, LogIn } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  onSearch: (query: string) => void;
  onOpenUpload: () => void;
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch, onOpenUpload, onNavigate, currentPage }) => {
  const { currentUser, isAdmin, switchAccount, signOut } = useAuth();
  const { lang, setLang } = useLanguage();
  const [searchInput, setSearchInput] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070A12]/95 backdrop-blur-md border-b border-indigo-950/80 px-4 lg:px-6 py-2.5">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3 md:gap-6">
        {/* Left: Brand Logo */}
        <div
          className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 shrink-0"
          onClick={() => onNavigate('home')}
        >
          <Logo size="md" />
        </div>

        {/* Center: Search Bar matching design reference */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-xl mx-auto relative hidden sm:flex items-center"
        >
          <div className="relative w-full">
            <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (e.target.value === '') onSearch('');
              }}
              placeholder="ស្វែងរកវីដេអូ..."
              className="w-full bg-[#0F172A] border border-indigo-950 focus:border-indigo-500 rounded-full py-2 pl-10 pr-10 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none transition-all shadow-inner"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  onSearch('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full bg-[#0F172A] hover:bg-indigo-950 border border-indigo-950 text-neutral-300 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-[#070A12]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0F172A] border border-indigo-900/60 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs space-y-2">
                <p className="font-bold text-white border-b border-indigo-950 pb-2">ការជូនដំណឹង (Notifications)</p>
                <div className="p-2 rounded-xl bg-indigo-950/40 text-neutral-300">
                  <p className="font-semibold text-indigo-300">SokhaTraveller បានបង្ហោះវីដេអូថ្មី</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">មុននេះ 2 ម៉ោង</p>
                </div>
                <div className="p-2 rounded-xl bg-indigo-950/40 text-neutral-300">
                  <p className="font-semibold text-indigo-300">វីដេអូរបស់អ្នកទទួលបាន 1K Likes!</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">មុននេះ 1 ថ្ងៃ</p>
                </div>
              </div>
            )}
          </div>

          {/* User Account / Login Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-1.5 sm:pl-2 rounded-full bg-[#0F172A] hover:bg-indigo-950 border border-indigo-950 transition-colors"
              >
                <img
                  src={currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser.displayName}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/40"
                />
                <span className="hidden sm:inline text-xs font-semibold text-neutral-200">
                  {currentUser.displayName}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400 mr-1" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0F172A] border border-indigo-900/60 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2.5 border-b border-indigo-950 mb-2">
                    <p className="text-sm font-semibold text-white truncate">{currentUser.displayName}</p>
                    <p className="text-xs text-neutral-400 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {currentUser.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('channel', { userId: currentUser.uid });
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-indigo-950 rounded-lg text-left"
                  >
                    <UserIcon className="w-4 h-4 text-indigo-400" />
                    <span>ព័ត៌មានផ្ទាល់ខ្លួន (Profile)</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg text-left"
                    >
                      <Shield className="w-4 h-4" />
                      <span>ផ្ទាំងគ្រប់គ្រង (Admin)</span>
                    </button>
                  )}

                  {/* Account Switcher for Testing */}
                  <div className="border-t border-indigo-950 my-2 pt-2 px-3">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      ផ្លាស់ប្តូរគណនីសាកល្បង
                    </p>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          switchAccount('admin');
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs ${
                          currentUser.role === 'admin' ? 'bg-indigo-950 text-indigo-300 font-bold' : 'text-neutral-400 hover:bg-indigo-950/60'
                        }`}
                      >
                        <span>Admin (chhnchhin94)</span>
                        {currentUser.role === 'admin' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                      </button>
                      <button
                        onClick={() => {
                          switchAccount('creator');
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs ${
                          currentUser.role === 'creator' ? 'bg-indigo-950 text-indigo-300 font-bold' : 'text-neutral-400 hover:bg-indigo-950/60'
                        }`}
                      >
                        <span>Creator (Sovann Vibe)</span>
                        {currentUser.role === 'creator' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                      <button
                        onClick={() => {
                          switchAccount('user');
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs ${
                          currentUser.role === 'user' ? 'bg-indigo-950 text-indigo-300 font-bold' : 'text-neutral-400 hover:bg-indigo-950/60'
                        }`}
                      >
                        <span>User (Bopha Rath)</span>
                        {currentUser.role === 'user' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-indigo-950 pt-1">
                    <button
                      onClick={() => {
                        signOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-400 hover:text-rose-400 hover:bg-indigo-950 rounded-lg text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>ចាកចេញ (Sign Out)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>ចូលគណនី</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
