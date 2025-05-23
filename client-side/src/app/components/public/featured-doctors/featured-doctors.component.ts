import { Component, OnInit } from '@angular/core';
import { Doctor } from '../../../shared/models/doctor.model';         // Adjust path
import { Department } from '../../../shared/models/department.model';   // Adjust path
import { PublicDataService } from '../../../core/services/public-data.service';

@Component({
  selector: 'app-featured-doctors',
  standalone: false,
  templateUrl: './featured-doctors.component.html',
  styleUrl: './featured-doctors.component.css'
})
export class FeaturedDoctorsComponent implements OnInit {
  featuredDoctors: Doctor[] = [];
  isLoadingFeaturedDoctors = true;
  featuredDoctorsError: string | null = null;

  constructor(private publicDataService: PublicDataService) { }

  ngOnInit(): void {
    this.loadFeaturedDoctors();
  }

  loadFeaturedDoctors(): void {
    this.isLoadingFeaturedDoctors = true;
    this.featuredDoctorsError = null;
    this.publicDataService.getFeaturedDoctors().subscribe({ // Assuming limit defaults in service
      next: (data) => {
        this.featuredDoctors = data;
        this.isLoadingFeaturedDoctors = false;
      },
      error: (err) => {
        console.error('Error fetching featured doctors:', err);
        this.featuredDoctorsError = err.error?.message || 'Could not load featured doctors. Please try again later.';
        this.isLoadingFeaturedDoctors = false;
      }
    });
  }

  // Helper method to safely get department name
  getDepartmentName(department: Department | string | undefined): string | null {
    if (department && typeof department === 'object' && department.name) {
      return department.name;
    }
    return null;
  }
}