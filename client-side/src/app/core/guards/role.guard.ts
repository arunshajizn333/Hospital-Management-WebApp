// src/app/core/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service'; // Adjust path as needed
import { User } from '../../shared/models/user.model'; // Adjust path as needed

@Injectable({
  providedIn: 'root' // Service is a singleton
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Get the expected roles from the route's 'data' property
    // This allows defining a single role string or an array of roles
    const expectedRoles = route.data?.['role'] || route.data?.['roles'];

    // This guard should run AFTER AuthGuard has confirmed the user is authenticated.
    // So, currentUser observable should emit the user object or null.
    return this.authService.currentUser.pipe(
      take(1), // Take the current value and complete the observable stream
      map((user: User | null) => {
        if (!user) {
          // This should ideally be caught by AuthGuard first.
          // If somehow an unauthenticated user reaches here, deny access and redirect.
          console.warn('RoleGuard: No authenticated user found. Redirecting to login.');
          return this.router.createUrlTree(['/login']); // Or your main login trigger
        }

        const userRole = user.role;
        let hasPermission = false;

        if (!expectedRoles) {
          // If no roles are specified in the route data, what's the default behavior?
          // Option 1: Allow access for any authenticated user (if AuthGuard already passed)
          // console.warn('RoleGuard: No expected roles defined for this route. Allowing access for any authenticated user.');
          // hasPermission = true;
          // Option 2: Deny access (stricter, assumes roles should always be specified for protected routes)
          console.error('RoleGuard: No expected roles defined for this route. Access denied by default.');
          hasPermission = false;
        } else if (Array.isArray(expectedRoles)) {
          // If expectedRoles is an array, check if the user's role is in that array
          if (expectedRoles.includes(userRole)) {
            hasPermission = true;
          }
        } else if (typeof expectedRoles === 'string') {
          // If expectedRoles is a single string, check for direct match
          if (userRole === expectedRoles) {
            hasPermission = true;
          }
        }

        if (hasPermission) {
          return true; // User has the required role, allow access
        } else {
          console.log(`RoleGuard: User role '${userRole}' not authorized for route requiring role(s): '${Array.isArray(expectedRoles) ? expectedRoles.join(', ') : expectedRoles}'. Redirecting.`);
          // Redirect to an "unauthorized" page, the user's specific dashboard, or the homepage.
          // For now, redirecting to home is a safe default.
          return this.router.createUrlTree(['/']); // Or a dedicated '/unauthorized' page
        }
      })
    );
  }
}