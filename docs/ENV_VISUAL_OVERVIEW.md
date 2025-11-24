# 🌍 Environnements COOKIE - Vue d'ensemble Visuelle

```
┌─────────────────────────────────────────────────────────────────┐
│                   ARCHITECTURE MULTI-ENVIRONNEMENTS             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│     DEV     │      │   STAGING   │      │ PRODUCTION  │
│   (testnet) │ ───> │  (testnet)  │ ───> │  (mainnet)  │
│  🧪 Faux $  │      │  🧪 Faux $  │      │  ⚠️ Vrai $  │
└─────────────┘      └─────────────┘      └─────────────┘
      │                     │                     │
      │                     │                     │
   .env.dev           .env.staging          .env.prod
      │                     │                     │
      ├──────────────┬──────┴──────┬──────────────┤
      ▼              ▼             ▼              ▼
   Firebase      Hyperliquid   Binance       Debug Logs
   (shared)       Testnet      API (shared)   true/false


┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW GIT MULTI-BRANCHES                  │
└─────────────────────────────────────────────────────────────────┘

feature/new-button
      │
      │ PR merge
      ▼
    dev ────────────────> Deploy dev.cookie.app (testnet)
      │                   ├── Auto tests
      │                   └── Clés testnet GitHub Secrets
      │ PR merge
      ▼
  release ───────────────> Deploy staging.cookie.app (testnet)
      │                   ├── Tests finaux
      │                   └── Clés testnet GitHub Secrets
      │ PR merge
      ▼
   main ─────────────────> Deploy cookie.app (mainnet ⚠️)
                          ├── Production
                          └── Clés mainnet GitHub Secrets


┌─────────────────────────────────────────────────────────────────┐
│                   FICHIERS .ENV PAR ENVIRONNEMENT               │
└─────────────────────────────────────────────────────────────────┘

Local Development               CI/CD GitHub Actions
┌──────────────────┐            ┌──────────────────┐
│ .env.development │            │ GitHub Secrets   │
│                  │            │                  │
│ Firebase: ✅     │            │ VITE_FIREBASE_*  │
│ Hyperliquid:     │            │ VITE_HYPERLIQUID_│
│  - Testnet URL   │            │   TESTNET_API_*  │
│  - Testnet keys  │            │                  │
│ Debug: true      │            │ Build & Deploy   │
└──────────────────┘            │ to dev/staging/  │
                                │ production       │
                                └──────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    COMMANDES NPM PAR ENVIRONNEMENT              │
└─────────────────────────────────────────────────────────────────┘

npm run dev              ──> .env.development   (testnet)
npm run dev:staging      ──> .env.staging       (testnet)
npm run dev:prod         ──> .env.production    (mainnet, test local)

npm run build            ──> .env.production    (mainnet, CI/CD)
npm run build:dev        ──> .env.development   (testnet)
npm run build:staging    ──> .env.staging       (testnet)


┌─────────────────────────────────────────────────────────────────┐
│                    HYPERLIQUID API ENDPOINTS                    │
└─────────────────────────────────────────────────────────────────┘

Development/Staging:
https://api.hyperliquid-testnet.xyz
  ├── Faux argent 🧪
  ├── Clés API testnet
  └── Identique à mainnet API (structure)

Production:
https://api.hyperliquid.xyz
  ├── Vrai argent ⚠️
  ├── Clés API mainnet
  └── Permissions réelles sur fonds


┌─────────────────────────────────────────────────────────────────┐
│              SÉCURITÉ : CLÉS API PAR ENVIRONNEMENT              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Développement   │   │    Staging      │   │   Production    │
├─────────────────┤   ├─────────────────┤   ├─────────────────┤
│ Local:          │   │ Local:          │   │ Local:          │
│ .env.development│   │ .env.staging    │   │ ❌ INTERDIT     │
│                 │   │                 │   │                 │
│ CI/CD:          │   │ CI/CD:          │   │ CI/CD:          │
│ GitHub Secrets  │   │ GitHub Secrets  │   │ GitHub Secrets  │
│ (testnet keys)  │   │ (testnet keys)  │   │ (mainnet keys)  │
│                 │   │                 │   │                 │
│ Risque: 🟢 Bas  │   │ Risque: 🟡 Moyen│   │ Risque: 🔴 Haut │
│ Argent: 🧪 Faux │   │ Argent: 🧪 Faux │   │ Argent: ⚠️ Vrai │
└─────────────────┘   └─────────────────┘   └─────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                 VARIABLES D'ENVIRONNEMENT VITE                  │
└─────────────────────────────────────────────────────────────────┘

Préfixe obligatoire: VITE_

Common (tous environnements):
├── VITE_FIREBASE_API_KEY
├── VITE_FIREBASE_AUTH_DOMAIN
├── VITE_FIREBASE_PROJECT_ID
├── VITE_FIREBASE_STORAGE_BUCKET
├── VITE_FIREBASE_MESSAGING_SENDER_ID
├── VITE_FIREBASE_APP_ID
└── VITE_FIREBASE_DATABASE_URL

Spécifique environnement:
├── VITE_HYPERLIQUID_API_URL       (testnet vs mainnet)
├── VITE_HYPERLIQUID_API_KEY       (clés différentes)
├── VITE_HYPERLIQUID_API_SECRET    (secrets différents)
├── VITE_ENABLE_DEBUG_LOGS         (true dev, false prod)
└── VITE_ENVIRONMENT               (development|staging|production)


┌─────────────────────────────────────────────────────────────────┐
│                    ORDRE DE PRIORITÉ VITE                       │
└─────────────────────────────────────────────────────────────────┘

Mode: development (npm run dev)

1. .env.development.local   ← Plus prioritaire (rare usage)
2. .env.local               ← Override personnel
3. .env.development         ← Fichier principal ✅
4. .env                     ← Fallback (moins prioritaire)

Variables surchargées en cascade (top → bottom)


┌─────────────────────────────────────────────────────────────────┐
│                    CHECKLIST DÉVELOPPEUR                        │
└─────────────────────────────────────────────────────────────────┘

✅ Setup Local
├── [ ] .env.development créé (cp .env.development.example)
├── [ ] Clés Firebase remplies
├── [ ] Clés Hyperliquid TESTNET remplies
├── [ ] npm install
└── [ ] npm run dev fonctionne

✅ Sécurité
├── [ ] .gitignore contient tous les .env.*
├── [ ] Jamais créer .env.production localement
├── [ ] Clés testnet pour dev/staging uniquement
└── [ ] Vérifier console: "Environment: development"

✅ CI/CD
├── [ ] Branches dev/release/main créées
├── [ ] GitHub Secrets configurés (16 secrets)
├── [ ] Workflow .github/workflows/deploy.yml actif
└── [ ] Test déploiement branche dev OK

✅ Documentation
├── [ ] Lire QUICKSTART.md (5 min)
├── [ ] Lire docs/ENVIRONMENTS.md (comprendre archi)
├── [ ] Lire docs/INDEX.md (naviguer docs)
└── [ ] Bookmark ce fichier pour référence rapide


┌─────────────────────────────────────────────────────────────────┐
│                      LIENS RAPIDES                              │
└─────────────────────────────────────────────────────────────────┘

📘 Documentation
├── QUICKSTART.md               ← Démarrage 5 min
├── MIGRATION.md                ← Migrer ancien système
├── docs/ENVIRONMENTS.md        ← Doc technique complète
├── docs/ENV_FILES_STRUCTURE.md ← Structure .env détaillée
├── docs/INDEX.md               ← Index navigation
└── .github/SECRETS_SETUP.md   ← Config GitHub Secrets

🔧 Configuration
├── .env.example                ← Template général
├── .env.development.example    ← Template dev (démarrage rapide)
├── .env.local.example          ← Template override local
└── .github/workflows/deploy.yml.example ← CI/CD template

🌐 URLs Externes
├── Firebase Console:  https://console.firebase.google.com
├── Hyperliquid Testnet: https://testnet.hyperliquid.xyz
├── Hyperliquid Mainnet: https://app.hyperliquid.xyz
└── Binance API:       https://www.binance.com/en/my/settings/api-management
```

---

**Légende** :
- 🧪 Testnet = Faux argent, environnement de test
- ⚠️ Mainnet = Vrai argent, production
- ✅ Recommandé / Autorisé
- ❌ Interdit / À éviter
- 🟢 Risque bas
- 🟡 Risque moyen
- 🔴 Risque haut

**Dernière mise à jour** : 24 novembre 2025
