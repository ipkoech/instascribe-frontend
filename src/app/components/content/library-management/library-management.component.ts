import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-library-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './library-management.component.html',
  styleUrl: './library-management.component.scss',
})
export class LibraryManagementComponent {
  // Tab Data
  tabs = [
    { label: 'Documents', value: 'documents' },
    { label: 'Podcasts', value: 'podcasts' },
    { label: 'Audio/Video', value: 'audio' },
    { label: 'Training Assignments', value: 'assignments' },
  ];

  // Default selected tab
  selectedTab = this.tabs[0];

  // Change tab
  selectTab(tab: any): void {
    this.selectedTab = tab;
  }
}
