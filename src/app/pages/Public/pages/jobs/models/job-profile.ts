// src/app/features/professions/models/job-profile.ts

export enum ApplicationStatus {
  Pending = 0,
  Reviewed = 1,
  Interviewing = 2,
  Rejected = 3,
  Accepted = 4,
}

export interface JobProfile {
  id: number;
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  responsibilities: string | null;
  salaryMin: number;
  salaryMax: number;
  workArrangement: number;
  employmentType: number;
  employmentLevel: number;
  location: { id: number; neighborhood: string; borough: string; zipCode: number; };
  author: { id: number; username: string; imageUrl: string; type: number; };
  createdAt: string;
}

export interface RelatedJob {
  id: number;
  title: string;
  salaryMin: number;
  salaryMax: number;
  workArrangement: number;
  employmentType: number;
  employmentLevel: number;
  companyName: string;
}

export interface Candidate {
  id: number;
  username: string;
  fullName: string;
  imageUrl: string;
  type: number;
}

export interface Applicant {
  applicationId: number;
  status: ApplicationStatus; // تم التحديث لاستخدام Enum
  appliedAt: string;
  coverLetter: string;
  resumeUrl: string | null;
  candidate: Candidate;
}

export interface JobProfileResponse {
  offer: JobProfile;
  relatedJobs: RelatedJob[];
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  error: any;
}