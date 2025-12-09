// src/app/pages/Dashboard/pages/posts/models/post.models.ts

// 1. Category Enum (Matches Backend)
export enum PostCategory {
  Art = 0,
  Community = 1,
  Culture = 2,
  Education = 3,
  Events = 4,
  Lifestyle = 5,
  Media = 6,
  News = 7,
  Recruitment = 8,
  Social = 9,
  Tv = 10
}

// Helper List for Dropdowns
export const PostCategoryList = [
  { id: 0, name: 'Art' },
  { id: 1, name: 'Community' },
  { id: 2, name: 'Culture' },
  { id: 3, name: 'Education' },
  { id: 4, name: 'Events' },
  { id: 5, name: 'Lifestyle' },
  { id: 6, name: 'Media' },
  { id: 7, name: 'News' },
  { id: 8, name: 'Recruitment' },
  { id: 9, name: 'Social' },
  { id: 10, name: 'TV' }
];

// 2. Main Entity
export interface Post {
  id: number;
  title: string;
  content: string;
  category: number; // Enum ID
  imageUrl: string | null;
  createdAt?: string; // Optional date
}

// 3. API Response Wrapper
export interface PostsResponse {
  isSuccess: boolean;
  data: Post[] | any; // Can be array or single object
  error: { code: string; message: string } | null;
}