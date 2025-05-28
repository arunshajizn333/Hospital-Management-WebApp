import { Component } from '@angular/core';
import { ModalManagerService } from '../../../core/services/modal-manager.service'; // Import the service
import { Router } from '@angular/router';

@Component({
  selector: 'app-public-navbar',
  standalone: false,
  templateUrl: './public-navbar.component.html',
  styleUrl: './public-navbar.component.css'
})
export class PublicNavbarComponent {
  navbarOpen = false;
  email :string="info@sacredmissionhospital.com";


  constructor(
    private modalManagerService: ModalManagerService,
    private router: Router // Inject Router
  ) { }

  toggleNavbar(): void {
    this.navbarOpen = !this.navbarOpen;
  }

  closeNavbar(): void {
    // This is called when a nav link is clicked in mobile view to close the menu
    this.navbarOpen = false;
  }

  openLogin(): void {
    this.closeNavbar(); // Close hamburger menu if open
    this.modalManagerService.openLoginModal();
  }

  openRegister(): void {
    this.closeNavbar(); // Close hamburger menu if open
    this.modalManagerService.openRegisterModal();
  }

  // Method for "Book An Appointment" button
  navigateToBookAppointment(): void {
    this.closeNavbar();
    // This navigation assumes the user might need to log in first,
    // or the booking route itself handles unauthenticated users.
    // Adjust the route as per your application's flow.
    // For instance, if booking is always for logged-in patients:
    // 1. Check if patient is logged in (using AuthService)
    // 2. If yes, navigate to '/patient/book-appointment'
    // 3. If no, openLoginModal() or navigate to a public info page about appointments.
    // For simplicity now, let's assume it tries to go to the patient booking area.
    this.router.navigate(['/patient/book-appointment']);
  }
  
}
