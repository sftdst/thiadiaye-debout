# Suivi d'implémentation — Thiadiaye Debout

Ce fichier trace l'avancement réel du projet. Mis à jour à chaque étape terminée.
Référence : `SpecTechnique_ThiadiayeDebout.docx`.

Stack : Backend Laravel (`backend/`) · Back-office admin React (`admin/`) · Site public citoyen React (`web/`) — trois projets indépendants.

## Légende
- ✅ Terminé — 🔄 En cours — ⏳ À faire

## Refonte du site public — navbar + mise en page (2026-09-15)
Constat initial : colonne de contenu figée à 720px sur des écrans larges (beaucoup de vide blanc autour), aucun état actif dans le menu, pas de pied de page.
- **Navbar réécrite** : `NavLink` au lieu de `Link` → l'onglet de la page courante s'affiche en **fond or** (charte graphique), bouton "Connexion" en dégradé de marque, séparateur visuel avant le bloc compte
- **Bandeau d'en-tête par page** (composant `PageHeader`) : fond dégradé sombre (identique à la navbar) avec titre + sous-titre, sur Sondages, Idées, Journal, Agenda, Classement, Mémoire, Tableau de bord, Carte, Lives, Espace ambassadeur, Live (regarder)
- **Largeur de contenu doublée** (720px → 1120px) et **grilles de cartes** (`.card-grid`, `.split-layout`) à la place de l'empilement en colonne unique — Sondages/Idées/Agenda/Journal en grille 2-3 colonnes, Classement/Mémoire/Tableau de bord/Carte/Espace ambassadeur en deux colonnes
- **Pied de page** (`Footer`) ajouté sur toutes les pages — liens de navigation secondaires, ferme proprement le bas de chaque page au lieu de s'arrêter net sur le fond clair
- Bug de contraste trouvé et corrigé au passage : le nom de quartier était invisible (texte blanc sur fond clair) sur Agenda et Vidéos — classe `membre-card-quartier` (pensée pour la carte de membre sur fond sombre) réutilisée à tort ; remplacée par une classe neutre `.quartier-tag`
- Vérifié visuellement via Playwright, desktop (1440px) et mobile (390px), sur 6+ pages — aucune erreur console

## Préparation au déploiement (2026-09-15)
- ✅ Suite de tests automatisés backend (`backend/tests/Feature`) : adhésion (carte + badge + unicité téléphone + consentement obligatoire + parrainage), double authentification (membre/staff), contrôle d'accès admin (membre refusé, staff accepté, non-authentifié rejeté), vote sondage (unicité, option d'un autre sondage rejetée, visiteur non membre bloqué) — 16 tests, tous verts (`php artisan test`)
- ✅ `npm run build` vérifié sans erreur pour `admin/` et `web/`
- ✅ README de mise en route écrit pour les 3 projets (prérequis, installation, lancement, build, points d'architecture)
- ✅ `.gitignore` backend vérifié : `.env` exclu
- ⏳ **Pas encore fait** (nécessite une décision/action de ta part) : dépôt Git initialisé, choix d'hébergement, configuration CORS de production (domaines réels au lieu de `localhost:*`), bascule `APP_DEBUG=false` en prod — voir `backend/README.md` section "Build pour la production"

## Membres : création + carte, badges colorés, dashboard enrichi (2026-09-15)
- **Création de membre depuis l'admin** : `POST /admin/membres` (même logique de génération de carte + badge "Nouveau membre" que l'adhésion publique), bouton "Nouveau membre" + popup sur la page Membres
- **Génération/impression de la carte** : bouton "Carte" par ligne → popup avec la carte de membre visuelle (même design premium que côté web) + bouton "Imprimer" (règle CSS `@media print` qui n'imprime que la carte, pas le reste de l'écran)
- **Badges colorés** : chaque badge a sa propre couleur (Nouveau membre = cyan, Actif = bleu électrique, Ambassadeur = or, Pilier de Thiadiaye = bleu primaire), appliqué partout où les badges sont affichés (tableau Membres, carte de membre admin et web)
- **Tableau de bord admin refondu** : nouvel endpoint `GET /admin/dashboard` agrégeant tout en un appel — 10 KPI (membres, quartiers, ambassadeurs, réalisations, sondages actifs, votes, vidéos publiées, publications, événements à venir, idées approuvées), widget d'alerte modération en attente (avec liens directs), graphique adhésions 14 jours, répartition membres par quartier, répartition des badges, défis actifs avec progression, prochains événements, top ambassadeurs
- Vérifié visuellement via Playwright : dashboard complet, création membre, carte générée — aucune erreur console

