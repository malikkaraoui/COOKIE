# 🚨 INCIDENT DE SÉCURITÉ - Firebase API Keys Exposées

**Date** : 24 novembre 2025  
**Gravité** : 🔴 CRITIQUE  
**Statut** : En cours de résolution

---

## 📋 Résumé

Les clés API Firebase ont été **accidentellement exposées dans l'historique Git** du dépôt GitHub public.

**Fichiers concernés** :
- `.env.development.example`
- `.env.example`
- `.env.local.example`
- `docs/ENVIRONMENTS.md`
- `.github/SECRETS_SETUP.md`

**Commits concernés** :
- `3a13bcd` (initial commit avec clés)
- `7611f6a` (correction, mais clés toujours dans l'historique)

---

## ✅ Actions Déjà Réalisées

1. ✅ Suppression des clés des fichiers actuels (commit `7611f6a`)
2. ✅ Remplacement par placeholders génériques
3. ✅ Push sur branche `dev`

---

## 🚨 ACTIONS URGENTES À FAIRE MAINTENANT

### 1. Régénérer TOUTES les clés Firebase (PRIORITÉ 1)

#### Console Firebase
1. Aller sur https://console.firebase.google.com
2. Sélectionner projet `cookie-7c5b6`
3. Aller dans **Project Settings** (⚙️ en haut à gauche)
4. Aller dans l'onglet **General**
5. Scroller vers **Your apps** → Section Web app
6. **Supprimer l'application web actuelle** (🗑️)
7. **Créer une nouvelle application web** avec un nouveau nom
8. Copier les **nouvelles clés** générées

#### Nouvelles valeurs à récupérer
```
VITE_FIREBASE_API_KEY=nouvelle_clé_ici
VITE_FIREBASE_AUTH_DOMAIN=nouveau_domaine.firebaseapp.com
VITE_FIREBASE_APP_ID=nouvelle_app_id
```

⚠️ **Les autres valeurs** (PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID) restent identiques.

---

### 2. Mettre à jour les fichiers locaux

#### Créer `.env.development` avec NOUVELLES clés
```bash
# Copier le template
cp .env.development.example .env.development

# Éditer avec NOUVELLES clés Firebase
code .env.development

# Remplacer :
VITE_FIREBASE_API_KEY=NOUVELLE_CLE_ICI
VITE_FIREBASE_AUTH_DOMAIN=nouveau_domaine.firebaseapp.com
VITE_FIREBASE_APP_ID=nouvelle_app_id
```

#### Supprimer TOUS les anciens fichiers .env
```bash
rm .env
rm .env.local
rm .env.staging
rm .env.production
```

**Note** : Ces fichiers contiennent les anciennes clés compromises.

---

### 3. Nettoyer l'historique Git (OPTIONNEL mais recommandé)

⚠️ **Attention** : Cela réécrit l'historique Git !

#### Option A : Utiliser BFG Repo-Cleaner (recommandé)
```bash
# Installer BFG
brew install bfg

# Nettoyer l'historique
bfg --replace-text passwords.txt

# passwords.txt contient :
# AIzaSyBr6MXqUHOXUJx9NpgWE9K09mk_NOnPyqs==>REMOVED
# cookie-7c5b6==>REMOVED
# 989136449677==>REMOVED
# 1:989136449677:web:f84c762f9c89a60a2732c4==>REMOVED

# Force push
git push origin --force --all
```

#### Option B : Laisser l'historique tel quel
Si tu régénères les clés Firebase, les anciennes deviennent **invalides** donc moins critique.

---

### 4. Tester avec nouvelles clés

```bash
# Avec nouvelles clés dans .env.development
npm run dev

# Vérifier connexion Firebase fonctionne
# Tester login Google
```

---

## 📊 Exposition & Impact

### Données Exposées
- ✅ `VITE_FIREBASE_API_KEY` (publique, peut être dans client-side)
- ✅ `VITE_FIREBASE_AUTH_DOMAIN`
- ✅ `VITE_FIREBASE_PROJECT_ID`
- ✅ `VITE_FIREBASE_APP_ID`

### Données NON Exposées
- ✅ **Clés privées Hyperliquid** (jamais commitées)
- ✅ **Service Account Firebase** (jamais commité)
- ✅ **Mots de passe utilisateurs** (gérés par Firebase Auth)

### Risques
🟡 **MOYEN** : Les clés Firebase API sont **conçues pour être publiques** (utilisées côté client).

**Protections Firebase actives** :
- ✅ Domain whitelisting (seuls domaines autorisés peuvent utiliser)
- ✅ Firebase Security Rules (contrôlent accès database)
- ✅ Firebase Auth (authentification requise)

**Risque principal** :
- ❌ Quelqu'un pourrait utiliser ton quota Firebase
- ❌ Spam de requêtes vers ton projet

**Solutions** :
- ✅ Régénérer clés par précaution
- ✅ Activer App Check Firebase (limite aux apps légitimes)
- ✅ Monitorer usage Firebase Console

---

## 📝 Checklist de Résolution

### Immédiat (aujourd'hui)
- [ ] Régénérer clés Firebase (console.firebase.google.com)
- [ ] Créer `.env.development` avec nouvelles clés
- [ ] Supprimer anciens fichiers `.env*` locaux
- [ ] Tester `npm run dev` avec nouvelles clés

### Court terme (cette semaine)
- [ ] Configurer Firebase App Check
- [ ] Vérifier Firebase Security Rules
- [ ] Monitorer usage Firebase Console
- [ ] Documenter incident (ce fichier)

### Optionnel
- [ ] Nettoyer historique Git avec BFG
- [ ] Force push branches (dev/release/main)

---

## 🔐 Prévention Future

### Git Hooks
Installer `git-secrets` pour détecter clés avant commit :
```bash
brew install git-secrets
git secrets --install
git secrets --register-aws
```

### Pre-commit Hooks
Créer `.git/hooks/pre-commit` :
```bash
#!/bin/bash
if git diff --cached | grep -E "AIzaSy|AKIA|sk-"; then
  echo "❌ ERREUR: Clé API détectée dans commit !"
  exit 1
fi
```

### Fichiers .env
✅ **JAMAIS** commit fichiers `.env*` (sauf `.env.example`)  
✅ Vérifier `.gitignore` contient tous les patterns  
✅ Utiliser placeholders dans examples  

---

## 📞 Contacts

**Support Firebase** : https://firebase.google.com/support  
**GitHub Security** : https://github.com/security  

---

**Document créé** : 24 novembre 2025  
**Dernière mise à jour** : 24 novembre 2025
