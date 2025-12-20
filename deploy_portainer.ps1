param(
    [string]$PortainerUrl = "https://192.168.1.115:9443",
    [string]$ApiKey = "ptr_C2oVlNW0D7W/9+ZcCnEf6qWRXpe1c+SbGsONasutgCw=",
    [string]$StackName = "archimodeler",
    [string]$RepoUrl = "https://github.com/gloret29/archibanque",
    [string]$RepoUser = "",
    [string]$RepoPassword = ""
)

# Function to execute curl and return content
function Invoke-Curl {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [string]$BodyFile = ""
    )
    
    $CurlArgs = @("-k", "-s", "-H", "X-API-Key: $ApiKey", "-X", $Method, $Url)
    
    if ($BodyFile) {
        $CurlArgs += "-H", "Content-Type: application/json"
        $CurlArgs += "--data-binary", "`@$BodyFile"
    }

    $Output = & curl.exe @CurlArgs 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Curl failed with exit code $LASTEXITCODE. Output: $Output"
        exit 1
    }
    return $Output
}

Write-Host "Checking Endpoint..."
$EndpointsJson = Invoke-Curl -Url "$PortainerUrl/api/endpoints"
$Endpoints = $EndpointsJson | ConvertFrom-Json
$Endpoint = $Endpoints | Where-Object { $_.Name -like "*local*" } | Select-Object -First 1

if (-not $Endpoint) {
    $Endpoint = $Endpoints | Select-Object -First 1
}

if (-not $Endpoint) {
    Write-Error "No endpoints found in Portainer."
    exit 1
}

$EndpointId = $Endpoint.Id
Write-Host "Using Endpoint ID: $EndpointId ($($Endpoint.Name))"

# Check if Stack Exists
Write-Host "Checking for existing stack '$StackName'..."
$StacksJson = Invoke-Curl -Url "$PortainerUrl/api/stacks"
$Stacks = $StacksJson | ConvertFrom-Json
$Stack = $Stacks | Where-Object { $_.Name -eq $StackName }

if ($Stack) {
    Write-Host "Stack '$StackName' exists (ID: $($Stack.Id)). Updating from Git..."
    
    $UseAuth = !([string]::IsNullOrEmpty($RepoUser))
    
    $UpdateBody = @{
        repositoryReferenceName  = "refs/heads/main"
        repositoryAuthentication = $UseAuth
        repositoryUsername       = if ($UseAuth) { $RepoUser } else { $null }
        repositoryPassword       = if ($UseAuth) { $RepoPassword } else { $null }
        prune                    = $false
        pullImage                = $true
    }
    
    $TempFile = [System.IO.Path]::GetTempFileName()
    $JsonContent = $UpdateBody | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($TempFile, $JsonContent)

    $Response = Invoke-Curl -Url "$PortainerUrl/api/stacks/$($Stack.Id)/git/redeploy?endpointId=$EndpointId" -Method "PUT" -BodyFile $TempFile
    Remove-Item $TempFile
    Write-Host "API Response: $Response"
    Write-Host "Stack redeploy triggered successfully."
}
else {
    Write-Host "Stack '$StackName' does not exist. Creating from Git..."
    
    $UseAuth = !([string]::IsNullOrEmpty($RepoUser))

    $CreateBody = @{
        name                     = $StackName
        repositoryURL            = $RepoUrl
        repositoryReferenceName  = "refs/heads/main"
        composeFile              = "docker-compose.yml"
        repositoryAuthentication = $UseAuth
        repositoryUsername       = if ($UseAuth) { $RepoUser } else { $null }
        repositoryPassword       = if ($UseAuth) { $RepoPassword } else { $null }
    }
    
    $TempFile = [System.IO.Path]::GetTempFileName()
    $JsonContent = $CreateBody | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($TempFile, $JsonContent)

    $Response = Invoke-Curl -Url "$PortainerUrl/api/stacks/create/standalone/repository?endpointId=$EndpointId" -Method "POST" -BodyFile $TempFile
    Remove-Item $TempFile
    Write-Host "API Response: $Response"
    Write-Host "Stack created successfully from Git."
}
