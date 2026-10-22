/**
 * KhmerVibe - Full-Stack Video Sharing Platform
 * Long-form YouTube browsing + Vertical TikTok-style Shorts
 */
import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { VideoWatchPage } from './pages/VideoWatchPage';
import { ShortsPage } from './pages/ShortsPage';
import { ChannelPage } from './pages/ChannelPage';
import { FollowingPage } from './pages/FollowingPage';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';
import { PolicyPage } from './pages/PolicyPage';
import { UploadModal } from './components/UploadModal';
import { ShareModal } from './components/ShareModal';
import { ReportModal } from './components/ReportModal';
import { Video } from './types';

function MainApp() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [sharingVideo, setSharingVideo] = useState<Video | null>(null);
  const [reportingVideo, setReportingVideo] = useState<Video | null>(null);

  // Parse URL parameters on initial load (e.g. ?v=vid_angkor_sunrise or ?page=shorts)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('v');
    const page = params.get('page');

    if (videoId) {
      setCurrentPage('watch');
      setPageParams({ videoId });
    } else if (page) {
      setCurrentPage(page);
    }
  }, []);

  const navigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update browser URL quietly without full reload
    const url = new URL(window.location.href);
    url.searchParams.delete('v');
    url.searchParams.delete('page');

    if (page === 'watch' && params?.videoId) {
      url.searchParams.set('v', params.videoId);
    } else if (page !== 'home') {
      url.searchParams.set('page', page);
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleSelectVideo = (video: Video) => {
    if (video.type === 'short') {
      navigate('shorts', { initialVideoId: video.id });
    } else {
      navigate('watch', { videoId: video.id });
    }
  };

  const handleUploadSuccess = (videoId: string, type: 'long' | 'short') => {
    if (type === 'short') {
      navigate('shorts', { initialVideoId: videoId });
    } else {
      navigate('watch', { videoId });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Fixed Navbar */}
      <Navbar
        onSearch={(q) => {
          setSearchQuery(q);
          if (currentPage !== 'home') {
            navigate('home');
          }
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        onNavigate={navigate}
        currentPage={currentPage}
      />

      {/* Main Content Layout with Responsive Sidebar */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto">
        {/* Sidebar (Desktop left rail + mobile bottom bar) */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={navigate}
          onOpenUpload={() => setIsUploadOpen(true)}
        />

        {/* Dynamic Page Container */}
        <main
          className={`flex-1 transition-all overflow-y-auto ${
            currentPage === 'shorts' ? 'p-0 overflow-hidden' : 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full'
          }`}
        >
          {currentPage === 'home' && (
            <HomePage
              searchQuery={searchQuery}
              onSelectVideo={handleSelectVideo}
              onOpenShorts={(id) => navigate('shorts', { initialVideoId: id })}
              onCreatorClick={(uid) => navigate('channel', { userId: uid })}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          )}

          {currentPage === 'watch' && (
            <VideoWatchPage
              videoId={pageParams.videoId}
              onSelectVideo={handleSelectVideo}
              onCreatorClick={(uid) => navigate('channel', { userId: uid })}
              onOpenShare={(video) => setSharingVideo(video)}
              onOpenReport={(video) => setReportingVideo(video)}
            />
          )}

          {currentPage === 'shorts' && (
            <ShortsPage
              initialVideoId={pageParams.initialVideoId}
              onCreatorClick={(uid) => navigate('channel', { userId: uid })}
              onOpenShare={(video) => setSharingVideo(video)}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          )}

          {currentPage === 'channel' && (
            <ChannelPage
              userId={pageParams.userId}
              onSelectVideo={handleSelectVideo}
              onOpenShorts={(id) => navigate('shorts', { initialVideoId: id })}
            />
          )}

          {currentPage === 'following' && (
            <FollowingPage
              onSelectVideo={handleSelectVideo}
              onCreatorClick={(uid) => navigate('channel', { userId: uid })}
              onExplore={() => navigate('home')}
            />
          )}

          {currentPage === 'admin' && <AdminPage />}

          {currentPage === 'auth' && (
            <AuthPage onSuccess={() => navigate('home')} />
          )}

          {currentPage === 'policy' && (
            <PolicyPage initialTab={pageParams.tab || 'terms'} />
          )}
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Social Share Modal */}
      <ShareModal
        video={sharingVideo}
        isOpen={Boolean(sharingVideo)}
        onClose={() => setSharingVideo(null)}
      />

      {/* Report Modal */}
      <ReportModal
        video={reportingVideo}
        isOpen={Boolean(reportingVideo)}
        onClose={() => setReportingVideo(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
