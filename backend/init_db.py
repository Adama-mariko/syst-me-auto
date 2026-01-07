from app import create_app, db
from models import Request
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    db.create_all()
    
    # Créer quelques données de test si la base est vide
    if Request.query.count() == 0:
        req1 = Request(
            request_type='Informatique',
            priority='Élevée',
            requester_name='Jean Dupont',
            requester_service='Comptabilité',
            requester_contact='jean.dupont@example.com',
            description='Mon ordinateur ne démarre plus.',
            status='En attente',
            deadline=datetime.utcnow() + timedelta(days=2)
        )
        req2 = Request(
            request_type='Maintenance',
            priority='Moyenne',
            requester_name='Marie Curie',
            requester_service='Laboratoire',
            requester_contact='marie.curie@example.com',
            description='Lampe grillée dans le couloir.',
            status='En cours',
            assigned_agent='Paul Bricole',
            deadline=datetime.utcnow() + timedelta(days=5)
        )
        db.session.add(req1)
        db.session.add(req2)
        db.session.commit()
        print("Base de données initialisée avec des données de test.")
    else:
        print("Base de données déjà existante.")
