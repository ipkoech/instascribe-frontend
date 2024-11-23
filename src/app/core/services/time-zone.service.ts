import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeZoneService {
  getDefaultTimeZone(): string {
    // Use Intl.DateTimeFormat to get the default time zone of the user's system
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}
