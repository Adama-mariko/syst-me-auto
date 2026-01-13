import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from '../models/request.model';
import { environment } from '../../environments/environment';
import { MockRequestService } from './mock-request.service';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = environment.apiUrl;
  private refresh$ = new Subject<void>();
  private readonly MODE_KEY = 'USE_MOCK';

  constructor(private http: HttpClient, private mock: MockRequestService) { }

  private resolveApiUrl(): string {
    try {
      const params = new URLSearchParams(location.search);
      const paramApi = params.get('api');
      if (paramApi && paramApi.startsWith('http')) {
        const normalizedParam = paramApi.endsWith('/api') ? paramApi : `${paramApi}/api`;
        localStorage.setItem('API_URL', normalizedParam);
        return normalizedParam;
      }
      const stored = localStorage.getItem('API_URL');
      if (stored && stored.startsWith('http')) {
        return stored.endsWith('/api') ? stored : `${stored}/api`;
      }
    } catch (_) {}
    return this.apiUrl;
  }

  private isMock(): boolean {
    try {
      const params = new URLSearchParams(location.search);
      const mode = (params.get('mode') || '').toLowerCase();
      if (mode === 'api') return false;
      if (mode === 'mock') return true;
      const stored = localStorage.getItem(this.MODE_KEY);
      if (stored === 'true' || stored === 'false') {
        return stored === 'true';
      }
    } catch (_) {}
    return !!(environment as any).useMock;
  }

  setMockMode(enabled: boolean): void {
    try {
      localStorage.setItem(this.MODE_KEY, enabled ? 'true' : 'false');
    } catch (_) {}
    this.refresh$.next();
  }

  getRequests(): Observable<Request[]> {
    if (this.isMock()) {
      return this.mock.getRequests();
    }
    const url = this.resolveApiUrl();
    return this.http.get<Request[]>(`${url}/requests`);
  }

  getRequest(id: number): Observable<Request> {
    if (this.isMock()) {
      return this.mock.getRequest(id);
    }
    const url = this.resolveApiUrl();
    return this.http.get<Request>(`${url}/requests/${id}`);
  }

  createRequest(request: Request): Observable<Request> {
    if (this.isMock()) {
      return this.mock.createRequest(request);
    }
    const url = this.resolveApiUrl();
    return this.http.post<Request>(`${url}/requests`, request).pipe(
      tap(() => this.refresh$.next())
    );
  }

  updateRequest(id: number, request: Partial<Request>): Observable<Request> {
    if (this.isMock()) {
      return this.mock.updateRequest(id, request);
    }
    const url = this.resolveApiUrl();
    return this.http.put<Request>(`${url}/requests/${id}`, request).pipe(
      tap(() => this.refresh$.next())
    );
  }

  deleteRequest(id: number): Observable<any> {
    if (this.isMock()) {
      return this.mock.deleteRequest(id);
    }
    const url = this.resolveApiUrl();
    return this.http.delete(`${url}/requests/${id}`).pipe(
      tap(() => this.refresh$.next())
    );
  }

  downloadReport(format: string, status?: string): void {
    if (this.isMock()) {
      this.mock.downloadReport(format, status);
      return;
    }
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
