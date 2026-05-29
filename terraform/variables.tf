variable "app_port" {
  description = "Port externe pour l'API"
  type        = number
  default     = 3000
}

variable "image_name" {
  description = "Nom et tag de l'image Docker"
  type        = string
  default     = "calorie-tracker-api:latest"
}

variable "environment" {
  description = "Environnement de déploiement"
  type        = string
  default     = "development"
}
