import { Routes } from "@angular/router";
import { UserDetailComponent } from "./user-detail/user-detail.component";
import { UsersComponent } from "./users/users.component";
import { UsersOverviewComponent } from "./users-overview/users-overview.component";
import { userResolver } from "../../core/services/user.service";

export const USERS_ROUTES: Routes = [
  {
    path: '', component: UsersOverviewComponent, children: [
      { path: '', component: UsersComponent },
      { path: ':id', component: UserDetailComponent, resolve: { user: userResolver } }

    ]
  },
];
