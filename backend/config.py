import os

class Config:
    # Configuration par défaut (SQLite pour le développement rapide sans serveur MySQL)
    # Pour utiliser MySQL, décommentez la ligne suivante et configurez vos accès
    # SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://user:password@localhost/systeme_auto_db'
    
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'votre_cle_secrete_tres_securisee'
