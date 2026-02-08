function Show-Menu {
    Clear-Host
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   Vault Manager Production Setup" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "1. Configure for Local Database (Default)"
    Write-Host "2. Configure for External Database"
    Write-Host "q. Quit"
    Write-Host "========================================" -ForegroundColor Cyan
}

function Get-Input {
    param([string]$Prompt, [string]$DefaultValue)
    $inputVal = Read-Host "$Prompt [$DefaultValue]"
    if ([string]::IsNullOrWhiteSpace($inputVal)) {
        return $DefaultValue
    }
    return $inputVal
}

function Generate-Env-File {
    param($DockerUser, $DbUrl, $SecretKey, $EncKey, $PostgresPass)

    $envContent = @"
# Docker Hub Username
DOCKER_USERNAME=$DockerUser

# Database Configuration
POSTGRES_PASSWORD=$PostgresPass
DATABASE_URL=$DbUrl

# Security
SECRET_KEY=$SecretKey
ENCRYPTION_KEY=$EncKey
"@
    
    Set-Content -Path ".env" -Value $envContent
    Write-Host "`nSuccessfully creating .env file!" -ForegroundColor Green
}

# Main Script
$envFile = ".env"
$exampleEnv = ".env.example"

# Load current .env if exists to use as defaults
$currentConfig = @{}
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^#=]+)=(.*)$") {
            $currentConfig[$matches[1]] = $matches[2]
        }
    }
}

Show-Menu
$choice = Read-Host "Select an option"

if ($choice -eq 'q') { exit }

# Common Configs
$dockerUser = Get-Input "Enter Docker Hub Username" ($currentConfig['DOCKER_USERNAME'] -or "kadir")
$secretKey = Get-Input "Enter Secret Key (random string)" ($currentConfig['SECRET_KEY'] -or "changeme_please_change_this_in_production")
$encKey = Get-Input "Enter Encryption Key (fernet)" ($currentConfig['ENCRYPTION_KEY'] -or "ZE0lriVLEvwGa7iXvR7asxBr2yzf6Kf-5VN1409ywj0=")

if ($choice -eq '2') {
    # External DB
    Write-Host "`n--- External Database Configuration ---" -ForegroundColor Yellow
    $dbUrl = Get-Input "Enter Full Database URL" ($currentConfig['DATABASE_URL'] -or "postgresql://user:password@host:port/dbname")
    $postgresPass = "unused" # Not used for local container
    
    Generate-Env-File $dockerUser $dbUrl $secretKey $encKey $postgresPass
    
    Write-Host "`nsetup complete!" -ForegroundColor Green
    Write-Host "`nTo start the application with EXTERNAL database, run:" -ForegroundColor Cyan
    Write-Host "docker-compose up -d" -ForegroundColor White
}
else {
    # Local DB (Default)
    Write-Host "`n--- Local Database Configuration ---" -ForegroundColor Yellow
    $postgresPass = Get-Input "Enter Postgres Password" ($currentConfig['POSTGRES_PASSWORD'] -or "changeme")
    $dbUrl = "postgresql://vaultmgr:${postgresPass}@postgres:5432/vaultmanager"
    
    Generate-Env-File $dockerUser $dbUrl $secretKey $encKey $postgresPass
    
    Write-Host "`nSetup complete!" -ForegroundColor Green
    Write-Host "`nTo start the application with LOCAL database, run:" -ForegroundColor Cyan
    Write-Host "docker-compose --profile local-db up -d" -ForegroundColor White
}
