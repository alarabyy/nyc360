import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { PostsService } from '../services/posts';
import { Post, PostCategoryList, InteractionType, Comment } from '../models/posts';
import { AuthService } from '../../../../Authentication/Service/auth';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './post-details.html',
  styleUrls: ['./post-details.scss']
})
export class PostDetailsComponent implements OnInit {
  
  protected readonly environment = environment;
  protected readonly InteractionType = InteractionType;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postsService = inject(PostsService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  post: Post | null = null;
  isLoading = true;
  errorMessage = '';
  categories = PostCategoryList;
  
  currentUserId: string | null = null;
  isAdmin = false;

  newCommentContent = '';

  ngOnInit() {
    // 1. مراقبة المستخدم (الآن الـ AuthService بيرجع id جاهز)
    this.authService.currentUser$.subscribe(user => {
      if (user && user.id) {
        this.currentUserId = user.id;
        this.isAdmin = Array.isArray(user.roles) ? user.roles.includes('Admin') : user.roles === 'Admin';
        console.log("✅ Current User ID in Post Details:", this.currentUserId);
      } else {
        this.currentUserId = null;
      }
    });

    // 2. تحميل البوست
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.loadPost(+id);
    });
  }

  loadPost(id: number) {
    this.isLoading = true;
    this.postsService.getPostById(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess && res.data) {
          this.post = res.data;
          // تهيئة المصفوفات لتجنب الأخطاء
          if (!this.post.stats) this.post.stats = { views:0, likes:0, dislikes:0, comments:0, shares:0 };
          if (!this.post.comments) this.post.comments = [];
        } else {
          this.errorMessage = res.error?.message || 'Post not found.';
        }
        this.cdr.detectChanges();
      },
      error: () => { 
        this.isLoading = false; 
        this.errorMessage = 'Network error.'; 
        this.cdr.detectChanges();
      }
    });
  }

  // --- التفاعل (Like/Dislike) ---
  toggleInteraction(type: InteractionType) {
    if (!this.post) return;

    if (!this.currentUserId) { 
      alert('Please login to interact.'); 
      // توجيه لصفحة تسجيل الدخول إذا لم يكن مسجلاً
      this.router.navigate(['/auth/login']);
      return; 
    }

    const oldInteraction = this.post.userInteraction;
    const oldStats = { ...this.post.stats! };

    // Optimistic Update (تحديث الواجهة فوراً)
    if (this.post.userInteraction === type) {
      this.post.userInteraction = null;
      if (type === InteractionType.Like) this.post.stats!.likes--;
      else this.post.stats!.dislikes--;
    } else {
      if (this.post.userInteraction === InteractionType.Like) this.post.stats!.likes--;
      if (this.post.userInteraction === InteractionType.Dislike) this.post.stats!.dislikes--;
      
      this.post.userInteraction = type;
      if (type === InteractionType.Like) this.post.stats!.likes++;
      else this.post.stats!.dislikes++;
    }

    this.postsService.interact(this.post.id, type).subscribe({
      error: (err) => {
        console.error('Interaction Failed:', err);
        // التراجع عند الخطأ
        this.post!.userInteraction = oldInteraction;
        this.post!.stats = oldStats;
        
        // التحقق من أخطاء الـ CORS أو السيرفر
        if (err.status === 0) {
          alert('Network Error: CORS or Server Down.');
        } else {
          alert('Failed to interact. Try again.');
        }
      }
    });
  }

  // --- التعليقات ---
  submitComment() {
    if (!this.newCommentContent.trim() || !this.post) return;
    if (!this.currentUserId) { 
      alert('Please login to comment.'); 
      this.router.navigate(['/auth/login']);
      return; 
    }
    
    this.postsService.addComment(this.post.id, this.newCommentContent).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // التأكد من أن التعليقات مصفوفة قبل الإضافة
          if (!this.post!.comments) this.post!.comments = [];
          this.post!.comments.unshift(res.data as any); 
          this.post!.stats!.comments++;
          this.newCommentContent = '';
        }
      },
      error: (err) => {
        console.error(err);
        alert('Failed to post comment.');
      }
    });
  }

  // --- الردود ---
  submitReply(parentComment: Comment, replyContent: string) {
    if (!replyContent.trim() || !this.post) return;
    if (!this.currentUserId) { alert('Please login to reply.'); return; }

    this.postsService.addComment(this.post.id, replyContent, parentComment.id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          if (!parentComment.replies) parentComment.replies = [];
          parentComment.replies.push(res.data as any);
          parentComment.isReplying = false;
          this.post!.stats!.comments++;
        }
      }
    });
  }

  // --- الصلاحيات ---
  get canEdit(): boolean {
    if (!this.post?.author || !this.currentUserId) return false;
    return String(this.post.author.id) === String(this.currentUserId) || this.isAdmin;
  }

  getCategoryName(id: number): string {
    return this.categories.find(c => c.id === id)?.name || 'General';
  }

  onDelete() {
    if (this.post && confirm('Delete this post?')) {
      this.postsService.deletePost(this.post.id).subscribe({
        next: () => this.router.navigate(['/admin/posts']),
        error: () => alert('Failed to delete.')
      });
    }
  }
}