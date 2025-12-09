// src/app/pages/Public/pages/profile/models/profile.models.ts

// The generic wrapper from your API
export interface StandardResponse<T> {
  isSuccess: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

// Enum for User Types (Match your backend)
export enum UserType {
  Regular = 0,
  Organization = 1,
  Admin = 2
}

// Social Platform Enum (if used in links)
export enum SocialPlatform {
  Facebook = 0,
  Twitter = 1,
  Instagram = 2,
  LinkedIn = 3,
  GitHub = 4,
  YouTube = 5,
  Website = 6
}

export interface UserSocialLinkDto {
  platform: SocialPlatform;
  url: string;
}

export interface UserStatsDto {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isVerified: boolean | null;
}

// --- Specific Profile Data DTOs ---

export interface AdminProfileDto {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface OrganizationProfileDto {
  name: string;
  bio?: string;
  socialLinks?: UserSocialLinkDto[];
  stats: UserStatsDto;
}

export interface RegularProfileDto {
  firstName: string;
  lastName: string;
  bio?: string;
  socialLinks?: UserSocialLinkDto[];
  stats: UserStatsDto;
}

// --- Main Profile DTO (The 'data' field is dynamic) ---
export interface UserProfileDto {
  id: number;
  type: UserType;
  imageUrl?: string;
  data: AdminProfileDto | OrganizationProfileDto | RegularProfileDto; // Dynamic Content
  email?: string; // Often needed for display, ensure backend sends it or fetch separately
  twoFactorEnabled?: boolean; // For toggle logic
}

export type ProfileResponse = StandardResponse<UserProfileDto>;