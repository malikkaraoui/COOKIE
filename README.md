# 🍪 COOKIE 🧑🏼‍🍳

> **Plateforme de trading crypto moderne construite avec React, Firebase et l'API Hyperliquid**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.6.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## ✨ Fonctionnalités

### 🔐 Authentification
- **Google Sign-In** via Firebase Authentication
- Gestion automatique des profils utilisateurs
- Synchronisation en temps réel avec Realtime Database
- Sécurité renforcée avec règles de sécurité
- Création automatique du profil à la première connexion

### 📊 Trading & Données
- **Intégration API Hyperliquid** pour les données crypto en temps réel
- **Système de cache intelligent** : affichage instantané + fallback automatique
- OrderBook BTC avec profondeur de marché
- Tuile Bitcoin avec statistiques 24h (prix + variation)
- WebSocket pour prix live + HTTP pour données 24h
- Résilience : fonctionne même si Hyperliquid est indisponible

### 👤 Profils Utilisateurs
- Photo de profil synchro avec Google (120px, centrée)
- Prénom/nom d'utilisateur (importés automatiquement)
- Date de naissance avec calcul automatique de l'âge
- Page profil simplifiée : affichage âge si date renseignée
- Design épuré : nom sous la photo, pas d'inputs modifiables

### 🎨 Interface Moderne
- **Design System cohérent** (palette violette/beige/dorée)
- Sidebar redimensionnable avec persistance
- Navigation fluide avec React Router
- Composants UI réutilisables

---

## 🏗️ Architecture

### Structure du Projet

```
COOKIE/
├── src/
│   ├── auth/                    # Module d'authentification
│   │   ├── AuthContext.jsx      # Context API pour l'état auth
│   │   ├── LoginButton.jsx      # Bouton connexion Google
│   │   ├── LogoutButton.jsx     # Bouton déconnexion
│   │   └── ProfileButton.jsx    # Navigation profil
│   │
│   ├── components/              # Composants layout
│   │   ├── AppLayout.jsx        # Shell principal
│   │   ├── Sidebar.jsx          # Barre latérale
│   │   ├── Topbar.jsx           # Barre supérieure
│   │   ├── BtcOrderBook.jsx     # OrderBook Bitcoin
│   │   └── BtcTile.jsx          # Tuile stats BTC
│   │
│   ├── hooks/                   # Hooks personnalisés
│   │   ├── useAuth.js           # Logique authentification
│   │   ├── useUserProfile.js    # Gestion profils Realtime Database
│   │   ├── useBtc24h.js         # Données BTC 24h (via API meta)
│   │   └── useResizablePanel.js # Redimensionnement UI
│   │
│   ├── lib/                     # Services & utilitaires
│   │   ├── database/
│   │   │   ├── userService.js   # CRUD profils utilisateurs
│   │   │   └── priceCache.js    # Système de cache des prix
│   │   ├── hlEndpoints.js       # Endpoints Hyperliquid
│   │   └── priceCalculations.js # Logique métier: calculs de variations
│   │
│   ├── pages/                   # Pages routées
│   │   ├── page1.jsx
│   │   ├── page2.jsx
│   │   └── ProfilePage.jsx      # Page profil utilisateur
│   │
│   ├── context/                 # Contexts React
│   │   └── NavigationContext.jsx
│   │
│   └── config/
│       └── firebase.js          # Config Firebase
│
├── docs/
│   ├── CACHE_ARCHITECTURE.md      # Architecture du cache des prix
│   ├── PRICE_CALCULATIONS.md      # Logique métier des calculs
│   └── REALTIME_DATABASE.md       # Architecture Firebase Realtime Database
│
├── database.rules.json          # Règles de sécurité Realtime Database
└── .env                         # Variables d'environnement
```

### Principes Architecturaux

#### 🧩 Modularité Stricte
- **Context API** pour l'état global (AuthContext, NavigationContext)
- **Hooks personnalisés** pour la logique réutilisable
- **Service Layer** pour les appels Firebase/API
- **Composants atomiques** dans `/elements`

#### 🔒 Sécurité
- Variables d'environnement pour les clés API (`.env` non versionné)
- Règles Realtime Database pour accès contrôlé
- Validation des données côté serveur
- Firebase Auth UID comme clé primaire unique

#### 📈 Scalabilité & Performance
- **Système de cache intelligent** : Realtime Database comme fallback
- **Affichage instantané** : < 50ms au chargement (cache local)
- **Résilience** : Continue de fonctionner si Hyperliquid est down
- **WebSocket** pour données live (push, pas de polling)
- **Logique métier centralisée** : Réutilisable pour tous les tokens

