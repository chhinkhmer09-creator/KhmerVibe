import { Video, Comment, LikeRecord, FollowRecord, Report, User } from '../types';

const STORAGE_KEYS = {
  VIDEOS: 'khmervibe_db_videos_real_v1',
  COMMENTS: 'khmervibe_db_comments_real_v1',
  LIKES: 'khmervibe_db_likes_real_v1',
  FOLLOWS: 'khmervibe_db_follows_real_v2',
  REPORTS: 'khmervibe_db_reports_real_v1',
  USERS: 'khmervibe_db_users_real_v2',
  GENUINE_VIEWS: 'khmervibe_db_views_genuine_v1',
};

// Seed creators for social following - all start strictly at zero (0) followers
export const SEED_CREATORS: User[] = [
  {
    uid: 'creator_sokha',
    displayName: 'SokhaTraveller',
    email: 'sokha@khmervibe.kh',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    bio: 'អ្នកចូលចិត្តដំណើរកម្សាន្ត និងវប្បធម៌ខ្មែរ 🇰🇭 Travel, culture and daily vlogs in Cambodia.',
    role: 'creator',
    subscribersCount: 0,
    createdAt: '2025-01-10T00:00:00.000Z',
  },
  {
    uid: 'creator_dara',
    displayName: 'Dara Official',
    email: 'dara@khmervibe.kh',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    bio: 'ផលិតករភាពយន្ត និងរឿងភាគខ្លីខ្មែរ 🎬',
    role: 'creator',
    subscribersCount: 0,
    createdAt: '2025-01-15T00:00:00.000Z',
  },
  {
    uid: 'creator_kong',
    displayName: 'Kong Vlogger',
    email: 'kong@khmervibe.kh',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    bio: 'វីដេអូប្លែកៗ ម្ហូបអាហារ និងកំប្លែង 🍜',
    role: 'creator',
    subscribersCount: 0,
    createdAt: '2025-02-01T00:00:00.000Z',
  },
  {
    uid: 'creator_chhay',
    displayName: 'Chhay Movie',
    email: 'chhay@khmervibe.kh',
    photoURL: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    bio: 'សង្ខេបរឿងភាគ និងភាពយន្តល្បីៗ 🍿',
    role: 'creator',
    subscribersCount: 0,
    createdAt: '2025-02-12T00:00:00.000Z',
  },
  {
    uid: 'creator_phalla',
    displayName: 'Phalla Music',
    email: 'phalla@khmervibe.kh',
    photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    bio: 'ចម្រៀងបុរាណ និងសម័យខ្មែរ 🎵',
    role: 'creator',
    subscribersCount: 0,
    createdAt: '2025-02-20T00:00:00.000Z',
  },
];

// No fake sample videos: 100% genuine real videos uploaded by creators
const INITIAL_VIDEOS: Video[] = [];

