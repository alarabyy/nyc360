import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { ProfileService } from '../service/profile';
import { AuthService } from '../../../../Authentication/Service/auth';
import { UserProfileData, SocialPlatform } from '../models/profile';
import { Post } from '../../posts/models/posts';

export interface DashboardCard {
  type: string;
  status: string;
  title: string;
  sub: string;
  detail: string;
  action: string;
  isEvent?: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [DatePipe],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {

  protected readonly environment = environment;
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private datePipe = inject(DatePipe);
  private zone = inject(NgZone);


  // --- State ---
  user: UserProfileData | null = null;
  savedPosts: Post[] = [];
  currentUsername: string = '';

  isLoading = true;
  isSavedLoading = false;
  isOwner = false; // Determined by comparing logged in user and route param
  activeTab = 'posts';

  // UI Data -- keeping for display
  socialPlatforms = [
    { id: SocialPlatform.Facebook, name: 'Facebook', icon: 'bi-facebook' },
    { id: SocialPlatform.Twitter, name: 'Twitter', icon: 'bi-twitter-x' },
    { id: SocialPlatform.LinkedIn, name: 'LinkedIn', icon: 'bi-linkedin' },
    { id: SocialPlatform.Github, name: 'Github', icon: 'bi-github' },
    { id: SocialPlatform.Website, name: 'Website', icon: 'bi-globe' },
    { id: SocialPlatform.Other, name: 'Other', icon: 'bi-link-45deg' }
  ];

  topCards: DashboardCard[] = [
    { type: 'APPULD', status: 'waiting for approval', title: 'Product Manager', sub: '2 hours left', detail: 'stemsite company', action: 'check status' },
    { type: 'Booked', status: '+ 200XP', title: 'Tech NYC Mixer', sub: 'Today', detail: 'Seman House, Manhattan', action: 'Ticket QR', isEvent: true },
    { type: 'APPULD', status: 'waiting for approval', title: 'UX Designer', sub: '5 hours left', detail: 'Google Inc', action: 'check status' }
  ];

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const username = params.get('username');
      this.resolveIdentityAndLoad(username);
    });
  }

  resolveIdentityAndLoad(routeUsername: string | null) {
    const currentUser = this.authService.currentUser$.value;
    let targetUsername = routeUsername;
    if (!targetUsername) {
      targetUsername = currentUser?.username || '';
      this.isOwner = true;
    } else {
      this.isOwner = (currentUser?.username?.toLowerCase() === targetUsername.toLowerCase());
    }
    this.currentUsername = targetUsername || '';
    if (targetUsername) {
      this.loadProfile(targetUsername);
    } else {
      this.zone.run(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      });
    }
  }

  loadProfile(username: string) {
    this.isLoading = true;
    this.profileService.getProfile(username).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.isLoading = false;
          if (res.isSuccess && res.data) {
            this.user = res.data;
          }
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'saved' && this.isOwner) this.loadSavedPosts();
  }

  loadSavedPosts() {
    this.isSavedLoading = true;
    this.profileService.getSavedPosts().subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.isSavedLoading = false;
          if (res.isSuccess) this.savedPosts = res.data || [];
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.isSavedLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  shareProfile() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => alert('Profile link copied!'));
  }

  // --- Display Helpers ---
  resolveImage(url: string | null | undefined): string {
    if (!url) return '/assets/images/default-avatar.png';
    if (url.includes('http') || url.startsWith('data:')) return url;
    return `${environment.apiBaseUrl2}/avatars/${url}`;
  }

  resolveCover(url: string | null | undefined): string {
    if (!url) return '/assets/images/default-cover.jpg';
    if (url.includes('http') || url.startsWith('data:')) return url;
    return `${environment.apiBaseUrl2}/covers/${url}`;
  }

  resolvePostImage(post: any): string {
    const attachment = post.attachments?.[0];
    let url = attachment?.url || post.imageUrl;

    if (!url || url.trim() === '') return '/assets/images/default-post.jpg';

    // تنظيف المسار
    url = url.replace('@local://', '');

    // لو لينك خارجي
    if (url.startsWith('http')) return url;

    // لو صورة من السيرفر (posts)
    return `${this.environment.apiBaseUrl3}/${url}`;
  }

  getAuthorImage(author: any): string {
    if (author && author.imageUrl) {
      if (author.imageUrl.includes('http')) return author.imageUrl;
      return `${environment.apiBaseUrl2}/avatars/${author.imageUrl}`;
    }
    return '/assets/images/default-avatar.png';
  }

  getPlatformName(id: number): string { return this.socialPlatforms.find(p => p.id === id)?.name || 'Link'; }
  getPlatformIcon(id: number): string { return this.socialPlatforms.find(p => p.id === id)?.icon || 'bi-link'; }
  getAuthorName(author: any): string { return author?.name || author?.username || 'User'; }
  get displayName() { return this.user ? `${this.user.firstName} ${this.user.lastName}` : ''; }
  getInitials(name: string): string { return name ? name.substring(0, 2).toUpperCase() : 'CO'; }

}