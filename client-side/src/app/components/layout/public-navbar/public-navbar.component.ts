import { Component } from '@angular/core';
import { ModalManagerService } from '../../../core/services/modal-manager.service'; // Import the service

@Component({
  selector: 'app-public-navbar',
  standalone: false,
  templateUrl: './public-navbar.component.html',
  styleUrl: './public-navbar.component.css'
})
export class PublicNavbarComponent {
  navbarOpen = false;

 constructor(private modalManagerService: ModalManagerService) { }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  closeNavbar() {
    this.navbarOpen = false;
  }
  openLogin(): void {
    this.closeNavbar(); // Close hamburger if open
    this.modalManagerService.openLoginModal();
  }
  openRegister(): void {
    this.closeNavbar(); // Close hamburger if open
    this.modalManagerService.openRegisterModal();
  }
  
}
