import { Component } from '@angular/core';

interface SocialLink {
  name: string;
  url: string;
  iconClass?: string; // For Font Awesome or other icon libraries
  displayText?: string; // Fallback if no icon
}

interface PageLink {
  name: string;
  routerLink: string;
}

@Component({
  selector: 'app-contact-info',
  standalone: false,
  templateUrl: './contact-info.component.html',
  styleUrl: './contact-info.component.css'
})
export class ContactInfoComponent {
  hospitalName = "Kerala Mission Hospital"; // Using the hospital name
  address = "123 Health St, Wellness City, HC 45678";
  generalPhoneNumber = "(555) 123-4567";
  generalPhoneLink = "tel:+1-555-123-4567";
  emergencyPhoneNumber = "(555) 911-0000";
  emergencyPhoneLink = "tel:+1-555-911-0000";
  generalEmail = "info@keralamissionhospital.com";
  generalEmailLink = `mailto:${this.generalEmail}`;

  socialMediaLinks: SocialLink[] = [
    { name: 'Facebook', url: 'https://facebook.com/sacredmissionhospital', displayText: 'Facebook' },
    { name: 'Twitter', url: 'https://twitter.com/sacredmissionh', displayText: 'Twitter' },
    { name: 'WhatsApp', url: 'https://wa.me/15551234567', displayText: 'Whatsapp' }
    // Add more social links here
  ];

  dedicatedPageLinks: PageLink[] = [
    { name: 'Our Departments', routerLink: '/departments' },
    { name: 'Find a Doctor', routerLink: '/find-doctor' },
    { name: 'About Sacred Mission Hospital', routerLink: '/about-us' },
    { name: 'Patient Portal', routerLink: '/patient-portal/login' }, // Example
    { name: 'Book an Appointment Online', routerLink: '/appointments/book' }, // Example
    { name: 'Careers', routerLink: '/careers' }, // Example
    { name: 'Privacy Policy', routerLink: '/privacy-policy' },
    { name: 'Terms of Service', routerLink: '/terms-of-service' }
  ];

  constructor() { }

}
