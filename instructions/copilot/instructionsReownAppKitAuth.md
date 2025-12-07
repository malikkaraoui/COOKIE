# instructionsReownAppKitAuth.md

## 0. Objectif pour Copilot

Copilot, ta mission :

- Intégrer **Reown AppKit** dans un projet React/TypeScript (Vite ou Next.js).
- Fournir :
  - une **config centralisée** (AppKit + Wagmi + React Query),
  - un **provider global** qui enrobe l’app,
  - un ou plusieurs **boutons de connexion** pour gérer l’identification utilisateur (wallet + email/social).
- Respecter l’architecture existante :
  - pas de grosse logique dans `App.tsx` / `main.tsx` / `layout.tsx`,
  - créer des fichiers dédiés dans `src/lib` / `src/providers` / `src/components`.

Les infos techniques viennent de la doc officielle Reown AppKit (React).  
Docs : https://docs.reown.com/appkit/react/core/installation

---

## 1. Pré-requis et dépendances

### 1.1. Stack attendue

- Projet **React + TypeScript** (Vite ou Next.js).
- Node >= 18 recommandé.
- Gestion des secrets via `.env` :
  - En Vite : `VITE_REOWN_PROJECT_ID=xxx`
  - En Next : `NEXT_PUBLIC_REOWN_PROJECT_ID=xxx`

### 1.2. Packages à installer (wagmi + AppKit)

Copilot, ajoute ces dépendances (npm par défaut) :

```bash
npm install @reown/appkit @reown/appkit-adapter-wagmi wagmi viem @tanstack/react-query
