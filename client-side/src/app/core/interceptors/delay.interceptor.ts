import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { delay, finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // To check if in production

@Injectable()
export class DelayInterceptor implements HttpInterceptor {
  private readonly EXCLUDED_URLS = ['/assets/']; // URLs to exclude from delay (e.g., local assets)
  private readonly DELAY_DURATION = 100;  // 2000 milliseconds = 2 seconds

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isExcluded = this.EXCLUDED_URLS.some(url => request.url.includes(url));

    // Only apply delay in development mode and if not an excluded URL
    if (!environment.production && !isExcluded) {
      console.log(`DelayInterceptor: Delaying response for ${request.url} by ${this.DELAY_DURATION}ms`);
      return next.handle(request).pipe(
        delay(this.DELAY_DURATION), // Delays the emission of the HTTP response
        finalize(() => {
          console.log(`DelayInterceptor: Response finalized for ${request.url}`);
        })
      );
    }

    return next.handle(request); // Pass through without delay for production or excluded URLs
  }
}