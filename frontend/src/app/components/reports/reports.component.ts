import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '../../services/request.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  selectedStatus: string = '';
  statuses = ['En attente', 'En cours', 'Résolu', 'Clôturé'];

  constructor(private requestService: RequestService) { }

  export(format: string): void {
    this.requestService.downloadReport(format, this.selectedStatus);
  }
}
