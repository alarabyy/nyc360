// 1. نفس الـ Enum اللي في الـ Backend بالظبط
export enum CategoryEnum {
  Community = 0,
  Culture = 1,
  Education = 2,
  Housing = 3,
  Health = 4,
  Legal = 5,
  Lifestyle = 6,
  News = 7,
  Professions = 8,
  Social = 9,
  Transportation = 10,
  Tv = 11
}

// 2. خريطة الألوان لكل قسم (بناء على الصورة اللي بعتها)
export const CATEGORY_THEMES = {
  [CategoryEnum.Community]: { color: '#ff7f50', label: 'Community', path: 'community' }, // Orange
  [CategoryEnum.Culture]: { color: '#dc3545', label: 'Culture', path: 'culture' },       // Red
  [CategoryEnum.Education]: { color: '#0056b3', label: 'Education', path: 'education' }, // Dark Blue
  [CategoryEnum.Housing]: { color: '#6c757d', label: 'Housing', path: 'housing' },       // Grey (Example)
  [CategoryEnum.Health]: { color: '#00c3ff', label: 'Health', path: 'health' },          // Cyan
  [CategoryEnum.Legal]: { color: '#102a43', label: 'Legal', path: 'legal' },             // Navy
  [CategoryEnum.Lifestyle]: { color: '#8bc34a', label: 'Lifestyle', path: 'lifestyle' }, // Green
  [CategoryEnum.News]: { color: '#333333', label: 'News', path: 'news' },                // Black
  [CategoryEnum.Professions]: { color: '#2ecc71', label: 'Professions', path: 'professions' },
  [CategoryEnum.Social]: { color: '#17a2b8', label: 'Social', path: 'social' },
  [CategoryEnum.Transportation]: { color: '#f1c40f', label: 'Transportation', path: 'transportation' }, // Yellow
  [CategoryEnum.Tv]: { color: '#0d47a1', label: 'TV', path: 'tv' }
};