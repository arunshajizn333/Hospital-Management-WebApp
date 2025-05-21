import { Component } from '@angular/core';

@Component({
  selector: 'app-public-navbar',
  standalone: false,
  templateUrl: './public-navbar.component.html',
  styleUrl: './public-navbar.component.css'
})
export class PublicNavbarComponent {
  navbarOpen = false;

  constructor() { }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  closeNavbar() {
    this.navbarOpen = false;
  }
}
