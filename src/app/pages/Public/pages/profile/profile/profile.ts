import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { ProfileService } from '../service/profile';
import { UserProfile } from '../models/profile';
import { AuthService } from '../../../../Authentication/Service/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  
  protected readonly environment = environment;
  
  // --- Dependencies ---
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // --- State ---
  profile: UserProfile | null = null;
  isLoading = true;
  isSaving = false;
  isEditMode = false;
  errorMessage = '';
  
  // Modal State
  showPasswordModal = false;

  // --- Forms ---
  profileForm: FormGroup;
  passwordForm: FormGroup; // New Form for Password Change
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor() {
    // Profile Form
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      bio: [''],
      phoneNumber: [''],
      websiteUrl: [''],
      facebookUrl: [''],
      twitterUrl: [''],
      instagramUrl: [''],
      linkedInUrl: [''],
      githubUrl: ['']
    });

    // Password Form (New)
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.resolveUsernameAndLoad();
  }

  // --- Load Data ---
  resolveUsernameAndLoad() {
    let identifier = this.route.snapshot.paramMap.get('username');
    if (!identifier) {
      const currentUser = this.authService.currentUser$.value;
      if (currentUser) {
        identifier = currentUser.username || currentUser.email || currentUser.unique_name;
      }
    }

    if (identifier) {
      this.loadProfileData(identifier);
    } else {
      this.errorMessage = "Please log in to view your profile.";
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  loadProfileData(identifier: string) {
    this.isLoading = true;
    this.profileService.getProfile(identifier).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess && res.data) {
          this.profile = res.data;
          this.initForm(this.profile);
          this.cdr.detectChanges();
        } else {
          this.errorMessage = "Profile not found.";
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.status === 404 ? "User not found." : "Network error.";
        this.cdr.detectChanges();
      }
    });
  }

  initForm(user: UserProfile) {
    this.profileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      phoneNumber: user.phoneNumber,
      websiteUrl: user.websiteUrl,
      facebookUrl: user.facebookUrl,
      twitterUrl: user.twitterUrl,
      instagramUrl: user.instagramUrl,
      linkedInUrl: user.linkedInUrl,
      githubUrl: user.githubUrl
    });
  }

  // --- Profile Actions ---
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode && this.profile) {
      this.initForm(this.profile);
      this.imagePreview = null;
      this.selectedFile = null;
    }
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    if (this.profileForm.invalid) return;
    this.isSaving = true;
    this.profileService.updateMyProfile(this.profileForm.value, this.selectedFile || undefined)
      .subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.isSuccess) {
            alert('Profile updated successfully!');
            this.isEditMode = false;
            this.resolveUsernameAndLoad();
          } else {
            alert(res.error?.message || 'Update failed.');
          }
        },
        error: () => { this.isSaving = false; alert('Network Error'); }
      });
  }

  // --- 2FA Action ---
  toggle2FA() {
    if (!this.profile) return;
    const action = this.profile.twoFactorEnabled ? 'Disable' : 'Enable';
    if (!confirm(`Are you sure you want to ${action} Two-Factor Authentication?`)) return;

    this.profileService.toggle2FA(!this.profile.twoFactorEnabled).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.profile!.twoFactorEnabled = !this.profile!.twoFactorEnabled;
          alert(`2FA has been ${action}d.`);
          this.cdr.detectChanges();
        } else {
          alert('Failed to update 2FA settings.');
        }
      }
    });
  }

  // --- Password Modal Actions ---
  openPasswordModal() {
    this.passwordForm.reset();
    this.showPasswordModal = true;
  }

  closePasswordModal() {
    this.showPasswordModal = false;
  }

  onChangePassword() {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    this.isSaving = true;
    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.isSuccess) {
          alert('Password changed successfully!');
          this.closePasswordModal();
        } else {
          alert(res.error?.message || 'Failed to change password.');
        }
      },
      error: () => {
        this.isSaving = false;
        alert('Network Error.');
      }
    });
  }

  getInitials(first: string, last: string): string {
    return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase();
  }
}