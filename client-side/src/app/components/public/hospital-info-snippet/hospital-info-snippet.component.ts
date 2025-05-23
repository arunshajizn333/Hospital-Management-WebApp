import { Component, OnInit } from '@angular/core';
import { HospitalInfo } from '../../../shared/models/hospital-info.model'; // Adjust path
import { PublicDataService } from '../../../core/services/public-data.service';

@Component({
  selector: 'app-hospital-info-snippet',
  standalone: false,
  templateUrl: './hospital-info-snippet.component.html',
  styleUrl: './hospital-info-snippet.component.css'
})
export class HospitalInfoSnippetComponent implements OnInit {
  hospitalInfo: HospitalInfo | null = null;
  isLoadingHospitalInfo = true;
  hospitalInfoError: string | null = null;

  constructor(private publicDataService: PublicDataService) { }

  ngOnInit(): void {
    this.loadHospitalInfo();
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