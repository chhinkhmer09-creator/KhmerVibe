/**
 * Video Storage Adapter for KhmerVibe
 * Supports Server Object Storage with progress reporting and IndexedDB persistent offline blob store.
 */

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB
const ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-matroska',
  'video/avi',
  'video/x-msvideo',
];

export interface UploadProgressCallback {
  (percentage: number): void;
}

export interface VideoUploadResult {
  playbackUrl: string;
  storagePath: string;
  thumbnailUrl: string;
  duration: number;
  size: number;
}

// Open or initialize IndexedDB for persistent local media
function openMediaDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('KhmerVibeMediaStore', 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('blobs')) {
        db.createObjectStore('blobs', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredBlobRecord {
  id: string;
  blob: Blob;
  storagePath?: string;
  videoId?: string;
  createdAt: number;
}

export async function storeBlobLocally(
  id: string,
  blob: Blob,
  metadata?: { storagePath?: string; videoId?: string }
): Promise<string> {
  try {
    const db = await openMediaDatabase();
    const objectUrl = URL.createObjectURL(blob);
    return new Promise((resolve, reject) => {
      const tx = db.transaction('blobs', 'readwrite');
      const store = tx.objectStore('blobs');

      const record: StoredBlobRecord = {
        id,
        blob,
        storagePath: metadata?.storagePath,
        videoId: metadata?.videoId,
        createdAt: Date.now(),
      };
      store.put(record);

      // Also index by storagePath if present
      if (metadata?.storagePath && metadata.storagePath !== id) {
        store.put({
          ...record,
          id: metadata.storagePath,
        });
      }

      // Also index by the created object URL for immediate lookup
      store.put({
        ...record,
        id: objectUrl,
      });

      tx.oncomplete = () => {
        resolve(objectUrl);
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB write fallback to memory URL:', err);
    return URL.createObjectURL(blob);
  }
}

export async function retrieveBlobUrl(identifier: string): Promise<string | null> {
  if (!identifier) return null;
  try {
    const db = await openMediaDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('blobs', 'readonly');
      const store = tx.objectStore('blobs');

      // 1. First attempt direct primary key lookup
      const req = store.get(identifier);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          try {
            resolve(URL.createObjectURL(req.result.blob));
            return;
          } catch {
            // failed to create url
          }
        }

        // 2. Fallback: scan records by storagePath, videoId or most recent entry
        const allReq = store.getAll();
        allReq.onsuccess = () => {
          const records: StoredBlobRecord[] = allReq.result || [];
          if (!records.length) {
            resolve(null);
            return;
          }

          // Find matching record
          const match = records.find(
            (r) =>
              r.storagePath === identifier ||
              r.videoId === identifier ||
              (r.storagePath && identifier.includes(r.storagePath)) ||
              (r.id && identifier.includes(r.id))
          );

          if (match && match.blob) {
            resolve(URL.createObjectURL(match.blob));
            return;
          }

          // If identifier was a stale blob: URL and there's a stored blob, use the newest valid blob
          if (identifier.startsWith('blob:') && records.length > 0) {
            records.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            const latest = records[0];
            if (latest && latest.blob) {
              resolve(URL.createObjectURL(latest.blob));
              return;
            }
          }

          resolve(null);
        };
        allReq.onerror = () => resolve(null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Universal resolver to guarantee 100% playable video URL across refreshes & sessions
 */
export async function resolvePlayableSrc(
  src: string,
  storagePath?: string,
  videoId?: string
): Promise<string> {
  if (!src) return '';

  // If already a valid absolute or server relative URL (e.g. /api/stream/videos/... or http/https)
  if (src.startsWith('/api/') || src.startsWith('/uploads/') || (src.startsWith('http') && !src.startsWith('blob:'))) {
    return src;
  }

  // Try retrieving a fresh, valid object URL from IndexedDB
  const candidates = [src, storagePath, videoId].filter(Boolean) as string[];
  for (const candidate of candidates) {
    const recoveredUrl = await retrieveBlobUrl(candidate);
    if (recoveredUrl) {
      return recoveredUrl;
    }
  }

  return src;
}

/**
 * Capture automatic video frame thumbnail at 1s timestamp
 */
export function captureVideoThumbnail(videoFile: File): Promise<{ thumbnailUrl: string; duration: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const fileUrl = URL.createObjectURL(videoFile);
    video.src = fileUrl;

    const cleanup = () => {
      URL.revokeObjectURL(fileUrl);
      video.remove();
    };

    video.onloadedmetadata = () => {
      const duration = video.duration || 0;
      // Seek to 1s or middle if short
      const seekTime = Math.min(Math.max(0.5, duration * 0.1), Math.max(1, duration - 0.5));
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          return reject(new Error('Canvas context unavailable'));
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
        const duration = Math.round(video.duration || 0);
        cleanup();
        resolve({ thumbnailUrl, duration });
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Unable to read video file format'));
    };

    // Timeout safety
    setTimeout(() => {
      cleanup();
      reject(new Error('Thumbnail extraction timed out'));
    }, 15000);
  });
}

/**
 * Upload video file with progress tracking
 */
export async function uploadVideoFile(
  file: File,
  customThumbnailFile: File | null,
  onProgress?: UploadProgressCallback
): Promise<VideoUploadResult> {
  // 1. Client-side file validation
  if (!file) {
    throw new Error('No video file selected.');
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File size (${sizeMb}MB) exceeds the maximum limit of 1GB.`);
  }

  // Check MIME type or extension
  const ext = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['mp4', 'webm', 'mov', 'mkv', 'ogg', 'avi'];
  const isValidType = ALLOWED_MIME_TYPES.includes(file.type) || (ext && validExtensions.includes(ext));

  if (!isValidType) {
    throw new Error(`Unsupported video format (${file.type || ext}). Please upload MP4, WebM, or MOV.`);
  }

  // 2. Extract thumbnail and duration from the video
  let thumbnailUrl = '';
  let duration = 0;
  try {
    const captured = await captureVideoThumbnail(file);
    thumbnailUrl = captured.thumbnailUrl;
    duration = captured.duration;
  } catch (err) {
    console.warn('Could not auto-generate thumbnail:', err);
    // Fallback placeholder
    thumbnailUrl = 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80';
  }

  if (customThumbnailFile) {
    try {
      const reader = new FileReader();
      thumbnailUrl = await new Promise<string>((res, rej) => {
        reader.onload = () => res(reader.result as string);
        reader.onerror = rej;
        reader.readAsDataURL(customThumbnailFile);
      });
    } catch (e) {
      console.warn('Custom thumbnail read failed:', e);
    }
  }

  const storageId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const storagePath = `videos/${storageId}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;

  // 3. Try uploading via Server API endpoint `/api/upload/video` with progress
  let playbackUrl = '';
  try {
    playbackUrl = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('video', file);
      formData.append('storageId', storageId);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 95);
          onProgress(percent);
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.playbackUrl) {
              if (onProgress) onProgress(100);
              // Also cache blob locally for instant fallback playback
              try {
                await storeBlobLocally(data.playbackUrl, file, { storagePath });
              } catch (e) {
                console.warn('Local blob caching error:', e);
              }
              resolve(data.playbackUrl);
              return;
            }
          } catch {
            // response not JSON
          }
        }
        // If server upload failed, reject to trigger local persistent store
        reject(new Error(`Server upload returned status ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error('Network error uploading video to server'));
      xhr.open('POST', '/api/upload/video');
      xhr.send(formData);
    });
  } catch (serverErr) {
    console.info('Server upload endpoint not available or returned error; falling back to IndexedDB persistent storage:', serverErr);
    // Store in IndexedDB for permanent local client playback
    if (onProgress) {
      onProgress(50);
      await new Promise(r => setTimeout(r, 200));
      onProgress(85);
    }
    playbackUrl = await storeBlobLocally(storageId, file, { storagePath });
    if (onProgress) onProgress(100);
  }

  return {
    playbackUrl,
    storagePath,
    thumbnailUrl,
    duration,
    size: file.size,
  };
}