#### ⚡ Stratégie de Cache
1. **Chargement** : Affiche immédiatement le cache Realtime Database
2. **Live** : WebSocket + API HTTP pour données fraîches
3. **Fallback** : Si Hyperliquid fail → Utilise le cache (< 1h)
4. **Update** : Cache mis à jour automatiquement quand données live reçues

---

## 🚀 Installation

### Prérequis
- Node.js >= 18.0
- npm ou yarn
- Compte Firebase avec projet configuré
- Clés API Hyperliquid Testnet (pour développement)

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/malikkaraoui/COOKIE.git
cd COOKIE
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**

> 🆕 **Le projet utilise désormais 3 environnements distincts** : development, staging, production

**Pour démarrer rapidement** :
```bash
# Copier le template d'environnement développement
cp .env.development.example .env.development

# Éditer et remplir vos clés API
code .env.development
```

**Variables requises** dans `.env.development` :
```env
# Firebase (configuration partagée)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Hyperliquid TESTNET (faux argent pour développement)
VITE_HYPERLIQUID_API_URL=https://api.hyperliquid-testnet.xyz
VITE_HYPERLIQUID_API_KEY=your_testnet_api_key
VITE_HYPERLIQUID_API_SECRET=your_testnet_api_secret
```

> - Tous les fichiers `.env.*` sont dans `.gitignore` pour protéger vos clés
> - **Development** utilise testnet Hyperliquid (faux argent 🧪)
> - **Production** utilise mainnet Hyperliquid (vrai argent ⚠️)
> 
> 📚 **Documentation complète** : Voir [`QUICKSTART.md`](./QUICKSTART.md) pour guide détaillé

4. **Déployer les règles Realtime Database**
```bash
firebase deploy --only database
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173` 🎉

> 💡 **Aide supplémentaire** :
> - Guide rapide : [`QUICKSTART.md`](./QUICKSTART.md)
> - Migration depuis ancien système : [`MIGRATION.md`](./MIGRATION.md)
> - Documentation technique : [`docs/ENVIRONMENTS.md`](./docs/ENVIRONMENTS.md)

---

## 🔧 Scripts Disponibles

### Développement
```bash
npm run dev              # Lancer en mode development (testnet)
npm run dev:staging      # Lancer en mode staging (préproduction)
npm run dev:prod         # Lancer en mode production (mainnet, test local)
```

### Build
```bash
npm run build            # Build production (mainnet)
npm run build:dev        # Build development (testnet)
npm run build:staging    # Build staging (préproduction)
```

### Autres
```bash
npm run preview          # Prévisualiser le build production
npm run preview:staging  # Prévisualiser le build staging
npm run lint             # Linter le code
```

> 📘 **Note** : Chaque script charge automatiquement le fichier `.env.*` correspondant
> - `dev` → `.env.development` → Testnet Hyperliquid (faux argent)
> - `build` → `.env.production` → Mainnet Hyperliquid (vrai argent ⚠️)

---

## 🔁 Versioning automatique

- Chaque commit déclenche automatiquement `npm run bump:version` via un hook Husky (`pre-commit`).
- Par défaut, on incrémente le **patch** (`0.0.X`). Le script met à jour `package.json` **et** `src/config/version.ts` (avec timestamp ISO).
- Les fichiers modifiés sont automatiquement ajoutés au commit.

### 🎚️ Changer le niveau d'incrément

Besoin d'un `minor` ou `major` ? Lance la commande de commit avec la variable `BUMP_VERSION_LEVEL` :

```bash
BUMP_VERSION_LEVEL=minor git commit -m "feat: grosse mise à jour"
```

Valeurs possibles : `patch` (défaut), `minor`, `major`.

> Astuce : tu peux aussi exécuter manuellement `npm run bump:version -- minor` avant de commit. Le hook détectera la même valeur si `BUMP_VERSION_LEVEL` est positionnée.

---

## 🔥 Firebase Configuration (Realtime Database)

### Authentication
- **Providers activés** : Google
- **Domaines autorisés** : localhost, votre-domaine.com

### Schéma RTDB
```
/users/{uid}
  email: string
  displayName: string
  photoURL: string
  createdAt: number

/priceCache/{coin}
  price: number
  prevDayPx: number
  deltaAbs: number
  deltaPct: number
  timestamp: number
  source: string

/priceTokenHyper/{coin}  // données Hyperliquid
/priceTokenBinance/{coin} // données Binance
```

