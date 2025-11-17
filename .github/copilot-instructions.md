Dans ce projet, je veux une architecture très structurée et modulaire. Merci d’appliquer systématiquement les principes suivants quand tu proposes du code :
Composants React propres
App.jsx doit rester minimal : uniquement composition (layout, routes) et presque aucune logique métier.
Évite de mettre de la logique complexe directement dans les composants de page.
Séparation de la logique
Toute logique réutilisable liée à l’UI (ex : redimensionnement, gestion de formulaires, timers, etc.) doit aller dans des hooks personnalisés dans src/hooks (ex : useResizableSidebar.js).
Toute logique métier ou utilitaire doit aller dans src/lib ou src/services (par ex. appels API, transformations de données).
Organisation des fichiers
src/components : composants UI réutilisables.
src/components/layout : layout globaux (top bar, sidebar, shell d’application).
src/pages : pages pour le router.
src/hooks : tous les hooks personnalisés (useXXX).
src/styles : fichiers CSS globaux si nécessaire.
src/config : constantes, valeurs de configuration (min/max, couleurs, etc.).
Quand tu génères du code
Si tu proposes une fonctionnalité qui nécessite de la logique, propose directement le hook séparé + le composant qui l’utilise, plutôt que tout mettre dans un seul fichier.
N’hésite pas à factoriser :
un composant par responsabilité,
un hook par comportement.
Lisibilité avant tout
Préfère du code explicite, avec des noms de variables/fonctions parlants, plutôt que des raccourcis “magiques”.
Ajoute des commentaires courts et utiles quand la logique n’est pas évidente (surtout dans les hooks).