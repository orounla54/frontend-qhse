# 📚 Guide des Services API - Module QHSE

## ✅ Services disponibles

### 1. **laboratoireService.ts** 
Services pour le module Laboratoire (✅ TESTÉ ET FONCTIONNEL)

```typescript
import { 
  echantillonService, 
  analyseService, 
  planControleService 
} from '../services/laboratoireService';

// Exemples d'utilisation
await echantillonService.create(data);
await echantillonService.update(id, data);
await analyseService.getAll({ page: 1, limit: 10 });
```

### 2. **qualiteService.ts**
Services pour le module Qualité

```typescript
import { 
  matierePremiereService,
  controleQualiteService,
  nonConformiteService,
  auditQualiteService,
  decisionQualiteService
} from '../services/qualiteService';

// Exemples d'utilisation
await matierePremiereService.create(data);
await controleQualiteService.getAll();
await nonConformiteService.fermer(id, data);
```

### 3. **hseService.ts**
Services pour le module HSE

```typescript
import { 
  formationService,
  epiService,
  produitChimiqueService,
  hygieneService
} from '../services/hseService';

// Exemples d'utilisation
await formationService.create(data);
await formationService.getExpirantes();
await epiService.update(id, data);
```

### 4. **dashboardApiService.ts**
Services pour le Dashboard

```typescript
import { dashboardApiService } from '../services/dashboardApiService';

// Exemples d'utilisation
await dashboardApiService.getStats();
await dashboardApiService.getLaboratoire();
await dashboardApiService.getQualite();
```

## 🔧 Configuration commune

Tous les services incluent :
- ✅ URL backend : `https://backend-qhse.vercel.app`
- ✅ Authentification JWT automatique
- ✅ Gestion des erreurs 401 (déconnexion auto)
- ✅ Headers `Content-Type: application/json`

## 🚫 Erreurs courantes et solutions

### Erreur 400 (Bad Request)
**Cause** : Données invalides ou champs requis manquants

**Solution** :
1. Vérifier que tous les champs requis sont présents
2. Vérifier le format des données (dates, nombres, etc.)
3. Consulter les logs backend pour voir l'erreur exacte

### Erreur 401 (Unauthorized)
**Cause** : Token JWT manquant ou expiré

**Solution** :
- L'intercepteur déconnecte automatiquement l'utilisateur
- Se reconnecter pour obtenir un nouveau token

### Erreur 405 (Method Not Allowed)
**Cause** : Mauvaise URL ou route qui n'existe pas

**Solution** :
- Vérifier que vous utilisez le bon service
- Vérifier que la route existe dans le backend

### Erreur "Unexpected token '<'"
**Cause** : Le backend retourne du HTML au lieu de JSON

**Solution** :
- Vérifier que le backend est déployé et accessible
- Vérifier que la route existe
- Vérifier les logs backend

## 📝 Migration des appels fetch

### AVANT (à ne plus utiliser)
```typescript
const res = await fetch('/api/laboratoire/echantillons', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  },
  body: JSON.stringify(data)
});
if (!res.ok) throw new Error('Erreur');
const result = await res.json();
```

### APRÈS (recommandé)
```typescript
import { echantillonService } from '../services/laboratoireService';

// L'authentification est automatique !
const result = await echantillonService.create(data);
```

## 🎯 Avantages des services

1. **Code plus propre** : Moins de duplication
2. **Authentification automatique** : Plus besoin de gérer les tokens
3. **Gestion d'erreur centralisée** : Déconnexion auto sur 401
4. **Type-safe** : TypeScript pour éviter les erreurs
5. **Maintenabilité** : Un seul endroit pour modifier l'URL

## 📦 Structure des réponses

Les services retournent directement les données Axios :

```typescript
const response = await echantillonService.getAll();
// response.data contient les données
// response.status contient le code HTTP
// response.headers contient les headers
```

## 🔍 Debugging

Pour voir les requêtes :
1. Ouvrir DevTools → Network
2. Filtrer par "Fetch/XHR"
3. Cliquer sur une requête pour voir :
   - Headers (dont Authorization)
   - Payload (données envoyées)
   - Response (réponse du serveur)

## ✨ Prochaines étapes

Les pages suivantes ont encore des appels fetch à remplacer :
- [ ] `Qualite.tsx` : 7 appels fetch restants
- [ ] `HSE.tsx` : Appels fetch à identifier

Pour chaque page :
1. Importer les services nécessaires
2. Remplacer les appels fetch par les méthodes du service
3. Tester la fonctionnalité
4. Commit et push
