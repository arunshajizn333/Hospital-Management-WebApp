// src/app/components/public/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { AuthService } from '../../../core/services/auth.service'; // Import AuthService
import { ModalManagerService } from '../../../core/services/modal-manager.service';
// Remove: import { log } from 'node:console'; // This is a Node.js specific import, not for Angular browser code


@Component({
  selector: 'app-home',
  standalone:false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    // Remove PublicDataService if HomeComponent itself is no longer fetching data directly for departments, doctors, hospital info
    // private publicDataService: PublicDataService, 
    private modalManagerService: ModalManagerService,
    private authService: AuthService, // Inject AuthService
    private router: Router            // Inject Router
  ) { }

  ngOnInit(): void {
    // HomeComponent might not need to load departments, featured doctors, hospital info directly
    // if those are now handled by their own dedicated components embedded in the HTML.
    // If HomeComponent still has properties for these, keep their load methods.
  }

  // Renamed from openLogin to be more specific to this button's intent
  handleBookAppointmentClick(): void {
    const currentUser = this.authService.currentUserValue;

    if (currentUser && currentUser.role === 'patient') {
      // If patient is already logged in, navigate to the booking page
      this.router.navigate(['/patient/book-appointment']); // Ensure this route exists
    } else if (currentUser) {
      // If another role is logged in, perhaps navigate them to their dashboard
      // or show a message that booking is for patients.
      // For simplicity, let's redirect to their likely dashboard or home.
      if(currentUser.role === 'doctor') this.router.navigate(['/doctor']);
      else if(currentUser.role === 'admin') this.router.navigate(['/admin']);
      else this.router.navigate(['/']); // Fallback
    }
    else {
      // If no user is logged in, open the login modal.
      // We can enhance AuthService or ModalManagerService to handle post-login redirect.
      console.log('User not logged in, opening login modal for booking.');
      this.modalManagerService.openLoginModal();
      // After login, LoginComponent's onSubmit navigates to '/patient', which then
      // redirects to '/patient/overview'. We might need a more sophisticated redirect
      // after login if the original intent was to book an appointment.
    }
  }
}