### Règles de Sécurité (RTDB)

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid"
      }
    },
    "priceCache": {
      "$coin": {
        ".read": true,
        ".write": true
      }
    },
    "priceTokenHyper": {
      "$coin": {
        ".read": true,
        ".write": true
      }
    },
    "priceTokenBinance": {
      "$coin": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

> Pour durcir la sécurité en production, restreindre les writes des nœuds de prix aux seuls services serveur (Cloud Functions) et conserver `users` en écriture propriétaire.

### 💳 Paiements Premium (Stripe)
- Checkout Stripe déclenché via une Cloud Function callable (Firebase Functions v2).
- Achat réservé aux utilisateurs Google authentifiés (UID attaché à la session).
- Pages dédiées : `StripePage` (achat), `StripeSuccessPage`, `StripeCancelPage`.
- À court terme, l’activation premium est marquée côté client (RTDB); une implémentation par webhook Stripe serveur peut être ajoutée ensuite pour validation robuste.

---

## 🌐 API Hyperliquid

### Endpoints Utilisés

#### 📚 L2 Order Book
```javascript
POST https://api.hyperliquid.xyz/info
{
  "type": "l2Book",
  "coin": "BTC"
}
```

#### 📊 Stats 24h
```javascript
POST https://api.hyperliquid.xyz/info
{
  "type": "metaAndAssetCtxs"
}
```

### Client API Custom

Voir `src/lib/infoClient.js` pour l'implémentation du client HTTP.

---

## 🎨 Design System

### Palette de Couleurs

```css
/* Primaire */
--primary: #6f5a72;      /* Violet profond */
--primary-light: #e7cfcf; /* Rose poudré */

/* Accent */
--accent: #e4b85a;       /* Doré */

/* Neutre */
--background: #faf8f3;   /* Beige très clair */
--text: #333333;         /* Gris foncé */
```

### Composants Réutilisables

- **Buttons** : LoginButton, LogoutButton, ProfileButton
- **Panels** : Sidebar redimensionnable, Topbar fixe
- **Cards** : BtcTile, OrderBook
- **Forms** : ProfilePage avec validation

---

## 📚 Documentation

### 🌍 Environnements & Configuration
- [Index complet de la doc](docs/INDEX.md)
- [Hub des instructions opérationnelles](docs/instructions/README.md)

### 🏗️ Architecture
<!-- Intégrations & APIs externes: NOWNodes non utilisé actuellement -->

### MCP Servers

Le projet utilise plusieurs serveurs MCP (Model Context Protocol) :

#### 🎨 Figma MCP
- Respect de la charte graphique
- Import de composants avec dépendances graphiques

#### 💳 Stripe MCP
- Gestion des paiements
- Webhooks et événements

#### 📖 GitBook MCP
- Documentation API Hyperliquid
- Recherche dans la doc

---

## 🧪 Tests (À venir)

```bash
npm run test         # Tests unitaires
npm run test:e2e     # Tests end-to-end
```

---

## 🚢 Déploiement

### Build de Production
```bash
npm run build
```

Les fichiers optimisés seront dans `dist/`.

### Firebase Hosting
```bash
firebase deploy --only hosting
```

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Conventions de Code

- **ESLint** : Configuration React + Hooks
- **Naming** :
  - Composants : `PascalCase.jsx`
  - Hooks : `useCamelCase.js`
  - Services : `camelCase.js`
- **Imports** : Ordre alphabétique par groupe (React → Libraries → Locaux)

---

## 📝 Changelog

### v1.0.0 (2025-01-20)
- ✅ Module d'authentification Google
- ✅ Gestion profils utilisateurs Firestore
- ✅ Intégration API Hyperliquid (OrderBook + Stats 24h)
- ✅ Architecture scalable pour millions de données
- ✅ Interface moderne avec sidebar redimensionnable
- ✅ Documentation complète

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir `LICENSE` pour plus d'informations.

---

## 👨‍💻 Auteur

**Malik Karaoui**
- GitHub: [@malikkaraoui](https://github.com/malikkaraoui)

---

## 🙏 Remerciements

- [Firebase](https://firebase.google.com/) pour l'infrastructure backend
- [Hyperliquid](https://hyperliquid.xyz/) pour l'API crypto
- [Vite](https://vitejs.dev/) pour le bundler ultra-rapide
- [React](https://react.dev/) pour le framework UI

---

<div align="center">

**[🌟 Star le projet](https://github.com/malikkaraoui/COOKIE)** si vous le trouvez utile !

Made with ❤️ and ☕

</div>
