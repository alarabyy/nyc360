import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, Location, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../../../Authentication/Service/auth';
import { CommunityRequestsComponent } from '../community-requests/community-requests';
import { CommunityProfileService } from '../../services/community-profile';
import { CommunityDetails, CommunityMember, Post } from '../../models/community-profile';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { PostService } from '../../services/post';
import { InteractionType, PostComment } from '../../models/post-details';

// Enum Matching Backend
// Enum مطابق للـ Backend
export enum CommunityRole {
  Owner = 1,
  Moderator = 2,
  Member = 3,
}

// Extends Post locally to support UI states
// توسيع Post محلياً لدعم حالات الـ UI
interface ExtendedPost extends Omit<Post, 'stats'> {
  stats: { likes: number; comments: number; shares: number; dislikes?: number };
  comments?: PostComment[];
  currentUserInteraction?: number;
  showComments?: boolean;
  newCommentContent?: string;
  activeReplyId?: number | null;
}

@Component({
  selector: 'app-community-profile',
  standalone: true,
  imports: [CommonModule, CommunityRequestsComponent, RouterLink, FormsModule],
  templateUrl: './community-profile.html',
  styleUrls: ['./community-profile.scss'],
})
export class CommunityProfileComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private profileService = inject(CommunityProfileService);
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private location = inject(Location);
  private toastService = inject(ToastService);
  private platformId = inject(PLATFORM_ID);

  protected readonly environment = environment;
  protected readonly InteractionType = InteractionType;

  // Data
  community: CommunityDetails | null = null;
  posts: ExtendedPost[] = [];
  members: CommunityMember[] = [];

  // Roles & Permissions
  ownerId = 0;
  memberRole: number | null = null; // 1=Owner, 2=Mod, 3=Member, null=Not Joined
  currentUserId: string | null = null;

  // UI State
  activeTab = 'discussion';
  isLoading = false;
  isMembersLoading = false;
  isJoinLoading = false;
  shareSuccess = false;

  // Subscriptions
  private subs = new Subscription();

  // Getters for Logic
  get isJoined(): boolean {
    return !!this.memberRole && this.memberRole > 0;
  }

  get isOwner(): boolean {
    return this.memberRole === CommunityRole.Owner;
  }

  get isAdminOrOwner(): boolean {
    return this.memberRole === CommunityRole.Owner || this.memberRole === CommunityRole.Moderator;
  }

  ngOnInit() {
    // auth
    this.subs.add(
      this.authService.currentUser$.subscribe((user) => {
        this.currentUserId = user ? user.id : null;
      }),
    );

    // route params
    this.subs.add(
      this.route.paramMap.subscribe((params) => {
        const slug = params.get('slug');
        if (slug) this.loadData(slug);
      }),
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  loadData(slug: string) {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.subs.add(
      this.profileService.getCommunityBySlug(slug).subscribe({
        next: (res) => {
          this.isLoading = false;

          if (res.isSuccess && res.data) {
            this.community = res.data.community;
            this.ownerId = res.data.ownerId;
            this.memberRole = res.data.memberRole ? Number(res.data.memberRole) : null;

            const list = res.data.posts?.data;
            if (Array.isArray(list)) {
              this.posts = list.map((p: any) => ({
                ...p,
                comments: [],
                currentUserInteraction: p.currentUserInteraction || InteractionType.None,
                showComments: false,
                newCommentContent: '',
                activeReplyId: null,
              }));
            } else {
              this.posts = [];
            }
          }

          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      }),
    );
  }

  loadMembers() {
    if (!this.community) return;

    this.activeTab = 'members';
    this.isMembersLoading = true;
    this.cdr.detectChanges();

    this.subs.add(
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
        },
      }),
    );
  }

  // --- Actions ---

  onJoinCommunity() {
    if (!this.community || this.isJoined) return;

    this.isJoinLoading = true;
    this.cdr.detectChanges();

    this.subs.add(
      this.profileService.joinCommunity(this.community.id).subscribe({
        next: (res) => {
          this.isJoinLoading = false;

          if (res.isSuccess) {
            this.memberRole = CommunityRole.Member;
            if (this.community) this.community.memberCount++;
            this.toastService.success('You have joined the community!');
          } else {
            this.toastService.error((res as any).message || 'Failed to join.');
          }

          this.cdr.detectChanges();
        },
        error: () => {
          this.isJoinLoading = false;
          this.toastService.error('An error occurred.');
          this.cdr.detectChanges();
        },
      }),
    );
  }

  onLeaveCommunity() {
    if (!this.community || !confirm('Are you sure you want to leave this community?')) return;

    this.isJoinLoading = true;
    this.cdr.detectChanges();

    this.subs.add(
      this.profileService.leaveCommunity(this.community.id).subscribe({
        next: (res) => {
          this.isJoinLoading = false;

          if (res.isSuccess) {
            this.memberRole = null;
            if (this.community) this.community.memberCount--;
            this.toastService.success('You have left the community.');
          } else {
            this.toastService.error('Failed to leave community.');
          }

          this.cdr.detectChanges();
        },
        error: () => {
          this.isJoinLoading = false;
          this.cdr.detectChanges();
        },
      }),
    );
  }

  onRemoveMember(memberId: number) {
    if (!this.community || !confirm('Are you sure you want to remove this member?')) return;

    this.subs.add(
      this.profileService.removeMember(this.community.id, memberId).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.members = this.members.filter((m) => m.userId !== memberId);
            this.toastService.success('Member removed successfully.');
          } else {
            this.toastService.error(res.error?.message || 'Failed to remove member.');
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.toastService.error('Error removing member.');
          this.cdr.detectChanges();
        },
      }),
    );
  }

  // --- Interaction Logic (Likes/Comments) ---

  toggleInteraction(post: ExtendedPost, type: InteractionType) {
    if (!this.currentUserId) {
      alert('Please login to interact');
      return;
    }

    const oldInteraction = post.currentUserInteraction;

    // Optimistic update
    if (post.currentUserInteraction === type) {
      post.currentUserInteraction = InteractionType.None;

      if (type === InteractionType.Like) post.stats.likes--;
      if (type === InteractionType.Dislike) post.stats.dislikes = (post.stats.dislikes || 0) - 1;
    } else {
      if (post.currentUserInteraction === InteractionType.Like) post.stats.likes--;
      if (post.currentUserInteraction === InteractionType.Dislike) {
        post.stats.dislikes = (post.stats.dislikes || 0) - 1;
      }

      if (type === InteractionType.Like) post.stats.likes++;
      if (type === InteractionType.Dislike) post.stats.dislikes = (post.stats.dislikes || 0) + 1;

      post.currentUserInteraction = type;
    }

    this.subs.add(
      this.postService.interact(post.id, type).subscribe({
        error: () => {
          post.currentUserInteraction = oldInteraction;
          this.cdr.detectChanges();
        },
      }),
    );
  }

  toggleComments(post: ExtendedPost) {
    post.showComments = !post.showComments;

    if (post.showComments && (!post.comments || post.comments.length === 0)) {
      this.loadCommentsForPost(post);
    }
  }

  loadCommentsForPost(post: ExtendedPost) {
    this.subs.add(
      this.postService.getPostDetails(post.id).subscribe((res) => {
        if (res.isSuccess && res.data?.comments) {
          post.comments = res.data.comments;
          this.cdr.detectChanges();
        }
      }),
    );
  }

  submitComment(post: ExtendedPost) {
    const content = post.newCommentContent?.trim();
    if (!content) return;

    this.subs.add(
      this.postService.addComment(post.id, content).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            post.comments ||= [];
            post.comments.unshift(res.data);
            post.stats.comments++;
            post.newCommentContent = '';
            post.showComments = true;
            this.cdr.detectChanges();
          }
        },
      }),
    );
  }

  openReplyInput(post: ExtendedPost, commentId: number) {
    post.activeReplyId = post.activeReplyId === commentId ? null : commentId;
  }

  submitReply(post: ExtendedPost, parentComment: PostComment, content: string) {
    const body = content.trim();
    if (!body) return;

    this.subs.add(
      this.postService.addComment(post.id, body, parentComment.id).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            parentComment.replies ||= [];
            parentComment.replies.push(res.data);
            post.stats.comments++;
            post.activeReplyId = null;
            this.cdr.detectChanges();
          }
        },
      }),
    );
  }

  // --- Share ---

  onShare() {
    if (!isPlatformBrowser(this.platformId)) return;

    const url = window.location.href;
    const title = this.community?.name || 'Join this Community on NYC360';
    const text = this.community?.description || 'Check out this amazing community!';

    if (navigator.share) {
      navigator.share({ title, text, url }).catch((err) => console.log('Error sharing', err));
      return;
    }

    this.copyToClipboard(url);
  }

  private copyToClipboard(text: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    navigator.clipboard.writeText(text).then(() => {
      this.shareSuccess = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.shareSuccess = false;
        this.cdr.detectChanges();
      }, 2000);
    });
  }

  // --- Helpers ---

  resolveCommunityImage(url?: string): string {
    if (!url) return 'assets/images/placeholder-cover.jpg';
    if (url.includes('http')) return url;
    return `${environment.apiBaseUrl2}/communities/${url}`;
  }

  resolvePostImage(url?: string): string {
    if (!url || url.trim() === '') return '';

    const cleanUrl = url.replace('@local://', '');
    if (cleanUrl.startsWith('http')) return cleanUrl;

    return `${this.environment.apiBaseUrl3}/${cleanUrl}`;
  }

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
