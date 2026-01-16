import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../Authentication/Service/auth';
import { environment } from '../../../../../environments/environment';
import { PostsService } from '../services/posts';
import { Post, FeedData, InterestGroup, CommunitySuggestion, PostAuthor } from '../models/posts';
import { CATEGORY_LIST } from '../../../../../pages/models/category-list';
import { WeatherService } from '../services/weather';

interface Toast { id: number; message: string; type: 'success' | 'error' | 'info'; }
interface Alert { type: 'yellow' | 'blue' | 'red'; title: string; desc: string; icon: string; }

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit {

  protected readonly environment = environment;
  private postsService = inject(PostsService);
  private weatherService = inject(WeatherService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  // Data
  featuredPosts: Post[] = [];
  heroBanner: Post | null = null;
  interestGroups: InterestGroup[] = [];
  trendingTags: string[] = [];
  suggestedCommunities: CommunitySuggestion[] = [];
  highlightedPosts: Post[] = [];
  textOnlyPosts: Post[] = []; // New array for posts without images

  // Weather Data
  weatherData: any = null;
  currentDate: Date = new Date();

  // Alerts Data
  alerts: Alert[] = [
    { type: 'yellow', title: 'Gridlock Alert', desc: 'Midtown traffic moving slow due to UN General Assembly', icon: 'bi-exclamation-triangle-fill' },
    { type: 'blue', title: 'Rain Expected', desc: 'Light showers starting around 4 PM', icon: 'bi-cloud-rain-fill' }
  ];

  isLoading = true;
  selectedCategoryId: number = -1;
  categories = [{ id: -1, name: 'All', icon: 'bi-grid' }, ...CATEGORY_LIST];

  toasts: Toast[] = [];
  private toastCounter = 0;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const cat = params['category'];
      this.selectedCategoryId = cat !== undefined ? +cat : -1;
      this.loadFeed();
    });

    this.getRealWeather();
  }

  getRealWeather() {
    this.weatherService.getWeather().subscribe(data => {
      if (data) {
        this.weatherData = {
          temp: Math.round(data.main.temp),
          desc: data.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          humidity: data.main.humidity
        };
      }
      this.cdr.detectChanges();
    });
  }

  loadFeed() {
    this.isLoading = true;
    this.postsService.getPostsFeed().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.processData(res.data);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.showToast('Failed to load feed', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // Helper check (Used mainly for Hero selection logic)
  private hasValidImage(post: Post): boolean {
    if (post.imageUrl && post.imageUrl.trim() !== '') return true;
    if (post.attachments && post.attachments.length > 0) {
      const url = post.attachments[0].url;
      if (url && url.trim() !== '') return true;
    }
    return false;
  }

  processData(data: FeedData) {
    this.textOnlyPosts = []; // Reset text-only posts
    const processedIds = new Set<string | number>(); // Track added IDs to avoid duplicates

    // Helper to add to textOnlyPosts if unique
    const addTextOnly = (post: Post) => {
      if (!processedIds.has(post.id)) {
        this.textOnlyPosts.push(post);
        processedIds.add(post.id);
      }
    };

    const rawFeatured = data.featuredPosts || [];
    const validFeatured: Post[] = [];

    // 1. Process Featured: Split into with-image and without-image
    rawFeatured.forEach(p => {
      const post = this.normalizePost(p);
      if (this.hasValidImage(post)) {
        validFeatured.push(post);
      } else {
        addTextOnly(post);
      }
    });

    // Take top 4 valid images for featured
    this.featuredPosts = validFeatured.slice(0, 4);

    // 2. Hero Banner Logic
    const rawDiscovery = data.discoveryPosts || [];
    const validDiscovery: Post[] = [];

    rawDiscovery.forEach(p => {
      const post = this.normalizePost(p);
      if (this.hasValidImage(post)) {
        validDiscovery.push(post);
      } else {
        addTextOnly(post);
      }
    });

    if (validDiscovery.length > 0) {
      this.heroBanner = validDiscovery[0];
    } else if (validFeatured.length > 4) {
      // If we have extra featured posts with images, use the 5th one as hero
      this.heroBanner = validFeatured[4];
    } else {
      this.heroBanner = null;
    }

    // 3. Interest Groups Logic
    this.interestGroups = (data.interestGroups || []).map(group => {
      const validGroupPosts: Post[] = [];

      group.posts.forEach(p => {
        const post = this.normalizePost(p);
        if (this.hasValidImage(post)) {
          validGroupPosts.push(post);
        } else {
          addTextOnly(post);
        }
      });

      return { ...group, posts: validGroupPosts };
    }).filter(g => g.posts.length > 0);

    // Highlights Logic (remains mostly same, picks from interest groups which are now only-images)
    this.highlightedPosts = [];
    this.interestGroups.forEach(group => {
      if (group.posts.length > 0) {
        this.highlightedPosts.push(group.posts[0]);
      }
    });

    this.trendingTags = data.trendingTags || [];
    this.suggestedCommunities = data.suggestedCommunities || [];
  }

  onSavePost(post: Post, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.authService.currentUser$.value) {
      this.showToast('Please login to save posts', 'info');
      return;
    }
    const originalState = post.isSaved;
    post.isSaved = !post.isSaved;
    this.postsService.savePost(post.id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const msg = post.isSaved ? 'Post saved successfully!' : 'Post unsaved';
          this.showToast(msg, 'success');
        } else {
          post.isSaved = originalState;
          this.showToast('Failed to save post', 'error');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        post.isSaved = originalState;
        this.showToast('Error saving post', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  onJoinCommunity(comm: CommunitySuggestion) {
    if (!this.authService.currentUser$.value) { this.showToast('Login required', 'info'); return; }
    if (comm.isJoined || comm.isLoadingJoin) return;
    comm.isLoadingJoin = true;
    this.postsService.joinCommunity(comm.id).subscribe({
      next: (res) => {
        comm.isLoadingJoin = false;
        if (res.isSuccess) { comm.isJoined = true; this.showToast('Joined!', 'success'); }
        else this.showToast('Failed', 'error');
        this.cdr.detectChanges();
      },
      error: () => { comm.isLoadingJoin = false; this.cdr.detectChanges(); }
    })
  }

  private showToast(message: string, type: 'success' | 'error' | 'info') {
    const id = this.toastCounter++;
    this.toasts.push({ id, message, type });
    setTimeout(() => this.removeToast(id), 3500);
  }
  removeToast(id: number) { this.toasts = this.toasts.filter(t => t.id !== id); this.cdr.detectChanges(); }

  // Helpers
  private normalizePost(post: any): Post {
    if (!post.stats) post.stats = { views: 0, likes: 0, dislikes: 0, comments: 0, shares: 0 };
    if (post.isSaved === undefined) post.isSaved = (post.isSavedByUser === true);
    return post;
  }

  getAuthorName(author: PostAuthor | string | undefined | null): string {
    if (!author) return 'NYC360';
    if (typeof author === 'string') return author;
    return author.name || author.username || 'NYC360';
  }

  getCategoryName(id: number): string {
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : 'General';
  }

  // ============================================
  // 🔥 دوال معالجة الصور (الذكية)
  // ============================================

  getAuthorImage(author: PostAuthor | string | undefined | null): string {
    if (typeof author === 'object' && author?.imageUrl) {
      let url = author.imageUrl;
      // لو الرابط لينك خارجي رجعه زي ما هو
      if (url.startsWith('http') || url.startsWith('https')) return url;

      // لو الرابط محلي، ضيف مسار السيرفر
      return `${this.environment.apiBaseUrl3}/${url}`;
    }
    return 'assets/images/default-avatar.png';
  }

  resolvePostImage(post: Post): string {
    const attachment = post.attachments?.[0];
    let url = attachment?.url || post.imageUrl;

    // 1. لو مفيش صورة، رجع صورة احتياطية (Placeholder)
    if (!url || url.trim() === '') return 'assets/images/placeholder-news.jpg';

    // 2. تنظيف المسار من @local://
    url = url.replace('@local://', '');

    // 3. 🔥 الفحص الذكي:
    // لو الرابط بيبدأ بـ http يعني ده لينك خارجي -> رجعه زي ما هو
    if (url.startsWith('http') || url.startsWith('https')) {
      return url;
    }

    // 4. لو الرابط مش http يعني ده اسم ملف محلي -> ضيف مسار السيرفر والفولدر posts
    return `${this.environment.apiBaseUrl3}/${url}`;
  }
}