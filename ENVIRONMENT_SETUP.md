# 🔧 Configuration des Variables d'Environnement

## 📁 Fichiers créés

### Backend (`backend/`)
- **`.env`** - Variables pour le développement local
- **`.env.example`** - Template pour la production (ne pas commiter)

### Frontend (`frontend/`)
- **`.env`** - Variables pour le développement local
- **`.env.example`** - Template pour la production (ne pas commiter)

---

## 🚀 Setup Initial

### Backend
```bash
cd backend

# Copier le fichier d'exemple
cp .env.example .env

# Le .env contient déjà la config de dev (SQLite local)
# Pour la production sur Render, modifier:
# DATABASE_URL=mysql+pymysql://user:pass@host/db
# SECRET_KEY=your_secure_key
# ALLOWED_ORIGINS=https://votre-frontend.netlify.app
```

### Frontend
```bash
cd frontend

# Copier le fichier d'exemple
cp .env.example .env

# Le .env contient déjà la config de dev (localhost:5000)
# Pour la production, modifier:
# NG_APP_API_URL=https://votre-backend.onrender.com/api
```

---

## 🔐 Sécurité

⚠️ **IMPORTANT**: Les fichiers `.env` NE doivent PAS être commités (ils sont dans `.gitignore`)

- Jamais partager les clés secrètes dans les repos publics
- Utiliser des secrets sur les plateformes de déploiement (Render, Netlify)

---

## 📌 Variables Clés

### Backend (.env)
```
DATABASE_URL          → URL de la base de données
SECRET_KEY            → Clé secrète Flask
FLASK_ENV             → development ou production
ALLOWED_ORIGINS       → URLs CORS autorisées
API_BASE_URL          → URL publique du backend
FRONTEND_URL          → URL du frontend (CORS)
```

### Frontend (.env)
```
NG_APP_API_URL        → URL de l'API backend
NG_APP_PRODUCTION     → Mode production (true/false)
NG_APP_APP_NAME       → Nom de l'app
```

---

## ✅ Étapes suivantes

1. **Développement local**: Tous les fichiers `.env` sont configurés ✓
2. **Production (Render)**: 
   - Récupérer l'URL de votre backend Render
   - Mettre à jour `NG_APP_API_URL` dans les variables d'environnement du frontend
   - Définir les variables sur Render (Settings → Environment)

