import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from '../models/request.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = environment.apiUrl;
  private refresh$ = new Subject<void>();

  constructor(private http: HttpClient) { }

  private resolveApiUrl(): string {
    try {
      const stored = localStorage.getItem('API_URL');
      if (stored && stored.startsWith('http')) {
        return stored.endsWith('/api') ? stored : `${stored}/api`;
      }
    } catch (_) {}
    return this.apiUrl;
  }

  getRequests(): Observable<Request[]> {
    const url = this.resolveApiUrl();
    return this.http.get<Request[]>(`${url}/requests`);
  }

  getRequest(id: number): Observable<Request> {
    const url = this.resolveApiUrl();
    return this.http.get<Request>(`${url}/requests/${id}`);
  }

  createRequest(request: Request): Observable<Request> {
    const url = this.resolveApiUrl();
    return this.http.post<Request>(`${url}/requests`, request).pipe(
      tap(() => this.refresh$.next())
    );
  }

  updateRequest(id: number, request: Partial<Request>): Observable<Request> {
    const url = this.resolveApiUrl();
    return this.http.put<Request>(`${url}/requests/${id}`, request).pipe(
      tap(() => this.refresh$.next())
    );
  }

  deleteRequest(id: number): Observable<any> {
    const url = this.resolveApiUrl();
    return this.http.delete(`${url}/requests/${id}`).pipe(
      tap(() => this.refresh$.next())
    );
  }

  downloadReport(format: string, status?: string): void {
    const url = this.resolveApiUrl();
    let reportUrl = `${url}/reports/export/${format}`;
    if (status) {
      reportUrl += `?status=${status}`;
    }
    window.open(reportUrl, '_blank');
  }

  onChanges(): Observable<void> {
    return this.refresh$.asObservable();
  }
}
