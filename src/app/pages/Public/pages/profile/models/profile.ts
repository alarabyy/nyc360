// src/app/pages/Public/pages/profile/models/profile.models.ts
import { Post } from "../../posts/models/posts";

export enum UserType {
  Normal = 0, Organization = 1, Admin = 2
}

export enum SocialPlatform {
  Facebook = 0, Twitter = 1, Instagram = 2, LinkedIn = 3, Github = 4, Youtube = 5, Website = 6, Other = 7
}

// --- Display Models (From GET Response) ---
export interface UserSocialLink {
  id?: number; // Some APIs return Id, others LinkId
  linkId?: number; 
  platform: SocialPlatform;
  url: string;
}

export interface Position {
  id: number; // Mapped from backend (PositionId)
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface Education {
  id: number; // Mapped from backend (EducationId)
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
}

export interface CommunitySummary {
  id: number;
  name: string;
  membersCount: number;
  imageUrl?: string;
}

export interface ProfileDetails {
  firstName: string;
  lastName: string;
  headline: string;
  bio: string;
  email: string;
  phoneNumber: string;
  locationId: number | null;
  location?: string;
  positions: Position[];
  education: Education[];
  topCommunities: CommunitySummary[];
  recentPosts: Post[];
  socialLinks: UserSocialLink[];
}

export interface UserProfileData {
  id: number;
  type: UserType;
  imageUrl: string | null;
  coverImageUrl: string | null;
  profile: ProfileDetails;
}

// --- Request DTOs (Strictly PascalCase if API requires it, or mapped in Service) ---
export interface UpdateBasicProfileDto {
  FirstName: string;
  LastName: string;
  Headline: string;
  Bio: string;
  LocationId: number;
}

export interface AddEducationDto {
  School: string;
  Degree: string;
  FieldOfStudy: string;
  StartDate: string;
  EndDate?: string;
}

export interface UpdateEducationDto {
  EducationId: number;
  School: string;
  Degree: string;
  FieldOfStudy: string;
  StartDate: string;
  EndDate?: string;
}

export interface AddPositionDto {
  Title: string;
  Company: string;
  StartDate: string;
  EndDate?: string;
  IsCurrent: boolean;
}

export interface UpdatePositionDto {
  PositionId: number;
  Title: string;
  Company: string;
  StartDate: string;
  EndDate?: string;
  IsCurrent: boolean;
}

export interface SocialLinkDto {
  LinkId?: number;
  Platform: SocialPlatform;
  Url: string;
}

export interface Toggle2FADto {
  Enable: boolean;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  error: { code: string; message: string } | null;
}