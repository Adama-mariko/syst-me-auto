from flask import Blueprint, request, jsonify, send_file
from models import db, Request
from services.report_service import ReportService
from datetime import datetime

api = Blueprint('api', __name__)

# --- REQUESTS CRUD ---

@api.route('/requests', methods=['GET'])
def get_requests():
    requests = Request.query.order_by(Request.created_at.desc()).all()
    return jsonify([req.to_dict() for req in requests])

@api.route('/requests', methods=['POST'])
def create_request():
    data = request.json
    new_request = Request(
        request_type=data.get('request_type'),
        priority=data.get('priority'),
        requester_name=data.get('requester_name'),
        requester_service=data.get('requester_service'),
        requester_contact=data.get('requester_contact'),
        description=data.get('description'),
        assigned_agent=data.get('assigned_agent'),
        deadline=datetime.fromisoformat(data.get('deadline')) if data.get('deadline') else None
    )
    if data.get('status'):
        new_request.status = data.get('status')
        if new_request.status in ['Résolu', 'Clôturé']:
            new_request.resolution_date = datetime.utcnow()
    db.session.add(new_request)
    db.session.commit()
    return jsonify(new_request.to_dict()), 201

@api.route('/requests/<int:id>', methods=['GET'])
def get_request(id):
    req = Request.query.get_or_404(id)
    return jsonify(req.to_dict())

@api.route('/requests/<int:id>', methods=['PUT'])
def update_request(id):
    req = Request.query.get_or_404(id)
    data = request.json
    
    req.request_type = data.get('request_type', req.request_type)
    req.priority = data.get('priority', req.priority)
    req.requester_name = data.get('requester_name', req.requester_name)
    req.requester_service = data.get('requester_service', req.requester_service)
    req.requester_contact = data.get('requester_contact', req.requester_contact)
    req.description = data.get('description', req.description)
    req.status = data.get('status', req.status)
    req.assigned_agent = data.get('assigned_agent', req.assigned_agent)
    req.internal_comments = data.get('internal_comments', req.internal_comments)
    if data.get('deadline') is not None:
        req.deadline = datetime.fromisoformat(data.get('deadline')) if data.get('deadline') else None
    
    if data.get('resolution_date'):
        req.resolution_date = datetime.fromisoformat(data.get('resolution_date'))
    elif req.status in ['Résolu', 'Clôturé'] and not req.resolution_date:
        req.resolution_date = datetime.utcnow()
        
    db.session.commit()
    return jsonify(req.to_dict())

@api.route('/requests/<int:id>', methods=['DELETE'])
def delete_request(id):
    req = Request.query.get_or_404(id)
    db.session.delete(req)
    db.session.commit()
    return jsonify({'message': 'Requête supprimée'})

# --- REPORTS ---

@api.route('/reports/export/<format>', methods=['GET'])
def export_report(format):
    # Filtres simples (à étendre selon besoins)
    status_filter = request.args.get('status')
    
    query = Request.query
    if status_filter:
        query = query.filter_by(status=status_filter)
        
    requests = query.all()
    
    if format == 'pdf':
        pdf_buffer = ReportService.generate_pdf_report(requests)
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name='rapport_requetes.pdf',
            mimetype='application/pdf'
        )
    elif format == 'excel':
        excel_buffer = ReportService.generate_excel_report(requests)
        return send_file(
            excel_buffer,
            as_attachment=True,
            download_name='rapport_requetes.xlsx',
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    elif format == 'word':
        word_buffer = ReportService.generate_word_report(requests)
        return send_file(
            word_buffer,
            as_attachment=True,
            download_name='rapport_requetes.docx',
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    else:
        return jsonify({'error': 'Format non supporté'}), 400
