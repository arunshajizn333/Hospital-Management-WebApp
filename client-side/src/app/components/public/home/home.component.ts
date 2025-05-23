// src/app/components/public/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { PublicDataService } from '../../../core/services/public-data.service';

@Component({
  selector: 'app-home',
  standalone:false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
 
  constructor(private publicDataService: PublicDataService) { }

  ngOnInit(): void {
    
    

  
  }}
