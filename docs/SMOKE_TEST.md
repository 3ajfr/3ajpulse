# 3AJPULSE — Checklist smoke-test manuel

À exécuter après `npm run dev` ou sur un déploiement preview/staging.

## Prérequis

- Base PostgreSQL avec migrations appliquées et seed exécuté
- Compte démo : `julien@3ajpulse.fr` / `PulseDemo2026!`

## Liste de vérification

- [ ] **Auth** — Connexion avec identifiants démo
- [ ] **Dashboard** — Page chargée, KPIs visibles, pas d’erreur
- [ ] **Dossiers** — Liste, création, détail, édition
- [ ] **Tâches** — Liste, création, assignation, changement de statut
- [ ] **Jalons** — Liste, création, détail, marquer terminé
- [ ] **Factures** — Liste, création, workflow (émettre, envoyer, en attente)
- [ ] **Paiements** — Liste, enregistrement, imputation sur facture
- [ ] **PDF facture** — Accès `/invoices/[id]/pdf`, rendu correct, impression

## Navigation rapide

1. Se connecter → Dashboard
2. Dossiers → ouvrir un dossier → onglets tâches, jalons, facturation
3. Factures → ouvrir une facture → bouton PDF
4. Paiements → Nouveau règlement → sélectionner dossier/facture → enregistrer
