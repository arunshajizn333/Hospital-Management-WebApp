import { Component, OnInit } from '@angular/core';
import { Department } from '../../../shared/models/department.model';     // Adjust path if needed
import { PublicDataService } from '../../../core/services/public-data.service';


@Component({
  selector: 'app-department-list-page',
  standalone: false,
  templateUrl: './department-list-page.component.html',
  styleUrl: './department-list-page.component.css'
})
export class DepartmentListPageComponent implements OnInit {
  allDepartments: Department[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private publicDataService: PublicDataService) { }

  ngOnInit(): void {
    this.loadAllDepartments();
  }

  loadAllDepartments(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.publicDataService.getDepartments().subscribe({
      next: (data) => {
        this.allDepartments = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching all departments:', err);
        this.errorMessage = err.error?.message || 'Could not load departments. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}
