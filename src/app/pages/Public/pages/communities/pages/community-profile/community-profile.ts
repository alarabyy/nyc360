import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../../environments/environment';
import { CommunityProfileService } from '../../services/community-profile';
import { CommunityDetails, CommunityMember, Post } from '../../models/community-profile';

@Component({
  selector: 'app-community-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community-profile.html',
  styleUrls: ['./community-profile.scss']
})
export class CommunityProfileComponent implements OnInit {
  
  private route = inject(ActivatedRoute);
  private profileService = inject(CommunityProfileService);
  private cdr = inject(ChangeDetectorRef);
  protected readonly environment = environment;

  // Data
  community: CommunityDetails | null = null;
  posts: Post[] = [];
  members: CommunityMember[] = [];
  
  slug: string = '';
  
  // UI State
  activeTab: string = 'discussion'; // 'discussion' | 'members' | 'about'
  isLoading = false;
  isMembersLoading = false;
  isJoined = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || '';
      if (this.slug) {
        this.loadData(this.slug);
      }
    });
  }

  loadData(slug: string) {
    this.isLoading = true;
    this.profileService.getCommunityBySlug(slug).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess && res.data) {
          this.community = res.data.community;
          
          if (res.data.posts && Array.isArray(res.data.posts.data)) {
            this.posts = res.data.posts.data;
          } else {
            this.posts = [];
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMembers() {
    if (!this.community) return;
    
    this.activeTab = 'members';
    this.isMembersLoading = true;

    this.profileService.getCommunityMembers(this.community.id).subscribe({
      next: (res) => {
        this.isMembersLoading = false;
        if (res.isSuccess && Array.isArray(res.data)) {
          this.members = res.data;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isMembersLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- Image Helpers ---

  resolveCommunityImage(url?: string): string {
    if (!url) return 'assets/images/placeholder-cover.jpg';
    if (url.includes('http')) return url;
    return `${environment.apiBaseUrl2}/communities/${url}`;
  }

  resolvePostImage(url?: string): string {
    if (!url) return '';
    if (url.includes('http')) return url;
    return `${environment.apiBaseUrl2}/${url}`;
  }

  // ✅ تم التعديل هنا: قراءة صور الأعضاء من مجلد 'avatars'
  resolveUserAvatar(url?: string | null): string {
    if (!url) return 'assets/images/default-avatar.png';
    if (url.includes('http')) return url;
    return `${environment.apiBaseUrl2}/avatars/${url}`; 
  }

  getAuthorName(author: any): string {
    if (!author) return 'NYC360 Member';
    return typeof author === 'string' ? author : author.name;
  }
}