import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userSearch',
  standalone: true,
})
export class UserSearchPipe implements PipeTransform {
  transform(users: any[], query: string): any[] {
    if (!users || !query) {
      return users;
    }
    // if (!users) {
    //   return []; // Return an empty array if input is undefined
    // }

    // if (!query) {
    //   return users; // Return the original array if there's no search query
    // }

    const lowerQuery = query.toLowerCase();

    return users.filter(
      (user) =>
        user.f_name?.toLowerCase().includes(lowerQuery) || // Match first name
        user.email?.toLowerCase().includes(lowerQuery) // Match email
    );
  }
}
