import React, { useState } from 'react';
import { Flag, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { Video } from '../types';
import { dbService } from '../services/database';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface ReportModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ video, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { lang, t } = useLanguage();

  const [selectedReason, setSelectedReason] = useState('Inappropriate Content');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !video) return null;

  const reasons = [
    { id: 'inappropriate', km: 'ខ្លឹមសារមិនសមរម្យ ឬអាសអាភាស', en: 'Inappropriate or sexual content' },
    { id: 'harassment', km: 'ការគំរាមកំហែង ឬបៀតបៀន', en: 'Harassment or cyberbullying' },
    { id: 'spam', km: 'ស្ពែម ឬខ្លឹមសារបោកប្រាស់', en: 'Spam, scams or misleading' },
    { id: 'copyright', km: 'ការរំលោភកម្មសិទ្ធិបញ្ញា ឬចម្លងស្នាដៃ', en: 'Copyright or intellectual property infringement' },
    { id: 'violence', km: 'អំពើហិង្សា ឬគ្រោះថ្នាក់', en: 'Violent or dangerous acts' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const fullReason = `${selectedReason}${details.trim() ? ` - Details: ${details.trim()}` : ''}`;

    dbService.createReport({
      reporterId: currentUser.uid,
      reporterName: currentUser.displayName,
      videoId: video.id,
      videoTitle: video.title,
      reason: fullReason,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setDetails('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            <Flag className="w-4 h-4 text-rose-500" />
            <span>{t('feed.report')}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-sm font-bold text-neutral-100">{t('common.report_success')}</p>
            <p className="text-xs text-neutral-400">Our moderation team will review this video.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-neutral-300">
              {lang === 'km' ? 'សូមជ្រើសរើសមូលហេតុដែលអ្នករាយការណ៍វីដេអូនេះ៖' : 'Why are you reporting this video?'}
            </p>

            <div className="space-y-2">
              {reasons.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === (lang === 'km' ? r.km : r.en)
                      ? 'bg-rose-500/10 border-rose-500/50 text-rose-300 font-semibold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-800/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={lang === 'km' ? r.km : r.en}
                    checked={selectedReason === (lang === 'km' ? r.km : r.en)}
                    onChange={() => setSelectedReason(lang === 'km' ? r.km : r.en)}
                    className="accent-rose-500"
                  />
                  <span>{lang === 'km' ? r.km : r.en}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                {lang === 'km' ? 'ព័ត៌មានបន្ថែម (ជម្រើស)' : 'Additional details (optional)'}
              </label>
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={lang === 'km' ? 'បញ្ជាក់ព័ត៌មានលម្អិតបន្ថែម...' : 'Provide more context...'}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                {t('common.close')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md"
              >
                {t('common.report_submit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
