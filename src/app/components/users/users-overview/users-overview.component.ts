import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-users-overview',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './users-overview.component.html',
  styleUrl: './users-overview.component.scss'
})
export class UsersOverviewComponent {

}
