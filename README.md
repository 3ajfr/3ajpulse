# 3AJPULSE

Maîtrise d'œuvre — Gestion opérationnelle des dossiers et missions d'architecture.

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind v4**
- **Prisma 7** + PostgreSQL
- **Auth.js v5**
- **Zod** + react-hook-form

## Démarrage rapide

```bash
npm install
cp .env.example .env
# Éditer .env (DATABASE_URL, AUTH_SECRET)
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

**Connexion démo** : `julien@3ajpulse.fr` / `PulseDemo2026!`

## Commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Vérification ESLint |
| `npm run test` | Tests Vitest |
| `npm run db:generate` | Génération client Prisma |
| `npm run db:push` | Synchronisation schéma → base |
| `npm run db:migrate` | Migrations versionnées |
| `npm run db:seed` | Données de démonstration |

## Structure

```
src/
├── app/              # Routes (App Router)
│   ├── (app)/        # Pages authentifiées
│   ├── (auth)/       # Connexion
│   └── invoices/     # PDF facture (hors app shell)
├── components/       # UI et layout
├── features/         # Domaines (dossiers, factures, etc.)
├── generated/        # Client Prisma
└── lib/              # Utilitaires, auth, format
```

## Documentation

- [Configuration](docs/SETUP.md)
- [Déploiement](docs/DEPLOY.md)
- [Checklist post-déploiement](docs/POST_DEPLOY.md)
- [Hors périmètre v1](docs/V1_OUT_OF_SCOPE.md)
- [Design system](docs/DESIGN_SYSTEM.md)

## Fonctionnalités v1

- **Dossiers** : CRUD, phases, missions LCA/LCMP/LCSC
- **Tâches** : CRUD, assignation, statuts
- **Jalons** : CRUD, filtres, tri
- **Temps** : Saisie, compétences, valorisation
- **Facturation** : Création, statuts, règlements, page imprimable
- **Paiements** : Enregistrement, imputation
- **Tableau de bord** : KPIs, tâches urgentes, factures en attente

## Licence

Propriétaire — Usage interne.
