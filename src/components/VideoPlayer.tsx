import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Settings,
  Sparkles,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { formatDuration } from '../utils/formatters';
import { retrieveBlobUrl, resolvePlayableSrc } from '../services/storageAdapter';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  storagePath?: string;
  videoId?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  onGenuineWatch?: () => void;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  storagePath,
  videoId,
  autoPlay = true,
  onEnded,
  onGenuineWatch,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeSrc, setActiveSrc] = useState(src);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showUnmuteNotice, setShowUnmuteNotice] = useState(false);

  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const watchCountedRef = useRef(false);
  const activePlaySecondsRef = useRef(0);

  // Reset genuine watch tracking when video source or id changes
  useEffect(() => {
    watchCountedRef.current = false;
    activePlaySecondsRef.current = 0;
  }, [src, videoId]);

  // Sync activeSrc and resolve IndexedDB fallback if available
  useEffect(() => {
    let isMounted = true;
    setHasError(false);

    const resolveUrl = async () => {
      const resolved = await resolvePlayableSrc(src, storagePath, videoId);
      if (isMounted) {
        setActiveSrc(resolved || src);
      }
    };

    resolveUrl();

    return () => {
      isMounted = false;
    };
  }, [src, storagePath, videoId]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (autoPlay) {
      vid.play()
        .then(() => {
          setIsPlaying(true);
          setShowUnmuteNotice(false);
        })
        .catch(() => {
          // Autoplay policy fallback: mute and play
          vid.muted = true;
          setIsMuted(true);
          vid.play()
            .then(() => {
              setIsPlaying(true);
              setShowUnmuteNotice(true);
            })
            .catch(() => setIsPlaying(false));
        });
    }
  }, [activeSrc, autoPlay]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 2800);
  };

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play();
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    const vid = videoRef.current;
    if (!vid) return;
    vid.volume = newVol;
    setVolume(newVol);
    vid.muted = newVol === 0;
    setIsMuted(newVol === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = time;
    setCurrentTime(time);
  };

  const handleSeekMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clampedPos = Math.max(0, Math.min(1, pos));
    setHoverPosition(e.clientX - rect.left);
    setHoverTime(clampedPos * duration);
    setIsHoveringSeek(true);
  };

  const changeSpeed = (rate: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const handleVideoError = async () => {
    console.warn('Video failed to load from URL:', activeSrc);
    // Multi-key recovery from IndexedDB (by storagePath, videoId, or src)
    const candidates = [storagePath, videoId, src].filter(Boolean) as string[];
    for (const key of candidates) {
      const fallbackBlob = await retrieveBlobUrl(key);
      if (fallbackBlob && fallbackBlob !== activeSrc) {
        console.info('Switching to local IndexedDB blob fallback:', fallbackBlob);
        setActiveSrc(fallbackBlob);
        setHasError(false);
        const vid = videoRef.current;
        if (vid) {
          vid.load();
          vid.play().then(() => setIsPlaying(true)).catch(console.warn);
        }
        return;
      }
    }

    setHasError(true);
    setErrorMessage('មិនអាចចាក់វីដេអូនេះបានទេ។ សូមពិនិត្យមើលទ្រង់ទ្រាយវីដេអូ ឬបង្ហោះវីដេអូម្តងទៀត។');
  };

  const retryPlayback = async () => {
    setHasError(false);
    const resolved = await resolvePlayableSrc(src, storagePath, videoId);
    if (resolved && resolved !== activeSrc) {
      setActiveSrc(resolved);
    }
    const vid = videoRef.current;
    if (vid) {
      vid.load();
      vid.play().then(() => setIsPlaying(true)).catch(console.warn);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative w-full aspect-video bg-neutral-950 rounded-2xl overflow-hidden shadow-2xl select-none group border border-indigo-950/80 ${className}`}
    >
      {/* HTML5 Video element */}
      <video
        ref={videoRef}
        src={activeSrc}
        poster={poster}
        onClick={togglePlay}
        onError={handleVideoError}
        onTimeUpdate={() => {
          const vid = videoRef.current;
          if (!vid) return;
          setCurrentTime(vid.currentTime);

          // Genuine view counting: trigger strictly after 3 seconds of authentic active playback
          if (!watchCountedRef.current && vid.currentTime >= 3) {
            watchCountedRef.current = true;
            onGenuineWatch?.();
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setHasError(false);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          // If video was shorter than 3s, record genuine watch on end
          if (!watchCountedRef.current) {
            watchCountedRef.current = true;
            onGenuineWatch?.();
          }
          onEnded?.();
        }}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* Autoplay Muted Notice (User tap to unmute) */}
      {showUnmuteNotice && isMuted && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
            setShowUnmuteNotice(false);
          }}
          className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-xs font-semibold shadow-lg border border-indigo-500/30 transition-all hover:scale-105"
        >
          <VolumeX className="w-3.5 h-3.5 text-amber-400" />
          <span>ចុចដើម្បីបើកសំឡេង (Tap to unmute)</span>
        </button>
      )}

      {/* Error Overlay with Retry */}
      {hasError && (
        <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center p-6 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-rose-500" />
          <p className="text-sm font-bold text-white max-w-md">{errorMessage}</p>
          <button
            onClick={retryPlayback}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-transform hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            <span>សាកល្បងចាក់ឡើងវិញ (Retry)</span>
          </button>
        </div>
      )}

      {/* Center play icon overlay when paused */}
      {!isPlaying && !hasError && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer transition-opacity"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current translate-x-1" />
          </div>
        </div>
      )}

      {/* Sleek Bottom Control Bar */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-4 py-3 transition-opacity duration-300 z-30 ${
          showControls && !hasError ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber / Progress Bar with Hover Timestamp */}
        <div
          className="relative w-full h-2 mb-3 cursor-pointer flex items-center group/scrubber"
          onMouseMove={handleSeekMouseMove}
          onMouseLeave={() => setIsHoveringSeek(false)}
        >
          {isHoveringSeek && duration > 0 && (
            <div
              className="absolute -top-7 -translate-x-1/2 bg-neutral-900 border border-neutral-700 text-white text-[11px] font-mono px-2 py-0.5 rounded shadow pointer-events-none"
              style={{ left: `${hoverPosition}px` }}
            >
              {formatDuration(hoverTime)}
            </div>
          )}

          <div className="absolute inset-x-0 h-1.5 bg-white/20 rounded-full group-hover/scrubber:h-2 transition-all">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full relative"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-indigo-400 rounded-full shadow scale-0 group-hover/scrubber:scale-100 transition-transform" />
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
          />
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 hover:text-indigo-400 transition-colors focus:outline-none"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime -= 10;
              }}
              className="p-1.5 hover:text-indigo-400 transition-colors hidden sm:inline-block"
              title="Back 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 hover:text-indigo-400 transition-colors focus:outline-none"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 accent-indigo-500 h-1 bg-white/30 rounded-lg cursor-pointer hidden sm:inline-block"
              />
            </div>

            {/* Time Indicator */}
            <div className="font-mono text-[11px] text-neutral-300 ml-1">
              <span>{formatDuration(currentTime)}</span>
              <span className="mx-1 text-neutral-500">/</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-xs font-semibold text-neutral-200 transition-colors"
                title="Playback Speed"
              >
                <Settings className="w-3.5 h-3.5 text-neutral-400" />
                <span>{playbackRate}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute right-0 bottom-full mb-2 bg-[#0F172A] border border-indigo-950 rounded-xl shadow-2xl p-1.5 w-28 z-40">
                  <p className="text-[10px] text-neutral-400 uppercase font-bold px-2 py-1 border-b border-indigo-950 mb-1">
                    Speed
                  </p>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changeSpeed(rate)}
                      className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                        playbackRate === rate ? 'bg-indigo-600/30 text-indigo-400 font-bold' : 'hover:bg-indigo-950 text-neutral-300'
                      }`}
                    >
                      {rate === 1 ? '1x (Normal)' : `${rate}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-indigo-300">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>HD 1080p</span>
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:text-indigo-400 transition-colors focus:outline-none"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
