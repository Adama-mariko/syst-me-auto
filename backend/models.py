from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Request(db.Model):
    __tablename__ = 'requests'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Type de requête (Menu déroulant)
    request_type = db.Column(db.String(50), nullable=False)
    
    # Priorité (Basse/Moyenne/Élevée/Urgente)
    priority = db.Column(db.String(20), nullable=False)
    
    # Demandeur
    requester_name = db.Column(db.String(100), nullable=False)
    requester_service = db.Column(db.String(100), nullable=False)
    requester_contact = db.Column(db.String(100), nullable=False)
    
    # Description
    description = db.Column(db.Text, nullable=False)
    
    # Statut (En attente/En cours/Résolu/Clôturé)
    status = db.Column(db.String(20), default='En attente')
    
    # Résolution
    resolution_date = db.Column(db.DateTime, nullable=True)
    assigned_agent = db.Column(db.String(100), nullable=True)
    
    # Champs optionnels
    attachments = db.Column(db.String(255), nullable=True) # Chemin vers le fichier
    internal_comments = db.Column(db.Text, nullable=True)
    history = db.Column(db.Text, nullable=True) # Stocké en JSON ou texte
    deadline = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'request_type': self.request_type,
            'priority': self.priority,
            'requester_name': self.requester_name,
            'requester_service': self.requester_service,
            'requester_contact': self.requester_contact,
            'description': self.description,
            'status': self.status,
            'resolution_date': self.resolution_date.isoformat() if self.resolution_date else None,
            'assigned_agent': self.assigned_agent,
            'attachments': self.attachments,
            'internal_comments': self.internal_comments,
            'history': self.history,
            'deadline': self.deadline.isoformat() if self.deadline else None
        }
