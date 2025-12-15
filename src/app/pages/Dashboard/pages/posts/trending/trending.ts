import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TrendingService } from '../services/trending';
import { environment } from '../../../../../environments/environment';
import { CategoryMap, PostAuthor, TrendingPost } from '../models/trending';

@Component({
  selector: 'app-trending',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trending.html',
  styleUrls: ['./trending.scss']
})
export class TrendingComponent implements OnInit {
  
  private trendingService = inject(TrendingService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  protected readonly environment = environment;

  // State
  posts: TrendingPost[] = [];
  isLoading = true;
  hasMore = true;
  currentPage = 1;
  readonly pageSize = 10; // قللنا العدد شوية عشان التحميل يكون أسرع في القائمة الطويلة

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    if (this.currentPage === 1) this.isLoading = true;

    this.trendingService.getTrendingPosts(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          // دمج البيانات
          const newPosts = res.data;
          this.posts = [...this.posts, ...newPosts];

          // *** الترتيب: ضمان أن الأحدث يظهر في الأعلى ***
          this.posts.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          
          if (this.currentPage >= res.totalPages) {
            this.hasMore = false;
          }
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading trending:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMore() {
    if (this.hasMore && !this.isLoading) {
      this.currentPage++;
      this.loadPosts();
    }
  }

  // --- Helpers ---

  openDetails(id: number) {
    this.router.navigate(['/posts/details', id]);
  }

  getCategoryName(id: number): string {
    return CategoryMap[id] || 'General';
  }

  getPostImage(post: TrendingPost): string {
    if (post.attachments && post.attachments.length > 0) {
      let url = post.attachments[0].url;
      if (url.includes('@local://')) {
        const filename = url.replace('@local://', '');
        return `${this.environment.apiBaseUrl3}/${filename}`;
      }
      return url;
    }
    return 'assets/images/news-placeholder.jpg'; 
  }

  getAuthorName(author: PostAuthor): string {
    if (!author) return 'NYC360 Editor';
    return author.name || author.fullName || author.username || 'Unknown';
  }

  getAuthorImage(url: string | null | undefined): string {
    if (!url) return 'assets/images/avatar-placeholder.png';
    if (url.includes('@local://')) {
      const filename = url.replace('@local://', '');
      return `${this.environment.apiBaseUrl3}/${filename}`;
    }
    return url;
  }
}