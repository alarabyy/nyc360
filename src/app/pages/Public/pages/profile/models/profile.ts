// src/app/pages/Public/pages/profile/models/profile.models.ts

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatarUrl: string;
  role: string;
  twoFactorEnabled: boolean; // Important for the toggle button
  phoneNumber: string | null;
  
  // Social Links
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  linkedInUrl: string | null;
  githubUrl: string | null;
  youtubeUrl: string | null;
  websiteUrl: string | null;
}

export interface ProfileResponse {
  isSuccess: boolean;
  data: UserProfile;
  error: { code: string; message: string } | null;
}

// Response for 2FA Toggle
export interface Toggle2FAResponse {
  isSuccess: boolean;
  data?: any; // Sometimes returns QR code or status
  error: { code: string; message: string } | null;
}