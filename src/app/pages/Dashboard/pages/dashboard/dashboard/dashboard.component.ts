import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DashboardService } from '../service/dashboard';
import { DashboardStats, UserSummary } from '../models/dashboard.';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  // Expose environment to HTML for image URLs
  protected readonly environment = environment;
  
  // Dependencies
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  // --- State Variables ---
  stats: DashboardStats = {
    totalUsers: 0, totalAdmins: 0, totalOrganizations: 0, totalRegularUsers: 0,
    verifiedAccounts: 0, pendingAccounts: 0, lockedAccounts: 0
  };
  
  recentUsers: UserSummary[] = [];
  isLoading = true;

  // --- Computed Analytics (Getters) ---
  
  // Percentage of Verified Users
  get verificationRate(): number {
    return this.stats.totalUsers > 0 
      ? (this.stats.verifiedAccounts / this.stats.totalUsers) * 100 
      : 0;
  }

  // Percentage of Admin Users
  get adminRatio(): number {
    return this.stats.totalUsers > 0 
      ? (this.stats.totalAdmins / this.stats.totalUsers) * 100 
      : 0;
  }

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.isLoading = true;

    this.dashboardService.getDashboardAnalytics()
      .pipe(
        // Finalize ensures this runs whether successful OR failed (Fixes infinite load)
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges(); // Force UI update
        })
      )
      .subscribe({
        next: (data) => {
          console.log('Dashboard Data Loaded:', data);
          this.stats = data.stats;
          this.recentUsers = data.recentUsers;
        },
        error: (err) => {
          console.error('Critical Error loading dashboard:', err);
        }
      });
  }

  // Helper to generate initials for avatar
  getInitials(firstName: string, lastName: string): string {
    return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
  }
}