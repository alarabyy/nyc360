import { Component, OnInit, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../Authentication/Service/auth';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {
  
  public authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  
  isMenuOpen = false;
  isLoggedIn = false;
  currentUsername: string | null = null;
  hasNotifications = true; 
  
  private userSub!: Subscription;

  // Categories with exact Bootstrap Icons matching your image
  categories = [
    { id: 'community', name: 'Community', icon: 'bi-people-fill', route: '/public/community' }, // Orange
    { id: 'culture', name: 'Culture', icon: 'bi-mask', route: '/public/coming-soon' }, // Red
    { id: 'education', name: 'Education', icon: 'bi-journal-bookmark-fill', route: '/public/coming-soon' }, // Blue
    { id: 'events', name: 'Events', icon: 'bi-calendar-event-fill', route: '/public/coming-soon' }, // Purple
    { id: 'health', name: 'Health', icon: 'bi-heart-pulse-fill', route: '/public/coming-soon' }, // Light Blue
    { id: 'lifestyle', name: 'Lifestyle', icon: 'bi-person-arms-up', route: '/public/coming-soon' }, // Green
    { id: 'legal', name: 'Legal', icon: 'bi-bank2', route: '/public/coming-soon' }, // Dark Navy
    { id: 'news', name: 'News', icon: 'bi-newspaper', route: '/public/coming-soon' }, // Grey
    { id: 'profession', name: 'Profession', icon: 'bi-briefcase-fill', route: '/public/coming-soon' }, // Dk Green
    { id: 'social', name: 'Social', icon: 'bi-globe', route: '/public/coming-soon' }, // Teal
    { id: 'tour', name: 'Tour', icon: 'bi-map-fill', route: '/public/coming-soon' }, // Yellow
    { id: 'tv', name: 'TV', icon: 'bi-tv-fill', route: '/public/coming-soon' } // Dark Blue
  ];

  ngOnInit() {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.currentUsername = user.username || user.unique_name || user.email;
      } else {
        this.currentUsername = null;
      }
    });
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
  }
}