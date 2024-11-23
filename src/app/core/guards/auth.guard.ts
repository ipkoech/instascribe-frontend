import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { inject } from '@angular/core';
import { map, tap, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.user$.pipe(
    map((user) => !!user),
    tap((loggedIn) => {
      if (!loggedIn) {
        router.navigate(['auth/login']);
      }
    }),
    catchError(() => {
      router.navigate(['auth/login']);
      return of(false);
    })
  );
};
