# Data Connect – Service & Génération

Cette section documente la manière dont on consomme Firebase Data Connect dans COOKIE sans dépendre directement du dossier `src/dataconnect-generated` depuis les composants.

## Service applicatif

- Le module `src/services/dataconnect.ts` encapsule l’instanciation du client (`getDataConnectClient`) et expose des helpers (`listMoviesQuery`, `createMovieMutation`, etc.).
- Les composants/providers importent exclusivement depuis ce service. Si de nouvelles requêtes apparaissent dans le SDK généré, on les ajoute ici pour conserver un point d’entrée unique.
- Un helper `withDataConnect` permet de faire transiter une fonction qui attend un client déjà initialisé (utile pour des appels plus complexes).
- L’option `useEmulator` permet de chaîner `connectDataConnectEmulator` (par défaut sur `localhost:9399`).

## Régénérer le SDK

1. Vérifie que Firebase CLI est à jour et connecté au bon projet (`firebase login`).
2. Depuis la racine du repo, exécute :
   ```bash
   firebase dataconnect:generate --config dataconnect/dataconnect.yaml
   ```
   - Ajoute `--watch` si tu veux régénérer en continu pendant que tu modifies le schéma (`schema/`).
   - La commande lit `dataconnect/dataconnect.yaml` (serviceId `cookie`).
3. Le CLI écrase entièrement `src/dataconnect-generated/` (JS, types et README). Comme ces fichiers sont versionnés (dépendance locale dans `package.json`), **on les commit** après chaque régénération pour garder un état cohérent entre devs/CI.

> ℹ️ Tant que les composants passent par `src/services/dataconnect.ts`, aucune modification d’API interne ne sera nécessaire lorsque le SDK régénéré change.
