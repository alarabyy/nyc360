import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {

  // 1. Hero Story (الخبر الرئيسي - سياسة وعمران)
  heroStory = {
    category: 'Politics & Policy',
    title: 'The 2030 Vision: Reimagining Manhattan’s Skyline',
    subtitle: 'Mayor Adams unveils a controversial yet bold plan to transform Midtown into a green energy hub by the end of the decade.',
    author: 'Sarah Jenkins',
    date: 'Oct 24, 2025',
    image: 'assets/images/nyc-skyline.jpg' // تأكد من وجود صورة بهذا الاسم أو غير الرابط
  };

  // 2. Ticker (شريط الأخبار العاجلة)
  breakingNews = [
    'Wall Street closes at record high amidst tech rally.',
    'MTA announces contactless payment for all boroughs starting Monday.',
    'Met Gala theme announced: "The Gilded Age of Tomorrow".',
    'UN General Assembly gathers to discuss global climate resilience.'
  ];

  // 3. Bento Grid Stories (أخبار متنوعة بتصميم الشبكة)
  trendingStories = [
    {
      id: 1,
      category: 'Business',
      title: 'Crypto in the Village: How Blockchain is Changing Small Business',
      desc: 'Local cafes accept Bitcoin as the financial district expands north.',
      image: 'assets/images/business.jpg', // صورة وهمية
      size: 'large'
    },
    {
      id: 2,
      category: 'Culture',
      title: 'The Hidden Jazz Clubs of Harlem You Need to Visit',
      desc: 'A night out in the places where history was made.',
      image: 'assets/images/jazz.jpg', // صورة وهمية
      size: 'small'
    },
    {
      id: 3,
      category: 'Tech',
      title: 'Silicon Alley: NYC’s Answer to the West Coast',
      desc: 'Tech giants are buying up real estate in Chelsea.',
      image: 'assets/images/tech.jpg', // صورة وهمية
      size: 'small'
    }
  ];

  // 4. City Pulse (قائمة جانبية سريعة)
  cityPulse = [
    { category: 'Real Estate', title: 'Brooklyn Heights: The New Billionaire’s Row?', time: '2h ago' },
    { category: 'Transport', title: 'Ferry Routes Expanded to South Bronx', time: '4h ago' },
    { category: 'Arts', title: 'MoMA’s New Exhibit Challenges Modern Perception', time: '6h ago' },
    { category: 'Food', title: 'Why The Classic NY Slice is Making a Comeback', time: '8h ago' }
  ];

}