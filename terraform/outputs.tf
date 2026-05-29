output "container_id" {
  description = "ID du conteneur Docker"
  value       = docker_container.calorie_api.id
}

output "container_ip" {
  description = "Adresse IP du conteneur"
  value       = docker_container.calorie_api.network_data[0].ip_address
}

output "app_url" {
  description = "URL de l'application"
  value       = "http://localhost:${var.app_port}"
}
