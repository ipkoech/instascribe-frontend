import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<Breadcrumb[]>([]);
  breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  setBreadcrumbs(breadcrumbs: Breadcrumb[]) {
    this.breadcrumbsSubject.next(breadcrumbs);
  }

  addBreadcrumb(breadcrumb: Breadcrumb) {
    const currentBreadcrumbs = this.breadcrumbsSubject.getValue();
    this.breadcrumbsSubject.next([...currentBreadcrumbs, breadcrumb]);
  }

  updateBreadcrumb(index: number, breadcrumb: Breadcrumb) {
    const currentBreadcrumbs = this.breadcrumbsSubject.getValue();
    currentBreadcrumbs[index] = breadcrumb;
    this.breadcrumbsSubject.next([...currentBreadcrumbs]);
  }

  clearBreadcrumbs() {
    this.breadcrumbsSubject.next([]);
  }
}
