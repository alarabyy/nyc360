import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../../environments/environment';
import { CommunityService } from '../../services/community';
import { CommunityPost, CommunitySuggestion } from '../../models/community';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './community.html',
  styleUrls: ['./community.scss']
})
export class CommunityComponent implements OnInit {
  
  private communityService = inject(CommunityService);
  private cdr = inject(ChangeDetectorRef);
  protected readonly environment = environment;

  // Data Containers
  suggestions: CommunitySuggestion[] = [];
  posts: CommunityPost[] = [];
  featuredPost: CommunityPost | null = null; 

  isLoading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.communityService.getCommunityHome(1, 20).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess && res.data) {
          // 1. Communities Cards
          this.suggestions = res.data.suggestions || [];
          
          // 2. Feed Posts
          const allPosts = res.data.feed?.data || [];
          if (allPosts.length > 0) {
            // أول بوست نعتبره المميز (Featured)
            this.featuredPost = allPosts[0];
            // الباقي للنقاشات (Discussions)
            this.posts = allPosts.slice(1);
          }
        }
        this.cdr.detectChanges(); // تحديث فوري
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  joinCommunity(comm: CommunitySuggestion) {
    if (comm.isJoined) return; // منع الضغط مرتين

    comm.isLoadingJoin = true; // إظهار لودينج على الزر
    
    this.communityService.joinCommunity(comm.id).subscribe({
      next: (res) => {
        comm.isLoadingJoin = false;
        if (res.isSuccess) {
          comm.isJoined = true; // تغيير الزر إلى "Joined"
          comm.memberCount++; // زيادة العداد وهمياً للمستخدم
        }
        this.cdr.detectChanges();
      },
      error: () => {
        comm.isLoadingJoin = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- Image Resolvers ---

  // 1. صور الكوميونتي (من مجلد communities)
  resolveCommunityAvatar(url?: string): string {
    if (!url) return 'assets/images/default-group.png';
    if (url.includes('http')) return url;
    // هنا نوجه المسار للمجلد الصحيح
    return `${environment.apiBaseUrl2}/communities/${url}`;
  }

  // 2. صور المقالات والمرفقات (عام)
  resolvePostImage(url?: string): string {
    if (!url) return 'assets/images/nyc-city.jpg'; // صورة احتياطية
    if (url.includes('http')) return url;
    // افتراضياً المرفقات تكون في مجلد attachments أو root
    return `${environment.apiBaseUrl2}/${url}`; 
  }
}