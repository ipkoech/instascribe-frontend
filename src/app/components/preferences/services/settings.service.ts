import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface Company {
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private companyNameSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  // Observable for components to subscribe
  companyName$ = this.companyNameSubject.asObservable();

  constructor(private http: HttpClient, private api: ApiService) {}

  // Fetch company information and update BehaviorSubject
  loadCompanyInfo(): void {
    this.http
      .get<Company>(`${this.api.base_uri}companies`, { withCredentials: true })
      .subscribe({
        next: (data: Company) => {
          this.companyNameSubject.next(data.name); // Update shared state
        },
        error: (err) => {
          console.error('Error fetching company info:', err);
        },
      });
  }

  // Update company information and BehaviorSubject
  updateCompany(companyData: { name: string }): Observable<any> {
    return this.http.put(`${this.api.base_uri}companies`, companyData).pipe(
      tap(() => {
        this.companyNameSubject.next(companyData.name); // Update shared state
      })
    );
  }
}
