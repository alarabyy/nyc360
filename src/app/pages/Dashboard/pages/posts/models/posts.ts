// src/app/pages/Dashboard/pages/posts/models/post.models.ts

export enum PostCategory {
  Art = 0, Community = 1, Culture = 2, Education = 3, Events = 4,
  Lifestyle = 5, Media = 6, News = 7, Recruitment = 8, Social = 9, Tourism = 10, Tv = 11
}

export const PostCategoryList = [
  { id: 1, name: 'Art' }, { id: 2, name: 'Community' }, { id: 3, name: 'Culture' },
  { id: 4, name: 'Education' }, { id: 5, name: 'Events' }, { id: 6, name: 'Lifestyle' },
  { id: 7, name: 'Media' }, { id: 8, name: 'News' }, { id: 9, name: 'Recruitment' },
  { id: 10, name: 'Social' }, { id: 11, name: 'Tourism' }, { id: 12, name: 'TV' }
];

export enum InteractionType {
  Like = 1,
  Dislike = 2
}

export interface PostAuthor {
  id: number;
  username: string;
  fullName: string;
  imageUrl?: string;
  type: number;
}

export interface PostStats {
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
}

export interface Comment {
  id: number;
  content: string;
  author: PostAuthor;
  createdAt: string;
  replies?: Comment[];
  isReplying?: boolean;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  category: number;
  createdAt: string;
  
  author?: PostAuthor; 
  stats?: PostStats;
  comments?: Comment[];
  
  // حالة التفاعل الحالية للمستخدم
  userInteraction?: InteractionType | null;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  error: { code: string; message: string } | null;
}