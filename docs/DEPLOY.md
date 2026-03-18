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

| Variable        | Description                          | Exemple                          |
|----------------|--------------------------------------|----------------------------------|
| `DATABASE_URL` | URL PostgreSQL                       | `postgresql://...`               |
| `AUTH_SECRET`  | Secret Auth.js (32+ caractères)      | `openssl rand -base64 32`        |
| `AUTH_TRUST_HOST` | `true` en production             | `true`                           |
| `NEXTAUTH_URL` | URL publique de l’app                | `https://app.example.com`        |

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

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | URL Neon copiée |
| `AUTH_SECRET` | Générer en local : `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | `true` |
| `NEXTAUTH_URL` | URL Vercel du projet (ex. `https://3ajpulse.vercel.app`) |

`prisma generate` s’exécute automatiquement via le script `postinstall` du `package.json` — aucune configuration Build Command supplémentaire n’est nécessaire.

### 3. Migrations et seed — premier déploiement uniquement

Depuis la machine locale avec `DATABASE_URL` de production :

```bash
DATABASE_URL="<url-neon>" npx prisma migrate deploy
DATABASE_URL="<url-neon>" npm run db:seed
```

Ou via Vercel CLI :

```bash
vercel env pull .env.production.local
npx prisma migrate deploy
npm run db:seed
```

Les déploiements suivants n’exécutent que `prisma migrate deploy` si de nouvelles migrations existent.

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
