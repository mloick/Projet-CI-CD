terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "docker" {}

resource "docker_network" "calorie_network" {
  name = "calorie-network"
}

resource "docker_volume" "calorie_data" {
  name = "calorie-data"
}

resource "docker_container" "calorie_api" {
  name  = "calorie-api"
  image = var.image_name

  networks_advanced {
    name = docker_network.calorie_network.name
  }

  ports {
    internal = 3000
    external = var.app_port
  }

  mounts {
    target = "/app/data"
    source = docker_volume.calorie_data.name
    type   = "volume"
  }

  env = [
    "NODE_ENV=${var.environment}",
    "PORT=3000",
    "DATABASE_PATH=/app/data/calorie-tracker.db",
    "LOG_LEVEL=info"
  ]

  restart = "always"
}
