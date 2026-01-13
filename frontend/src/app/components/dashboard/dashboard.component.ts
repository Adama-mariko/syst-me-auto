import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { Request } from '../../models/request.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  requests: Request[] = [];
  filteredRequests: Request[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'Tous';
  statuses = ['Tous', 'En attente', 'En cours', 'Résolu', 'Clôturé'];
  loading: boolean = false;
  errorMessage: string = '';
  apiInput: string = '';

  totalRequests: number = 0;
  pendingRequests: number = 0;
  inProgressRequests: number = 0;
  resolvedRequests: number = 0;

  constructor(private requestService: RequestService) { }

  ngOnInit(): void {
    this.loadRequests();
    this.requestService.onChanges().subscribe(() => {
      this.loadRequests();
    });
  }

  loadRequests(): void {
    this.loading = true;
    this.errorMessage = '';
    this.requestService.getRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.calculateStats();
        this.filterRequests();
        this.loading = false;
      },
      error: (_) => {
        this.requests = [];
        this.filteredRequests = [];
        this.calculateStats();
        this.loading = false;
        this.errorMessage = 'Impossible de joindre l’API. Configurez l’URL via ?api= ou localStorage.';
      }
    });
  }

  saveApiUrl(): void {
    const url = (this.apiInput || '').trim();
    if (!url) return;
    const normalized = url.endsWith('/api') ? url : `${url}/api`;
    try {
      localStorage.setItem('API_URL', normalized);
    } catch (_) {}
    this.loadRequests();
  }
  
  setMode(mock: boolean): void {
    this.requestService.setMockMode(mock);
    this.loadRequests();
  }
  calculateStats(): void {
    this.totalRequests = this.requests.length;
    this.pendingRequests = this.requests.filter(r => r.status === 'En attente').length;
    this.inProgressRequests = this.requests.filter(r => r.status === 'En cours').length;
    this.resolvedRequests = this.requests.filter(r => r.status === 'Résolu' || r.status === 'Clôturé').length;
  }

  filterRequests(): void {
    const term = (this.searchTerm || '').toLowerCase().trim();
    const status = this.selectedStatus;
    let list = [...this.requests];
    if (status && status !== 'Tous') {
      list = list.filter(req => req.status === status);
    }
    if (term) {
      list = list.filter(req =>
        (req.requester_name && req.requester_name.toLowerCase().includes(term)) ||
        (req.description && req.description.toLowerCase().includes(term)) ||
        (req.request_type && req.request_type.toLowerCase().includes(term)) ||
        (req.assigned_agent && req.assigned_agent.toLowerCase().includes(term))
      );
    }
    this.filteredRequests = list;
    this.loading = false;
  }

  deleteRequest(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette requête ?')) {
      this.requestService.deleteRequest(id).subscribe(() => {
        this.loadRequests();
      });
    }
  }

  downloadCurrentReport(format: string): void {
    this.requestService.downloadReport(format, this.selectedStatus === 'Tous' ? undefined : this.selectedStatus);
  }

  getEcheanceDate(req: Request): string | undefined {
    return req.resolution_date || req.deadline;
  }

  isOverdue(req: Request): boolean {
    if (req.resolution_date) return false;
    if (!req.deadline) return false;
    return new Date(req.deadline) < new Date();
  }

}
