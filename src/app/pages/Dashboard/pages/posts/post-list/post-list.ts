import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Post, PostCategoryList } from '../models/posts'; // Ensure correct path
import { PostsService } from '../services/posts'; // Ensure correct path
import { AuthService } from '../../../../Authentication/Service/auth'; // Ensure correct path

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './post-list.html',
  styleUrls: ['./post-list.scss']
})
export class PostListComponent implements OnInit {
  
  protected readonly environment = environment;
  
  // Dependencies
  private postsService = inject(PostsService);
  private authService = inject(AuthService); 
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // State
  posts: Post[] = [];
  categories = PostCategoryList;
  isLoading = true;
  errorMessage = '';
  selectedCategoryId: number | null = null;

  // User Info
  currentUserId: string | null = null;
  isAdmin = false;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Adjust property access based on your specific User model structure from AuthService
        this.currentUserId = user.id || user.userId || user.sub; 
        this.isAdmin = user.roles?.includes('Admin') || false;
      }
    });

    this.route.queryParams.subscribe(params => {
      const catId = params['category'];
      this.selectedCategoryId = catId ? Number(catId) : null;
      this.loadPosts();
    });
  }

  loadPosts() {
    this.isLoading = true;
    const categoryParam = this.selectedCategoryId !== null ? this.selectedCategoryId : undefined;

    this.postsService.getAllPosts(categoryParam).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.posts = Array.isArray(res.data) ? res.data : [];
          this.cdr.detectChanges();
        } else {
          this.errorMessage = res.error?.message || 'Failed to load posts.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Network error.';
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  filterByCategory(id: number | null) {
    this.selectedCategoryId = id;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: id },
      queryParamsHandling: 'merge'
    });
  }

  // ✅ التصحيح هنا: استخدام post.author?.id بدلاً من post.userId
  canEditPost(post: Post): boolean {
    if (!this.currentUserId || !post.author) return false;
    
    // تحويل الـ IDs إلى String للمقارنة الآمنة
    return String(post.author.id) === String(this.currentUserId) || this.isAdmin;
  }

  getCategoryName(id: number): string {
    return this.categories.find(c => c.id === id)?.name || 'General';
  }

  onDelete(id: number) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postsService.deletePost(id).subscribe({
        next: () => this.loadPosts(),
        error: () => alert('Failed to delete post.')
      });
    }
  }
}