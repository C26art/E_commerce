import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  getDetails(): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/dashboard/details`);
  }
}
