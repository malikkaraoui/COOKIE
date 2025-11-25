# Configuration GitHub Actions - Firebase Hosting

## 🎯 Objectif

Configurer le déploiement automatique Firebase Hosting via GitHub Actions pour :
- ✅ Déploiement auto sur push (`main`, `release`, `dev`)
- ✅ Preview temporaire sur Pull Requests

---

## 📋 Étape 1 : Générer Service Account Firebase

### 1.1 Firebase Console

1. Ouvrir https://console.firebase.google.com/project/cookie1-b3592/settings/serviceaccounts/adminsdk
2. Cliquer **"Generate new private key"**
3. Confirmer → Télécharge fichier JSON (ex: `cookie1-b3592-firebase-adminsdk.json`)

⚠️ **IMPORTANT** : Ce fichier contient des credentials sensibles, **JAMAIS commit dans Git !**

### 1.2 Vérifier le contenu JSON

Le fichier doit ressembler à :
```json
{
  "type": "service_account",
  "project_id": "cookie1-b3592",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@cookie1-b3592.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

---

## 📋 Étape 2 : Ajouter Secrets GitHub

### 2.1 Ouvrir Repository Settings

1. GitHub → https://github.com/malikkaraoui/COOKIE
2. **Settings** → **Secrets and variables** → **Actions**
3. Cliquer **"New repository secret"**

### 2.2 Créer FIREBASE_SERVICE_ACCOUNT

**Name** : `FIREBASE_SERVICE_ACCOUNT`

**Value** : Copier-coller **TOUT le contenu** du fichier JSON service account

```json
{
  "type": "service_account",
  "project_id": "cookie1-b3592",
  ...
}
```

✅ Cliquer **"Add secret"**

### 2.3 Créer les autres secrets Firebase

Récupérer depuis Firebase Console → Project Settings → General :

| Secret Name | Valeur (exemple) | Où trouver |
|-------------|------------------|------------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyC...` | Firebase Console → Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | `cookie1-b3592.firebaseapp.com` | Firebase Console → Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | `cookie1-b3592` | Firebase Console → Project Settings |
| `VITE_FIREBASE_STORAGE_BUCKET` | `cookie1-b3592.firebasestorage.app` | Firebase Console → Project Settings |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | Firebase Console → Project Settings |
| `VITE_FIREBASE_APP_ID` | `1:123456:web:abc123` | Firebase Console → Project Settings |
| `VITE_FIREBASE_DATABASE_URL` | `https://cookie1-b3592...firebasedatabase.app` | Realtime Database → Data tab (URL en haut) |

---

## 📋 Étape 3 : Tester GitHub Actions

### 3.1 Push sur branche dev

```bash
git add .
git commit -m "chore(ci): configure GitHub Actions Firebase Hosting"
git push origin dev
```

### 3.2 Vérifier workflow

1. GitHub → **Actions** tab
2. Voir workflow **"Deploy to Firebase Hosting on merge"** en cours
3. Attendre ✅ succès (build + deploy)

### 3.3 Vérifier déploiement

- **Dev channel** : URL affichée dans logs GitHub Actions
- **Console Firebase** : https://console.firebase.google.com/project/cookie1-b3592/hosting/sites

---

## 📋 Étape 4 : Tester Pull Request Preview

### 4.1 Créer branche feature

```bash
git checkout -b feature/test-pr-preview
git push -u origin feature/test-pr-preview
```

### 4.2 Créer Pull Request

1. GitHub → **Pull requests** → **New pull request**
2. Base: `dev` ← Compare: `feature/test-pr-preview`
3. **Create pull request**

### 4.3 Vérifier preview

1. GitHub Actions build automatiquement
2. Commentaire auto ajouté dans PR avec URL preview
3. URL format : `https://cookie1-b3592--pr-1-abc123.web.app`

---

## ✅ Checklist Finale

- [ ] Service Account JSON généré depuis Firebase Console
- [ ] `FIREBASE_SERVICE_ACCOUNT` secret créé dans GitHub
- [ ] 7 secrets Firebase (`VITE_FIREBASE_*`) créés dans GitHub
- [ ] Push sur `dev` → workflow réussi ✅
- [ ] Pull Request → preview généré ✅
- [ ] URL preview accessible et fonctionnelle

---

## 🔥 Workflows Configurés

### 1. `firebase-hosting-merge.yml`
**Trigger** : Push sur `main`, `release`, `dev`

**Environnements** :
- `main` → Production (live) + Hyperliquid Mainnet
- `release` → Staging + Hyperliquid Testnet
- `dev` → Development + Hyperliquid Testnet

### 2. `firebase-hosting-pull-request.yml`
**Trigger** : Ouverture Pull Request

**Comportement** :
- Build selon branche cible (base_ref)
- Toujours Hyperliquid Testnet (sécurité)
- URL preview temporaire (expire 7j après close)

---

## 🐛 Troubleshooting

### Erreur "Missing required fields"

```
Error: Missing required fields in FIREBASE_SERVICE_ACCOUNT
```

✅ **Solution** : Vérifier que le JSON est complet (pas de troncature)

### Erreur "Permission denied"

```
Error: HTTP Error: 403, The caller does not have permission
```

✅ **Solution** : 
1. Firebase Console → IAM & Admin
2. Vérifier que `firebase-adminsdk-xxxxx@cookie1-b3592.iam.gserviceaccount.com` a rôle **"Firebase Hosting Admin"**

### Workflow ne se déclenche pas

✅ **Solution** : Vérifier que les workflows sont dans `.github/workflows/` et committés sur la branche

---

## 📚 Documentation

- GitHub Actions : https://docs.github.com/en/actions
- Firebase Hosting : https://firebase.google.com/docs/hosting/github-integration
- Service Accounts : https://firebase.google.com/docs/admin/setup#initialize-sdk