class DatabaseService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    // Purge old mock sample video and follow keys if present
    [
      'khmervibe_db_videos',
      'khmervibe_db_videos_v2',
      'khmervibe_db_videos_v3',
      'khmervibe_db_follows_real_v1',
      'khmervibe_db_users_real_v1',
    ].forEach((oldKey) => {
      localStorage.removeItem(oldKey);
    });

    if (!localStorage.getItem(STORAGE_KEYS.VIDEOS)) {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(INITIAL_VIDEOS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LIKES)) {
      localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify([]));
    }
    // Genuine followers start strictly from point 0
    if (!localStorage.getItem(STORAGE_KEYS.FOLLOWS)) {
      localStorage.setItem(STORAGE_KEYS.FOLLOWS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_CREATORS));
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // Clear all videos (Admin or User action)
  public clearAllVideos() {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify([]));
    this.notify();
  }

  // --- VIDEOS ---
  public getVideos(options?: {
    type?: 'long' | 'short';
    category?: string;
    search?: string;
    ownerId?: string;
    includePrivate?: boolean;
    viewerId?: string;
    isAdmin?: boolean;
    limit?: number;
  }): Video[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    let videos: Video[] = raw ? JSON.parse(raw) : INITIAL_VIDEOS;

    if (options?.type) {
      videos = videos.filter((v) => v.type === options.type);
    }

    if (options?.category && options.category !== 'all') {
      videos = videos.filter((v) => v.category === options.category);
    }

    if (options?.ownerId) {
      videos = videos.filter((v) => v.ownerId === options.ownerId);
    }

    if (!options?.isAdmin) {
      videos = videos.filter((v) => {
        if (v.visibility === 'public') return true;
        if (v.visibility === 'unlisted') return true;
        if (v.visibility === 'private' && options?.viewerId === v.ownerId) return true;
        return false;
      });
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      videos = videos.filter((v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.ownerName.toLowerCase().includes(q)
      );
    }

    videos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (options?.limit && options.limit > 0) {
      videos = videos.slice(0, options.limit);
    }

    return videos;
  }

  public getVideoById(id: string): Video | null {
    const videos = this.getVideos({ includePrivate: true, isAdmin: true });
    return videos.find((v) => v.id === id) || null;
  }

  public createVideo(payload: Omit<Video, 'id' | 'viewCount' | 'likesCount' | 'commentsCount' | 'createdAt'>): Video {
    const newVideo: Video = {
      ...payload,
      id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      viewCount: 0,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    const videos = this.getVideos({ includePrivate: true, isAdmin: true });
    videos.unshift(newVideo);
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    this.notify();
    return newVideo;
  }

  public updateVideo(id: string, updates: Partial<Video>): boolean {
    const videos = this.getVideos({ includePrivate: true, isAdmin: true });
    const idx = videos.findIndex((v) => v.id === id);
    if (idx === -1) return false;

    videos[idx] = { ...videos[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    this.notify();
    return true;
  }

  public deleteVideo(id: string, requesterUid: string, isAdmin: boolean): boolean {
    const videos = this.getVideos({ includePrivate: true, isAdmin: true });
    const target = videos.find((v) => v.id === id);
    if (!target) return false;

    if (target.ownerId !== requesterUid && !isAdmin) {
      throw new Error('Unauthorized: Only video owner or Admin can delete videos.');
    }

    const filtered = videos.filter((v) => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(filtered));
    this.notify();
    return true;
  }

  public recordGenuineView(
    videoId: string,
    viewerId?: string | null
  ): { recorded: boolean; viewCount: number } {
    let viewerToken = viewerId;
    if (!viewerToken) {
      viewerToken = sessionStorage.getItem('khmervibe_viewer_session') || '';
      if (!viewerToken) {
        viewerToken = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('khmervibe_viewer_session', viewerToken);
      }
    }

    const rawViews = localStorage.getItem(STORAGE_KEYS.GENUINE_VIEWS);
    interface ViewLog {
      videoId: string;
      viewerToken: string;
      timestamp: number;
    }
    const viewLogs: ViewLog[] = rawViews ? JSON.parse(rawViews) : [];

    // Deduplication check: only 1 genuine view per viewer/session per video within 12 hours
    const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
    const existing = viewLogs.find(
      (v) => v.videoId === videoId && v.viewerToken === viewerToken && v.timestamp > twelveHoursAgo
    );

    const videos = this.getVideos({ includePrivate: true, isAdmin: true });
    const video = videos.find((v) => v.id === videoId);

    if (!video) {
      return { recorded: false, viewCount: 0 };
    }

    if (existing) {
      return { recorded: false, viewCount: video.viewCount || 0 };
    }

    // Genuine view registered
    video.viewCount = (video.viewCount || 0) + 1;
    viewLogs.push({
      videoId,
      viewerToken,
      timestamp: Date.now(),
    });

    localStorage.setItem(STORAGE_KEYS.GENUINE_VIEWS, JSON.stringify(viewLogs));
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    this.notify();

    return { recorded: true, viewCount: video.viewCount };
  }

  public incrementViewCount(videoId: string, viewerId?: string | null) {
    return this.recordGenuineView(videoId, viewerId);
  }

  // --- LIKES ---
  public toggleLike(videoId: string, userId: string): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.LIKES);
    const likes: LikeRecord[] = raw ? JSON.parse(raw) : [];
    const existingIndex = likes.findIndex((l) => l.videoId === videoId && l.userId === userId);

    let isLiked = false;
    const videos = this.getVideos({ includePrivate: true, isAdmin: true });
    const video = videos.find((v) => v.id === videoId);

    if (existingIndex > -1) {
      likes.splice(existingIndex, 1);
      if (video) video.likesCount = Math.max(0, (video.likesCount || 0) - 1);
      isLiked = false;
    } else {
      likes.push({
        id: `like_${videoId}_${userId}`,
        videoId,
        userId,
        createdAt: new Date().toISOString(),
      });
      if (video) video.likesCount = (video.likesCount || 0) + 1;
      isLiked = true;
    }

    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likes));
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    this.notify();
    return isLiked;
  }

  public isVideoLikedByUser(videoId: string, userId?: string | null): boolean {
    if (!userId) return false;
    const raw = localStorage.getItem(STORAGE_KEYS.LIKES);
    const likes: LikeRecord[] = raw ? JSON.parse(raw) : [];
    return likes.some((l) => l.videoId === videoId && l.userId === userId);
  }

  // --- COMMENTS ---
  public getComments(videoId: string): Comment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const comments: Comment[] = raw ? JSON.parse(raw) : [];
    return comments
      .filter((c) => c.videoId === videoId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addComment(comment: Omit<Comment, 'id' | 'likesCount' | 'createdAt'>): Comment {
    const newComment: Comment = {
      ...comment,
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      likesCount: 0,
      createdAt: new Date().toISOString(),
    };

    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const comments: Comment[] = raw ? JSON.parse(raw) : [];
    comments.unshift(newComment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));

    const videos = this.getVideos({ includePrivate: true, isAdmin: true });
    const video = videos.find((v) => v.id === comment.videoId);
    if (video) {
      video.commentsCount = (video.commentsCount || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    }

    this.notify();
    return newComment;
  }

  public deleteComment(commentId: string, requesterUid: string, isAdmin: boolean): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const comments: Comment[] = raw ? JSON.parse(raw) : [];
    const target = comments.find((c) => c.id === commentId);
    if (!target) return false;

    if (target.authorId !== requesterUid && !isAdmin) {
      throw new Error('Unauthorized to delete this comment.');
    }

    const filtered = comments.filter((c) => c.id !== commentId);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(filtered));

    const videos = this.getVideos({ includePrivate: true, isAdmin: true });
    const video = videos.find((v) => v.id === target.videoId);
    if (video) {
      video.commentsCount = Math.max(0, (video.commentsCount || 0) - 1);
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    }

    this.notify();
    return true;
  }

  // --- FOLLOWING & CREATORS ---
  public toggleFollow(
    creatorId: string,
    follower: { uid: string; displayName?: string; photoURL?: string } | string
  ): boolean {
    const followerId = typeof follower === 'string' ? follower : follower.uid;
    const followerName = typeof follower === 'string' ? undefined : follower.displayName;
    const followerPhotoURL = typeof follower === 'string' ? undefined : follower.photoURL;

    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOWS);
    const follows: FollowRecord[] = raw ? JSON.parse(raw) : [];
    const existingIndex = follows.findIndex((f) => f.creatorId === creatorId && f.followerId === followerId);

    let isFollowing = false;
    if (existingIndex > -1) {
      follows.splice(existingIndex, 1);
      isFollowing = false;
    } else {
      follows.push({
        id: `follow_${creatorId}_${followerId}`,
        creatorId,
        followerId,
        followerName: followerName || 'អ្នកគាំទ្រ KhmerVibe',
        followerPhotoURL: followerPhotoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        createdAt: new Date().toISOString(),
      });
      isFollowing = true;
    }

    localStorage.setItem(STORAGE_KEYS.FOLLOWS, JSON.stringify(follows));

    // Keep creator's subscribersCount up to date in USERS storage
    const currentFollowersCount = follows.filter((f) => f.creatorId === creatorId).length;
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const users: User[] = rawUsers ? JSON.parse(rawUsers) : SEED_CREATORS;
    const userIdx = users.findIndex((u) => u.uid === creatorId);
    if (userIdx > -1) {
      users[userIdx].subscribersCount = currentFollowersCount;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    this.notify();
    return isFollowing;
  }

  public isFollowing(creatorId: string, followerId?: string | null): boolean {
    if (!followerId) return false;
    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOWS);
    const follows: FollowRecord[] = raw ? JSON.parse(raw) : [];
    return follows.some((f) => f.creatorId === creatorId && f.followerId === followerId);
  }

  public getFollowersCount(creatorId: string): number {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOWS);
    const follows: FollowRecord[] = raw ? JSON.parse(raw) : [];
    return follows.filter((f) => f.creatorId === creatorId).length;
  }

  public getFollowers(creatorId: string): FollowRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOWS);
    const follows: FollowRecord[] = raw ? JSON.parse(raw) : [];
    return follows
      .filter((f) => f.creatorId === creatorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getFollowing(followerId: string): FollowRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOWS);
    const follows: FollowRecord[] = raw ? JSON.parse(raw) : [];
    return follows
      .filter((f) => f.followerId === followerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getFollowingCount(followerId: string): number {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOWS);
    const follows: FollowRecord[] = raw ? JSON.parse(raw) : [];
    return follows.filter((f) => f.followerId === followerId).length;
  }

  public getAllFollowsCount(): number {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOWS);
    const follows: FollowRecord[] = raw ? JSON.parse(raw) : [];
    return follows.length;
  }

  public getCreators(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : SEED_CREATORS;
  }

  public getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : SEED_CREATORS;
  }

  // --- REPORTS ---
  public createReport(report: Omit<Report, 'id' | 'status' | 'createdAt'>): Report {
    const newReport: Report = {
      ...report,
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    const reports: Report[] = raw ? JSON.parse(raw) : [];
    reports.unshift(newReport);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    this.notify();
    return newReport;
  }

  public getReports(): Report[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return raw ? JSON.parse(raw) : [];
  }

  public updateReportStatus(reportId: string, status: 'reviewed' | 'dismissed'): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    const reports: Report[] = raw ? JSON.parse(raw) : [];
    const report = reports.find((r) => r.id === reportId);
    if (!report) return false;

    report.status = status;
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    this.notify();
    return true;
  }
}

export const dbService = new DatabaseService();
