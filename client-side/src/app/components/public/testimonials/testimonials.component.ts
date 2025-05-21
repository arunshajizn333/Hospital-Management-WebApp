import { Component, OnInit } from '@angular/core';

interface Testimonial {
  quote: string;
  author: string;
  location?: string; // Optional, e.g., city or "Grateful Patient"
  rating?: number;   // Optional, e.g., 1-5 stars
}

@Component({
  selector: 'app-testimonials',
  standalone :false,
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css']
})
export class TestimonialsComponent implements OnInit {

  testimonials: Testimonial[] = [
    {
      quote: "The care I received at Sacred Mission Hospital was exceptional. The doctors and nurses were attentive and compassionate throughout my recovery.",
      author: "John D.",
      location: "Wellness City",
      rating: 5
    },
    {
      quote: "Booking appointments was so easy, and Dr. Emily Carter is fantastic. Highly recommend this hospital!",
      author: "Sarah G.",
      location: "Grateful Patient",
      rating: 5
    },
    {
      quote: "From the moment I walked in, I felt cared for. The facilities are top-notch and the staff truly professional.",
      author: "Michael B.",
      location: "Neighboring Town",
      rating: 4
    }
    // Add more testimonials as needed
  ];

  constructor() { }

  ngOnInit(): void {
  }

  // Helper to generate stars for rating (optional)
  getStars(rating?: number): any[] {
    if (rating === undefined) {
      return [];
    }
    return new Array(Math.floor(rating));
  }

  getEmptyStars(rating?: number): any[] {
    if (rating === undefined) {
        return [];
    }
    return new Array(5 - Math.floor(rating));
  }
}