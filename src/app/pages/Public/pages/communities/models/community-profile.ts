// src/app/pages/Public/pages/communities/models/community-profile.models.ts

export interface CommunityDetails {
  id: number;
  name: string;
  slug: string;
  description: string;
  type: number;
  imageUrl: string; 
  coverUrl: string; 
  memberCount: number;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: string | { name: string; imageUrl?: string };
  attachments: { id: number; url: string }[];
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
}

// ✅ New: Member Interface
export interface CommunityMember {
  userId: number;
  name: string;
  avatarUrl: string | null;
  role: string;
  joinedAt: string;
}

export interface CommunityProfileData {
  community: CommunityDetails;
  posts: {
    isSuccess: boolean;
    data: Post[];
    totalCount: number;
  };
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  error: any;
}