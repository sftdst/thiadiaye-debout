# Thiadiaye Debout — Back-office (React + TypeScript)

Interface d'administration de la plateforme Thiadiaye Debout : membres, quartiers, journal,
sondages, idées, vidéos, mémoire, défis, agenda, ambassadeurs, lives, multilingue, tableau de
bord. Consomme l'API du dossier `../backend`. Voir `../SUIVI_PROJET.md` pour l'état d'avancement.

## Prérequis

- Node.js 20+
- L'API backend doit tourner (voir `../backend/README.md`)

## Installation

```bash
npm install
cp .env.example .env
```

Renseigner `VITE_API_URL` dans `.env` (par défaut `http://localhost:8000/api`).

## Lancer en développement

```bash
npm run dev
```

Démarre sur le port 5183 (fixé dans `vite.config.ts`).

Connexion : `admin@thiadiaye-debout.local` / `password` (compte créé par le seeder backend —
à changer avant toute mise en production).

## Build pour la production

```bash
npm run build
```

Génère `dist/` (fichiers statiques à déployer derrière un serveur web quelconque, en pointant
`VITE_API_URL` vers l'URL réelle de l'API en production au moment du build).

## Vérification des types

```bash
npx tsc --noEmit
```

## Points d'architecture utiles

- **Auth** : token Sanctum stocké dans `localStorage` (`staff_token`), intercepteur axios dans
  `src/api/client.ts` qui redirige vers `/login` sur une réponse 401.
- **UX des formulaires de création** : composant `Modal` réutilisable (`src/components/Modal.tsx`).
  Chaque page liste + recherche + bouton "Nouveau" qui ouvre un popup — pattern à reproduire pour
  toute nouvelle entité.
- **Responsive** : sidebar transformée en tiroir mobile sous 900px, tables enveloppées dans
  `.table-scroll` pour le défilement horizontal.
