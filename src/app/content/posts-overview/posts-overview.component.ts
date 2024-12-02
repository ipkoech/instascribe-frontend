import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-posts-overview',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './posts-overview.component.html',
  styleUrl: './posts-overview.component.scss',
})
export class PostsOverviewComponent {}
