# EroTrack 2.0 — Observatoire du littoral ivoirien

Cette livraison ajoute une vraie structure multi-pages et les flux applicatifs reliés à Supabase.
**Aucune mesure, observation, statistique ou photographie scientifique n'est préremplie.**
Les pages affichent un état vide tant que la base ne contient pas de données réelles.

## 1. Contenu
- Pages publiques : accueil, explorer, secteurs, protocole, statistiques, à propos.
- Espace membre : tableau de bord, dépôt d'observation avec photo, mes observations, profil.
- Espace administration : validation des observations (rôle `admin`).
- Espace Premium : présentation et contrôle d'accès (pas de paiement simulé).
- Carte Leaflet, graphiques Chart.js, authentification Supabase, stockage privé/public des photos selon configuration.
- SQL complet avec profils, secteurs, observations, photos, mesures, validation, favoris, abonnements et politiques RLS.

## 2. Préparer Supabase
1. Crée un **nouveau projet Supabase**. Ne supprime pas ton ancien projet.
2. Dans SQL Editor, exécute `sql/01_schema.sql`.
3. Dans `js/config.js`, remplace `SUPABASE_URL` et `SUPABASE_ANON_KEY` par les valeurs **Project URL** et **publishable/anon key** de ton nouveau projet.
4. Ne mets jamais la clé `service_role` dans ce dossier ni dans le navigateur.
5. Dans Authentication > URL Configuration, ajoute l'URL de ton site déployé et `http://localhost:5500` pour les tests locaux.

## 3. Lancer en local
Ne double-clique pas sur `index.html` (les modules JavaScript sont bloqués en `file://`).
- Avec VS Code, installe l'extension Live Server.
- Clique droit sur `index.html` > Open with Live Server.
- Ou lance `python -m http.server 5500` dans le dossier puis ouvre `http://localhost:5500`.

## 4. Déployer sur Render sans GitHub
Pour un site statique, Render Static Site demande généralement un dépôt Git. Si tu veux éviter GitHub, utilise un hébergeur statique qui accepte le téléversement direct, ou passe par le déploiement manuel Render si cette option est disponible sur ton compte.
Le ZIP n'est pas encore déployé et la connexion Supabase ne peut pas être activée sans tes identifiants publics de projet.

## 5. Comptes et rôles
- Toute personne peut consulter les pages publiques.
- Un compte est nécessaire pour déposer une observation et accéder à l'espace membre.
- Le rôle `member` est attribué par défaut.
- Un administrateur doit être promu manuellement depuis SQL Editor par un propriétaire du projet :
  `update public.profiles set role = 'admin' where id = 'UUID_DU_COMPTE';`
- Les validations sont enregistrées dans `observation_reviews`.

## 6. Photos
Le SQL crée le bucket `observation-photos`. Les règles autorisent l'envoi par le propriétaire dans son dossier utilisateur. Les fichiers ne sont pas des preuves scientifiques en soi : une observation doit être contrôlée avant publication.

## 7. Limites honnêtes de cette version
- Le paiement Premium n'est pas branché : aucun faux paiement ni faux abonnement n'est généré.
- Les secteurs peuvent être consultés, mais leur géométrie SIG détaillée doit être ajoutée avec des données géographiques officielles.
- Les cartes et graphiques n'inventent pas de valeurs : ils interrogent la base et affichent un message si elle est vide.
- Les comptes et les données réelles nécessitent la configuration Supabase décrite ci-dessus.
