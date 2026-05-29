# Calorie Tracker API

![CI Pipeline](https://img.shields.io/github/actions/workflow/status/mloick/Projet-CI-CD/ci.yml?branch=main)
![SonarCloud Quality Gate](https://img.shields.io/sonar/quality_gate/calorie-tracker-api?server=https%3A%2F%2Fsonarcloud.io)
![Coverage](https://img.shields.io/sonar/coverage/calorie-tracker-api?server=https%3A%2F%2Fsonarcloud.io)
![Docker Image Size](https://img.shields.io/docker/image-size/ghcr.io/mloick/Projet-CI-CD/calorie-tracker-api/latest)
![License MIT](https://img.shields.io/badge/license-MIT-blue.svg)

## 1. Description
Calorie Tracker API est une application robuste de suivi nutritionnel conçue pour aider les utilisateurs dans leur rééquilibrage alimentaire. Elle permet de calculer précisément les besoins caloriques (BMR/TDEE) et de suivre quotidiennement la consommation de macronutriments.

## 2. Stack Technique
- **Node.js / TypeScript** : Typage fort pour la maintenabilité et la robustesse.
- **Express** : Framework minimaliste et performant pour les APIs REST.
- **SQLite (better-sqlite3)** : Base de données SQL performante sans serveur, idéale pour la portabilité du projet académique.
- **Singleton, Strategy, Factory, Repository** : Design Patterns assurant la séparation des responsabilités.
- **Prometheus & Grafana** : Monitoring de production temps réel.
- **Docker** : Conteneurisation pour un environnement reproductible.
- **GitHub Actions** : Pipeline CI/CD automatisée.

## 3. Architecture
```text
[ Client (Postman/Web) ]
           |
           v
[ Express Application ]
           |
    -----------------
    | Controllers   | <--- Orchestrent les requêtes
    -----------------
           |
    -----------------
    | Services      | <--- Logique métier (BMR, Plans, Suivi)
    -----------------        (Uses Strategy & Factory)
           |
    -----------------
    | Repositories  | <--- Abstraction des données (Interfaces)
    -----------------
           |
    -----------------
    | SQLite / RAM  | <--- Stockage persistant ou temporaire
    -----------------
```

## 4. Pipeline CI/CD
```text
PUSH/PR
  |
  |-- Lint & Format check (Parallel)
  |-- Security Scan (npm audit) (Parallel)
  |-- Unit Tests (Coverage report) (Parallel)
  |-- Integration Tests (Parallel)
  |      |
  |      v
  |-- SonarCloud Analysis (Depends on Tests)
  |      |
  |      v
  |-- Build Application (dist/) (Depends on Lint & Tests)
  |      |
  |      v
  |-- Docker Build & Push (Depends on Build)
  |      |
  |      v
  |-- Trivy Security Scan (Docker Image)
```

## 5. Installation et Lancement

### Prérequis
- Docker & Docker Compose
- Node.js 20+ (pour développement local)

### Via Docker Compose (Recommandé)
```bash
docker-compose up --build
```
L'API est accessible sur `http://localhost:3000`.

### Via npm (Développement)
```bash
npm install
npm run dev
```

## 6. Tests et Couverture
```bash
npm test              # Lancer tous les tests
npm run test:coverage # Générer le rapport lcov
```

## 7. Design Patterns
- **Strategy** : Utilisé pour les calculs de BMR. Permet de changer la formule (Mifflin-St Jeor ou Harris-Benedict) dynamiquement sans modifier le service. Facilite le test des formules isolées.
- **Factory** : `NutritionPlanFactory` génère les plans nutritionnels selon l'objectif. Encapsule la complexité de création et de validation.
- **Repository** : Isole la logique d'accès aux données. Permet de switcher entre `InMemory` (tests) et `SQLite` (prod) en changeant une ligne.
- **Singleton** : Garantit une instance unique du Logger Winston et de la connexion SQLite pour éviter les fuites de ressources.

## 8. Variables d'environnement
| Variable | Description | Défaut |
|----------|-------------|---------|
| PORT | Port de l'API | 3000 |
| DATABASE_PATH | Chemin base SQLite | ./data/calorie-tracker.db |
| LOG_LEVEL | Niveau de log | info|

## 9. Routes API
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/users | Créer un profil |
| GET | /api/users/:id| Lire un profil |
| GET | /api/nutrition/plan/:userId | Générer un plan complet|
| POST | /api/journal | Logger un repas |
| GET | /api/journal/:userId/today | Résumé du jour |
| GET | /health | État de santé de l'API |

## 10. Stratégie de Rollback
1. Identifier le tag de la version stable précédente dans GHCR (ex: `v1.2.0`).
2. Mettre à jour l'image dans le déploiement ou docker-compose : `ghcr.io/mloick/calorie-api:v1.2.0`.
3. Relancer les conteneurs : `docker-compose up -d`.

## 11. Monitoring
- **Prometheus** : `http://localhost:9090`
- **Grafana** : `http://localhost:3001` (admin/admin)
- **Métriques** : access via `http://localhost:3000/metrics`

## 12. Éléments non réalisés
Le déploiement Cloud (AWS/GCP) n'a pas été réalisé pour limiter les coûts académiques. Le choix se porterait sur **AWS ECS Fargate** pour la facilité de gestion des conteneurs. Coût estimé : ~15$/mois.

## 13. Auteur
Senior TypeScript Developer - Projet CI/CD Académique
