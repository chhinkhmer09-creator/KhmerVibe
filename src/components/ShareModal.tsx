import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, MessageCircle } from 'lucide-react';
import { Video } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ShareModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ video, isOpen, onClose }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !video) return null;

  const shareUrl = `${window.location.origin}/?v=${video.id}`;
  const shareTitle = `${video.title} - KhmerVibe`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: video.description || shareTitle,
          url: shareUrl,
        });
        onClose();
      } catch (err) {
        console.warn('Share cancelled or failed', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-500" />
            <span>{t('feed.share')}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video preview mini banner */}
        <div className="flex items-center gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-16 aspect-video object-cover rounded-lg"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-neutral-200 line-clamp-1">{video.title}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">@{video.ownerName}</p>
          </div>
        </div>

        {/* Native Web Share button if available */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white font-semibold text-xs shadow-md transition-all hover:scale-[1.01] active:scale-95"
          >
            Share via System Apps (Facebook, Telegram, etc.)
          </button>
        )}

        {/* Social Quick Links */}
        <div className="grid grid-cols-3 gap-2.5">
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors"
          >
            <Send className="w-5 h-5 text-sky-400" />
            <span className="text-[11px] font-medium">Telegram</span>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors"
          >
            <Share2 className="w-5 h-5 text-blue-500" />
            <span className="text-[11px] font-medium">Facebook</span>
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-[11px] font-medium">WhatsApp</span>
          </a>
        </div>

        {/* Copy Link Input Bar */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
            {t('common.copy_link')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
