# Thiadiaye Debout — Site public (React + TypeScript)

Espace citoyen public de la plateforme Thiadiaye Debout : accueil, adhésion, sondages, idées,
vidéos, lives, agenda, carte interactive, journal, mémoire, tableau de bord public, espace
ambassadeur. Consomme l'API du dossier `../backend`. Voir `../SUIVI_PROJET.md` pour l'état
d'avancement complet.

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

Démarre sur le port 5174 (fixé dans `vite.config.ts`).

## Build pour la production

```bash
npm run build
```

Génère `dist/` (fichiers statiques), en pointant `VITE_API_URL` vers l'URL réelle de l'API en
production au moment du build.

## Vérification des types

```bash
npx tsc --noEmit
```

## Points d'architecture utiles

- **Auth membre** : token Sanctum stocké dans `localStorage` (`membre_token`) via
  `src/context/MembreAuthContext.tsx`.
- **Multilingue** : `src/context/LanguageContext.tsx` — le français reste géré en dur dans le
  code (langue par défaut) ; wolof/sérère sont chargés depuis l'API (`GET /traductions`) et
  retombent sur le texte français si aucune traduction n'existe encore pour une clé donnée.
- **Mode simplifié** (accessibilité, smartphones d'entrée de gamme) :
  `src/context/SimplifiedModeContext.tsx`, applique une classe `body.mode-simplifie`.
- **Lives** : `src/pages/LiveWatchPage.tsx` — compteur de viewers et chat par polling (pas de
  WebSocket), cf. limitations documentées dans `SUIVI_PROJET.md`.
