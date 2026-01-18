import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive,
  Router,
  NavigationEnd,
  Event as RouterEvent,
} from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { DragScrollXDirective } from '../../../../shared/directives/drag-scroll.directive';
import { AuthService } from '../../../Authentication/Service/auth';
import { GlobalSearchComponent } from './components/global-search/global-search';
import { CATEGORY_THEMES } from '../feeds/models/categories';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    DragScrollXDirective,
    GlobalSearchComponent,
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit, OnDestroy {
  // services
  public authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private doc = inject(DOCUMENT);

  // UI state
  isMenuOpen = false;
  isLoggedIn = false;
  currentUsername: string | null = null;
  hasNotifications = true;
  isProfileDropdownOpen = false;

  // current active category object (or null)
  currentActiveCat: any = null;

  // subscriptions
  private userSub?: Subscription;
  private routerSub?: Subscription;

  // Links / data (kept because you had it, even if unused in template)
  navLinks = Object.values(CATEGORY_THEMES);

  // Categories definition (your current structure)
  categories = [
    {
      id: 'community',
      name: 'Community',
      icon: 'bi-people-fill',
      route: '/public/community',
      topLinks: [
        { label: 'Feed', route: '/public/community' },
        { label: 'Explore', route: '/public/discover' },
        { label: 'My Communities', route: '/public/my-communities' },
      ],
    },
    {
      id: 'culture',
      name: 'Culture',
      icon: 'bi-masks',
      route: '/public/category/culture',
      topLinks: [
        { label: 'Feed', route: '/public/feed/culture' },
        { label: 'initiatives', route: '/public/initiatives/culture' },
      ],
    },
    {
      id: 'education',
      name: 'Education',
      icon: 'bi-book-fill',
      route: '/public/category/education',
      topLinks: [
        { label: 'Feed', route: '/public/feed/education' },
        { label: 'initiatives', route: '/public/initiatives/education' },
      ],
    },
    {
      id: 'housing',
      name: 'Housing',
      icon: 'bi-calendar-event-fill',
      route: '/public/category/housing',
      topLinks: [
        { label: 'Feed', route: '/public/feed/housing' },
        { label: 'initiatives', route: '/public/initiatives/housing' },
      ],
    },
    {
      id: 'health',
      name: 'Health',
      icon: 'bi-heart-pulse-fill',
      route: '/public/category/health',
      topLinks: [
        { label: 'Feed', route: '/public/feed/health' },
        { label: 'Initiatives', route: '/public/initiatives/health' },
      ],
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle',
      icon: 'bi-person-arms-up',
      route: '/public/category/lifestyle',
      topLinks: [
        { label: 'Feed', route: '/public/feed/lifestyle' },
        { label: 'Trends', route: '/public/lifestyle/trends' },
        { label: 'initiatives', route: '/public/initiatives/lifestyle' },
      ],
    },
    {
      id: 'legal',
      name: 'Legal',
      icon: 'bi-balance-scale',
      route: '/public/category/legal',
      topLinks: [
        { label: 'Feed', route: '/public/feed/legal' },
        { label: 'initiatives', route: '/public/initiatives/legal' },
      ],
    },
    {
      id: 'news',
      name: 'News',
      icon: 'bi-newspaper',
      route: '/public/category/news',
      topLinks: [
        { label: 'Feed', route: '/public/feed/news' },
        { label: 'initiatives', route: '/public/initiatives/news' },
      ],
    },
    {
      id: 'profession',
      name: 'Profession',
      icon: 'bi-briefcase-fill',
      route: '/public/profession/feed',
      topLinks: [
        { label: 'Feed', route: '/public/profession/feed' },
        { label: 'Jobs', route: '/public/profession/jobs' },
        { label: 'My Application', route: '/public/profession/my-applications' },
        { label: 'My Offers', route: '/public/profession/my-offers' },
      ],
    },
    {
      id: 'social',
      name: 'Social',
      icon: 'bi-globe-americas',
      route: '/public/category/social',
      topLinks: [
        { label: 'Feed', route: '/public/feed/social' },
        { label: 'initiatives', route: '/public/initiatives/social' },
      ],
    },
    {
      id: 'transportation',
      name: 'Transportation',
      icon: 'bi-map-fill',
      route: '/public/category/transportation',
      topLinks: [
        { label: 'Feed', route: '/public/feed/transportation' },
        { label: 'initiatives', route: '/public/initiatives/transportation' },
      ],
    },
    {
      id: 'tv',
      name: 'TV',
      icon: 'bi-tv-fill',
      route: '/public/category/tv',
      topLinks: [
        { label: 'Feed', route: '/public/feed/tv' },
        { label: 'initiatives', route: '/public/initiatives/tv' },
      ],
    },
  ];

  ngOnInit() {
    // auth/user subscription
    this.userSub = this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      this.currentUsername = user ? user.username || user.unique_name || user.email || null : null;

      this.cdr.detectChanges();
    });

    // route sync
    this.routerSub = this.router.events
      .pipe(filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveCategory(event.urlAfterRedirects);
      });

    // initial
    if (isPlatformBrowser(this.platformId)) {
      this.updateActiveCategory(this.router.url);
    }
  }

  private updateActiveCategory(url: string) {
    const path = (url || '').split('?')[0];

    // home / base
    if (path === '/' || path === '/public/home' || path.includes('/public/home')) {
      this.currentActiveCat = null;
      this.applyThemeClass(null);
      this.cdr.detectChanges();
      return;
    }

    // match by main route or any sub route
    const found = this.categories.find((cat) => {
      const isMainRoute = path.startsWith(cat.route);
      const isSubRoute = cat.topLinks?.some((link) => path.startsWith(link.route));
      return isMainRoute || !!isSubRoute;
    });

    this.currentActiveCat = found ?? null;

    // apply theme on body
    this.applyThemeClass(this.currentActiveCat?.id ?? null);

    this.cdr.detectChanges();
  }

  private applyThemeClass(categoryId: string | null) {
    if (!isPlatformBrowser(this.platformId)) return;

    const body = this.doc?.body;
    if (!body) return;

    // remove existing theme-*
    body.classList.forEach((cls) => {
      if (cls.startsWith('theme-')) body.classList.remove(cls);
    });

    body.classList.add(`theme-${categoryId ?? 'all'}`);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;

    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : 'auto';
    }

    this.cdr.detectChanges();
  }

  toggleProfileDropdown(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  closeDropdowns(_event: Event) {
    if (!this.isProfileDropdownOpen) return;
    this.isProfileDropdownOpen = false;
    this.cdr.detectChanges();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    // close dropdowns/menu
    this.isProfileDropdownOpen = false;

    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      if (isPlatformBrowser(this.platformId)) {
        document.body.style.overflow = 'auto';
      }
    }

    this.cdr.detectChanges();
  }

  logout() {
    this.authService.logout();

    this.isMenuOpen = false;
    this.isProfileDropdownOpen = false;

    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';
    }

    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }
}
