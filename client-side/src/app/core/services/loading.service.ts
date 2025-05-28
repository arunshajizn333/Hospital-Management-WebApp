import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor() { }

  show(): void {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError in some cases
    setTimeout(() => this.loadingSubject.next(true), 0);
  }

  hide(): void {
    setTimeout(() => this.loadingSubject.next(false), 0);
  }
}