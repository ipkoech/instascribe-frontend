import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss',
})
export class PostsComponent {
  posts = [
    {
      title: 'The Rise of Edge Computing',
      platform: 'LinkedIn',
      postedDate: new Date('2024-11-27'),
    },
    {
      title: 'Cybersecurity Best Practices',
      platform: 'Twitter',
      postedDate: new Date('2024-11-26'),
    },
    {
      title: 'Machine Learning in Healthcare',
      platform: 'Facebook',
      postedDate: new Date('2024-11-25'),
    },
  ];
}
