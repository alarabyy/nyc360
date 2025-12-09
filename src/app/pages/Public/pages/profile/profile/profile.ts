import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { ProfileService } from '../service/profile';
import { AuthService } from '../../../../Authentication/Service/auth';
import { 
  UserProfileDto, UserType, RegularProfileDto, OrganizationProfileDto, AdminProfileDto 
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
  protected readonly UserType = UserType; // Make Enum available in template

  // --- Dependencies ---
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // --- State ---
  userProfile: UserProfileDto | null = null;
  
  // Helpers for type casting in template
  get regularData() { return this.userProfile?.data as RegularProfileDto; }
  get orgData() { return this.userProfile?.data as OrganizationProfileDto; }
  get adminData() { return this.userProfile?.data as AdminProfileDto; }

  isLoading = true;
  isSaving = false;
  isEditMode = false;
  errorMessage = '';
  
  // --- Forms ---
  profileForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  ngOnInit() {
    this.resolveUsernameAndLoad();
  }

  resolveUsernameAndLoad() {
    let username = this.route.snapshot.paramMap.get('username');
    if (!username) {
      // Fallback to current user if no username in URL
      const currentUser = this.authService.currentUser$.value;
      username = currentUser?.username || currentUser?.email;
    }

    if (username) {
      this.loadProfile(username);
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

  // --- Dynamic Form Initialization ---
  initForm() {
    if (!this.userProfile) return;

    if (this.userProfile.type === UserType.Organization) {
      const data = this.orgData;
      this.profileForm = this.fb.group({
        name: [data.name, Validators.required],
        bio: [data.bio || ''],
        // Add social links form array logic here if needed
      });
    } else {
      // Regular or Admin
      const data = this.userProfile.type === UserType.Regular ? this.regularData : this.adminData;
      this.profileForm = this.fb.group({
        firstName: [data.firstName, Validators.required],
        lastName: [data.lastName, Validators.required],
        bio: [(data as any).bio || ''], // Admin might not have bio
      });
    }
  }

  // --- Actions ---
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.initForm(); // Reset form on cancel
      this.imagePreview = null;
    }
  }

  onFileSelected(event: any) {
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
    if (this.profileForm.invalid) return;
    this.isSaving = true;
    
    this.profileService.updateMyProfile(this.profileForm.value, this.selectedFile || undefined)
      .subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.isSuccess) {
            this.isEditMode = false;
            // Reload to get fresh data
            this.resolveUsernameAndLoad(); 
          } else {
            alert(res.error?.message || 'Update failed.');
          }
        },
        error: () => { this.isSaving = false; alert('Network error.'); }
      });
  }

  // Helper for Initials
  getInitials(): string {
    if (this.userProfile?.type === UserType.Organization) {
      return this.orgData.name.substring(0, 2).toUpperCase();
    }
    const data = this.userProfile?.type === UserType.Regular ? this.regularData : this.adminData;
    return ((data?.firstName?.[0] || '') + (data?.lastName?.[0] || '')).toUpperCase();
  }

  // Helper for Full Name
  getDisplayName(): string {
    if (this.userProfile?.type === UserType.Organization) return this.orgData.name;
    const data = this.userProfile?.type === UserType.Regular ? this.regularData : this.adminData;
    return `${data?.firstName} ${data?.lastName}`;
  }
}