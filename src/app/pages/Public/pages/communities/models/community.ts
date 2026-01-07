// src/app/pages/Public/pages/community/models/community.models.ts

// --- Shared Types ---
export interface Author {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface Attachment {
  id: number;
  url: string;
}

export interface PostStats {
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
}

// --- Feed Post (For Discussions/Featured) ---
export interface CommunityPost {
  id: number;
  title: string;
  content: string;
  category: number;
  createdAt: string;
  author: Author | string; 
  attachments: Attachment[];
  stats: PostStats;
  tags?: string[];
}

// --- Community Suggestion (The Cards) ---
export interface CommunitySuggestion {
  id: number;
  name: string;
  slug: string;
  description: string;
  avatarUrl: string; // اسم الملف فقط من الباك اند
  type: number;
  memberCount: number;
  isPrivate: boolean;
  
  // حقول للتحكم في الواجهة (UI State)
  isJoined?: boolean;
  isLoadingJoin?: boolean;
}

// --- API Response Structures ---
export interface FeedResponse {
  isSuccess: boolean;
  data: CommunityPost[];
  totalCount: number;
}

export interface CommunityHomeData {
  feed: FeedResponse;
  suggestions: CommunitySuggestion[];
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  error: { code: string; message: string } | null;
}

// Join Request Body
export interface JoinCommunityDto {
  communityId: number;
}