# 3AJPULSE — Déploiement

## Stack cible

- **Runtime** : Node.js 20+
- **Base** : PostgreSQL (Supabase, Neon, Railway, etc.)
- **Hébergement** : Vercel, Railway, ou tout hébergeur Node

## Étapes générales

### 1. Base de données

Créer une base PostgreSQL et récupérer l’URL de connexion (ex. Supabase, Neon).

### 2. Variables d'environnement

Configurer sur la plateforme :

| Variable           | Requis          | Description                                                                 |
|-------------------|-----------------|-----------------------------------------------------------------------------|
| `DATABASE_URL`    | Toujours        | URL PostgreSQL                                                              |
| `AUTH_SECRET`     | Toujours        | Secret Auth.js — générer : `openssl rand -base64 32`                          |
| `AUTH_TRUST_HOST` | En production   | `true` — permet à Auth.js d’inférer l’URL depuis les headers du proxy/Vercel    |
| `NEXTAUTH_URL`    | Conditionnel    | Optionnel sur Vercel avec `AUTH_TRUST_HOST=true`. À définir pour un domaine personnalisé en production. |

### 3. Build et migrations

**Production** : utiliser les migrations versionnées (recommandé). Avant le premier déploiement et à chaque déploiement :

```bash
npm run db:generate
npx prisma migrate deploy
npm run db:seed
```

(`db:seed` uniquement au premier déploiement ; les migrations suivantes n'exécutent que `prisma migrate deploy`.)

**Prototypage local** : `npm run db:push` reste disponible pour synchroniser le schéma sans créer de migration. En production, privilégier `prisma migrate deploy`.

### 4. Déploiement

```bash
npm run build
npm run start
```

## Vercel + Neon (déploiement recommandé)

### 1. Base de données — Neon

1. Créer un projet sur [neon.tech](https://neon.tech)
2. Copier la **Connection string** depuis le dashboard Neon (`postgresql://...`)
3. Si le provider requiert SSL, ajouter `?sslmode=require` à la fin de l’URL

### 2. Vercel — Import et variables

1. Importer le repo GitHub depuis [vercel.com/new](https://vercel.com/new)
2. Framework preset : **Next.js** (détecté automatiquement)
3. Configurer dans Settings → Environment Variables :

| Variable | Requis | Valeur |
|----------|--------|--------|
| `DATABASE_URL` | Oui | URL Neon copiée |
| `AUTH_SECRET` | Oui | Générer en local : `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | Oui | `true` |
| `NEXTAUTH_URL` | Non (optionnel) | URL du projet Vercel — à définir si domaine personnalisé (ex. `https://3ajpulse.vercel.app`) |

`prisma generate` s’exécute automatiquement via le script `postinstall` du `package.json` — aucune configuration Build Command supplémentaire n’est nécessaire.

### 3. Migrations et seed — étape manuelle (workflow personnel)

> **Note** : dans cette configuration, les migrations ne s’exécutent pas automatiquement lors d’un déploiement Vercel. Il s’agit d’une étape manuelle — acceptable pour un projet personnel, non recommandé pour un flux de production automatisé.

**Recommandé — via Vercel CLI** (tire les variables de production) :

```bash
vercel env pull .env.production.local
npx prisma migrate deploy
npm run db:seed        # premier déploiement uniquement
```

**Alternative — variable inline** :

```bash
DATABASE_URL="<url-neon>" npx prisma migrate deploy
DATABASE_URL="<url-neon>" npm run db:seed   # premier déploiement uniquement
```

Pour chaque schéma modifié ultérieurement, re-exécuter `npx prisma migrate deploy` manuellement avant ou après le déploiement Vercel.

### 4. Déploiement continu

Pousser sur `main` déclenche un déploiement automatique. Pour un déploiement preview :

```bash
vercel
```

## Railway / Render / Autres

1. Créer un service PostgreSQL
2. Lier le projet et définir `DATABASE_URL`
3. Ajouter les autres variables
4. Build : `npm run build`
5. Start : `npm run start`
6. Exécuter `npx prisma migrate deploy` et `npm run db:seed` (seed au premier déploiement seulement) via un script de build ou un job one-off

---

## Flux de déploiement selon le contexte

### 1. Développement local

```bash
cp .env.example .env          # éditer DATABASE_URL et AUTH_SECRET
npm install
npx prisma migrate deploy      # ou npm run db:push pour le prototypage rapide
npm run db:seed
npm run dev
```

Variables requises : `DATABASE_URL` (sinon : fallback dev interne). `AUTH_SECRET` optionnel en dev (fallback interne, ne jamais utiliser en prod).

### 2. Déploiement personnel Vercel + Neon (workflow actuel)

- Migrations et seed : **étape manuelle** depuis la machine locale (voir section ci-dessus)
- `AUTH_TRUST_HOST=true` sur Vercel : `NEXTAUTH_URL` non requis
- `NEXTAUTH_URL` : définir uniquement si domaine personnalisé configuré
- Push sur `main` → déploiement automatique Vercel (build + postinstall)

### 3. Production automatisée (futur)

- Migrations intégrées en CI/CD (ex. GitHub Actions : `prisma migrate deploy` avant deploy)
- Bases staging et production séparées
- `NEXTAUTH_URL` défini sur le domaine canonique
- Enforcement des rôles activé (hors périmètre v1)
- Sauvegardes Neon configurées
