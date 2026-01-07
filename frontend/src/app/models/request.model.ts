export interface Request {
  id?: number;
  created_at?: string;
  request_type: string;
  priority: string;
  requester_name: string;
  requester_service: string;
  requester_contact: string;
  description: string;
  status?: string;
  resolution_date?: string;
  assigned_agent?: string;
  attachments?: string;
  internal_comments?: string;
  history?: string;
  deadline?: string;
}
