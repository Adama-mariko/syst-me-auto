import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { Request } from '../../models/request.model';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './request-form.component.html',
  styleUrl: './request-form.component.scss'
})
export class RequestFormComponent implements OnInit {
  request: Request = {
    request_type: '',
    priority: 'Moyenne',
    requester_name: '',
    requester_service: '',
    requester_contact: '',
    description: '',
    status: 'En attente'
  };
  isEditMode: boolean = false;

  types = ['Informatique', 'Maintenance', 'Ressources Humaines', 'Autre'];
  priorities = ['Basse', 'Moyenne', 'Élevée', 'Urgente'];
  statuses = ['En attente', 'En cours', 'Résolu', 'Clôturé'];

  constructor(
    private requestService: RequestService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.requestService.getRequest(+id).subscribe(data => {
        this.request = data;
      });
    }
  }

  onSubmit(): void {
    if (this.isEditMode) {
      this.requestService.updateRequest(this.request.id!, this.request).subscribe(() => {
        this.router.navigate(['/']);
      });
    } else {
      this.requestService.createRequest(this.request).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
  }
}
