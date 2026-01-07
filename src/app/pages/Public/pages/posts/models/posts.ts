// src/app/pages/Dashboard/pages/posts/models/posts.ts

// ✅ تم حذف PostCategory و PostCategoryList نهائياً
// الاعتماد الآن على: src/app/shared/models/category-list.ts

export enum InteractionType {
  Like = 1,
  Dislike = 2
}

// --- Shared Interfaces ---

export interface PostAttachment {
  id: number;
  url: string;
  type?: number;
}

export interface PostAuthor {
  id: number;
  // Fields for compatibility (Admin might use username/fullName, Feed uses name)
  username?: string;
  fullName?: string;
  name?: string; 
  imageUrl?: string;
  type?: number;
}

export interface PostStats {
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
}

// ✅ Comment Interface
export interface PostComment {
  id: number;
  content: string;
  author: PostAuthor | string;
  createdAt: string;
  replies?: PostComment[];
  isReplying?: boolean;
}

// ✅ Main Post Interface
export interface Post {
  id: number;
  title: string;
  content: string;
  category: number; // This maps to the ID in CATEGORY_LIST
  createdAt: string;
  
  // Optional fields
  imageUrl?: string | null;
  lastUpdated?: string;
  sourceType?: number;
  postType?: number;
  tags?: string[];

  author?: PostAuthor | string; // Can be object or ID string
  stats?: PostStats;
  comments?: PostComment[];
  attachments?: PostAttachment[];
  
  currentUserInteraction?: InteractionType | null; 
  userInteraction?: InteractionType | null; // Helper for UI state
}

// --- 🔥 NEW INTERFACES (For Home News Feed) ---

export interface InterestGroup {
  category: number;
  posts: Post[];
}

export interface CommunitySuggestion {
  name: string;
  slug: string;
}

export interface FeedData {
  featuredPosts: Post[];
  interestGroups: InterestGroup[];
  discoveryPosts: Post[];
  suggestedCommunities: CommunitySuggestion[];
  trendingTags: string[];
}

// --- Tag Page Response Alias ---
// في صفحة التاج، البيانات العائدة هي مصفوفة بوستات
export type TagPostsResponse = Post[];

// --- Generic API Response (Updated for Root Pagination) ---
export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  error: { code: string; message: string } | null;

  // ✅ Pagination Fields (Added optional fields to handle List/Tags endpoints)
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}