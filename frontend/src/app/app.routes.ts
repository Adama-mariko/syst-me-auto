import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RequestFormComponent } from './components/request-form/request-form.component';
import { ReportsComponent } from './components/reports/reports.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'requests/new', component: RequestFormComponent },
  { path: 'requests/:id', component: RequestFormComponent },
  { path: 'reports', component: ReportsComponent },
  { path: '**', redirectTo: '' }
];
