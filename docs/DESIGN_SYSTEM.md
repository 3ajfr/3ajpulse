# 3AJPULSE — Design System

## 1. Design Principles

- **Premium, elegant, restrained** — No visual noise. Every element earns its place.
- **Apple / Linear / high-end SaaS feel** — Soft light theme, refined typography, subtle depth.
- **Beautiful cards** — Rounded corners, thin borders, gentle shadows.
- **Calm but luxurious UI** — Zero cheap admin-template feeling.
- **Dense but breathable** — Information-rich layouts with generous whitespace.

## 2. Color System

| Token | Value | Usage |
|-------|-------|-------|
| `--surface` | `#fafafa` | Page background |
| `--surface-elevated` | `#ffffff` | Cards, sidebar, modals |
| `--surface-overlay` | `rgba(255,255,255,0.9)` | Overlays |
| `--border` | `rgba(0,0,0,0.08)` | Primary borders |
| `--border-subtle` | `rgba(0,0,0,0.05)` | Subtle dividers |
| `--text` | `#0f0f0f` | Primary text |
| `--text-muted` | `#525252` | Secondary text |
| `--text-faint` | `#a3a3a3` | Tertiary, labels |
| `--accent` | `#2563eb` | Primary actions, links |
| `--accent-muted` | `#3b82f6` | Hover states |
| `--success` | `#16a34a` | Success, active |
| `--warning` | `#ca8a04` | Warnings |
| `--error` | `#dc2626` | Errors |
| `--info` | `#0284c7` | Info, sent |

## 3. Typography Scale

- **Font stack**: Geist Sans (primary), Geist Mono (code)
- **Page title**: `text-xl font-semibold tracking-tight`
- **Section title**: `text-base font-semibold`
- **Card label**: `text-xs font-medium uppercase tracking-wider`
- **KPI value**: `text-2xl font-semibold tracking-tight`
- **Body**: `text-sm` (default)
- **Caption**: `text-xs text-[var(--text-muted)]`

## 4. Spacing / Radius / Shadow Tokens

### Spacing
- `--spacing-page`: 1.5rem
- `--spacing-section`: 1.25rem
- `--spacing-card`: 1rem
- `--spacing-tight`: 0.5rem

### Radius
- `--radius-sm`: 6px
- `--radius-md`: 8px
- `--radius-lg`: 12px
- `--radius-xl`: 16px
- `--radius-card`: 12px

### Shadows
- `--shadow-subtle`: `0 1px 2px rgba(0,0,0,0.04)`
- `--shadow-card`: `0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)`
- `--shadow-elevated`: `0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)`

## 5. Base Component Inventory

| Component | Path | Purpose |
|-----------|------|---------|
| SectionHeader | `@/components/ui/section-header` | Page title + description + action |
| KpiCard | `@/components/ui/kpi-card` | Metric display with label, value, subtext |
| Badge | `@/components/ui/badge` | Status pills (success, warning, error, etc.) |
| Button | `@/components/ui/button` | Primary, secondary, ghost, outline |
| ButtonLink | `@/components/ui/button` | Link styled as button |
| TableWrapper | `@/components/ui/table-wrapper` | Styled table container + cells |
| EmptyState | `@/components/ui/empty-state` | Empty list placeholder |
| PageContainer | `@/components/layout/page-container` | Max-width page wrapper |
| Sidebar | `@/components/layout/sidebar` | Main navigation |
| Topbar | `@/components/layout/topbar` | Optional top bar |
| AppShell | `@/components/layout/app-shell` | Layout wrapper |
| DossierNav | `@/components/layout/dossier-nav` | Dossier-level tabs |

## 6. App Shell Layout

- **Sidebar** (240px): Logo + nav items (Dashboard, Dossiers, Temps, Factures, Paiements, Paramètres)
- **Main**: Scrollable content area
- **PageContainer**: Max 1400px, horizontal padding 24–32px

## 7. Main Navigation

- Tableau de bord → `/dashboard`
- Dossiers → `/dossiers`
- Temps → `/time`
- Factures → `/invoices`
- Paiements → `/payments`
- Paramètres → `/settings`

## 8. Dossier-Level Navigation

Tabs on dossier detail: Vue d'ensemble | Tâches | Jalons | Temps | Factures

## 9. Text Mockups of Important Screens

### Dashboard
- Section header: "Tableau de bord" + "Vue d'ensemble de l'activité"
- 5 KPI cards: Dossiers actifs, Taux de conversion, Heures ce mois, Encaissements, Échéances à risque
- Activity feed placeholder

### Dossiers List
- Section header + "Nouveau dossier" button
- Table: Référence | Titre | Client | Statut | Phase | Prochain jalon

### Dossier Detail
- Breadcrumb: Dossiers / DOS-2024-001
- Title + client + status badges
- 3 KPI cards: Tâches, Jalons, Honoraires
- Overview placeholder

### Invoices List
- Section header + "Nouvelle facture" button
- Table: N° Facture | Dossier | Montant | Statut | Échéance

### Settings
- Section header
- Empty state: "Paramètres à venir"
