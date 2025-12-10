# Déploiement & variables d'environnement

## Installation locale

```bash
# Cloner le repo
git clone https://github.com/malikkaraoui/COOKIE.git
cd COOKIE

# Installer les dépendances front
npm install

# Installer les dépendances Functions
cd functions
npm install
cd ..
```

## Lancer le front

```bash
npm run dev
# → http://localhost:5173
```

Tailwind et Vite gèrent automatiquement le HMR; les fichiers CSS globaux (ex : `src/pages/MaCuisine.css`) se rechargent instantanément.

## Exécuter les Functions en émulateur

```bash
npm run build:functions   # si présent
firebase emulators:start --only functions,database,auth
```

## Déploiement Firebase

```bash
# Déployer les Functions uniquement
firebase deploy --only functions

# Déployer le front (Hosting)
npm run build
firebase deploy --only hosting
```

Pense à configurer les secrets (Stripe, Hyperliquid, Binance) dans **Firebase Secret Manager** ou via `firebase functions:secrets:set`.

## Variables d’environnement (exemples)

Front (`.env.local` ou `.env`):

```
VITE_FIREBASE_API_KEY=XXX
VITE_FIREBASE_AUTH_DOMAIN=XXX.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=XXX
VITE_FIREBASE_DATABASE_URL=https://XXX.firebaseio.com
VITE_FIREBASE_STORAGE_BUCKET=XXX.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=XXX
VITE_FIREBASE_APP_ID=1:XXX:web:YYY
VITE_FUNCTIONS_URL=https://REGION-COOKIE.cloudfunctions.net
```

Functions (`.env` ou secrets Firebase) :

```
HYPERLIQUID_API_KEY=XXX
HYPERLIQUID_API_SECRET=XXX
BINANCE_API_KEY=XXX
BINANCE_API_SECRET=XXX
STRIPE_SECRET_KEY=sk_placeholder
REOWN_PRIVATE_KEY=XXX
```

Ne commite jamais de valeurs réelles. Utilise des placeholders (`XXX`) et passe par les secrets Firebase pour la production.
