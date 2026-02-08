$DOCKER_USERNAME = Read-Host "Enter your Docker Hub username"

if (-not $DOCKER_USERNAME) {
    Write-Error "Username is required."
    exit 1
}

Write-Host "Building Backend Image..."
docker build -t "$DOCKER_USERNAME/vault-backend:latest" ../backend

Write-Host "Building Frontend Image..."
docker build -t "$DOCKER_USERNAME/vault-frontend:latest" ../frontend

Write-Host "Pushing Backend Image..."
docker push "$DOCKER_USERNAME/vault-backend:latest"

Write-Host "Pushing Frontend Image..."
docker push "$DOCKER_USERNAME/vault-frontend:latest"

Write-Host "Done! You can now run the app on any machine using docker-compose.prod.yml"
Write-Host "Set DOCKER_USERNAME=$DOCKER_USERNAME in your environment before running docker-compose up."
