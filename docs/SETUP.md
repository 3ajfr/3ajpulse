# 3AJPULSE — Guide de configuration

## Prérequis

- **Node.js** 20+
- **PostgreSQL** 14+
- **npm** ou **pnpm**

## 1. Cloner et installer

```bash
git clone <repo-url>
cd 3ajpulse
npm install
```

## 2. Base de données

Créer une base PostgreSQL :

```bash
createdb 3ajpulse
```

Ou via un service (Docker, Supabase, Neon, etc.).

## 3. Variables d'environnement

Copier le fichier d'exemple et renseigner les valeurs :

```bash
cp .env.example .env
```

Éditer `.env` :

- `DATABASE_URL` : chaîne de connexion PostgreSQL
- `AUTH_SECRET` : secret aléatoire (ex. `openssl rand -base64 32`)
- `AUTH_TRUST_HOST` : `true` en dev, `true` derrière un proxy en prod
- `NEXTAUTH_URL` : URL de l'app (ex. `http://localhost:3000`)

## 4. Migrations et seed

**Recommandé** (migrations versionnées) :

```bash
npm run db:generate
npx prisma migrate deploy
npm run db:seed
```

Pour le prototypage local sans migration : `npm run db:push` synchronise le schéma directement.

## 5. Lancer l'application

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## 6. Connexion démo

Après le seed :

- **Email** : `julien@3ajpulse.fr`
- **Mot de passe** : `PulseDemo2026!`

Autres comptes : `sarah@3ajpulse.fr`, `finance@3ajpulse.fr`, `production@3ajpulse.fr` (même mot de passe).
