param(
    [string]$PortainerUrl = "https://192.168.1.115:9443",
    [string]$ApiKey = "ptr_C2oVlNW0D7W/9+ZcCnEf6qWRXpe1c+SbGsONasutgCw=",
    [string]$StackName = "archimodeler",
    [string]$ComposeFile = "docker-compose.yml"
)

# Function to execute curl and return content
function Invoke-Curl {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = ""
    )
    
    $CurlArgs = @("-k", "-s", "-H", "X-API-Key: $ApiKey", "-X", $Method, $Url)
    
    if ($Body) {
        $CurlArgs += "-H", "Content-Type: application/json"
        $CurlArgs += "-d", $Body
    }

    $Output = & curl.exe @CurlArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Curl failed with exit code $LASTEXITCODE"
        exit 1
    }
    return $Output
}

Write-Host "Checking Endpoint..."
$EndpointsJson = Invoke-Curl -Url "$PortainerUrl/api/endpoints"
$Endpoints = $EndpointsJson | ConvertFrom-Json
$Endpoint = $Endpoints | Where-Object { $_.Name -like "*local*" } | Select-Object -First 1

if (-not $Endpoint) {
    # Fallback to first endpoint if 'local' not found
    $Endpoint = $Endpoints | Select-Object -First 1
}

if (-not $Endpoint) {
    Write-Error "No endpoints found in Portainer."
    exit 1
}

$EndpointId = $Endpoint.Id
Write-Host "Using Endpoint ID: $EndpointId ($($Endpoint.Name))"

# Read Compose File
$ComposeContent = Get-Content -Path $ComposeFile -Raw

# Check if Stack Exists
Write-Host "Checking for existing stack '$StackName'..."
$StacksJson = Invoke-Curl -Url "$PortainerUrl/api/stacks"
$Stacks = $StacksJson | ConvertFrom-Json
$Stack = $Stacks | Where-Object { $_.Name -eq $StackName }

if ($Stack) {
    Write-Host "Stack '$StackName' exists (ID: $($Stack.Id)). Updating..."
    
    # Portainer requires compact JSON for the body
    $UpdateBody = @{
        stackFileContent = $ComposeContent
        env              = @()
        prune            = $false
        pullImage        = $true
    } | ConvertTo-Json -Depth 10 -Compress

    $Response = Invoke-Curl -Url "$PortainerUrl/api/stacks/$($Stack.Id)?endpointId=$EndpointId" -Method "PUT" -Body $UpdateBody
    Write-Host "Stack updated successfully."
}
else {
    Write-Host "Stack '$StackName' does not exist. Creating..."
    
    $CreateBody = @{
        name             = $StackName
        stackFileContent = $ComposeContent
        env              = @()
        method           = "string"
        type             = 2 # Standalone
    } | ConvertTo-Json -Depth 10 -Compress

    $Response = Invoke-Curl -Url "$PortainerUrl/api/stacks?method=string&type=2&endpointId=$EndpointId" -Method "POST" -Body $CreateBody
    Write-Host "Stack created successfully."
}
