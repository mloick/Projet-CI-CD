# Ansible — Déploiement Calorie Tracker API

## Prérequis
```bash
pip install ansible
ansible-galaxy collection install community.docker
```

## Utilisation

### Déploiement standard
```bash
ansible-playbook -i inventory.ini playbook.yml
```

### Déploiement d'un tag spécifique (rollback)
```bash
ansible-playbook -i inventory.ini playbook.yml -e "app_tag=v1.2.0"
```

### Déploiement en staging
```bash
ansible-playbook -i inventory.ini playbook.yml -e "app_env=staging app_tag=staging"
```

## Structure
```
ansible/
├── inventory.ini          # Hôtes cibles
├── playbook.yml           # Point d'entrée
├── vars.yml               # Variables par défaut
└── roles/
    └── app/
        ├── tasks/main.yml          # Tâches de déploiement
        └── templates/docker-compose.j2  # Template Compose
```

## Idempotence
Le playbook est idempotent : le relancer ne cause aucun effet secondaire si l'état cible est déjà atteint.
