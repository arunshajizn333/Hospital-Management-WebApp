import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalManagerService {
  private showLoginModalSubject = new BehaviorSubject<boolean>(false);
  showLoginModal$ = this.showLoginModalSubject.asObservable();

  private showRegisterModalSubject = new BehaviorSubject<boolean>(false); // --- NEW ---
  showRegisterModal$ = this.showRegisterModalSubject.asObservable();   // --- NEW ---

  
  constructor() { }

  openLoginModal() {
    this.showLoginModalSubject.next(true);
  }

  closeLoginModal() {
    this.showLoginModalSubject.next(false);
  }

  openRegisterModal() {
    this.closeLoginModal(); // Close login modal if open
    this.showRegisterModalSubject.next(true);
  }

  closeRegisterModal() {
    this.showRegisterModalSubject.next(false);
  }
}