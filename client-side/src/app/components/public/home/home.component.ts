// src/app/components/public/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { Department } from '../../../shared/models/department.model';     // Adjust path if needed
import { PublicDataService } from '../../../core/services/public-data.service';
import { Doctor } from '../../../shared/models/doctor.model';
import { HospitalInfo } from '../../../shared/models/hospital-info.model';

@Component({
  selector: 'app-home',
  standalone:false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  departments: Department[] = [];
  isLoadingDepartments = true;
  departmentError: string | null = null;

  featuredDoctors: Doctor[] = [];
  isLoadingFeaturedDoctors = true;
  featuredDoctorsError: string | null = null;

  


  hospitalInfo: HospitalInfo | null = null; // --- NEW Property ---
  isLoadingHospitalInfo = true;          // --- NEW Loading state ---
  hospitalInfoError: string | null = null;  // --- NEW Error state ---

  constructor(private publicDataService: PublicDataService) { }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadFeaturedDoctors();
    this.loadHospitalInfo();
  }

  loadDepartments(): void {
    this.isLoadingDepartments = true;
    this.departmentError = null;
    this.publicDataService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
        this.isLoadingDepartments = false;
      },
      error: (err) => {
        console.error('Error fetching departments:', err);
        this.departmentError = err.error?.message || 'Could not load departments. Please try again later.';
        this.isLoadingDepartments = false;
      }
    });
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
    // If it's just a string (ID), you might want to handle it differently or return null
    // For now, we assume if it's an object, it should have a name (due to backend population)
    return null; 
  }

 
 loadHospitalInfo(): void {
    this.isLoadingHospitalInfo = true;
    this.hospitalInfoError = null;
    this.publicDataService.getHospitalInfo().subscribe({
      next: (data) => {
        this.hospitalInfo = data;
        this.isLoadingHospitalInfo = false;
      },
      error: (err) => {
        console.error('Error fetching hospital info:', err);
        this.hospitalInfoError = err.error?.message || 'Could not load hospital information. Please try again later.';
        this.isLoadingHospitalInfo = false;
      }
    });
  }

}