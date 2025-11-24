# 🔐 Configuration GitHub Secrets - COOKIE

## Vue d'ensemble

Ce document explique comment configurer les **GitHub Secrets** pour les déploiements automatiques multi-environnements.

---

## 📍 Où Configurer

1. Aller sur **GitHub.com** → Votre repo `COOKIE`
2. Cliquer sur **Settings** (⚙️)
3. Dans la sidebar gauche → **Secrets and variables** → **Actions**
4. Cliquer sur **New repository secret**

---

## 🔑 Secrets à Créer

### 🔷 Firebase (commun à tous les environnements)

| Nom du Secret | Valeur | Où trouver |
|---------------|--------|------------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyBr6MXqUHOXUJx9NpgWE9K09mk_NOnPyqs` | Firebase Console → Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | `cookie-7c5b6.firebaseapp.com` | Firebase Console |
| `VITE_FIREBASE_PROJECT_ID` | `cookie-7c5b6` | Firebase Console |
| `VITE_FIREBASE_STORAGE_BUCKET` | `cookie-7c5b6.firebasestorage.app` | Firebase Console |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `989136449677` | Firebase Console |
| `VITE_FIREBASE_APP_ID` | `1:989136449677:web:f84c762f9c89a60a2732c4` | Firebase Console |
| `VITE_FIREBASE_DATABASE_URL` | `https://cookie-7c5b6-default-rtdb.firebaseio.com` | Firebase Console → Realtime Database |

---

### 🧪 Hyperliquid TESTNET (dev + staging)

| Nom du Secret | Environnement | Où obtenir |
|---------------|---------------|------------|
| `VITE_HYPERLIQUID_TESTNET_API_KEY` | Development | https://testnet.hyperliquid.xyz → Account → API Keys |
| `VITE_HYPERLIQUID_TESTNET_API_SECRET` | Development | Même endroit (copier lors de création) |
| `VITE_HYPERLIQUID_STAGING_API_KEY` | Staging | Peut utiliser même clé testnet ou créer nouvelle |
| `VITE_HYPERLIQUID_STAGING_API_SECRET` | Staging | Idem |

**Note** : Les clés testnet utilisent de **faux argent** 🧪

---

### 🔴 Hyperliquid MAINNET (production uniquement)

| Nom du Secret | Environnement | ⚠️ ATTENTION |
|---------------|---------------|--------------|
| `VITE_HYPERLIQUID_PRODUCTION_API_KEY` | Production | **VRAI ARGENT** - Obtenir sur https://app.hyperliquid.xyz |
| `VITE_HYPERLIQUID_PRODUCTION_API_SECRET` | Production | **NE JAMAIS partager ou commit** |

⚠️ **SÉCURITÉ CRITIQUE** :
- Ces clés donnent accès à de **vrais fonds**
- Activer **IP Whitelisting** si possible
- Limiter les permissions (read-only si possible)
- Utiliser **2FA** sur compte Hyperliquid

---

### 💰 Binance (optionnel, production)

| Nom du Secret | Usage |
|---------------|-------|
| `VITE_BINANCE_PRODUCTION_API_KEY` | Lectures prix Binance Spot |
| `VITE_BINANCE_PRODUCTION_API_SECRET` | Idem (optionnel si read-only) |

**Obtenir sur** : https://www.binance.com/en/my/settings/api-management

---

### 🔥 Firebase Service Accounts (CI/CD)

Pour déployer sur Firebase Hosting via GitHub Actions :

1. Aller dans **Firebase Console** → Project Settings → Service Accounts
2. Cliquer sur **Generate new private key**
3. Télécharger le fichier JSON
4. Copier **tout le contenu** du JSON

Créer ces secrets avec le contenu JSON complet :

| Nom du Secret | Usage |
|---------------|-------|
| `FIREBASE_SERVICE_ACCOUNT_DEV` | Déploiement branche `dev` |
| `FIREBASE_SERVICE_ACCOUNT_STAGING` | Déploiement branche `release` |
| `FIREBASE_SERVICE_ACCOUNT_PROD` | Déploiement branche `main` |

**Exemple de valeur** (copier JSON entier) :
```json
{
  "type": "service_account",
  "project_id": "cookie-7c5b6",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@cookie-7c5b6.iam.gserviceaccount.com",
  ...
}
```

---

## ✅ Vérification

### Checklist après configuration

- [ ] **16 secrets** créés au total (Firebase + Hyperliquid + Binance + Service Accounts)
- [ ] Clés **testnet** pour dev/staging (faux argent)
- [ ] Clés **mainnet** uniquement pour production (vrai argent)
- [ ] Service Accounts Firebase configurés
- [ ] Tester déploiement sur branche `dev` d'abord

### Tester la configuration

1. Créer branche `dev` :
```bash
git checkout -b dev
git push origin dev
```

2. Vérifier GitHub Actions :
   - Aller sur **Actions** tab
   - Voir workflow `Deploy Multi-Environment` lancé
   - Vérifier build réussi

3. Si erreur :
   - Cliquer sur workflow échoué
   - Voir les logs d'erreur
   - Vérifier secret manquant ou mal nommé

---

## 🔒 Bonnes Pratiques

### ✅ À FAIRE

- ✅ Utiliser **IP Whitelisting** pour clés mainnet (si disponible)
- ✅ Limiter permissions clés API (read-only si possible)
- ✅ Rotationner clés régulièrement (tous les 3-6 mois)
- ✅ Tester sur testnet AVANT production
- ✅ Monitorer logs déploiement

### ❌ NE JAMAIS

- ❌ Partager secrets via email/Slack
- ❌ Commit secrets dans code source
- ❌ Utiliser clés mainnet en développement local
- ❌ Donner accès GitHub repo à personnes non autorisées
- ❌ Stocker secrets en clair dans notes

---

## 🆘 Dépannage

### Secret non trouvé dans workflow

**Erreur** : `Error: The secret VITE_HYPERLIQUID_TESTNET_API_KEY was not found`

**Solution** :
1. Vérifier nom exact du secret (sensible à la casse)
2. Vérifier secret créé au niveau **repository** (pas environment)
3. Re-créer secret si nécessaire

### Clé API invalide

**Erreur** : `Hyperliquid API authentication failed`

**Solution** :
1. Vérifier URL API correspond aux clés (testnet vs mainnet)
2. Régénérer clés API sur Hyperliquid
3. Mettre à jour secrets GitHub

### Déploiement échoue

**Erreur** : `Firebase deploy failed`

**Solution** :
1. Vérifier Service Account JSON valide
2. Vérifier permissions Firebase (Editor/Owner)
3. Vérifier projet ID correct dans workflow

---

## 📚 Ressources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Firebase Service Accounts](https://firebase.google.com/docs/admin/setup#initialize-sdk)
- [Hyperliquid API Docs](https://hyperliquid.gitbook.io/hyperliquid-docs)
- [Binance API Management](https://www.binance.com/en/support/faq/how-to-create-api-360002502072)

---

**Dernière mise à jour** : 24 novembre 2025
