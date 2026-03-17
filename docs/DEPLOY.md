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

Avant le premier déploiement :

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Ou avec migrations :

```bash
npm run db:migrate
npm run db:seed
```

### 4. Déploiement

```bash
npm run build
npm run start
```

## Vercel

1. Importer le projet depuis Git
2. Configurer les variables d’environnement
3. Optionnel : ajouter un script `postinstall` ou `build` qui exécute `prisma generate`
4. Déployer

Le build Next.js exécute `prisma generate` si configuré dans `package.json` (postinstall).

## Railway / Render / Autres

1. Créer un service PostgreSQL
2. Lier le projet et définir `DATABASE_URL`
3. Ajouter les autres variables
4. Build : `npm run build`
5. Start : `npm run start`
6. Exécuter migrations/seed manuellement ou via un job one-off
