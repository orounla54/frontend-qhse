# QHSE Frontend

Application React frontend pour le module QHSE (Qualité, Hygiène, Sécurité, Environnement) de Trafrule.

## 🚀 Technologies

- **React 18** - Bibliothèque UI
- **TypeScript** - Langage typé
- **Vite** - Build tool moderne
- **Tailwind CSS** - Framework CSS
- **React Router** - Routage
- **Axios** - Client HTTP
- **Chart.js** - Graphiques
- **React Hook Form** - Gestion des formulaires

## ✨ Fonctionnalités

### Interface utilisateur
- **Dashboard** - Tableau de bord avec statistiques
- **Gestion Qualité** - Audits, conformité, contrôles
- **Gestion HSE** - Incidents, risques, formations
- **Laboratoire** - Analyses, échantillons, résultats
- **Authentification** - Login/Register sécurisé

### Composants
- **Modals** - Formulaires modaux pour toutes les entités
- **DataTable** - Tableaux de données avec pagination
- **Charts** - Graphiques et statistiques
- **Forms** - Formulaires avec validation
- **Notifications** - Système de notifications

## 🛠️ Installation

1. **Cloner le repository**
```bash
git clone https://github.com/orounla54/frontend-qhse.git
cd frontend-qhse
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
# Créer un fichier .env
cp env.example .env
```

4. **Variables d'environnement requises**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=QHSE Trafrule
```

5. **Démarrer l'application**
```bash
# Développement
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview
```

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── components/     # Composants React
│   │   ├── auth/       # Authentification
│   │   ├── common/     # Composants communs
│   │   ├── features/   # Composants métier
│   │   └── layout/     # Layout et navigation
│   ├── pages/          # Pages de l'application
│   ├── services/       # Services API
│   ├── hooks/          # Hooks personnalisés
│   ├── contexts/       # Contextes React
│   ├── types/          # Types TypeScript
│   └── utils/          # Utilitaires
├── public/             # Fichiers statiques
└── dist/               # Build de production
```

## 🎨 Design System

### Composants UI
- **Button** - Boutons avec variantes
- **Input** - Champs de saisie
- **Modal** - Modales et dialogues
- **Card** - Cartes de contenu
- **DataTable** - Tableaux de données
- **Badge** - Badges et étiquettes

### Thème
- **Couleurs** : Palette cohérente avec Tailwind
- **Typographie** : Hiérarchie claire
- **Espacement** : Système d'espacement cohérent
- **Responsive** : Design adaptatif

## 🔧 Scripts disponibles

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Preview du build
- `npm run lint` - Linting ESLint

## 📊 Fonctionnalités principales

### Dashboard
- Statistiques en temps réel
- Graphiques et métriques
- Notifications
- Accès rapide aux modules

### Gestion Qualité
- **Audits** - Planification et suivi
- **Conformité** - Respect des normes
- **Contrôles** - Contrôles qualité
- **Non-conformités** - Gestion des NC

### Gestion HSE
- **Incidents** - Déclaration et suivi
- **Risques** - Identification et évaluation
- **Formations** - Planification et suivi
- **Hygiène** - Gestion de l'hygiène

### Laboratoire
- **Analyses** - Gestion des analyses
- **Échantillons** - Suivi des échantillons
- **Résultats** - Enregistrement des résultats
- **Traçabilité** - Suivi complet

## 🔐 Authentification

### Fonctionnalités
- Login/Register
- Gestion des sessions
- Protection des routes
- Rôles et permissions

### Composants
- `AuthModal` - Modal d'authentification
- `LoginForm` - Formulaire de connexion
- `RegisterForm` - Formulaire d'inscription
- `ProtectedRoute` - Protection des routes

## 📱 Responsive Design

### Breakpoints
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

### Optimisations
- Images responsives
- Navigation mobile
- Touch-friendly
- Performance optimisée

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

### Variables d'environnement de production
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME=QHSE Trafrule
```

### Déploiement sur Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

### Déploiement sur Netlify
```bash
# Build
npm run build

# Déployer le dossier dist/
```

## 🧪 Tests

### Linting
```bash
npm run lint
```

### Types
```bash
npx tsc --noEmit
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence ISC - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Trafrule Team** - Développement et maintenance

## 📞 Support

Pour toute question ou support, contactez l'équipe Trafrule.

## 🔗 Liens utiles

- [Backend API](https://github.com/orounla54/backend-qhse)
- [Documentation API](https://github.com/orounla54/backend-qhse#documentation-api)
- [Guide de déploiement](https://github.com/orounla54/frontend-qhse#déploiement)

