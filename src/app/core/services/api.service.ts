import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }
  client_uri = environment.client_uri;
  base_uri = environment.base_uri;
  base_uri_api = environment.base_uri_api;

}
