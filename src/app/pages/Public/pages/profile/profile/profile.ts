import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { ProfileService } from '../service/profile';
import { AuthService } from '../../../../Authentication/Service/auth';
import { 
  UserProfileDto, UserType, RegularProfileDto, OrganizationProfileDto, 
  AdminProfileDto, SocialPlatform, UserSocialLinkDto, UserStatsDto 
} from '../models/profile';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  
  protected readonly environment = environment;
  protected readonly UserType = UserType; 

  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // --- State ---
  userProfile: UserProfileDto | null = null;
  isLoading = true;
  isSaving = false;
  isEditMode = false;
  isOwner = false;
  errorMessage = '';
  
  // --- Forms ---
  profileForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // --- Type Casting Helpers ---
  get isOrg() { return this.userProfile?.type === UserType.Organization; }
  get isNormal() { return this.userProfile?.type === UserType.Normal; }
  get isAdmin() { return this.userProfile?.type === UserType.Admin; }

  get orgData() { return this.userProfile?.data as OrganizationProfileDto; }
  get regData() { return this.userProfile?.data as RegularProfileDto; }
  get adminData() { return this.userProfile?.data as AdminProfileDto; }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.resolveIdentityAndLoad(params.get('username'));
    });
  }

  resolveIdentityAndLoad(routeUsername: string | null) {
    const currentUser = this.authService.currentUser$.value;
    let targetUsername = routeUsername;

    if (!targetUsername) {
      targetUsername = currentUser?.username || currentUser?.email || '';
      this.isOwner = true; 
    } else {
      const currentIdentifier = currentUser?.username || currentUser?.email;
      this.isOwner = (currentIdentifier?.toLowerCase() === targetUsername.toLowerCase());
    }

    if (targetUsername) {
      this.loadProfile(targetUsername);
    } else {
      this.errorMessage = "Please log in to view profile.";
      this.isLoading = false;
    }
  }

  loadProfile(username: string) {
    this.isLoading = true;
    this.profileService.getProfile(username).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess && res.data) {
          this.userProfile = res.data;
          this.initForm();
        } else {
          this.errorMessage = res.error?.message || "Profile not found.";
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "User not found or network error.";
        this.cdr.detectChanges();
      }
    });
  }

  // --- Dynamic Form Logic ---
  initForm() {
    if (!this.userProfile || !this.userProfile.data) return;

    const controls: any = { bio: [''] };

    if (this.isOrg) {
      controls['name'] = [this.orgData.name || '', Validators.required];
      controls['bio'] = [this.orgData.bio || ''];
    } 
    else if (this.isNormal) {
      controls['firstName'] = [this.regData.firstName || '', Validators.required];
      controls['lastName'] = [this.regData.lastName || '', Validators.required];
      controls['bio'] = [this.regData.bio || ''];
    }
    else if (this.isAdmin) {
      controls['firstName'] = [this.adminData.firstName || ''];
      controls['lastName'] = [this.adminData.lastName || ''];
    }

    // Social Links Mapping
    const links = (this.isOrg ? this.orgData.socialLinks : this.isNormal ? this.regData.socialLinks : []) || [];
    controls['websiteUrl'] = [this.getLinkUrl(links, SocialPlatform.Website)];
    controls['facebookUrl'] = [this.getLinkUrl(links, SocialPlatform.Facebook)];
    controls['twitterUrl'] = [this.getLinkUrl(links, SocialPlatform.Twitter)];
    controls['instagramUrl'] = [this.getLinkUrl(links, SocialPlatform.Instagram)];
    controls['linkedinUrl'] = [this.getLinkUrl(links, SocialPlatform.LinkedIn)];
    controls['githubUrl'] = [this.getLinkUrl(links, SocialPlatform.Github)];

    this.profileForm = this.fb.group(controls);
    
    if (!this.isOwner) this.profileForm.disable();
  }

  getLinkUrl(links: UserSocialLinkDto[], platform: SocialPlatform): string {
    return links.find(l => l.platform === platform)?.url || '';
  }

  // --- Actions ---
  toggleEditMode() {
    if (!this.isOwner) return; 
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.initForm(); 
      this.imagePreview = null;
      this.selectedFile = null;
    }
  }

  onFileSelected(event: any) {
    if (!this.isOwner) return;
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedFile!);
    }
  }

  saveChanges() {
    if (!this.isOwner || this.profileForm.invalid) return;
    this.isSaving = true;

    const formVal = this.profileForm.value;
    const payload: any = { ...formVal };

    // Rebuild Social Links
    const socialLinks: UserSocialLinkDto[] = [];
    if (formVal.websiteUrl) socialLinks.push({ platform: SocialPlatform.Website, url: formVal.websiteUrl });
    if (formVal.facebookUrl) socialLinks.push({ platform: SocialPlatform.Facebook, url: formVal.facebookUrl });
    if (formVal.twitterUrl) socialLinks.push({ platform: SocialPlatform.Twitter, url: formVal.twitterUrl });
    if (formVal.instagramUrl) socialLinks.push({ platform: SocialPlatform.Instagram, url: formVal.instagramUrl });
    if (formVal.linkedinUrl) socialLinks.push({ platform: SocialPlatform.LinkedIn, url: formVal.linkedinUrl });
    if (formVal.githubUrl) socialLinks.push({ platform: SocialPlatform.Github, url: formVal.githubUrl });

    payload.socialLinks = socialLinks;

    this.profileService.updateMyProfile(payload, this.selectedFile || undefined)
      .subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.isSuccess) {
            this.isEditMode = false;
            // Reload logic (simplified)
            const currentUser = this.authService.currentUser$.value;
            this.loadProfile(currentUser?.username || currentUser?.email || '');
          } else {
            alert(res.error?.message || 'Update failed.');
          }
        },
        error: () => { 
          this.isSaving = false; 
          alert('Network Error'); 
        }
      });
  }

  toggle2FA() {
    if (!this.isOwner) return;
    const action = this.userProfile?.twoFactorEnabled ? 'Disable' : 'Enable';
    if(confirm(`Do you want to ${action} 2FA?`)) {
      this.profileService.toggle2FA(!this.userProfile?.twoFactorEnabled).subscribe({
        next: (res) => {
          if (this.userProfile) {
            this.userProfile.twoFactorEnabled = !this.userProfile.twoFactorEnabled;
            this.cdr.detectChanges();
          }
        }
      });
    }
  }

  // --- 🔥 Verification Logic (The Logic You Requested) ---
  
  get stats(): UserStatsDto | null {
    if (this.isOrg) return this.orgData.stats;
    if (this.isNormal) return this.regData.stats;
    return null;
  }

  // Determine Verified Status
  // Returns TRUE only if isVerified is strictly true
  get isVerifiedUser(): boolean {
    return this.stats?.isVerified === true;
  }

  // Determine Display Label based on isVerified value
  getUserLabel(): string {
    if (this.isOrg) return 'Organization';
    if (this.isAdmin) return 'Administrator';

    // Logic for Regular Users
    const verifiedStatus = this.stats?.isVerified;

    if (verifiedStatus === null) return 'Visitor'; // Null -> Visitor
    if (verifiedStatus === false) return 'New Yorker'; // False -> New Yorker (Unverified)
    if (verifiedStatus === true) return 'New Yorker'; // True -> New Yorker (Verified Badge will show separately)
    
    return 'User';
  }

  // --- Display Helpers ---
  getInitials(): string {
    if (!this.userProfile?.data) return 'U';
    if (this.isOrg) return this.orgData.name.substring(0, 2).toUpperCase();
    if (this.isNormal) return ((this.regData.firstName?.[0] || '') + (this.regData.lastName?.[0] || '')).toUpperCase();
    return 'U';
  }

  getDisplayName(): string {
    if (!this.userProfile?.data) return 'Unknown';
    if (this.isOrg) return this.orgData.name;
    if (this.isNormal) return `${this.regData.firstName} ${this.regData.lastName}`;
    if (this.isAdmin) return `${this.adminData.firstName} ${this.adminData.lastName}`;
    return 'Unknown';
  }
}