import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsService } from '../services/posts';

// --- 1. تعريف الـ Enum والـ Themes زي ما طلبت بالظبط ---
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

export const CATEGORY_THEMES: any = {
  [CategoryEnum.Community]: { color: '#ff7f50', label: 'Community' },
  [CategoryEnum.Culture]: { color: '#dc3545', label: 'Culture' },
  [CategoryEnum.Education]: { color: '#0056b3', label: 'Education' },
  [CategoryEnum.Housing]: { color: '#6c757d', label: 'Housing' },
  [CategoryEnum.Health]: { color: '#00c3ff', label: 'Health' },
  [CategoryEnum.Legal]: { color: '#102a43', label: 'Legal' },
  [CategoryEnum.Lifestyle]: { color: '#8bc34a', label: 'Lifestyle' },
  [CategoryEnum.News]: { color: '#333333', label: 'News' },
  [CategoryEnum.Professions]: { color: '#2ecc71', label: 'Professions' },
  [CategoryEnum.Social]: { color: '#17a2b8', label: 'Social' },
  [CategoryEnum.Transportation]: { color: '#f1c40f', label: 'Transportation' },
  [CategoryEnum.Tv]: { color: '#0d47a1', label: 'TV' }
};

@Component({
  selector: 'app-feed-layout',
  templateUrl: './feed-layout.html',
  styleUrls: ['./feed-layout.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class FeedLayoutComponent implements OnInit, OnDestroy {
  // Data
  posts: any[] = [];
  locations: any[] = [];
  loading = true;
  
  // Pagination
  totalCount: number = 0;
  totalPages: number = 0;
  pagesArray: number[] = [];
  
  // Filters
  currentCategory: number = 0;
  pageTitle: string = '';
  searchQuery: string = '';
  selectedLocationId: number | null = null;
  currentPage: number = 1;
  pageSize: number = 9; 

  // Subjects
  private searchSubject = new Subject<string>();
  private locationSearch$ = new Subject<string>();
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private postsService: PostsService,
    private el: ElementRef
  ) {
    // Live Search
    const searchSub = this.searchSubject.pipe(
      debounceTime(400), 
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.searchQuery = searchText;
      this.currentPage = 1;
      this.loadPosts(); 
    });
    this.subscriptions.push(searchSub);

    // Location Search
    const locSub = this.locationSearch$.pipe(
      debounceTime(400), distinctUntilChanged()
    ).subscribe(term => this.fetchLocations(term));
    this.subscriptions.push(locSub);
  }

  ngOnInit(): void {
    const routeSub = this.route.data.subscribe(data => {
      this.currentCategory = data['categoryEnum'];
      this.pageTitle = data['title'];
      
      // لو القسم الحالي ليه لون معين، نستخدمه كـ Theme للصفحة
      const themeInfo = CATEGORY_THEMES[this.currentCategory];
      const themeColor = themeInfo ? themeInfo.color : '#ff7f50';
      
      this.applyTheme(themeColor);
      this.resetFilters();
      this.loadPosts();
    });
    this.subscriptions.push(routeSub);
  }

  ngOnDestroy(): void { this.subscriptions.forEach(sub => sub.unsubscribe()); }

  applyTheme(color: string) {
    if(this.el && this.el.nativeElement) {
        this.el.nativeElement.style.setProperty('--primary-color', color);
    }
  }

  loadPosts() {
    this.loading = true;
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });

    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      category: this.currentCategory,
      locationId: this.selectedLocationId,
      search: this.searchQuery 
    };

    this.postsService.getFeed(params).subscribe({
      next: (res: any) => {
        if (res.isSuccess) { 
          this.totalCount = res.totalCount;
          this.totalPages = res.totalPages;
          this.posts = this.mapAndSortPosts(res.data);
          this.generatePageArray();
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  // --- Core Mapping Logic ---
  private mapAndSortPosts(rawPosts: any[]): any[] {
    const mapped = rawPosts.map(post => {
      const isShared = !!post.parentPost;
      
      let displayImage = null;
      if (post.attachments?.length > 0) displayImage = post.attachments[0].url;
      else if (post.parentPost?.attachments?.length > 0) displayImage = post.parentPost.attachments[0].url;

      // 1. استخراج بيانات القسم (الاسم واللون)
      const catTheme = CATEGORY_THEMES[post.category] || { label: 'General', color: '#999' };
      
      // 2. استخراج نوع البوست
      const postTypeName = this.getPostTypeName(post.postType, post.sourceType);

      return {
        ...post,
        ui: { 
          isShared,
          displayImage,
          authorImg: post.author?.imageUrl || 'assets/images/default-avatar.png',
          authorName: post.author?.fullName || post.author?.username || 'Member',
          title: post.title || post.parentPost?.title,
          content: post.content,
          sharedTitle: isShared ? post.parentPost.title : null,
          sharedContent: isShared ? post.parentPost.content : null,
          
          // UI Data (Colors & Labels)
          locationName: post.location?.neighborhood || post.location?.city,
          categoryName: catTheme.label,
          categoryColor: catTheme.color, // اللون الخاص بالقسم
          postTypeName: postTypeName
        }
      };
    });

    // الترتيب: الصور تظهر الأول
    return mapped.sort((a, b) => {
      const aHasImg = a.ui.displayImage ? 1 : 0;
      const bHasImg = b.ui.displayImage ? 1 : 0;
      return bHasImg - aHasImg;
    });
  }

  getPostTypeName(postType: number, sourceType: number): string {
    if (sourceType === 2) return 'RSS Article';
    if (postType === 1) return 'News';
    return 'Post';
  }

  generatePageArray() {
    let start = Math.max(1, this.currentPage - 1);
    let end = Math.min(this.totalPages, this.currentPage + 1);
    if (this.totalPages >= 3) {
        if (this.currentPage === 1) end = 3;
        else if (this.currentPage === this.totalPages) start = this.totalPages - 2;
    } else { start = 1; end = this.totalPages; }
    this.pagesArray = [];
    for (let i = start; i <= end; i++) this.pagesArray.push(i);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadPosts();
    }
  }

  onSearchInput(event: any) { this.searchSubject.next(event.target.value); }
  onLocationType(term: string) { if(term.length > 2) this.locationSearch$.next(term); }
  
  fetchLocations(term: string) {
    this.postsService.searchLocations(term).subscribe((res: any) => {
      if(res.isSuccess) this.locations = res.data;
    });
  }

  selectLocation(locId: number) {
    this.selectedLocationId = locId;
    this.currentPage = 1;
    this.loadPosts();
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedLocationId = null;
    this.currentPage = 1;
  }
}