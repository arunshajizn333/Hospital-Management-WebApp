import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalManagerService } from './core/services/modal-manager.service';
import { AuthService } from './core/services/auth.service'; // Import AuthService
import { User } from './shared/models/user.model'; // Import User model
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router'; // Import Router and NavigationEnd
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit, OnDestroy {
  title = 'hospital-management-frontend';
  // showLoginModal and showRegisterModal are now handled by modalManagerService.show...$ | async in template

  isPublicPage = true; // Flag to determine if we are on a public page
  private routerSubscription!: Subscription;
  currentUser: User | null = null;
  private authSubscription!: Subscription;


  constructor(
    public modalManagerService: ModalManagerService,
    private router: Router,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit() {
    // Determine if the current route is a public page or a dashboard
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => { // Use 'any' for event or find specific type for NavigationEnd url
      const url = (event as NavigationEnd).urlAfterRedirects || event.url;
      if (url.startsWith('/patient') || url.startsWith('/doctor') || url.startsWith('/admin')) {
        this.isPublicPage = false;
      } else {
        this.isPublicPage = true;
      }
    });

    this.authSubscription = this.authService.currentUser.subscribe(user => {
        this.currentUser = user;
        // Potentially update isPublicPage based on login status too, if dashboards are always non-public
        if (user) { // If user is logged in, assume not on a purely public page context for the main navbar
            const currentUrl = this.router.url;
             if (currentUrl.startsWith('/patient') || currentUrl.startsWith('/doctor') || currentUrl.startsWith('/admin')) {
                this.isPublicPage = false;
             }
        }
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.authSubscription) {
        this.authSubscription.unsubscribe();
    }
  }
}