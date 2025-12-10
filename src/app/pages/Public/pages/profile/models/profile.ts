// src/app/pages/Public/pages/profile/models/profile.models.ts

export enum UserType {
  Normal = 0,
  Organization = 1,
  Admin = 2
}

export enum SocialPlatform {
  Facebook = 0,
  Twitter = 1,
  Instagram = 2,
  LinkedIn = 3,
  Github = 4,
  Youtube = 5,
  Website = 6,
  Other = 7
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

// --- Specific DTOs ---
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

// --- Main Profile Wrapper ---
export interface UserProfileDto {
  id: number;
  userName: string; // Ensure backend returns this to compare!
  email: string;
  type: UserType;
  imageUrl?: string;
  data: AdminProfileDto | OrganizationProfileDto | RegularProfileDto | null;
  twoFactorEnabled?: boolean;
}

export interface StandardResponse<T> {
  isSuccess: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

export type ProfileResponse = StandardResponse<UserProfileDto>;