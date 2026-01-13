import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { Request } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class MockRequestService {
  private storageKey = 'MOCK_REQUESTS';
  private refresh$ = new Subject<void>();
  private data: Request[] = [];

  constructor() {
    this.load();
    if (this.data.length === 0) {
      const now = new Date().toISOString();
      this.data = [
        {
          id: 1,
          created_at: now,
          request_type: 'Informatique',
          priority: 'Élevée',
          requester_name: 'Jean Dupont',
          requester_service: 'Comptabilité',
          requester_contact: 'jean.dupont@example.com',
          description: 'Mon ordinateur ne démarre plus.',
          status: 'En attente'
        },
        {
          id: 2,
          created_at: now,
          request_type: 'Maintenance',
          priority: 'Moyenne',
          requester_name: 'Marie Curie',
          requester_service: 'Laboratoire',
          requester_contact: 'marie.curie@example.com',
          description: 'Lampe grillée dans le couloir.',
          status: 'En cours',
          assigned_agent: 'Paul Bricole'
        }
      ];
      this.save();
    }
  }

  getRequests(): Observable<Request[]> {
    const list = [...this.data].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return of(list);
  }

  getRequest(id: number): Observable<Request> {
    const found = this.data.find(r => r.id === id)!;
    return of(found);
  }

  createRequest(request: Request): Observable<Request> {
    const nextId = (this.data.reduce((m, r) => Math.max(m, r.id || 0), 0) || 0) + 1;
    const created: Request = {
      ...request,
      id: nextId,
      created_at: new Date().toISOString()
    };
    if ((created.status === 'Résolu' || created.status === 'Clôturé') && !created.resolution_date) {
      created.resolution_date = new Date().toISOString();
    }
    this.data.push(created);
    this.save();
    this.refresh$.next();
    return of(created);
  }

  updateRequest(id: number, request: Partial<Request>): Observable<Request> {
    const idx = this.data.findIndex(r => r.id === id);
    const merged = { ...this.data[idx], ...request };
    if ((merged.status === 'Résolu' || merged.status === 'Clôturé') && !merged.resolution_date) {
      merged.resolution_date = new Date().toISOString();
    }
    this.data[idx] = merged;
    this.save();
    this.refresh$.next();
    return of(merged);
  }

  deleteRequest(id: number): Observable<any> {
    this.data = this.data.filter(r => r.id !== id);
    this.save();
    this.refresh$.next();
    return of({ message: 'Requête supprimée' });
  }

  downloadReport(format: string, status?: string): void {
    let items = [...this.data];
    if (status) {
      items = items.filter(r => r.status === status);
    }
    if (format === 'excel') {
      const csv = this.toCsv(items);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      this.saveBlob(blob, 'rapport_requetes.csv');
    } else if (format === 'word') {
      const html = this.toHtml(items);
      const blob = new Blob([html], { type: 'application/msword' });
      this.saveBlob(blob, 'rapport_requetes.doc');
    } else if (format === 'pdf') {
      const html = this.toHtml(items, true);
      const w = window.open('', '_blank');
      if (w) {
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
      }
    }
  }

  onChanges(): Observable<void> {
    return this.refresh$.asObservable();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      this.data = raw ? JSON.parse(raw) : [];
    } catch {
      this.data = [];
    }
  }

  private save(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch {}
  }

  private toCsv(items: Request[]): string {
    const headers = [
      'ID', 'Date Création', 'Type', 'Priorité',
      'Demandeur - Nom', 'Demandeur - Service', 'Demandeur - Contact',
      'Description', 'Statut', 'Date Résolution',
      'Agent Assigné', 'Échéance', 'Commentaires Internes'
    ];
    const lines = [headers.join(',')];
    for (const req of items) {
      const echeance = req.resolution_date ? req.resolution_date : (req.deadline || '');
      const row = [
        req.id || '',
        req.created_at || '',
        req.request_type || '',
        req.priority || '',
        req.requester_name || '',
        req.requester_service || '',
        req.requester_contact || '',
        (req.description || '').replace(/[\r\n]+/g, ' ').replace(/"/g, '""'),
        req.status || '',
        req.resolution_date || '',
        req.assigned_agent || '',
        echeance || '',
        (req.internal_comments || '').replace(/[\r\n]+/g, ' ').replace(/"/g, '""')
      ];
      lines.push(row.map(v => `"${String(v)}"`).join(','));
    }
    return lines.join('\n');
  }

  private toHtml(items: Request[], forPrint = false): string {
    const rows = items.map(req => {
      const echeance = req.resolution_date ? req.resolution_date : (req.deadline || '');
      return `<tr>
        <td>${req.id || ''}</td>
        <td>${req.created_at ? new Date(req.created_at).toLocaleDateString() : ''}</td>
        <td>${req.request_type || ''}</td>
        <td>${req.priority || ''}</td>
        <td>${req.requester_name || ''}<br>${req.requester_service || ''}<br>${req.requester_contact || ''}</td>
        <td>${(req.description || '').replace(/</g, '&lt;')}</td>
        <td>${echeance ? new Date(echeance).toLocaleDateString() : '-'}</td>
        <td>${req.status || ''}</td>
        <td>${req.assigned_agent || 'Non assigné'}</td>
      </tr>`;
    }).join('');
    const style = `
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; }
        h1 { color: #2c3e50; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #dfe6ed; padding: 8px; font-size: 12px; vertical-align: top; }
        thead th { background: #2c3e50; color: #fff; }
      </style>
    `;
    const script = forPrint ? `<script>window.onload=function(){window.print();}</script>` : '';
    return `<!doctype html><html><head><meta charset="utf-8">${style}</head><body>
      <h1>Rapport Global des Requêtes</h1>
      <table>
        <thead><tr>
          <th>ID</th><th>Date</th><th>Type</th><th>Priorité</th>
          <th>Demandeur</th><th>Description</th><th>Échéance</th><th>Statut</th><th>Agent</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${script}
    </body></html>`;
  }

  private saveBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}
