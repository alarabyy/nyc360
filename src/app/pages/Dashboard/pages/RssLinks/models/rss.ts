// src/app/pages/Dashboard/pages/rss/models/rss.models.ts

// Enum for Mapping Categories (0=Art, 1=Community, etc.)
export enum RssCategory {
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

// Helper List for Dropdowns/Badges
export const RssCategoryList = [
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
  { id: 10, name: 'Tv' }
];

// Main Entity
export interface RssSource {
  id: number;
  name: string;
  rssUrl: string;
  category: number;
  description: string;
  imageUrl: string | null; // Can be null
  isActive: boolean;
  lastChecked: string;
}

// Response Wrapper
export interface RssResponse {
  isSuccess: boolean;
  data: RssSource[]; // Array of sources
  error: { code: string; message: string } | null;
}



// 3. Create Request (Simple JSON)
export interface CreateRssRequest {
  url: string;
  category: number;
}

// 4. API Response Wrapper
export interface RssResponse {
  isSuccess: boolean;
  data: RssSource[];
  error: { code: string; message: string } | null;
}