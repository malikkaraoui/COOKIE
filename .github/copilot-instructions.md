Dans ce projet, je veux une architecture très structurée et modulaire. 

Merci d’appliquer systématiquement les principes suivants quand tu proposes du code :
Composants React propres
App.jsx doit rester minimal : uniquement composition (layout, routes) et presque aucune logique métier.
Évite de mettre de la logique complexe directement dans les composants de page.

Séparation de la logique :
Toute logique réutilisable liée à l’UI (ex : redimensionnement, gestion de formulaires, timers, etc.) doit aller dans des hooks personnalisés dans src/hooks (ex : useResizableSidebar.js). Économie d'échelle et réutilisabilité.
Toute logique métier ou utilitaire doit aller dans src/lib ou src/services (par ex. appels API, transformations de données).

Organisation des fichiers :
src/elements : composants UI réutilisables.
src/components : layout globaux (top bar, sidebar, shell d’application).
src/pages : pages pour le router.
src/hooks : tous les hooks personnalisés (useXXX).
src/styles : fichiers CSS globaux si nécessaire.
src/config : constantes, valeurs de configuration (min/max, couleurs, etc.).

Quand tu génères du code :
Si tu proposes une fonctionnalité qui nécessite de la logique, propose directement le hook séparé + le composant qui l’utilise, plutôt que tout mettre dans un seul fichier.
N’hésite pas à factoriser :
un composant par responsabilité,
un hook par comportement.
Lisibilité avant tout
Préfère du code explicite, avec des noms de variables/fonctions parlants, plutôt que des raccourcis “magiques”.
Ajoute des commentaires courts et utiles quand la logique n’est pas évidente (surtout dans les hooks).

Pour ce qui est de l'intégration de Firebase :
Toute la configuration Firebase doit être dans src/config/firebase.js.
Toute la logique d’authentification doit être dans un hook personnalisé dans src/hooks/useAuth
Assure toi de ne pas créer de dépendances circulaires entre les fichiers.
Respecte scrupuleusement cette architecture dans toutes tes propositions de code. 
Merci de confirmer ta compréhension de ces instructions avant de continuer.

En ce qui concerne l'utilisation d'api necessitant une clé d'API :
Ne jamais inclure de clés d'API directement dans le code source.
Utiliser des variables d'environnement pour stocker les clés d'API.
Assurer que les clés d'API ne sont pas exposées dans le code côté client.
Merci de bien respecter ces consignes dans toutes tes propositions de code.

L'utilisation de MCP (Modular Code Practices) est obligatoire dans ce projet, donc il te fait t'assurer que les serveurs soient bien démarrés avant toute exécution de code dépendant de ces serveurs.
exemple : 
Un MCP figma est en place et te permet de t'assurer du respect de la charte graphique. Ce serveur MCP te permettra aussi de pouvoir préléver du code avec les dépendances graphiques respectées et donc leur installation. 
Un MCP Stripe pour la partie paiement est aussi disponible donc n'hésite pas à l'utiliser pour toute la partie paiement.
Un MCP giibook est aussi disponible pour la partie gestion de bibliothèque de livres (docuemention des API d'Hyperliquid) 

Docs : https://hyperliquid.gitbook.io/hyperliquid-docs
MCP  : https://hyperliquid.gitbook.io/hyperliquid-docs/~gitbook/mcp


