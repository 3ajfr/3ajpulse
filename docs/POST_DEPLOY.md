# 3AJPULSE — Checklist post-déploiement

## Immédiat

- [ ] Vérifier que l’app répond sur l’URL de production
- [ ] Tester la connexion (sign-in)
- [ ] Vérifier que les données seed sont visibles (si seed exécuté)
- [ ] Tester une navigation complète : dashboard, dossiers, factures, paiements

## Sécurité

- [ ] `AUTH_SECRET` est unique et non commité
- [ ] `DATABASE_URL` n’est pas exposée côté client
- [ ] `NEXTAUTH_URL` pointe vers l’URL de production
- [ ] Changer le mot de passe des comptes démo si utilisés en prod

## Données

- [ ] Migrations appliquées (`npx prisma migrate deploy`)
- [ ] Seed exécuté si environnement de démo (`npm run db:seed`)
- [ ] Sauvegardes PostgreSQL configurées (selon l’hébergeur)

## Monitoring

- [ ] Logs d’erreur accessibles
- [ ] Alertes sur erreurs 5xx (si disponible)
