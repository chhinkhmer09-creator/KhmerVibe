export type UserRole = 'user' | 'creator' | 'admin';

export interface User {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  role: UserRole;
  subscribersCount?: number;
  createdAt: string;
}

export type VideoType = 'long' | 'short';
export type VideoVisibility = 'public' | 'unlisted' | 'private';

export interface Video {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhotoURL?: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  storagePath: string;
  playbackUrl: string;
  type: VideoType;
  category: string;
  visibility: VideoVisibility;
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  duration?: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  videoId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  text: string;
  likesCount: number;
  createdAt: string;
}

export interface LikeRecord {
  id: string;
  videoId: string;
  userId: string;
  createdAt: string;
}

export interface FollowRecord {
  id: string;
  followerId: string;
  followerName?: string;
  followerPhotoURL?: string;
  creatorId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName?: string;
  videoId: string;
  videoTitle?: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export interface Category {
  id: string;
  nameKm: string;
  nameEn: string;
  iconName?: string;
}