## Données de démonstration (2026-09-15)
`DemoDataSeeder` (`php artisan db:seed --class=DemoDataSeeder`) — 18 membres (dont 4 ambassadeurs avec parrainages), 3 sondages avec votes, 6 idées (approuvées/en attente/rejetée), 4 vidéos, 2 défis, 5 photos d'archive, 4 témoignages anciens, 3 messages livre d'or, 5 publications (dates étalées sur 15 jours pour le graphique du tableau de bord), 4 réalisations, 1 témoignage de la semaine, 4 événements (dont 1 réservé ambassadeurs), 10 inscriptions, 2 contenus de formation. Photos en `picsum.photos` (placeholders, pas de vrai stockage — Étape 0). Mots de passe des membres démo : `password`.

## Édition dans toutes les interfaces (2026-09-15)
Chaque page admin qui gère une entité permet maintenant de la **modifier**, pas seulement de créer/supprimer : Membres (nom, téléphone, quartier — nouveau), Quartiers, Sondages (question — options verrouillées après création car liées aux votes), Vidéos, Défis, Publications, Réalisations, Événements, Contenu de formation, Photos d'archive. Deux endpoints backend ajoutés (`PUT /admin/videos/{id}` complet, `PUT /admin/memoire/photos/{id}`, `PUT /admin/membres/{id}`). Vérifié de bout en bout (édition d'un membre via l'UI puis contrôle par l'API).

