import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service'; // Adjust path as needed

@Injectable({
  providedIn: 'root' // Or provide it in CoreModule
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.isAuthenticated.pipe(
      take(1), // Take the latest value and complete
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true; // User is authenticated, allow access
        } else {
          // User is not authenticated, redirect to login page
          console.log('AuthGuard: User not authenticated, redirecting to login.');
          // Store the attempted URL for redirection after login (optional)
          // this.authService.setRedirectUrl(state.url);
          return this.router.createUrlTree(['']); // Or your primary login modal trigger if that's the main flow
        }
      })
    );
  }
}