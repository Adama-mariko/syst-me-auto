import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = this.resolveApiUrl();
  private refresh$ = new Subject<void>();

  constructor(private http: HttpClient) { }

  private resolveApiUrl(): string {
    try {
      const stored = localStorage.getItem('API_URL');
      if (stored && stored.startsWith('http')) {
        return stored.endsWith('/api') ? stored : `${stored}/api`;
      }
    } catch (_) {}
    if (location.hostname !== 'localhost') {
      return 'http://localhost:5000/api';
    }
    return 'http://localhost:5000/api';
  }

  getRequests(): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}/requests`);
  }

  getRequest(id: number): Observable<Request> {
    return this.http.get<Request>(`${this.apiUrl}/requests/${id}`);
  }

  createRequest(request: Request): Observable<Request> {
    return this.http.post<Request>(`${this.apiUrl}/requests`, request).pipe(
      tap(() => this.refresh$.next())
    );
  }

  updateRequest(id: number, request: Partial<Request>): Observable<Request> {
    return this.http.put<Request>(`${this.apiUrl}/requests/${id}`, request).pipe(
      tap(() => this.refresh$.next())
    );
  }

  deleteRequest(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/requests/${id}`).pipe(
      tap(() => this.refresh$.next())
    );
  }

  downloadReport(format: string, status?: string): void {
    let url = `${this.apiUrl}/reports/export/${format}`;
    if (status) {
      url += `?status=${status}`;
    }
    window.open(url, '_blank');
  }

  onChanges(): Observable<void> {
    return this.refresh$.asObservable();
  }
}
