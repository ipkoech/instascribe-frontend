import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-collaboration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collaboration.component.html',
  styleUrl: './collaboration.component.scss',
})
export class CollaborationComponent {
  // ngOnInit(): void {
  //   console.log('CollaborationComponent loaded');
  // }

  // constructor(private route: ActivatedRoute) {}

  // ngOnInit(): void {
  //   console.log(
  //     'CollaborationComponent route params:',
  //     this.route.snapshot.params
  //   );
  //   console.log('CollaborationComponent route path:', this.route.snapshot.url);
  // }

  collaborationDocuments = [
    {
      name: 'Social Media Strategy',
      owner: 'John Doe',
      lastUpdated: new Date(2024, 10, 29), // November 29, 2024
      permission: 'Edit',
    },
    {
      name: 'Blog Post Draft',
      owner: 'Jane Smith',
      lastUpdated: new Date(2024, 10, 28), // November 28, 2024
      permission: 'View Only',
    },
    {
      name: 'Q4 Marketing Plan',
      owner: 'Alice Johnson',
      lastUpdated: new Date(2024, 10, 27), // November 27, 2024
      permission: 'Comment Only',
    },
  ];

  getPermissionIcon(permission: string): string {
    switch (permission) {
      case 'Edit':
        return 'edit';
      case 'View Only':
        return 'visibility';
      case 'Comment Only':
        return 'chat';
      default:
        return 'help';
    }
  }
}
