// src/app/pages/Dashboard/pages/posts/models/posts.ts

// --- Enums & Lists ---

// Enum for categories (Starting from 1 to match the ID list below)
export enum PostCategory {
  Art = 1,
  Community = 2,
  Culture = 3,
  Education = 4,
  Events = 5,
  Lifestyle = 6,
  Media = 7,
  News = 8,
  Recruitment = 9,
  Social = 10,
  Tourism = 11,
  Tv = 12
}

// Static list for dropdowns or filtering UI
export const PostCategoryList = [
  { id: 1, name: 'Art' },
  { id: 2, name: 'Community' },
  { id: 3, name: 'Culture' },
  { id: 4, name: 'Education' },
  { id: 5, name: 'Events' },
  { id: 6, name: 'Lifestyle' },
  { id: 7, name: 'Media' },
  { id: 8, name: 'News' },
  { id: 9, name: 'Recruitment' },
  { id: 10, name: 'Social' },
  { id: 11, name: 'Tourism' },
  { id: 12, name: 'TV' }
];

export enum InteractionType {
  Like = 1,
  Dislike = 2
}

// --- Interfaces ---

// Interface for Author (Old/Standard)
export interface PostAuthor {
  id: number;
  username: string;
  fullName: string;
  imageUrl?: string;
  type?: number;
}

// Interface for Stats (Old/Standard)
export interface PostStats {
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
}

// Interface for Comments (Old/Standard)
export interface Comment {
  id: number;
  content: string;
  author: PostAuthor | string; // Flexible to handle object or string name
  createdAt: string;
  replies?: Comment[];
  isReplying?: boolean; // UI Helper
}

// Interface for Attachments (New - from Swagger Response)
export interface PostAttachment {
  id: number;
  url: string;
}

// Main Post Interface (Combined Old + New)
export interface Post {
  id: number;
  title: string;
  content: string;
  
  // Metadata
  sourceType?: number;
  postType?: number;
  category: number; // Matches PostCategory Enum
  
  // Media (Updated to support attachments array)
  attachments: PostAttachment[]; 
  imageUrl?: string | null; // Kept for backward compatibility if needed
  
  // Statistics & Relations
  stats?: PostStats;
  comments?: Comment[];
  author?: PostAuthor | string; 
  
  // Dates
  createdAt: string;
  lastUpdated: string;
  
  // Interaction
  currentUserInteraction?: number; // 0=None, 1=Like, 2=Dislike
}

// Generic API Response Wrapper
export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  error: { code: string; message: string } | null;
}