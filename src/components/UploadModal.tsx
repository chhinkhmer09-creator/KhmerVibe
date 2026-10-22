import React, { useState, useRef } from 'react';
import {
  Upload as UploadIcon,
  X,
  Play,
  CloudUpload,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Film,
  Clock
} from 'lucide-react';
import { VideoType, VideoVisibility } from '../types';
import { CATEGORIES } from '../data/categories';
import { uploadVideoFile, captureVideoThumbnail } from '../services/storageAdapter';
import { dbService } from '../services/database';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDuration } from '../utils/formatters';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (videoId: string, type: VideoType) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const { currentUser } = useAuth();
  const { lang } = useLanguage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(0);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('entertainment');
  const [videoType, setVideoType] = useState<VideoType>('long');
  const [visibility, setVisibility] = useState<VideoVisibility>('public');

  // Status & Progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(65);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const MAX_DURATION_SECONDS = 600; // 10 minutes (10 នាទី)
  const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB

  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);

    // 1GB limit check
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`ទំហំឯកសារធំពេក (${(file.size / (1024 * 1024)).toFixed(1)}MB)។ ទំហំអនុញ្ញាតអតិបរមា 1GB។`);
      return;
    }

    setSelectedFile(file);

    if (!title) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(baseName);
    }

    try {
      const { thumbnailUrl, duration } = await captureVideoThumbnail(file);
      setThumbnailPreview(thumbnailUrl);
      setVideoDuration(duration);

      // Check 10-minute duration limit
      if (duration > MAX_DURATION_SECONDS) {
        setErrorMessage(`វីដេអូមានរយៈពេល ${Math.floor(duration / 60)} នាទី ដែលលើសពីកម្រិតកំណត់ 10 នាទី (រហូតដល់ 10 នាទី / 600 វិនាទី)។ សូមជ្រើសរើសវីដេអូត្រឹម 10 នាទី។`);
      }

      const videoTest = document.createElement('video');
      videoTest.src = URL.createObjectURL(file);
      videoTest.onloadedmetadata = () => {
        if (videoTest.videoHeight > videoTest.videoWidth) {
          setVideoType('short');
        } else {
          setVideoType('long');
        }
        URL.revokeObjectURL(videoTest.src);
      };
    } catch (e) {
      console.warn('Auto thumbnail generation warning:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('សូមជ្រើសរើសឯកសារវីដេអូ។');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('សូមបញ្ចូលចំណងជើងវីដេអូ។');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setErrorMessage(null);

    try {
      const uploadResult = await uploadVideoFile(selectedFile, null, (percent) => {
        setUploadProgress(percent);
      });

      const created = dbService.createVideo({
        ownerId: currentUser?.uid || 'user_guest',
        ownerName: currentUser?.displayName || 'KhmerVibe Creator',
        ownerPhotoURL: currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        title: title.trim(),
        description: description.trim(),
        thumbnailUrl: uploadResult.thumbnailUrl || thumbnailPreview || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
        storagePath: uploadResult.storagePath,
        playbackUrl: uploadResult.playbackUrl,
        type: videoType,
        category,
        visibility,
        duration: uploadResult.duration || videoDuration || 60,
      });

      setIsSuccess(true);
      setUploadProgress(100);

      setTimeout(() => {
        onUploadSuccess(created.id, videoType);
        handleClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'ការបង្ហោះវីដេអូបរាជ័យ សូមព្យាយាមម្តងទៀត។');
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setThumbnailPreview('');
    setTitle('');
    setDescription('');
    setIsUploading(false);
    setUploadProgress(0);
    setErrorMessage(null);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#090D16] border border-indigo-950 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header matching design reference: បង្ហោះវីដេអូ */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-950 bg-[#0F172A]/70">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-white">
              បង្ហោះវីដេអូ
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>ការបង្ហោះបានជោគជ័យ! កំពុងបើកវីដេអូ...</span>
            </div>
          )}

          {/* Drag & Drop Box matching design reference */}
          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="border-2 border-dashed border-indigo-900 hover:border-indigo-500/80 rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-indigo-950/20 group"
            >
              <div className="w-14 h-14 rounded-full bg-indigo-950/80 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-950/50">
                <CloudUpload className="w-7 h-7" />
              </div>
              <p className="text-sm sm:text-base font-bold text-white">
                ចុចដើម្បីជ្រើសរើសវីដេអូ<br />
                <span className="text-xs font-normal text-neutral-400">ឬអូសទម្លាក់ទីនេះ</span>
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 mb-2">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>អាចបញ្ចូលវីដេអូរហូតដល់ 10 នាទី (Max 10 Mins)</span>
              </div>
              <p className="text-[11px] text-indigo-300/70 mt-1">
                MP4, MOV, AVI, MKV, WebM (អតិបរមា 1GB • រយៈពេលរហូតដល់ 10 នាទី)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/avi"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Thumbnail Preview with Play Icon & Progress Bar */}
              <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-indigo-950 flex items-center gap-4">
                <div className="relative aspect-video w-32 rounded-xl overflow-hidden bg-neutral-900 border border-indigo-900/60 shrink-0">
                  <img
                    src={thumbnailPreview || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-current" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Preview</span>
                    <span className="text-indigo-400 font-bold font-mono">ការបង្ហោះ {uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span>{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB / 1 GB</span>
                    <span className="flex items-center gap-1 font-mono text-indigo-300 font-bold">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      {formatDuration(videoDuration)} / 10:00 នាទី
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    ចំណងជើង*
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ឧ. រឿងភាគខ្មែរ..."
                    className="w-full bg-[#0F172A] border border-indigo-950 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    ការពិពណ៌នា
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="ពណ៌នាអំពីវីដេអូរបស់អ្នក..."
                    className="w-full bg-[#0F172A] border border-indigo-950 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      ប្រភេទ
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#0F172A] border border-indigo-950 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nameKm}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      ភាពជាក់លាក់
                    </label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as VideoVisibility)}
                      className="w-full bg-[#0F172A] border border-indigo-950 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="public">សាធារណៈ</option>
                      <option value="unlisted">មិនចុះបញ្ជី</option>
                      <option value="private">ឯកជន</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        កំពុងបង្ហោះ ({uploadProgress}%)...
                      </span>
                    ) : (
                      'បង្ហោះវីដេអូ'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