## Responsive (2026-09-15)
- **Admin** : sidebar transformée en tiroir off-canvas sous 900px (bouton ☰ dans une barre mobile, fermeture au clic sur un lien ou l'overlay), tableaux dans un conteneur à défilement horizontal (`.table-scroll`), cartes/formulaires/toolbar qui s'empilent en dessous de 900px et 520px
- **Web** : navbar transformée en menu burger sous 860px, hero et cartes de stats qui s'empilent, grille vidéo à une colonne, tailles de police réduites sous 480px
- Vérifié visuellement via Playwright en viewport mobile (390×844) sur les deux apps : accueil, menu ouvert, sondages, tableau de bord (web) ; connexion, tableau de bord, menu ouvert, membres avec défilement de tableau (admin)

## Charte graphique officielle (2026-09-15)
Remplace la charte provisoire SenArchive utilisée aux Étapes 3-6. Basée sur le logo Thiadiaye Debout (`logo.jpeg`, copié dans `admin/public/` et `web/public/`, utilisé comme favicon + logo navbar/sidebar/login).
- **Primary Blue** `#0246B0` · **Dark Blue** `#01196D` · **Electric Blue** `#027EED` · **Cyan** `#0ECEF7` · **Gold** `#F7B506` · **Noir** `#000000`
- Dégradé de marque `linear-gradient(135deg, Primary Blue → Electric Blue → Cyan)` sur boutons principaux, cartes, bordures d'accent
- Fond sombre dégradé (noir → bleu marine) pour navbar (web), sidebar (admin), pages de connexion et hero — reprend l'ambiance du logo
- Or utilisé en accent (élément actif de la sidebar, CTA principal du hero, badges) — jamais en fond large
- Couleurs des quartiers de démonstration alignées sur la palette (`QuartierSeeder`)
- Vérifié visuellement via Playwright (screenshots) sur les deux apps : accueil, adhésion, carte de membre, connexion admin, tableau de bord, quartiers, carte interactive — un bug trouvé et corrigé (classe `.btn-link` manquante côté web, bouton "Déconnexion" mal stylé)

## UX back-office : pattern liste + popup d'ajout (2026-09-15)
Toutes les pages admin avec un formulaire de création suivent désormais le même pattern : liste + barre de recherche + bouton "+ Nouveau" qui ouvre une **popup modale** (composant réutilisable `admin/src/components/Modal.tsx`, portail React, fermeture Échap/clic extérieur/croix) contenant le formulaire. Plus de formulaire affiché en permanence sur la page.
- Appliqué à : Quartiers (+ modification), Sondages, Vidéos, Défis, Publications (Journal), Réalisations, Agenda (Événements), Ambassadeurs (contenu de formation), Mémoire (photos d'archive)
- Recherche côté liste ajoutée partout où elle manquait (quartiers, sondages, vidéos, défis, publications, réalisations, événements, formations, photos)
- Non concerné : Membres (déjà dans ce pattern), Idées (pas de création admin, uniquement modération), promotion ambassadeur (action de bascule, pas une création)
- Vérifié visuellement via Playwright : liste + popup testées sur Publications et Quartiers, aucune erreur console

## Présentation du mouvement sur l'accueil public (2026-09-17)
Nouvelle section "Le Mouvement" sur la page d'accueil du site public (`web/`) : description du mouvement + carte du président (photo, nom, titre, biographie). Contenu géré depuis une nouvelle page admin dédiée (pas de liste, un seul enregistrement à éditer).
- **Backend** : table singleton `presentation_mouvement` (un seul enregistrement, créé automatiquement au premier appel via `firstOrCreate`), `GET /api/presentation-mouvement` (public), `POST /api/admin/presentation-mouvement` (staff, `multipart/form-data` pour l'upload)
- **Upload de photo** : première fonctionnalité du projet à stocker un vrai fichier (jusqu'ici toutes les "photos" étaient des liens `picsum.photos`, cf. Étape 0). Stockage local Laravel (`storage/app/public`, lien symbolique `php artisan storage:link` créé) — migrable vers S3 plus tard sans changer le schéma (`president_photo_url` reste une simple URL)
- **Admin** : page "Présentation du mouvement" (sidebar → Contenu), formulaire direct sans popup ni liste (seul cas de ce type dans l'admin, cohérent avec le fait que c'est un enregistrement unique)
- **Web** : section ajoutée juste sous le hero de l'accueil, masquée tant qu'aucun contenu n'est renseigné côté admin
- Vérifié de bout en bout via Playwright (headless) : connexion admin → remplissage du formulaire + upload photo → sauvegarde confirmée → section visible sur l'accueil avec les bonnes données, aucune erreur console

---

## Étape 0 — Cadrage préalable
- ⏳ Liste officielle des quartiers + GeoJSON (à valider avec la mairie)
- ⏳ Choix du fournisseur WhatsApp Business API (BSP)
- ⏳ Choix de l'hébergement du stockage médias (S3-compatible)

## Étape 1 — Setup technique
- ✅ Backend Laravel 12 scaffoldé (`backend/`)
- ✅ Admin React + TypeScript + Vite scaffoldé (`admin/`, port 5173)
- ✅ Web public React + TypeScript + Vite scaffoldé (`web/`, port 5174)
- ✅ Sanctum installé (`php artisan install:api`)
- ✅ PostgreSQL configuré (`thiadiaye_debout`) et migrations de base validées
- ✅ CORS configuré (localhost:5173 / 5174 autorisés)
- ✅ `.env` / `.env.example` pour les 3 projets (VITE_API_URL pointant vers l'API)

## Étape 2 — Socle d'adhésion & auth
- ✅ Migrations : `quartiers`, `membres`, `badges`, `membre_badge`, rôle sur `users`
- ✅ Modèles Eloquent : `Quartier`, `Membre` (Authenticatable + Sanctum), `Badge`, `User` (+ rôle)
- ✅ Double authentification par token Sanctum, un seul guard : `$request->user()` résout automatiquement `Membre` ou `User` selon le token
- ✅ Middleware `staff.role` (alias `EnsureStaffRole`) pour restreindre les routes au personnel (Administrateur/Modérateur)
- ✅ Endpoints : `GET /api/quartiers` (public), `POST /api/adhesion` (public, génère carte + badge "Nouveau membre"), `POST /api/auth/membre/login`, `POST /api/auth/staff/login`, `GET /api/me`, `POST /api/logout`
- ✅ Seeders : 5 quartiers de démo (liste provisoire, à remplacer par la liste officielle mairie), 4 badges progressifs, 1 compte admin de dev
- ✅ Testé de bout en bout via curl (adhésion → login membre/staff → /me → contrôle d'accès)
- ⏳ Restant pour cette étape : endpoints CRUD quartiers/membres côté admin (Étape 3), UI du formulaire d'adhésion et de la carte de membre (React)

## Étape 3 — Back-office admin & site public (adhésion)
- ✅ Backend : endpoints admin `GET/POST/PUT/DELETE /api/admin/quartiers` (CRUD), `GET /api/admin/membres` (liste paginée + recherche + filtre quartier), `GET /api/admin/membres/{id}`
- ✅ Admin React (`admin/`, port **5183** — 5173 était occupé par un autre process sur la machine) :
  - Auth context + écran de connexion staff (`/login`)
  - Layout avec sidebar (Tableau de bord / Membres / Quartiers) + déconnexion
  - Tableau de bord : compteurs globaux + répartition membres par quartier
  - Page Membres : liste paginée, recherche (nom/téléphone/numéro de carte)
  - Page Quartiers : CRUD complet (créer/modifier/supprimer avec couleur)
- ✅ Web public React (`web/`, port 5174) :
  - Page d'accueil avec CTA adhésion
  - Formulaire d'adhésion (nom, téléphone, mot de passe optionnel, quartier, langue, consentement RGPD obligatoire)
  - Affichage de la carte de  membre numérique après adhésion (numéro TD-xxxxxx, quartier, badge, date)
- ✅ Testé bout en bout : adhésion via API, CORS multi-origines (5174/5183), login staff, listes admin membres/quartiers

### Charte graphique
- Reprise de la charte SenArchive (`E:\CODING\DSTCOMPUTING\Plateforme\SenArhive_Sn`) : Orange `#ff7631` (primary) + Bleu marine `#002f59` (secondary/sidebar), police **Instrument Sans**, rayon de bordure `0.625rem`, tokens de couleur en `oklch()`
- Appliquée dans `admin/` (sidebar bleu marine, actif en orange) et `web/` (hero bleu marine, CTA orange)
- Non repris pour l'instant : mode sombre (variables présentes côté SenArchive mais pas de toggle demandé), composants shadcn/ui (SenArchive utilise Tailwind+shadcn ; nos apps sont en CSS simple pour rester légères — mêmes couleurs/typo, implémentation différente)

### Identifiants de développement
- Admin : `admin@thiadiaye-debout.local` / `password` (à changer avant toute prod)
- Ports dev : backend 8000, admin 5183, web 5174

## Étape 4 — Phase 1 (5 modules prioritaires)
- ✅ **Sondages & consultations citoyennes** : `Sondage`/`OptionSondage`/`Vote`/`Idee`/`VoteIdee`, un vote par membre, boîte à idées avec modération, admin (créer/clôturer/résultats), web (voter, proposer, soutenir)
- ✅ **Espace vidéo & média** : entité `Video` (message/témoignage/réalisation/replay), admin ajoute par URL (pas encore de vrai stockage S3, cf. Étape 0), web : galerie filtrable par type
- ✅ **Gamification & récompenses** : classement des quartiers (temps réel, public), `Defi` (objectif + progression), badges déjà posés en Étape 2. **Non fait** : top ambassadeurs / certificats WhatsApp — dépend du module Ambassadeurs (Étape 6, phase 2) et du choix BSP (Étape 0)
- ✅ **Mémoire de Thiadiaye** : `ArchivePhoto` (admin), `TemoignageAncien` et `MessageLivreOr` (soumis par membres, modérés par l'admin avant publication)
- ⚠️ **Chatbot WhatsApp 24h/24** : moteur interne fonctionnel (sessions, historique, menu par mots-clés : ADHESION / CARTE / AMBASSADEUR, vérification de signature webhook prête) mais **pas branché à un vrai numéro WhatsApp** — bloqué sur le choix du fournisseur BSP (Étape 0). Intents "actualités" et "agenda" pas encore possibles : dépendent des modules Journal (Étape 6) et Agenda (Étape 6), pas encore construits
- ✅ Toutes les 5 fonctionnalités couvertes par des endpoints testés (curl) ; interfaces admin (Sondages, Idées, Vidéos, Défis, Mémoire) et web (Sondages, Idées, Vidéos, Classement, Mémoire, connexion membre) créées et type-checkées

### Charte graphique appliquée aux nouvelles pages
Toutes les nouvelles pages (admin et web) réutilisent les mêmes tokens (`--primary`, `--secondary`, `--radius`, etc.) posés à l'Étape 3 — pas de nouvelle palette introduite.

## Étape 5 — Sécurité transverse
- ✅ File de modération contenus (idées, témoignages, livre d'or, vidéos témoignages) — statut `en_attente` par défaut, visible publiquement qu'après validation admin
- ✅ Rate limiting sur le webhook chatbot (`throttle:30,1`) ; les routes API héritent du throttling par défaut du groupe `api`
- ✅ Vérification de signature webhook prête (HMAC SHA-256, désactivée tant que `WHATSAPP_WEBHOOK_SECRET` n'est pas défini — cf. Étape 0)
- ⏳ Restant : journalisation fine des actions admin, sauvegardes DB automatisées (à traiter avant mise en production)

## Étape 6 — Phase 2 (structuration & organisation)
- ✅ **Journal du mouvement** : `Publication` (actualité/bilan, brouillon/publié), `Realisation` (avant/après par quartier), `TemoignageMembre` ("témoignage de la semaine", modéré puis mis en avant). Admin : Publications + Réalisations. Web : page Journal
- ✅ **Carte interactive avancée** : réutilise `Quartier.geojson` (déjà posé en Étape 2) — admin peut coller le tracé GeoJSON par quartier, web affiche une vraie carte Leaflet + OpenStreetMap avec polygones colorés (popup = nb de membres) et marqueurs des événements géolocalisés. **Le tracé réel reste à obtenir de la mairie (Étape 0)** — la carte fonctionne mais est vide tant qu'aucun GeoJSON n'est saisi
- ✅ **Réseau des ambassadeurs** : `parraine_par_id` sur `Membre` (pas de table de jonction séparée), lien de parrainage `?parrain=TD-xxxxxx` résolu à l'adhésion, `ContenuFormation`, espace ambassadeur (recrutements, classement, formation, réunion mensuelle, lien groupe WhatsApp). Admin : promotion/rétrogradation membre ↔ ambassadeur + gestion formation
- ✅ **Agenda citoyen** : `Evenement`/`Inscription`, réunions "réservées ambassadeurs" exclues de l'agenda public, commande Artisan `evenements:envoyer-rappels` planifiée toutes les 30 min (J-1/H-1) — **journalise** les rappels à envoyer (`storage/logs/laravel.log`) mais n'envoie rien réellement : dépend du choix BSP (Étape 0)
- ✅ **Tableau de bord public** : `GET /api/tableau-de-bord` sans authentification (compteur membres, courbe d'adhésions 30j, carte de chaleur quartiers), page web avec bouton de partage (Web Share API)
- ✅ Backend testé de bout en bout via curl (75 routes API au total) ; interfaces admin (Publications, Réalisations, Agenda, Ambassadeurs + éditeur GeoJSON dans Quartiers) et web (Journal, Carte, Agenda, Espace ambassadeur, Tableau de bord) créées et type-checkées

## Étape 7 — Phase 3 (extension & portée)
- ✅ **Lives & diffusion en direct** : `LiveSession`/`MessageChatLive`. MVP tel que recommandé par la spec (5.2) — intégration d'un lien externe YouTube/Facebook Live plutôt qu'un service dédié (Mux/Agora). Cycle complet : planifier → démarrer (badge LIVE clignotant) → viewers en heartbeat join/leave → chat en direct par polling (3s) → terminer avec génération automatique du replay dans l'espace vidéo. Bannière LIVE sur l'accueil web. **Limite assumée** : pas d'infrastructure WebSocket (Reverb/Pusher) — compteur de viewers et chat sont approximés par polling, pas du vrai temps réel. Passage à un service de streaming dédié = évolution possible sans changer le schéma
- ✅ **Version multilingue** : infrastructure technique complète — `Traduction` (clé/langue/texte) et `FichierAudio` (clé/langue/URL) avec CRUD admin, sélecteur de langue FR/WO/SR sur le site public, mode simplifié (accessibilité, polices/boutons agrandis) fonctionnels et vérifiés. **Volontairement non fait** : traduction complète de l'interface — seulement 3 clés de démonstration en wolof (salutation + CTA d'adhésion), en wolof standard et non ambigu, pour prouver le mécanisme sans se substituer à un vrai travail de traduction. **Aucune traduction sérère fournie** (je n'ai pas la compétence linguistique pour garantir leur exactitude) — à faire avec un locuteur natif sérère, comme le recommande la spec (5.4). Idem pour les messages vocaux : le back-office permet d'uploader des liens audio pré-enregistrés, mais aucun contenu audio réel n'a été produit (nécessite des locuteurs natifs, cf. Étape 8 de la spec source)
- Les 12 modules de la spec technique sont maintenant couverts (au moins en MVP) — reste les points de l'Étape 0 (quartiers officiels, choix BSP WhatsApp, stockage médias) et la production de contenu réel (traductions, audio, GeoJSON) qui ne sont pas des tâches de développement

---

## Bascule PostgreSQL → MySQL (2026-09-17)
Migration de la base de données de développement de PostgreSQL vers MySQL/MariaDB (XAMPP), à la demande du porteur de projet.
- `.env` / `.env.example` : `DB_CONNECTION=mysql`, `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=thiadiaye_debout`, `DB_USERNAME=root`, `DB_PASSWORD=` (vide)
- Base `thiadiaye_debout` créée sur le serveur MySQL local (MariaDB 10.4 via XAMPP), charset `utf8mb4`
- Vérification préalable : aucune syntaxe spécifique à PostgreSQL dans le code (pas d'`ILIKE`, pas de `jsonb`, pas de requêtes brutes dépendantes du moteur) — la seule colonne JSON (`quartiers.geojson`) est compatible nativement avec les deux moteurs
- Toutes les migrations rejouées avec succès sur la nouvelle base (`php artisan migrate`), seeders de base + démo relancés (quartiers, badges, compte admin, `DemoDataSeeder`, `DemoTraductionsSeeder`)
- Suite de tests automatisés (16 tests, PHPUnit sur SQLite en mémoire — non affectée par ce changement) toujours au vert après la bascule
- README backend mis à jour (prérequis MySQL/MariaDB au lieu de PostgreSQL)
- **Note** : la base précédente contenait une vraie photo du président uploadée manuellement par le porteur de projet — elle n'existe plus dans la nouvelle base (remplacée par la photo de démonstration du seeder), il faudra la ré-uploader depuis l'admin si besoin

## Incident XAMPP MySQL — "shutdown unexpectedly" (2026-09-19)
Le serveur MySQL/MariaDB de XAMPP (partagé par tous les projets locaux, pas seulement Thiadiaye Debout) ne démarrait plus : journal InnoDB corrompu (`Missing MLOG_CHECKPOINT`), probablement suite à un arrêt brutal.
- Sauvegarde complète du dossier de données avant toute intervention (`C:\xampp\mysql\data_backup_20260919_111539`), puis export SQL (`mysqldump`) de chacune des 20 bases présentes sur le serveur (dont `thiadiaye_debout`), vérifiés individuellement
- Réparation impossible en l'état (même avec `innodb_force_recovery` jusqu'à 6) → reconstruction complète et propre du dossier de données MySQL (`mysql_install_db`), puis réimport de toutes les bases depuis les exports SQL vérifiés
- `max_allowed_packet` du serveur augmenté de 1M à 256M au passage (trop bas pour certains gros projets Drupal du serveur, provoquait des coupures de connexion pendant l'import)
- **`thiadiaye_debout` restaurée intégralement** (38 tables, toutes les données vérifiées) ; l'ancien dossier corrompu est conservé sur le disque (`C:\xampp\mysql\data_corrupted_20260919`) au cas où
- Une seule base du serveur (`db_site_mepc`, un site Drupal sans rapport avec ce projet) n'a pas pu être réimportée automatiquement (clé primaire dupliquée dans l'export) — laissée de côté à la demande du porteur de projet, à traiter séparément si besoin
- `innodb_force_recovery` désactivé après coup ; MySQL redémarré via le mécanisme standard de XAMPP pour rester pilotable depuis le panneau de contrôle

## Adhésion : vérification d'identité + validation admin (2026-09-19)
Le formulaire d'adhésion publique demande désormais une photo de profil, le numéro de CNI et une photo recto/verso de la CNI. Le compte reste **en attente** tant qu'un administrateur ne l'a pas validé — impossible de se connecter avant.
- **Backend** : colonnes `photo_profil_url`, `cni_numero` (unique), `cni_recto_url`, `cni_verso_url`, `statut` (`en_attente`/`approuve`/`rejete`, défaut `approuve` pour ne pas bloquer les comptes existants) ajoutées à `membres`. `AdhesionController` upload les 3 fichiers (stockage local, comme la photo du président), force `statut = en_attente` et ne délivre plus de token à l'inscription. `AuthController::membreLogin` bloque la connexion tant que le statut n'est pas `approuve`. Nouvelle route admin `PATCH /admin/membres/{id}/statut` (approuver/rejeter)
- **Admin** : page Membres avec filtres par statut (Tous/En attente/Approuvés/Rejetés) et un bouton "Vérifier" (visible sur les comptes en attente) ouvrant une fenêtre de revue avec la photo de profil, le numéro de CNI et les deux photos recto/verso, avec boutons Approuver/Rejeter
- **Web** : écran de confirmation "en attente de validation" à la place de la carte de membre + connexion automatique d'avant. Page de connexion mise à jour pour afficher le vrai message d'erreur (en attente / rejeté) au lieu d'un message générique
- **Photo de profil** : possibilité de prendre la photo directement à la webcam (composant `WebcamPhotoInput`, bascule upload/webcam, capture via `getUserMedia` + `canvas`) en plus de l'upload classique
- Tests automatisés mis à jour et complétés (adhésion avec fichiers obligatoires, blocage de connexion tant que non approuvé) — 18/18 tests au vert
- Vérifié de bout en bout via Playwright (formulaire, webcam simulée, écran d'attente, revue admin, approbation, connexion) et curl

## Carte membre (QR + logo), upload d'images Mémoire, CV PDF du président (2026-09-26)
- **Carte de membre (admin)** : ajout du logo du mouvement et d'un QR code (encode le numéro de carte, `qrcode.react`) sur la carte visuelle imprimable, en plus des informations déjà présentes
- **Mémoire — photos d'archive** : le formulaire admin acceptait uniquement une URL collée ; il permet maintenant aussi d'uploader directement un fichier image (`POST/PUT /admin/memoire/photos` en `multipart/form-data`, validation `required_without` pour accepter l'un ou l'autre), stocké comme les autres fichiers du projet (`storage`, disque `public` → dossier `tdcontent`)
- **Biographie du président — PDF** : nouvelle colonne `president_cv_url` sur `presentation_mouvement`. L'admin peut uploader un PDF (CV/biographie complète, `mimes:pdf`, 10 Mo max) depuis la page "Présentation du mouvement" ; le site public affiche un lien "📄 Lire la biographie complète (PDF)" sous la biographie courte lorsqu'un PDF est renseigné
- Vérifié via Playwright (headless) : carte avec QR scannable et logo (capture d'écran), champ d'upload visible sur Mémoire, upload PDF bout en bout (POST confirmé + lien visible sur l'accueil public) — 18/18 tests automatisés backend toujours au vert
- **Restant pour la mise en production** : `admin/` a une nouvelle dépendance (`qrcode.react`) → nécessite un `npm run build` frais avant réupload ; la migration `add_president_cv_to_presentation_mouvement_table` doit être jouée en prod (`php artisan migrate --force`)

## Journal des tâches

### 2026-09-15
- Analyse de `SpecTechnique_ThiadiayeDebout.docx` et découpage en étapes d'implémentation
- Scaffolding des 3 projets : `backend/` (Laravel 12), `admin/` (React+TS), `web/` (React+TS)
- Installation Sanctum, config PostgreSQL (`thiadiaye_debout`), CORS
- Vérification : migrations de base OK, `php artisan serve` fonctionne
- Étape 2 (socle d'adhésion & auth) terminée : migrations, modèles, auth Sanctum double (membre/staff), middleware de rôles, endpoints d'adhésion/login/me, seeders, tests curl validés
- Étape 3 terminée : endpoints admin (CRUD quartiers, liste membres), back-office React (login, dashboard, membres, quartiers), site public React (accueil, formulaire d'adhésion, carte de membre numérique). Testé bout en bout, serveurs de test arrêtés après validation
- Charte graphique DstComputing/SenArchive (orange #ff7631 + bleu marine #002f59, Instrument Sans) appliquée aux apps admin et web
- Étape 4 terminée : backend complet des 5 modules Phase 1 (sondages/idées, vidéos, gamification/défis, mémoire, chatbot WhatsApp — moteur interne prêt mais non branché à un vrai BSP), 11 nouvelles tables, ~25 nouveaux endpoints testés via curl, interfaces admin et web créées pour les 5 modules. Étape 5 (modération + rate limiting + signature webhook) posée en même temps
- Étape 6 terminée (Phase 2) : Journal (publications/réalisations/témoignage de la semaine), carte interactive Leaflet branchée sur le GeoJSON des quartiers, réseau des ambassadeurs (parrainage, espace dédié, formation), agenda citoyen (inscriptions + commande de rappels planifiée), tableau de bord public. 75 routes API au total, interfaces admin et web créées et type-checkées. Limitations documentées : GeoJSON des quartiers et rappels WhatsApp toujours en attente de l'Étape 0
- Charte graphique officielle Thiadiaye Debout appliquée (remplace SenArchive) : logo intégré (favicon, navbar, sidebar, connexion), palette Primary/Dark/Electric Blue + Cyan + Gold, dégradés de marque, fond sombre pour hero/sidebar/login, couleurs des quartiers de démo alignées. Vérifié visuellement via Playwright (screenshots headless Chromium) sur les deux apps ; un bug de style trouvé et corrigé (`.btn-link` manquant côté web)
- UX back-office harmonisée : composant `Modal` réutilisable, toutes les pages de création (Quartiers, Sondages, Vidéos, Défis, Publications, Réalisations, Agenda, Formation ambassadeurs, Mémoire) converties au pattern liste + recherche + bouton "Nouveau" → popup, au lieu du formulaire permanent en haut de page
- Génération d'un jeu de données de démonstration complet (`DemoDataSeeder`) pour tester la partie publique en conditions réalistes ; au passage, résolution d'un faux-positif de debug (page bloquée sur "Chargement…" à cause d'un ancien process de dev server resté actif sur le port 5174, pas un bug applicatif)
- Ajout de la modification dans toutes les interfaces admin qui n'en disposaient pas encore (Membres, Vidéos, Défis, Publications, Réalisations, Événements, Formation, Photos d'archive), avec 3 nouveaux endpoints backend
- Responsive géré sur les deux apps : sidebar/tiroir mobile + tables à défilement horizontal côté admin, navbar burger + mise en pile des sections côté web. Vérifié en viewport mobile via Playwright
- Membres : création admin + génération/impression de carte, badges colorés par type, tableau de bord admin refondu avec 10 KPI + 6 widgets (modération, adhésions, quartiers, badges, défis, événements, top ambassadeurs)
- Étape 7 (Phase 3) terminée : Lives & diffusion en direct (cycle complet planifier/démarrer/chat/viewers/replay automatique, MVP lien externe), Version multilingue (infra Traduction/FichierAudio, sélecteur FR/WO/SR, mode simplifié). Les 12 modules de la spec sont désormais couverts au moins en MVP ; testé visuellement via Playwright sans erreur console
- Préparation au déploiement : 16 tests automatisés backend (PHPUnit — adhésion, double authentification, contrôle d'accès admin, votes) tous verts, builds de production `admin/` et `web/` vérifiés sans erreur, READMEs de mise en route écrits pour les 3 projets, `.gitignore` backend vérifié (`.env` bien exclu)
- Refonte complète de la navbar et de la mise en page du site public : état actif en or, bandeau d'en-tête par page, largeur de contenu doublée, grilles de cartes, pied de page. Bug de contraste corrigé au passage (quartier invisible sur Agenda/Vidéos)

### 2026-09-17
- Nouvelle section "Le Mouvement" sur l'accueil public (description + carte du président) : table singleton `presentation_mouvement`, endpoints public/admin, page admin dédiée (formulaire direct, sans liste), upload réel de photo (première fonctionnalité avec stockage de fichier du projet, jusqu'ici uniquement des liens externes). Vérifié de bout en bout via Playwright, aucune erreur console
- Remplacement du logo provisoire (`logo.jpeg`) par le vrai logo officiel du mouvement (`logo.png`, fourni par le porteur de projet) dans les deux apps (favicon, navbar/sidebar, hero, footer, page de connexion admin)
- Jeu de données par défaut ajouté au `DemoDataSeeder` pour la présentation du mouvement (description + président), pour visualiser le rendu sans passer par l'admin
- Hero de l'accueil transformé en carrousel à 2 slides (accroche/CTA existants + description du mouvement en provenance de l'admin), rotation automatique (6s) et points de navigation cliquables. Carte du président agrandie (photo 260px) et recentrée en dessous, seule dans sa section (la description n'y est plus dupliquée puisqu'elle vit désormais dans le hero)
- Ajustements visuels suite retour : hero rendu bien plus compact (hauteur fixe en `100vh` remplacée par une hauteur qui s'adapte au contenu de chaque slide, fini l'espace vide sur le slide "Le Mouvement"). Section président entièrement restylée façon encart institutionnel (inspiré d'une maquette fournie) : photo portrait à gauche avec décor de pointillés, étiquette sombre "Le Mot du Président" + nom, biographie justifiée à droite
- Deuxième itération suite retour : carrousel du hero abandonné (une seule vue, encore plus compacte) au profit d'une section "Le Mouvement" dédiée juste avant le président. Bouton "Adhérer au mouvement" déplacé en haut de la navbar (à la place du sélecteur de langue FR/WO/SRR et du mode simplifié). Ces deux derniers ont ensuite été complètement retirés de l'interface web (demande explicite) — le code (`LanguageContext`, `SimplifiedModeContext`) reste en place mais n'est plus exposé dans la navbar
- Réorganisation du menu du site public en deux sous-menus déroulants : **Galerie** (Live, Vidéos, Image) et **Actualité** (Journal, Sondages, Idées, Revue de presse) — "Journal" déplacé de la barre principale vers ce sous-menu, et lien "Accueil" explicite ajouté en premier dans le menu — composant dropdown accessible (clic, fermeture au clic extérieur, mise en évidence du groupe actif), qui se replie en accordéon dans le menu mobile. Page "Image" créée en extrayant la galerie photo de Mémoire (qui ne garde plus que témoignages + livre d'or). **Revue de presse** : nouvelle fonctionnalité complète (table `articles_presse`, endpoints public/admin, page admin liste+popup, page publique en grille de cartes) ; données de démo ajoutées au seeder. Vérifié de bout en bout via Playwright (desktop + mobile + admin), aucune erreur console
