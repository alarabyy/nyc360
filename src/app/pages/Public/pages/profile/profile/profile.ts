import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { ProfileService } from '../service/profile';
import { AuthService } from '../../../../Authentication/Service/auth';
import { UserProfileData, SocialPlatform } from '../models/profile';
import { Post } from '../../posts/models/posts';
import { ToastService } from '../../../../../shared/services/toast.service';

export interface DashboardCard {
  type: string;
  status: string;
  title: string;
  sub: string;
  detail: string;
  action: string;
  isEvent?: boolean;
}

import { FormsModule } from '@angular/forms'; // Added Import

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // Added FormsModule
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
            this.initBasicInfo();
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



  private toastService = inject(ToastService);

  // Manage State
  // Manage State
  editingLink: { id: number, platform: number, url: string } | null = null;
  // editingPos moved to below with full type definition or as any to avoid conflict


  // --- Manage Actions ---

  // Social Links
  // --- Full Update Logic ---

  // 1. Images
  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profileService.uploadAvatar(file).subscribe((res: any) => {
        if (res.isSuccess) {
          this.toastService.success('Avatar updated!');
          this.loadProfile(this.currentUsername);
        } else {
          this.toastService.error('Failed to update avatar');
        }
      });
    }
  }

  onCoverSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profileService.uploadCover(file).subscribe((res: any) => {
        if (res.isSuccess) {
          this.toastService.success('Cover updated!');
          this.loadProfile(this.currentUsername);
        } else {
          this.toastService.error('Failed to update cover');
        }
      });
    }
  }

  // 2. Basic Info
  // Temp state for key edits
  basicInfo: any = {};

  // Method to initialize edit form data when tab switches or user loads
  initBasicInfo() {
    if (this.user) {
      this.basicInfo = {
        FirstName: this.user.firstName,
        LastName: this.user.lastName,
        Headline: this.user.headline,
        Bio: this.user.bio,
        LocationId: this.user.locationId || 0
      };
    }
  }

  saveBasicInfo() {
    if (!this.basicInfo.FirstName) return;
    this.profileService.updateBasicInfo(this.basicInfo).subscribe((res: any) => {
      if (res.isSuccess) {
        this.toastService.success('Profile info updated');
        this.loadProfile(this.currentUsername);
      } else {
        this.toastService.error('Failed to update info');
      }
    });
  }

  // 3. Social Links (Add New)
  newLink: any = { platform: 0, url: '' };
  isAddingLink = false;

  toggleAddLink() { this.isAddingLink = !this.isAddingLink; }

  addSocialLink() {
    if (!this.newLink.url) return;
    const dto = {
      Platform: Number(this.newLink.platform),
      Url: this.newLink.url
    };
    this.profileService.addSocialLink(dto).subscribe((res: any) => {
      if (res.isSuccess) {
        this.toastService.success('Link added');
        this.newLink = { platform: 0, url: '' };
        this.isAddingLink = false;
        this.loadProfile(this.currentUsername);
      } else {
        this.toastService.error('Failed to add link');
      }
    });
  }

  // 4. Positions (Add New)
  // Simplified for demo, ideally needs Date inputs
  newPosition: any = { Title: '', Company: '', StartDate: new Date().toISOString(), IsCurrent: true };
  isAddingPos = false;

  toggleAddPos() { this.isAddingPos = !this.isAddingPos; }

  addPosition() {
    if (!this.newPosition.Title || !this.newPosition.Company) return;
    this.newPosition.StartDate = new Date().toISOString(); // Default to now for quick add
    this.profileService.addPosition(this.newPosition).subscribe((res: any) => {
      if (res.isSuccess) {
        this.toastService.success('Position added');
        this.isAddingPos = false;
        this.newPosition = { Title: '', Company: '', StartDate: new Date().toISOString(), IsCurrent: true };
        this.loadProfile(this.currentUsername);
      } else {
        this.toastService.error('Failed to add position');
      }
    });
  }

  // 5. Education (View/Add/Delete - New Feature)
  // Simplified
  newEdu: any = { School: '', Degree: '', FieldOfStudy: '', StartDate: new Date().toISOString() };
  isAddingEdu = false;

  toggleAddEdu() { this.isAddingEdu = !this.isAddingEdu; }

  addEducation() {
    if (!this.newEdu.School) return;
    this.profileService.addEducation(this.newEdu).subscribe((res: any) => {
      if (res.isSuccess) {
        this.toastService.success('Education added');
        this.isAddingEdu = false;
        this.newEdu = { School: '', Degree: '', FieldOfStudy: '', StartDate: new Date().toISOString() };
        this.loadProfile(this.currentUsername);
      } else {
        this.toastService.error('Failed to add education');
      }
    });
  }

  deleteEducation(id: number) {
    if (!confirm('Delete this education?')) return;
    this.profileService.deleteEducation(id).subscribe((res: any) => {
      if (res.isSuccess) {
        this.toastService.success('Education deleted');
        this.loadProfile(this.currentUsername);
      }
    });
  }


  // --- Existing Manage Actions (Refined) ---

  // Social Links
  editLink(link: any) {
    this.editingLink = { id: link.id || link.linkId, platform: link.platform, url: link.url };
  }

  cancelEditLink() {
    this.editingLink = null;
  }

  saveLink() {
    if (!this.editingLink) return;
    const dto = {
      LinkId: this.editingLink.id,
      Platform: Number(this.editingLink.platform),
      Url: this.editingLink.url
    };

    if (this.editingLink.id) {
      this.profileService.updateSocialLink(dto).subscribe((res: any) => {
        if (res.isSuccess) {
          this.toastService.success('Link updated');
          this.editingLink = null;
          this.loadProfile(this.currentUsername);
        } else {
          this.toastService.error('Failed to update link');
        }
      });
    }
  }

  deleteLink(id: number) {
    if (!confirm('Delete this social link?')) return;
    this.profileService.deleteSocialLink(id).subscribe((res: any) => {
      if (res.isSuccess) {
        this.toastService.success('Link deleted');
        if (this.user) {
          this.user.socialLinks = this.user.socialLinks.filter(l => (l.id !== id && l.linkId !== id));
        }
      } else {
        this.toastService.error('Failed to delete link');
      }
    });
  }

  // Positions
  editingPos: any = null;

  editPos(pos: any) {
    // Clone to avoid live editing before save
    this.editingPos = {
      PositionId: pos.id,
      Title: pos.title,
      Company: pos.company,
      StartDate: pos.startDate || new Date().toISOString(),
      EndDate: pos.endDate,
      IsCurrent: pos.isCurrent
    };
  }

  cancelEditPos() {
    this.editingPos = null;
  }

  savePosition() {
    if (!this.editingPos) return;
    this.profileService.updatePosition(this.editingPos).subscribe((res: any) => {
      if (res.isSuccess) {
        this.toastService.success('Position updated');
        this.editingPos = null;
        this.loadProfile(this.currentUsername);
      } else {
        this.toastService.error('Failed to update position');
      }
    });
  }

  deletePosition(id: number) {
    if (!confirm('Delete this position?')) return;
    this.profileService.deletePosition(id).subscribe((res: any) => {
      if (res.isSuccess) {
        this.toastService.success('Position deleted');
        this.loadProfile(this.currentUsername);
      } else {
        this.toastService.error('Failed to delete position');
      }
    });
  }

  // Education
  editingEdu: any = null;

  editEdu(edu: any) {
    this.editingEdu = {
      EducationId: edu.id,
      School: edu.school,
      Degree: edu.degree,
      FieldOfStudy: edu.fieldOfStudy,
      StartDate: edu.startDate || new Date().toISOString(),
      EndDate: edu.endDate
    };
  }

  cancelEditEdu() {
    this.editingEdu = null;
  }

  saveEducation() {
    if (!this.editingEdu) return;
    this.profileService.updateEducation(this.editingEdu).subscribe((res: any) => {
      if (res.isSuccess) {
        this.toastService.success('Education updated');
        this.editingEdu = null;
        this.loadProfile(this.currentUsername);
      } else {
        this.toastService.error('Failed to update education');
      }
    });
  }

  shareProfile() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => this.toastService.success('Profile link copied!'));
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

  get isVerified(): boolean {
    if (!this.user || !this.user.stats) return false;

    // Check if stats say verified
    const verifiedByStats = this.user.stats.isVerified === true;

    // Check if user is a visitor (id: 4 or name: "NYC Visitors")
    const isVisitor = this.user.tags?.some(tag =>
      tag.id === 4 || tag.name?.toLowerCase().includes('visitor')
    );

    return verifiedByStats && !isVisitor;
  }

  getInitials(name: string): string { return name ? name.substring(0, 2).toUpperCase() : 'CO'; }

}