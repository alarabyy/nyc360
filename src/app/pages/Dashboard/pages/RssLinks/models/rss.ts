// src/app/pages/Dashboard/pages/rss/models/rss.models.ts

// Enum for Mapping Categories (0=Art, 1=Community, etc.)
export enum RssCategory {
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
  torism = 11,
  Tv = 12
}

// Helper List for Dropdowns/Badges
export const RssCategoryList = [
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
  { id: 11, name: 'torism' },
  { id: 12, name: 'Tv' }
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