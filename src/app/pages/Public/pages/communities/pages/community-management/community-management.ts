import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../../../Authentication/Service/auth';
import { CommunityProfileService } from '../../services/community-profile';
import { CommunityDetails, CommunityMember, CommunityRole } from '../../models/community-profile';
import { ToastService } from '../../../../../../shared/services/toast.service';

interface ManagementTab {
    id: string;
    label: string;
    icon: string;
}

@Component({
    selector: 'app-community-management',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './community-management.html',
    styleUrls: ['./community-management.scss']
})
export class CommunityManagementComponent implements OnInit {

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private profileService = inject(CommunityProfileService);
    private authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);
    private toastService = inject(ToastService);
    protected readonly environment = environment;

    // Data
    community: CommunityDetails | null = null;
    members: CommunityMember[] = [];
    slug: string = '';

    // Permissions
    memberRole: number | null = null;
    ownerId: number = 0;

    // UI State
    activeTab: string = 'overview';
    isLoading = false;
    isMembersLoading = false;
    isSaving = false;
    isTransferring = false;

    // Ownership Transfer Modal
    showTransferModal = false;
    memberSearchQuery = '';
    selectedNewOwner: CommunityMember | null = null;

    // Edit Form Data
    editForm = {
        name: '',
        description: '',
        type: 0
    };

    // Tabs Configuration
    tabs: ManagementTab[] = [
        { id: 'overview', label: 'Overview', icon: 'bi-grid-1x2' },
        { id: 'members', label: 'Members', icon: 'bi-people' },
        { id: 'settings', label: 'Settings', icon: 'bi-gear' },
        { id: 'danger', label: 'Danger Zone', icon: 'bi-exclamation-triangle' }
    ];

    // Getters
    get isOwner(): boolean {
        return this.memberRole === CommunityRole.Owner;
    }

    get isAdminOrOwner(): boolean {
        return this.memberRole === CommunityRole.Owner || this.memberRole === CommunityRole.Moderator;
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.slug = params.get('slug') || '';
            if (this.slug) this.loadCommunity();
        });
    }

    loadCommunity() {
        this.isLoading = true;
        this.profileService.getCommunityBySlug(this.slug).subscribe({
            next: (res) => {
                this.isLoading = false;
                if (res.isSuccess && res.data) {
                    this.community = res.data.community;
                    this.ownerId = res.data.ownerId;
                    this.memberRole = res.data.memberRole ? Number(res.data.memberRole) : null;

                    // Redirect if not owner
                    if (!this.isOwner) {
                        this.toastService.error('You do not have permission to manage this community.');
                        this.router.navigate(['/public/community', this.slug]);
                        return;
                    }

                    // Populate edit form
                    this.editForm = {
                        name: this.community.name,
                        description: this.community.description || '',
                        type: this.community.type
                    };
                }
                this.cdr.detectChanges();
            },
            error: () => {
                this.isLoading = false;
                this.toastService.error('Failed to load community.');
                this.cdr.detectChanges();
            }
        });
    }

    setTab(tabId: string) {
        this.activeTab = tabId;
        if (tabId === 'members') {
            this.loadMembers();
        }
    }

    loadMembers() {
        if (!this.community) return;
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

    // --- Member Management ---
    onRemoveMember(memberId: number) {
        if (!this.community || !confirm('Are you sure you want to remove this member?')) return;

        this.profileService.removeMember(this.community.id, memberId).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.members = this.members.filter(m => m.userId !== memberId);
                    this.toastService.success('Member removed successfully.');
                } else {
                    this.toastService.error(res.error?.message || 'Failed to remove member.');
                }
                this.cdr.detectChanges();
            },
            error: () => {
                this.toastService.error('Error removing member.');
                this.cdr.detectChanges();
            }
        });
    }

    onPromoteToModerator(memberId: number) {
        this.onUpdateRole(memberId, CommunityRole.Moderator, 'Promoted to Moderator');
    }

    onDemoteToMember(memberId: number) {
        this.onUpdateRole(memberId, CommunityRole.Member, 'Demoted to Member');
    }

    private onUpdateRole(memberId: number, newRole: CommunityRole, successMsg: string) {
        if (!this.community) return;

        this.profileService.updateMemberRole(this.community.id, memberId, newRole).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.toastService.success(successMsg);
                    // Update member role in the list locally
                    const member = this.members.find(m => m.userId === memberId);
                    if (member) {
                        member.role = newRole === CommunityRole.Moderator ? 'Moderator' : 'Member';
                    }
                } else {
                    this.toastService.error(res.error?.message || 'Failed to update role');
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.toastService.error('Error updating member role');
                this.cdr.detectChanges();
            }
        });
    }

    // --- Settings ---
    onSaveSettings() {
        if (!this.community) return;
        this.isSaving = true;

        // TODO: Implement actual update API when available
        setTimeout(() => {
            this.isSaving = false;
            this.toastService.success('Settings saved successfully!');
            this.cdr.detectChanges();
        }, 1000);
    }

    // --- Danger Zone ---
    onDisbandCommunity() {
        if (!this.community) return;

        const confirmText = prompt(`Type "${this.community.name}" to confirm you want to DISBAND this community. This action is irreversible:`);
        if (confirmText !== this.community.name) {
            this.toastService.error('Community name did not match. Action cancelled.');
            return;
        }

        this.isLoading = true;
        this.profileService.disbandCommunity(this.community.id).subscribe({
            next: (res) => {
                this.isLoading = false;
                if (res.isSuccess) {
                    this.toastService.success('Community has been disbanded.');
                    this.router.navigate(['/public/community']);
                } else {
                    this.toastService.error(res.error?.message || 'Failed to disband community.');
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.isLoading = false;
                this.toastService.error('Error disbanding community');
                this.cdr.detectChanges();
            }
        });
    }

    onTransferOwnership() {
        if (!this.community) return;
        this.showTransferModal = true;
        this.memberSearchQuery = '';
        this.selectedNewOwner = null;

        // Ensure members are loaded
        if (this.members.length === 0) {
            this.loadMembers();
        }
    }

    get filteredMembers(): CommunityMember[] {
        if (!this.memberSearchQuery.trim()) {
            return this.members.filter(m => m.userId !== this.ownerId);
        }
        const query = this.memberSearchQuery.toLowerCase();
        return this.members.filter(m =>
            m.userId !== this.ownerId &&
            (m.name.toLowerCase().includes(query))
        );
    }

    onSelectNewOwner(member: CommunityMember) {
        this.selectedNewOwner = member;
    }

    onConfirmTransfer() {
        if (!this.community || !this.selectedNewOwner) {
            console.error('Transfer blocked: missing community or owner');
            return;
        }

        console.log('Initiating transfer to:', this.selectedNewOwner.userId);
        this.isTransferring = true;
        this.cdr.detectChanges();

        this.profileService.transferOwnership(this.community.id, this.selectedNewOwner.userId).subscribe({
            next: (res) => {
                console.log('Transfer Response:', res);
                this.isTransferring = false;
                if (res.isSuccess) {
                    this.toastService.success('Ownership transferred successfully!');
                    this.showTransferModal = false;
                    this.router.navigate(['/public/community', this.slug]);
                } else {
                    this.toastService.error(res.error?.message || 'Failed to transfer ownership');
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Transfer API Error:', err);
                this.isTransferring = false;
                this.toastService.error('Error transferring ownership');
                this.cdr.detectChanges();
            }
        });
    }

    // --- Helpers ---
    resolveCommunityImage(url?: string): string {
        if (!url) return 'assets/images/placeholder-cover.jpg';
        if (url.includes('http')) return url;
        return `${environment.apiBaseUrl2}/communities/${url}`;
    }

    resolveUserAvatar(url?: string | null): string {
        if (!url) return 'assets/images/default-avatar.png';
        if (url.includes('http')) return url;
        return `${environment.apiBaseUrl2}/avatars/${url}`;
    }

    goBack() {
        this.router.navigate(['/public/community', this.slug]);
    }
}
