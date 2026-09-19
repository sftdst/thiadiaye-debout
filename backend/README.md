# Thiadiaye Debout — Backend (API Laravel)

API REST pour la plateforme citoyenne Thiadiaye Debout. Sert deux frontends indépendants :
`admin/` (back-office) et `web/` (site public citoyen). Voir `../SUIVI_PROJET.md` à la racine
pour l'état d'avancement complet du projet.

## Prérequis

- PHP 8.2+
- Composer
- MySQL / MariaDB (base `thiadiaye_debout`)

## Installation

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Renseigner dans `.env` :
- `DB_*` — connexion MySQL / MariaDB
- `FRONTEND_WEB_URL` — URL du site public (utilisée par le chatbot pour construire les liens)
- `WHATSAPP_WEBHOOK_SECRET` / `WHATSAPP_GROUPE_AMBASSADEURS_URL` — à renseigner une fois le
  fournisseur WhatsApp choisi (cf. Étape 0 du suivi projet)

```bash
php artisan migrate
php artisan db:seed                        # quartiers, badges, compte admin de dev
php artisan db:seed --class=DemoDataSeeder      # jeu de données de démonstration (optionnel)
php artisan db:seed --class=DemoTraductionsSeeder  # traductions wolof de démo (optionnel)
```

Identifiants admin de dev créés par le seeder : `admin@thiadiaye-debout.local` / `password`
— **à changer avant toute mise en production**.

## Lancer en développement

```bash
php artisan serve --port=8000
```

Pour que les rappels d'événements (agenda) et autres tâches planifiées s'exécutent, lancer le
planificateur en parallèle :

```bash
php artisan schedule:work
```

## Tests

```bash
php artisan test
```

## Build pour la production

Aucun build front côté backend. En production :

```bash
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan migrate --force
```

Penser à :
- `APP_ENV=production` et `APP_DEBUG=false`
- Un vrai secret `WHATSAPP_WEBHOOK_SECRET` dès que le fournisseur WhatsApp est choisi
- Configurer `config/cors.php` avec les domaines réels de `admin` et `web` (actuellement autorise
  tout `localhost:*` pour le développement)
- Sauvegardes régulières de la base (les données de membres sont un actif politique sensible,
  cf. section 6.4 de la spec technique)

## Points d'architecture utiles

- **Auth à deux profils, un seul mécanisme** : `Membre` (citoyens) et `User` (staff) utilisent
  tous les deux Laravel Sanctum. `$request->user()` résout automatiquement le bon modèle selon
  le token — pas de guards séparés.
- **Rôles** : `staff.role:administrateur,moderateur` (middleware) protège les routes admin ;
  `is.membre` protège les actions réservées aux adhérents (voter, commenter, etc.).
- **Modération** : idées, témoignages, vidéos et messages du livre d'or passent par un statut
  `en_attente` avant publication publique.
