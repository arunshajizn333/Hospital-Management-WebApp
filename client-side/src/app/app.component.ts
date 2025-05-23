import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalManagerService } from './core/services/modal-manager.service'; // Import
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit, OnDestroy {
  title = 'hospital-management-frontend';
  showLoginModal = false;
  showRegisterModal = false;
  private modalSubscription!: Subscription;
  private registerModalSubscription!: Subscription;

  constructor(public modalManagerService: ModalManagerService) {} // Make it public to access observable in template

  ngOnInit() {
    this.modalSubscription = this.modalManagerService.showLoginModal$.subscribe(show => {
      this.showLoginModal = show;
    });
    this.modalSubscription = this.modalManagerService.showRegisterModal$.subscribe(show => {
      this.showLoginModal = show;
    });


  }

  ngOnDestroy() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
     if (this.registerModalSubscription) { 
       this.registerModalSubscription.unsubscribe();
    }
  }
}
