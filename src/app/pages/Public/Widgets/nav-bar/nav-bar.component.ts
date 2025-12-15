import { Component, OnInit, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../Authentication/Service/auth';
// Import the Category List/Enum from your model to ensure consistency
// import { PostCategoryList } from '../../../Dashboard/pages/posts/models/post.models'; 

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  providers: [DatePipe]
})
export class NavBarComponent implements OnInit, OnDestroy {
  
  public authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  
  isMenuOpen = false;
  currentDate = new Date();
  isLoggedIn = false;
  currentUsername: string | null = null;
  canViewDashboard = false;
  
  private userSub!: Subscription;

  // 🔥 Dynamic Categories from your Shared Model
  // We map them to match the structure needed for the navbar
  // Note: Colors are hardcoded here for visual appeal as they are not in the model
  categories = [
    { id: 1, name: 'Art', color: '#FD7E14' },
    { id: 2, name: 'Community', color: '#E35D6A' },
    { id: 3, name: 'Culture', color: '#DC3545' },
    { id: 4, name: 'Education', color: '#6610f2' },
    { id: 5, name: 'Events', color: '#D63384' },
    { id: 6, name: 'Lifestyle', color: '#6F42C1' },
    { id: 7, name: 'Media', color: '#20c997' },
    { id: 8, name: 'News', color: '#198754' },
    { id: 9, name: 'Recruitment', color: '#A5673F' },
    { id: 10, name: 'Social', color: '#75B798' },
    { id: 11, name: 'Tourism', color: '#FFC107' },
    { id: 12, name: 'TV', color: '#0D6EFD' }
  ];

  ngOnInit() {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.currentUsername = user.username || user.unique_name || user.email;
        this.canViewDashboard = this.authService.hasPermission('Permissions.Dashboard.View');
      } else {
        this.resetPermissions();
      }
    });
  }

  resetPermissions() {
    this.currentUsername = null;
    this.canViewDashboard = false;
  }

  toggleMenu() { 
    this.isMenuOpen = !this.isMenuOpen; 
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : 'auto';
    }
  }
  
  logout() {
    this.authService.logout();
    this.isMenuOpen = false;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';
    }
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto'; 
    }
  }
}