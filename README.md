# Calorie Tracker API

![CI Pipeline](https://img.shields.io/github/actions/workflow/status/mloick/Projet-CI-CD/ci.yml?branch=main&label=CI)
![Coverage](https://img.shields.io/badge/coverage-97%25-brightgreen)
![Docker](https://img.shields.io/badge/docker-ghcr.io-blue)
![Node](https://img.shields.io/badge/node-20--alpine-green)
![License MIT](https://img.shields.io/badge/license-MIT-blue.svg)

API REST de suivi nutritionnel développée en TypeScript, avec un pipeline CI/CD complet, une architecture basée sur des Design Patterns, et une stack de monitoring Prometheus/Grafana.

---

## Table des matières
1. [Description](#1-description)
2. [Stack technique & justifications](#2-stack-technique--justifications)
3. [Architecture](#3-architecture)
4. [Design Patterns](#4-design-patterns)
5. [Pipeline CI/CD](#5-pipeline-cicd)
6. [Installation & Lancement](#6-installation--lancement)
7. [Tests et Couverture](#7-tests-et-couverture)
8. [Infrastructure as Code](#8-infrastructure-as-code)
9. [Monitoring](#9-monitoring)
10. [Qualité de code](#10-qualité-de-code)
11. [Variables d'environnement](#11-variables-denvironnement)
12. [Routes API](#12-routes-api)
13. [Stratégie de Rollback](#13-stratégie-de-rollback)
14. [Éléments non réalisés et justifications](#14-éléments-non-réalisés-et-justifications)

---

## 1. Description

Calorie Tracker API permet de :
- Calculer les besoins caloriques (BMR/TDEE) via des formules interchangeables (Mifflin-St Jeor, Harris-Benedict)
- Générer des plans nutritionnels personnalisés (perte de poids, maintien, prise de masse)
- Suivre quotidiennement la consommation de macronutriments et le poids

L'application est suffisamment complexe pour justifier une architecture complète (4 design patterns, repositories, middlewares, monitoring) tout en restant autonome (SQLite embarquée).

---

## 2. Stack technique & justifications

| Technologie | Rôle | Justification |
|---|---|---|
| **TypeScript** | Langage | Typage fort → meilleure détection d'erreurs à la compilation, interfaces pour les patterns Repository et Strategy |
| **Express** | Framework HTTP | Léger, écosystème mature, middleware-first (Chain of Responsibility natif) |
| **SQLite / better-sqlite3** | Base de données | Sans serveur, portable, synchrone — idéal pour un projet académique sans infrastructure cloud |
| **Winston** | Logging structuré | Format JSON configurable, niveaux standardisés (debug/info/warn/error), pas de `console.log` |
| **prom-client** | Métriques | Exposition native au format Prometheus (Counter, Histogram, Gauge) |
| **Jest** | Tests | Support TypeScript natif, couverture intégrée, mocking simple |
| **ESLint + Prettier** | Qualité | Lint (erreurs logiques) + format (style) séparés, deux responsabilités distinctes |
| **Husky + lint-staged** | Pre-commit | Empêche les commits non conformes sans bloquer le dev (seuls les fichiers stagés sont vérifiés) |

---

## 3. Architecture

```
src/
├── controllers/     # Couche HTTP — reçoit les requêtes, délègue aux services
├── services/        # Logique métier — BMR, plans, journal, poids
│   └── strategies/  # Algorithmes BMR interchangeables (Strategy Pattern)
├── repositories/    # Abstraction données — interfaces + implémentations
│   └── interfaces/  # IUserRepository, IJournalRepository, IWeightRepository
├── models/          # Types métier (UserProfile, MealEntry, WeightEntry, NutritionPlan)
├── middlewares/     # errorHandler, validateRequest, metricsMiddleware
├── routes/          # Définition des endpoints Express
└── config/          # DatabaseConnection (Singleton), Logger (Singleton)
```

```text
[ Client HTTP ]
      │
      ▼
[ Express App ]
      │
      ├── metricsMiddleware (Prometheus)
      ├── validateRequest (Zod/joi validation)
      │
      ▼
[ Controllers ] ──── orchestrent les requêtes HTTP
      │
      ▼
[ Services ] ──────── logique métier pure (testable unitairement)
      │         └── Strategy (calcul BMR)
      │         └── Factory (génération plans)
      │
      ▼
[ Repositories ] ─── abstraction données (interfaces)
      │         └── SQLiteUserRepository (prod)
      │         └── InMemoryUserRepository (tests)
      │
      ▼
[ SQLite / InMemory ]
```

---

## 4. Design Patterns

### Strategy — `src/services/strategies/`
**Problème résolu** : les formules de calcul du BMR (Harris-Benedict, Mifflin-St Jeor) ont des algorithmes différents mais la même interface. Sans Strategy, `CalorieCalculatorService` aurait un `switch/case` fragile, impossible à étendre sans modifier la classe.

**Implémentation** :
```typescript
// Interface commune
interface IBmrStrategy { calculate(profile: UserProfile): number }

// Deux implémentations indépendantes
class MifflinStJeorStrategy implements IBmrStrategy { ... }
class HarrisBenedictStrategy implements IBmrStrategy { ... }

// Le service reçoit la stratégie en injection
class CalorieCalculatorService {
  constructor(private strategy: IBmrStrategy) {}
}
```
**Facilite les tests** : chaque stratégie est testée isolément sans dépendances. Changer de formule = changer une ligne.

---

### Factory — `src/services/NutritionPlanFactory.ts`
**Problème résolu** : créer un `NutritionPlan` implique des calculs complexes selon l'objectif (perte/maintien/prise de masse). Sans Factory, cette logique serait éparpillée dans les controllers.

**Implémentation** :
```typescript
class NutritionPlanFactory {
  static create(profile: UserProfile, goal: Goal): NutritionPlan { ... }
}
```
**Facilite les tests** : on peut créer un `FakeNutritionPlanFactory` pour les tests d'intégration sans dépendre des calculs réels.

---

### Repository — `src/repositories/`
**Problème résolu** : les services ne doivent pas savoir si les données viennent de SQLite, d'une API ou d'un cache. Sans Repository, changer de base de données = réécrire tous les services.

**Implémentation** :
```typescript
interface IUserRepository {
  findById(id: string): UserProfile | null
  create(profile: UserProfile): UserProfile
}

// Production
class SQLiteUserRepository implements IUserRepository { ... }

// Tests (rapide, sans fichier disque)
class InMemoryUserRepository implements IUserRepository { ... }
```
**Facilite les tests** : les tests d'intégration utilisent `InMemoryUserRepository`, évitant les problèmes de fichiers temporaires et de transactions SQLite.

---

### Singleton — `src/config/database.ts` & `src/config/logger.ts`
**Problème résolu** : ouvrir plusieurs connexions SQLite ou créer plusieurs loggers Winston consomme des ressources et peut créer des conflits d'écriture.

**Implémentation** :
```typescript
class DatabaseConnection {
  private static instance: Database
  static getInstance(): Database {
    if (!this.instance) this.instance = new Database(path)
    return this.instance
  }
}
```
**Facilite les tests** : l'instance peut être réinitialisée entre les tests pour garantir l'isolation.

---

## 5. Pipeline CI/CD

### CI — déclenchée sur push et PR
```
PUSH / PR
  │
  ├─────────────────────────────────────────────────────── [Parallèle]
  │  ┌──────────────────┐  ┌──────────────┐  ┌────────────────────┐
  │  │ Lint & Format    │  │ Unit Tests   │  │ Integration Tests  │
  │  │ (ESLint+Prettier)│  │ + Coverage   │  │ (routes + BDD)     │
  │  └──────────────────┘  └──────────────┘  └────────────────────┘
  │  ┌──────────────────┐  ┌──────────────┐
  │  │ Test Coverage    │  │ Security Scan│
  │  │ (seuil ≥ 70%)   │  │ (npm audit)  │
  │  └──────────────────┘  └──────────────┘
  │                               │
  │  ┌──────────────────┐         │ [needs: test-coverage]
  │  │ SonarCloud       │◄────────┘
  │  │ (continue-on-err)│
  │  └──────────────────┘
  │                               │ [needs: lint, tests, coverage]
  │  ┌──────────────────┐         │
  │  │ Build app (dist/)│◄────────┘
  │  └──────────────────┘
  │                               │ [needs: build]
  │  ┌──────────────────┐         │
  │  │ Docker Build     │◄────────┘
  │  │ & Push (GHCR)    │
  │  └──────────────────┘
  │                               │ [needs: docker-build]
  │  ┌──────────────────┐         │
  │  │ Trivy Scan       │◄────────┘
  │  │ (SARIF → GitHub) │
  │  └──────────────────┘
```

### CD — déclenchée après CI verte sur main
| Environnement | Déclencheur | Action |
|---|---|---|
| **Staging** | CI verte sur `main` (automatique) | Retag image `sha` → `:staging`, push GHCR |
| **Production** | Tag `v*` ou `workflow_dispatch` (manuel) | Retag image → `:latest` + `:<tag>`, push GHCR |

---

## 6. Installation & Lancement

### Via Docker Compose (stack complète + monitoring)
```bash
docker-compose up --build
```
| Service | URL |
|---|---|
| API | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin/admin) |

### Via npm (développement)
```bash
npm install
npm run dev
```

---

## 7. Tests et Couverture

```bash
npm test              # Tous les tests
npm run test:coverage # Rapport de couverture (lcov + texte)
npm test -- --testPathPattern=unit        # Tests unitaires uniquement
npm test -- --testPathPattern=integration # Tests d'intégration uniquement
```

**Couverture actuelle : 97%** (seuil bloquant dans la CI : 70%)

| Type | Fichiers | Ce qui est testé |
|---|---|---|
| **Unitaires** | `tests/unit/` (9 fichiers) | Services, strategies, factory, middlewares, repositories InMemory |
| **Intégration** | `tests/integration/` (5 fichiers) | Routes HTTP complètes + base SQLite en mémoire |

Pas de tests E2E : l'application est une API pure sans interface web. Les tests d'intégration testent les scenarios critiques (404, 400, 409, happy path) end-to-end au niveau HTTP.

---

## 8. Infrastructure as Code

### Terraform — `terraform/`
Provisionne l'infrastructure Docker locale (réseau, volume, container).

```bash
terraform init
terraform plan    # Preview des changements
terraform apply   # Déploiement
```

Utilise le provider `kreuzwerker/docker` pour démontrer l'approche IaC sans coût cloud. En production, les mêmes patterns s'appliquent avec les providers AWS/GCP (ECS, VPC, RDS).

### Ansible — `ansible/`
Configure et déploie l'application sur l'infrastructure provisionnée.

```bash
# Déploiement
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml

# Rollback vers une version précédente
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml -e "app_tag=v1.2.0"
```

**Complémentarité Terraform/Ansible** : Terraform crée les ressources (réseau, volume, container), Ansible configure et déploie l'application. Les deux sont idempotents.

---

## 9. Monitoring

### Stack : Prometheus + Grafana (auto-provisionnée)
Le dashboard Grafana se charge automatiquement au démarrage sans import manuel (provisioning via `monitoring/grafana/provisioning/`).

**Métriques exposées** (`GET /metrics`) :
| Métrique | Type | Description |
|---|---|---|
| `http_requests_total` | Counter | Requêtes totales par méthode/route/status |
| `http_request_duration_seconds` | Histogram | Temps de réponse (percentiles p50, p90, p99) |
| `http_requests_in_flight` | Gauge | Requêtes en cours de traitement |
| `app_errors_total` | Counter | Erreurs par type (internal, not_found, validation) |

**Dashboard Grafana** (5 panneaux) :
- Requêtes par seconde (timeseries)
- Temps de réponse moyen en ms (stat)
- Taux d'erreur 5xx en % (stat)
- Requêtes en cours (gauge)
- Requêtes par route et méthode (table)

**Alertes configurées** (`monitoring/grafana/provisioning/alerting/alerts.yaml`) :
- `AppDown` : instance hors service depuis > 1 minute → sévérité critical
- `HighErrorRate` : taux d'erreur 5xx > 5% sur 2 minutes → sévérité warning

### Health Check
```
GET /health
{
  "status": "OK",
  "uptime": 12345,
  "version": "1.0.0",
  "database": "connected",
  "timestamp": "2026-05-31T20:00:00.000Z"
}
```

---

## 10. Qualité de code

| Outil | Rôle | Déclenchement |
|---|---|---|
| **ESLint** | Détection erreurs logiques et patterns dangereux | Pre-commit (Husky) + CI |
| **Prettier** | Formatage uniforme | Pre-commit (Husky) + CI |
| **Husky + lint-staged** | Hook pre-commit (lint + format automatique) | Chaque `git commit` |
| **SonarCloud** | Analyse statique approfondie (bugs, code smells, duplication) | CI (après tests) |
| **npm audit** | Vulnérabilités dans les dépendances npm | CI |
| **Trivy** | Vulnérabilités dans l'image Docker | CI (après docker build) |
| **Dependabot** | Mises à jour automatiques (npm, Actions, Docker) | Hebdomadaire |

---

## 11. Variables d'environnement

| Variable | Description | Défaut |
|---|---|---|
| `PORT` | Port de l'API | `3000` |
| `NODE_ENV` | Environnement d'exécution | `development` |
| `DATABASE_PATH` | Chemin base SQLite | `./data/calorie-tracker.db` |
| `LOG_LEVEL` | Niveau de log Winston | `info` |
| `APP_VERSION` | Version affichée dans `/health` | `1.0.0` |

Voir `.env.example` pour un template complet.

---

## 12. Routes API

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/health` | État de l'API et de la BDD |
| `GET` | `/metrics` | Métriques Prometheus |
| `POST` | `/api/users` | Créer un profil utilisateur |
| `GET` | `/api/users/:id` | Lire un profil |
| `GET` | `/api/nutrition/plan/:userId` | Générer un plan nutritionnel |
| `GET` | `/api/nutrition/calculate/:userId` | Calculer le BMR/TDEE |
| `POST` | `/api/journal` | Enregistrer un repas |
| `GET` | `/api/journal/:userId/today` | Résumé calorique du jour |
| `POST` | `/api/weight` | Enregistrer le poids |
| `GET` | `/api/weight/:userId` | Historique du poids |

---

## 13. Stratégie de Rollback

### Via Docker Compose
```bash
# 1. Identifier le SHA de l'image stable dans GHCR
# 2. Modifier docker-compose.yml : image: ghcr.io/mloick/projet-ci-cd:<sha-ou-tag>
# 3. Relancer
docker-compose up -d
```

### Via Ansible (rollback automatisé)
```bash
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml \
  -e "app_tag=v1.2.0"
```

### Via Git (revert de commit)
```bash
git revert <sha-du-commit-problematique>
git push origin main
# → Le pipeline CI/CD redéploie automatiquement l'image précédente
```

---

## 14. Éléments non réalisés et justifications

### Déploiement cloud réel
**Ce qui était demandé** : déploiement sur un cloud provider (AWS, GCP, Azure).

**Pourquoi non réalisé** : coût financier non justifié dans un contexte académique. Un compte AWS free tier peut être épuisé rapidement avec ECS Fargate + RDS.

**Ce qui aurait été mis en place** :
- **AWS ECS Fargate** : service managé pour les containers, sans gestion de serveurs
- **ECR** ou GHCR pour le registre d'images
- **AWS Secrets Manager** pour les secrets applicatifs
- **CloudWatch** pour les logs et métriques (ou Grafana Cloud)
- Terraform modifié pour cibler le provider `hashicorp/aws`

**Workaround** : Terraform avec provider Docker local démontre la maîtrise de l'IaC sans coût. La configuration serait transposable à AWS avec un changement de provider.

### Tests E2E
**Ce qui était demandé** : tests Cypress ou Playwright.

**Pourquoi non applicable** : l'application est une API REST pure, sans interface web. Cypress/Playwright ne seraient pas adaptés.

**Compensation** : 5 fichiers de tests d'intégration testent les scenarios HTTP complets (happy path + cas d'erreur) avec une vraie base SQLite en mémoire.
