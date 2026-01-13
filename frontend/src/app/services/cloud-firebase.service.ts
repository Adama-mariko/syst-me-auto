import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Request } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class CloudFirebaseService {
  constructor(private http: HttpClient) {}

  private toArray(dict: Record<string, any> | null): Request[] {
    if (!dict) return [];
    const items: Request[] = Object.values(dict) as Request[];
    return items.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  }

  getRequests(baseUrl: string): Observable<Request[]> {
    return this.http.get<Record<string, any> | null>(`${baseUrl}/requests.json`).pipe(
      map((dict) => this.toArray(dict))
    );
  }

  getRequest(baseUrl: string, id: number): Observable<Request> {
    return this.getRequests(baseUrl).pipe(
      map((items) => items.find((r) => r.id === id) as Request)
    );
  }

  createRequest(baseUrl: string, request: Request): Observable<Request> {
    return this.getRequests(baseUrl).pipe(
      switchMap((items) => {
        const nextId = (items.reduce((m, r) => Math.max(m, r.id || 0), 0) || 0) + 1;
        const created: Request = {
          ...request,
          id: nextId,
          created_at: new Date().toISOString()
        };
        if ((created.status === 'Résolu' || created.status === 'Clôturé') && !created.resolution_date) {
          created.resolution_date = new Date().toISOString();
        }
        return this.http.post(`${baseUrl}/requests.json`, created).pipe(map(() => created));
      })
    );
  }

  updateRequest(baseUrl: string, id: number, request: Partial<Request>): Observable<Request> {
    return this.http.get<Record<string, any> | null>(`${baseUrl}/requests.json`).pipe(
      switchMap((dict) => {
        const entries = Object.entries(dict || {});
        const entry = entries.find(([, value]) => value && value.id === id);
        if (!entry) {
          return of({ ...request, id } as Request);
        }
        const [key, current] = entry;
        const merged: Request = { ...current, ...request };
        if ((merged.status === 'Résolu' || merged.status === 'Clôturé') && !merged.resolution_date) {
          merged.resolution_date = new Date().toISOString();
        }
        return this.http.patch(`${baseUrl}/requests/${key}.json`, merged).pipe(map(() => merged));
      })
    );
  }

  deleteRequest(baseUrl: string, id: number): Observable<any> {
    return this.http.get<Record<string, any> | null>(`${baseUrl}/requests.json`).pipe(
      switchMap((dict) => {
        const entries = Object.entries(dict || {});
        const entry = entries.find(([, value]) => value && value.id === id);
        if (!entry) {
          return of({ message: 'Requête supprimée' });
        }
        const [key] = entry;
        return this.http.delete(`${baseUrl}/requests/${key}.json`);
      })
    );
  }
}

