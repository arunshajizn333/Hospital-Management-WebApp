import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalManagerService } from './core/services/modal-manager.service';
import { AuthService } from './core/services/auth.service';
import { User } from './shared/models/user.model';
import { Subscription } from 'rxjs';
// Import Event from @angular/router AS WELL AS specific event types
import { Router, NavigationEnd, Event as RouterNavigationEvent, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone : false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // Corrected to styleUrls
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'hospital-management-frontend';
  isPublicPage = true;
  private routerEventsSubscription!: Subscription; // Consistent name
  currentUser: User | null = null;
  private authStateSubscription!: Subscription;

  constructor(
    public modalManagerService: ModalManagerService,
    private router: Router,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {}
  

  ngOnInit() {
    this.routerEventsSubscription = this.router.events.pipe(
      // Corrected filter predicate type
      filter((event: RouterNavigationEvent): event is NavigationStart | NavigationEnd | NavigationCancel | NavigationError =>
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      )
    ).subscribe((event: RouterNavigationEvent) => { // Parameter type here is also RouterNavigationEvent
      this.handleRouterEvent(event);

      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        // For NavigationEnd, urlAfterRedirects is more reliable. For others, url might be undefined.
        const url = (event instanceof NavigationEnd) ? event.urlAfterRedirects : event.url;
        if (url?.startsWith('/patient') || url?.startsWith('/doctor') || url?.startsWith('/admin')) {
          this.isPublicPage = false;
        } else {
          this.isPublicPage = true;
        }
        console.log('Current URL:', url, 'isPublicPage:', this.isPublicPage);
      }
    });

    // Subscribe to authentication state changes
    this.authStateSubscription = this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  private handleRouterEvent(routerEvent: RouterNavigationEvent): void { // Parameter type here is RouterNavigationEvent
    if (routerEvent instanceof NavigationStart) {
      this.loadingService.show();
    }
    if (routerEvent instanceof NavigationEnd ||
        routerEvent instanceof NavigationCancel ||
        routerEvent instanceof NavigationError) {
      this.loadingService.hide();
    }
  }

  ngOnDestroy() {
    if (this.routerEventsSubscription) { // Consistent name
      this.routerEventsSubscription.unsubscribe();
    }
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
  }
}