import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { DraftModel } from '../../../core/interfaces/draft.model';
import { WebsocketsService } from '../../../core/services/websockets.service';

@Injectable({
  providedIn: 'root'
})
export class DraftService {

  private _draft$ = new BehaviorSubject<DraftModel | undefined>(undefined);
  draft$ = this._draft$.asObservable();
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private websocketService: WebsocketsService,
  ) { }

  fetchDrafts(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get(`${this.api.base_uri}drafts`, { params: httpParams, withCredentials: true, observe: 'response' });
  }

  fetchDraft(id: string): Observable<any> {
    return this.http.get(`${this.api.base_uri}drafts/${id}`, { withCredentials: true, observe: 'response' });
  }

  createDraft(draft: any): Observable<any> {
    return this.http.post(`${this.api.base_uri}drafts`, draft);
  }

  updateDraft(id: string, draft: any): Observable<any> {
    return this.http.put(`${this.api.base_uri}drafts/${id}`, draft, { withCredentials: true, observe: 'response' });
  }

  deleteDraft(id: string): Observable<any> {
    return this.http.delete(`${this.api.base_uri}drafts/${id}`);
  }

  addCollaborators(draftId: string, collaborators: any): Observable<any> {
    return this.http.post(`${this.api.base_uri}drafts/${draftId}/add_collaborator`, {
      user_ids: collaborators.user_ids,
      reason: collaborators.reason,
      access_level: collaborators.access_level
    });
  }

  removeCollaborators(draftId: string, userIds: string[]): Observable<any> {
    return this.http.post(`${this.api.base_uri}drafts/${draftId}/remove_collaborator`, {
      user_ids: userIds
    });
  }

  startReview(draftId: string): Observable<any> {
    return this.http.post(`${this.api.base_uri}drafts/${draftId}/start_review`, {}, { withCredentials: true, observe: 'response' });
  }

  approveDraft(draftId: string): Observable<any> {
    return this.http.post(`${this.api.base_uri}drafts/${draftId}/approve`, {},{ withCredentials: true, observe: 'response' });
  }

  rejectDraft(draftId: string): Observable<any> {
    return this.http.post(`${this.api.base_uri}drafts/${draftId}/reject`, {});
  }

  filterDrafts(filters: any): Observable<any> {
    return this.fetchDrafts({
      'filter[status]': filters.status,
      'filter[created_at]': filters.createdAt,
      'filter[user_id]': filters.userId,
      order_by: filters.orderBy,
      page: filters.page,
      per_page: filters.perPage
    });
  }

  subscribeToDraftChannel(draft: DraftModel) {
    this.websocketService.subscribeAndListenToChannel(
      'DraftChannel',
      { draft_id: draft.id },
      (data) => {
        if (data?.action === 'update') {
          const updatedDraft = data.draft;
          this._draft$.next(updatedDraft);
        }
      }
    );
  }

  // Fetch Shared drafts
  fetcSharedDrafts(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get(`${this.api.base_uri}drafts/shared-drafts`, { params: httpParams, withCredentials: true, observe: 'response' });
  }
}

