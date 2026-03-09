$env:DATABASE_USER = 'pgsql'
$env:DATABASE_PASSWORD = 'Admin_2026'
$env:REDIS_PASSWORD = 'aiteam123'
$env:RABBITMQ_PASSWORD = 'aiteam123'

Set-Location $PSScriptRoot
java -jar target/backend-1.0.0.jar
