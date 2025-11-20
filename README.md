# 🍪 COOKIE

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
- Synchronisation en temps réel avec Firestore
- Sécurité renforcée avec règles Firestore

### 📊 Trading & Données
- **Intégration API Hyperliquid** pour les données crypto en temps réel
- OrderBook BTC avec profondeur de marché
- Tuile Bitcoin avec statistiques 24h
- Architecture prête pour millions de données

### 👤 Profils Utilisateurs
- Photo de profil synchro avec Google
- Prénom/nom d'utilisateur
- Date de naissance avec calcul automatique de l'âge
- Page profil dédiée avec formulaire d'édition

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
│   │   ├── useUserProfile.js    # Gestion profils Firestore
│   │   ├── useBtc24h.js         # Données BTC 24h
│   │   └── useResizablePanel.js # Redimensionnement UI
│   │
│   ├── lib/                     # Services & utilitaires
│   │   ├── firestore/
│   │   │   └── userService.js   # CRUD profils utilisateurs
│   │   ├── hlEndpoints.js       # Endpoints Hyperliquid
│   │   └── infoClient.js        # Client API Hyperliquid
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
│   └── FIRESTORE_ARCHITECTURE.md  # Doc architecture BDD
│
├── firestore.rules              # Règles de sécurité Firestore
└── .env                         # Variables d'environnement
```

### Principes Architecturaux

#### 🧩 Modularité Stricte
- **Context API** pour l'état global (AuthContext, NavigationContext)
- **Hooks personnalisés** pour la logique réutilisable
- **Service Layer** pour les appels Firestore/API
- **Composants atomiques** dans `/elements`

#### 🔒 Sécurité
- Variables d'environnement pour les clés API (`.env` non versionné)
- Règles Firestore pour accès propriétaire uniquement
- Validation des données côté serveur
- Firebase Auth UID comme clé primaire unique

#### 📈 Scalabilité
- Architecture Firestore optimisée pour millions de documents
- Indexes composites pour requêtes complexes
- Dénormalisation stratégique des données
- Pas de requêtes imbriquées

---

## 🚀 Installation

### Prérequis
- Node.js >= 18.0
- npm ou yarn
- Compte Firebase avec projet configuré

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

3. **Configurer Firebase**

Créer un fichier `.env` à la racine :
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

> ⚠️ **Important** : Le fichier `.env` est déjà dans `.gitignore` pour éviter de versionner vos clés.

4. **Déployer les règles Firestore**
```bash
firebase deploy --only firestore:rules
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173` 🎉

---

## 🔧 Scripts Disponibles

```bash
npm run dev          # Lancer le serveur de dev Vite
npm run build        # Build de production
npm run preview      # Prévisualiser le build
npm run lint         # Linter le code
```

---

## 🔥 Firebase Configuration

### Authentication
- **Providers activés** : Google
- **Domaines autorisés** : localhost, votre-domaine.com

### Firestore Database
```
users/{userId}
  ├── uid: string (Firebase Auth UID)
  ├── email: string
  ├── firstName: string
  ├── lastName: string
  ├── photoURL: string
  ├── birthdate: timestamp (optional)
  ├── createdAt: timestamp
  └── updatedAt: timestamp
```

### Règles de Sécurité

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Lecture : seulement le propriétaire
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Création : seulement si UID correspond
      allow create: if request.auth != null 
                    && request.auth.uid == userId
                    && request.resource.data.uid == userId;
      
      // Mise à jour : propriétaire uniquement + champs immuables
      allow update: if request.auth != null 
                    && request.auth.uid == userId
                    && request.resource.data.uid == resource.data.uid;
      
      // Suppression : interdite
      allow delete: if false;
    }
  }
}
```

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

### Architecture Firestore
Voir [`docs/FIRESTORE_ARCHITECTURE.md`](./docs/FIRESTORE_ARCHITECTURE.md) pour :
- Structure détaillée des collections
- Stratégies d'indexation
- Patterns de requêtes
- Cas d'usage avancés

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
