import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CategoryPost } from '../models/category-home.models';
import { CategoryHomeService } from '../service/category-home.service';
import { CATEGORY_THEMES } from '../../feeds/models/categories';

@Component({
  selector: 'app-category-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-home.component.html',
  styleUrls: ['./category-home.component.scss']
})
export class CategoryHomeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private homeService = inject(CategoryHomeService);
  private cdr = inject(ChangeDetectorRef);

  // --- Data Buckets ---
  heroPost: CategoryPost | null = null;       // 1. الصورة الكبيرة (Hero)
  topSidePosts: CategoryPost[] = [];          // 2. القائمة الجانبية العلوية
  gridPosts: CategoryPost[] = [];             // 3. شبكة الصور (Latest Grid)
  moreNewsPosts: CategoryPost[] = [];         // 4. القائمة السفلية (More News)
  textOnlyPosts: CategoryPost[] = [];         // 5. بوستات بدون صور (التصميم الجديد في الأسفل)
  trendingPosts: CategoryPost[] = [];         // 6. التريند (Sidebar)
  
  // --- Theme ---
  activeTheme: any = null;
  isLoading = true;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const path = params['categoryPath'];
      this.resolveCategory(path);
    });
  }

  resolveCategory(path: string) {
    this.isLoading = true;
    const categoryEntry = Object.entries(CATEGORY_THEMES).find(([key, val]: any) => val.path === path);
    
    if (categoryEntry) {
      this.activeTheme = categoryEntry[1];
      const divisionId = Number(categoryEntry[0]);
      this.fetchData(divisionId);
    } else {
      this.activeTheme = { label: 'News', color: '#333' }; // Fallback
      this.isLoading = false;
    }
  }

  fetchData(divisionId: number) {
    // نطلب عدد أكبر قليلاً لملء الصفحة
    this.homeService.getCategoryHomeData(divisionId, 25).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          // دمج المصادر لعمل الفرز اليدوي
          const allIncoming = [...(res.data.featured || []), ...(res.data.latest || [])];

          // 1. فصل البوستات: "بصور" vs "بدون صور"
          const withImages = allIncoming.filter(p => this.hasImage(p));
          const noImages = allIncoming.filter(p => !this.hasImage(p));

          // 2. توزيع البوستات التي لها صور على الأقسام العلوية
          this.heroPost = withImages[0] || null;
          this.topSidePosts = withImages.slice(1, 5); // 4 بوستات جانبية
          this.gridPosts = withImages.slice(5, 8);    // 3 بوستات في الشبكة
          this.moreNewsPosts = withImages.slice(8, 12); // 4 بوستات في القائمة السفلية

          // 3. وضع البوستات النصية في القسم الجديد بالأسفل
          this.textOnlyPosts = noImages;

          // 4. التريند
          this.trendingPosts = res.data.trending || [];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // التحقق من وجود صورة
  hasImage(post: CategoryPost): boolean {
    const direct = !!(post.attachments && post.attachments.length > 0);
    const parent = !!(post.parentPost?.attachments && post.parentPost.attachments.length > 0);
    return direct || parent;
  }

  // جلب رابط الصورة
  getImg(post: CategoryPost): string {
    if (post.attachments && post.attachments.length > 0) return post.attachments[0].url;
    if (post.parentPost?.attachments && post.parentPost.attachments.length > 0) return post.parentPost.attachments[0].url;
    return 'assets/images/placeholder.jpg'; 
  }

  get dynamicDescription(): string {
    return `Discover the latest updates, opportunities, and insights in ${this.activeTheme?.label || 'NYC'}.`;
  }
}