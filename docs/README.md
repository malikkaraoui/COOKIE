# COOKLAB – $COOKIE

COOKLAB est la plateforme d’épargne communautaire imaginée par Malik Karaoui. Toute la narration tourne autour de la cuisine : l’Épicerie fine pour sélectionner les ingrédients (tokens), Ma Cuisine pour monitorer les performances, la Marmite pour mutualiser les recettes, le Bouillon pour tester les stratégies et la Tirelire pour sécuriser les gains. Sous cette métaphore se cachent des intégrations avancées : Hyperliquid et Binance pour la donnée marché et les ordres, Firebase (Auth, Functions, Realtime Database) comme colonne vertébrale serverless et Stripe pour activer l’accès Premium.

Architecture globale :

```
Front-end (React + Vite + Tailwind)
    ↓ HTTP + WebSockets + Firebase SDK
Firebase (Auth, Cloud Functions, Realtime Database)
    ↓ intégrations serverless
Hyperliquid · Binance · Stripe
```

## Liens rapides

- [Introduction](01-intro.md)
- [Architecture générale](02-architecture.md)
- [Front-end (React / Vite / Tailwind)](03-front-end.md)
- [Back-end (Firebase Functions / RTDB)](04-back-end-firebase.md)
- [Paiement Stripe](05-stripe.md)
- [APIs Hyperliquid & Binance](06-hyperliquid-binance.md)
- [Modélisation des données](07-donnees-modeles.md)
- [Déploiement & variables d'environnement](08-deploiement-et-env.md)
- [Roadmap & TODO techniques](09-roadmap.md)
