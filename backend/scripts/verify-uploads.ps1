[CmdletBinding()]
param(
    [string]$BaseUrl = "http://localhost:3000/api/v1",
    [Parameter(Mandatory = $true)]
    [string]$Email,
    [string]$Password
)

$ErrorActionPreference = "Stop"
$script:Checks = New-Object System.Collections.Generic.List[object]
$script:DeletedPublicIds = @{}
$script:Assets = @{}
$script:Token = $null
$script:SensitiveValues = New-Object System.Collections.Generic.List[string]
$script:TempDirectory = Join-Path ([System.IO.Path]::GetTempPath()) ([guid]::NewGuid().ToString("N"))
$plainPassword = $null
$securePassword = $null
$passwordPointer = [IntPtr]::Zero

function Add-Check {
    param(
        [string]$Name,
        [string]$Expected,
        [string]$Actual,
        [bool]$Passed
    )

    $result = "FAIL"
    if ($Passed) {
        $result = "PASS"
    }

    [void]$script:Checks.Add([PSCustomObject]@{
        Check = $Name
        Expected = $Expected
        Actual = $Actual
        Result = $result
    })
}

function New-TempFilePath {
    $path = Join-Path $script:TempDirectory ([guid]::NewGuid().ToString("N"))
    return $path
}

function Write-JsonTempFile {
    param([object]$Value)

    $path = New-TempFilePath
    $json = ConvertTo-Json -InputObject $Value -Depth 10 -Compress
    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($path, $json, $encoding)
    return $path
}

function Get-ResponseErrorMessage {
    param([object]$Json)

    if ($null -eq $Json -or $null -eq $Json.message) {
        return ""
    }
    if ($Json.message -is [string]) {
        return $Json.message
    }
    if ($Json.message -is [array]) {
        return [string]::Join("; ", [string[]]$Json.message)
    }
    return [string]$Json.message
}

function Protect-Output {
    param([string]$Value)

    foreach ($sensitiveValue in $script:SensitiveValues) {
        if (-not [string]::IsNullOrEmpty($sensitiveValue)) {
            $Value = $Value.Replace($sensitiveValue, "[REDACTED]")
        }
    }
    return $Value
}

function Get-ResponseDescription {
    param([object]$Response)

    $description = "HTTP $($Response.StatusCode)"
    if (-not [string]::IsNullOrWhiteSpace($Response.ErrorMessage)) {
        $description = "$description - $($Response.ErrorMessage)"
    }
    elseif (-not [string]::IsNullOrWhiteSpace($Response.Body) -and $Response.StatusCode -ge 400) {
        $description = "$description - $($Response.Body)"
    }
    if (-not [string]::IsNullOrWhiteSpace($Response.CurlError)) {
        $description = $Response.CurlError
    }
    return Protect-Output -Value $description
}

function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [string]$BearerToken,
        [string]$JsonPath,
        [string]$UploadPath,
        [string]$MimeType,
        [switch]$Range
    )

    $responsePath = New-TempFilePath
    $stderrPath = New-TempFilePath
    $curlArguments = @(
        "--silent",
        "--show-error",
        "--request", $Method,
        "--output", $responsePath,
        "--write-out", "%{http_code}",
        "--stderr", $stderrPath
    )

    if (-not [string]::IsNullOrWhiteSpace($BearerToken)) {
        $curlArguments += @("--header", "Authorization: Bearer $BearerToken")
    }
    if (-not [string]::IsNullOrWhiteSpace($JsonPath)) {
        $curlArguments += @(
            "--header", "Content-Type: application/json",
            "--data-binary", "@$JsonPath"
        )
    }
    if (-not [string]::IsNullOrWhiteSpace($UploadPath)) {
        $curlArguments += @("--form", "file=@$UploadPath;type=$MimeType")
    }
    if ($Range) {
        $curlArguments += @("--header", "Range: bytes=0-99")
    }
    $curlArguments += @($Uri)

    $curlOutput = @(& curl.exe @curlArguments)
    $curlExitCode = $LASTEXITCODE
    $curlError = ""
    if ($curlExitCode -ne 0) {
        if (Test-Path -LiteralPath $stderrPath) {
            $curlError = [System.IO.File]::ReadAllText($stderrPath).Trim()
        }
        if ([string]::IsNullOrWhiteSpace($curlError)) {
            $curlError = "curl.exe exited with code $curlExitCode"
        }
    }

    $statusText = [string]::Join("", [string[]]$curlOutput).Trim()
    $statusCode = 0
    if ($statusText -match '^\d{3}$') {
        $statusCode = [int]$statusText
    }

    $body = ""
    if (Test-Path -LiteralPath $responsePath) {
        $body = [System.IO.File]::ReadAllText($responsePath)
    }
    $json = $null
    if (-not [string]::IsNullOrWhiteSpace($body)) {
        try {
            $json = ConvertFrom-Json -InputObject $body
        }
        catch {
            $json = $null
        }
    }

    return [PSCustomObject]@{
        StatusCode = $statusCode
        Body = $body
        Json = $json
        ErrorMessage = Get-ResponseErrorMessage -Json $json
        CurlError = $curlError
    }
}

function Add-StatusCheck {
    param(
        [string]$Name,
        [int]$ExpectedStatus,
        [object]$Response,
        [string]$ExpectedErrorCode
    )

    $passed = $Response.StatusCode -eq $ExpectedStatus
    $actual = Get-ResponseDescription -Response $Response
    $expected = [string]$ExpectedStatus
    if (-not [string]::IsNullOrWhiteSpace($ExpectedErrorCode)) {
        $expected = "$ExpectedStatus $ExpectedErrorCode"
        $passed = $passed -and $Response.ErrorMessage -eq $ExpectedErrorCode
    }
    Add-Check -Name $Name -Expected $expected -Actual $actual -Passed $passed
}

function Invoke-Upload {
    param(
        [string]$Endpoint,
        [string]$Path,
        [string]$MimeType,
        [string]$BearerToken
    )

    return Invoke-ApiRequest `
        -Method "POST" `
        -Uri "$($script:BaseUri)/admin/uploads/$Endpoint" `
        -BearerToken $BearerToken `
        -UploadPath $Path `
        -MimeType $MimeType
}

function Invoke-DeleteAsset {
    param(
        [string]$PublicId,
        [string]$Kind,
        [string]$BearerToken
    )

    $jsonPath = Write-JsonTempFile @{ publicId = $PublicId; kind = $Kind }
    return Invoke-ApiRequest `
        -Method "DELETE" `
        -Uri "$($script:BaseUri)/admin/uploads" `
        -BearerToken $BearerToken `
        -JsonPath $jsonPath
}

try {
    New-Item -ItemType Directory -Path $script:TempDirectory | Out-Null
    $script:BaseUri = $BaseUrl.TrimEnd("/")

    if ([string]::IsNullOrEmpty($Password)) {
        $securePassword = Read-Host "Password" -AsSecureString
        $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    }
    else {
        $plainPassword = $Password
    }
    [void]$script:SensitiveValues.Add($plainPassword)

    $pngPath = Join-Path $script:TempDirectory "valid.png"
    $wavPath = Join-Path $script:TempDirectory "valid.wav"
    $svgPath = Join-Path $script:TempDirectory "renamed-svg.png"
    $textAudioPath = Join-Path $script:TempDirectory "renamed-text.mp3"
    $largeImagePath = Join-Path $script:TempDirectory "large.png"
    $pngAudioPath = Join-Path $script:TempDirectory "png-as-audio.png"

    $pngBytes = [Convert]::FromBase64String(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC"
    )
    [System.IO.File]::WriteAllBytes($pngPath, $pngBytes)
    [System.IO.File]::WriteAllBytes($pngAudioPath, $pngBytes)
    [System.IO.File]::WriteAllText(
        $svgPath,
        '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
        [System.Text.Encoding]::ASCII
    )
    [System.IO.File]::WriteAllText(
        $textAudioPath,
        "not an audio file",
        [System.Text.Encoding]::ASCII
    )
    $largeBytes = New-Object byte[] 6291456
    [System.IO.File]::WriteAllBytes($largeImagePath, $largeBytes)

    $waveSampleBytes = New-Object byte[] 8000
    for ($index = 0; $index -lt $waveSampleBytes.Length; $index++) {
        $waveSampleBytes[$index] = 128
    }
    $waveStream = [System.IO.File]::Create($wavPath)
    $waveWriter = New-Object System.IO.BinaryWriter($waveStream)
    try {
        $waveWriter.Write([System.Text.Encoding]::ASCII.GetBytes("RIFF"))
        $waveWriter.Write([int]($waveSampleBytes.Length + 36))
        $waveWriter.Write([System.Text.Encoding]::ASCII.GetBytes("WAVE"))
        $waveWriter.Write([System.Text.Encoding]::ASCII.GetBytes("fmt "))
        $waveWriter.Write([int]16)
        $waveWriter.Write([int16]1)
        $waveWriter.Write([int16]1)
        $waveWriter.Write([int]8000)
        $waveWriter.Write([int]8000)
        $waveWriter.Write([int16]1)
        $waveWriter.Write([int16]8)
        $waveWriter.Write([System.Text.Encoding]::ASCII.GetBytes("data"))
        $waveWriter.Write([int]$waveSampleBytes.Length)
        $waveWriter.Write($waveSampleBytes)
    }
    finally {
        $waveWriter.Dispose()
    }

    $loginPath = Write-JsonTempFile @{ email = $Email; password = $plainPassword }
    $loginResponse = Invoke-ApiRequest `
        -Method "POST" `
        -Uri "$($script:BaseUri)/auth/login" `
        -JsonPath $loginPath
    Add-StatusCheck -Name "Admin login" -ExpectedStatus 200 -Response $loginResponse
    if ($loginResponse.StatusCode -ne 200 -or
        $null -eq $loginResponse.Json -or
        $null -eq $loginResponse.Json.data -or
        [string]::IsNullOrWhiteSpace($loginResponse.Json.data.accessToken)) {
        throw "Admin login failed: $(Get-ResponseDescription -Response $loginResponse)"
    }
    $script:Token = $loginResponse.Json.data.accessToken
    [void]$script:SensitiveValues.Add($script:Token)

    $imageUpload = Invoke-Upload `
        -Endpoint "image" `
        -Path $pngPath `
        -MimeType "image/png" `
        -BearerToken $script:Token
    Add-StatusCheck -Name "Upload valid PNG" -ExpectedStatus 201 -Response $imageUpload
    if ($null -ne $imageUpload.Json -and $null -ne $imageUpload.Json.data) {
        $script:Assets.Image = $imageUpload.Json.data
    }

    $audioUpload = Invoke-Upload `
        -Endpoint "audio" `
        -Path $wavPath `
        -MimeType "audio/wav" `
        -BearerToken $script:Token
    Add-StatusCheck -Name "Upload valid WAV" -ExpectedStatus 201 -Response $audioUpload
    if ($null -ne $audioUpload.Json -and $null -ne $audioUpload.Json.data) {
        $script:Assets.Audio = $audioUpload.Json.data
    }

    if ($null -ne $script:Assets.Image -and
        -not [string]::IsNullOrWhiteSpace($script:Assets.Image.url)) {
        $imageUrlResponse = Invoke-ApiRequest `
            -Method "GET" `
            -Uri $script:Assets.Image.url
        Add-StatusCheck -Name "Image URL returns 200" -ExpectedStatus 200 -Response $imageUrlResponse
    }
    else {
        Add-Check -Name "Image URL returns 200" -Expected "200" -Actual "No image URL returned" -Passed $false
    }

    if ($null -ne $script:Assets.Audio -and
        -not [string]::IsNullOrWhiteSpace($script:Assets.Audio.url)) {
        $audioRangeResponse = Invoke-ApiRequest `
            -Method "GET" `
            -Uri $script:Assets.Audio.url `
            -Range
        Add-StatusCheck -Name "Audio URL Range returns 206" -ExpectedStatus 206 -Response $audioRangeResponse
    }
    else {
        Add-Check -Name "Audio URL Range returns 206" -Expected "206" -Actual "No audio URL returned" -Passed $false
    }

    $svgUpload = Invoke-Upload `
        -Endpoint "image" `
        -Path $svgPath `
        -MimeType "image/png" `
        -BearerToken $script:Token
    Add-StatusCheck -Name "SVG renamed .png" -ExpectedStatus 400 -Response $svgUpload

    $textAudioUpload = Invoke-Upload `
        -Endpoint "audio" `
        -Path $textAudioPath `
        -MimeType "audio/mpeg" `
        -BearerToken $script:Token
    Add-StatusCheck -Name "Text renamed .mp3" -ExpectedStatus 400 -Response $textAudioUpload

    $pngAsAudioUpload = Invoke-Upload `
        -Endpoint "audio" `
        -Path $pngAudioPath `
        -MimeType "image/png" `
        -BearerToken $script:Token
    Add-StatusCheck -Name "PNG sent to audio endpoint" -ExpectedStatus 400 -Response $pngAsAudioUpload

    $largeUpload = Invoke-Upload `
        -Endpoint "image" `
        -Path $largeImagePath `
        -MimeType "image/png" `
        -BearerToken $script:Token
    Add-StatusCheck -Name "6 MB image rejected" -ExpectedStatus 413 -Response $largeUpload

    $unauthorizedUpload = Invoke-Upload `
        -Endpoint "image" `
        -Path $pngPath `
        -MimeType "image/png" `
        -BearerToken ""
    Add-StatusCheck -Name "Upload without token" -ExpectedStatus 401 -Response $unauthorizedUpload

    $noFileResponse = Invoke-ApiRequest `
        -Method "POST" `
        -Uri "$($script:BaseUri)/admin/uploads/image" `
        -BearerToken $script:Token
    Add-StatusCheck -Name "Upload without file" -ExpectedStatus 400 -Response $noFileResponse

    $learnerEmail = "uploadtest-$([guid]::NewGuid().ToString('N'))@example.com"
    $learnerPassword = "$([guid]::NewGuid().ToString('N'))Aa1!"
    [void]$script:SensitiveValues.Add($learnerPassword)
    $registerPath = Write-JsonTempFile @{ email = $learnerEmail; password = $learnerPassword }
    $registerResponse = Invoke-ApiRequest `
        -Method "POST" `
        -Uri "$($script:BaseUri)/auth/register" `
        -JsonPath $registerPath
    Add-StatusCheck -Name "Register temporary learner" -ExpectedStatus 201 -Response $registerResponse

    $learnerToken = $null
    if ($registerResponse.StatusCode -eq 201) {
        $learnerLoginPath = Write-JsonTempFile @{ email = $learnerEmail; password = $learnerPassword }
        $learnerLoginResponse = Invoke-ApiRequest `
            -Method "POST" `
            -Uri "$($script:BaseUri)/auth/login" `
            -JsonPath $learnerLoginPath
        if ($learnerLoginResponse.StatusCode -eq 200 -and
            $null -ne $learnerLoginResponse.Json -and
            $null -ne $learnerLoginResponse.Json.data) {
            $learnerToken = $learnerLoginResponse.Json.data.accessToken
            [void]$script:SensitiveValues.Add($learnerToken)
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($learnerToken)) {
        $learnerUpload = Invoke-Upload `
            -Endpoint "image" `
            -Path $pngPath `
            -MimeType "image/png" `
            -BearerToken $learnerToken
        Add-StatusCheck -Name "Learner upload forbidden" -ExpectedStatus 403 -Response $learnerUpload

        $learnerDeleteId = "ktutor/images/123e4567-e89b-42d3-a456-426614174000"
        if ($null -ne $script:Assets.Image -and
            -not [string]::IsNullOrWhiteSpace($script:Assets.Image.publicId)) {
            $learnerDeleteId = $script:Assets.Image.publicId
        }
        $learnerDelete = Invoke-DeleteAsset `
            -PublicId $learnerDeleteId `
            -Kind "image" `
            -BearerToken $learnerToken
        Add-StatusCheck -Name "Learner delete forbidden" -ExpectedStatus 403 -Response $learnerDelete
    }
    else {
        Add-Check -Name "Learner upload forbidden" -Expected "403" -Actual "Learner registration or login failed" -Passed $false
        Add-Check -Name "Learner delete forbidden" -Expected "403" -Actual "Learner registration or login failed" -Passed $false
    }

    $invalidPublicIds = @(
        "../../kt-nonexistent-check",
        "ktutor/images/../../x",
        "..\..\x",
        "/etc/passwd",
        "C:\Windows\win.ini",
        "%2e%2e/%2e%2e/x"
    )
    foreach ($invalidPublicId in $invalidPublicIds) {
        $invalidPath = Write-JsonTempFile @{ publicId = $invalidPublicId; kind = "image" }
        $invalidResponse = Invoke-ApiRequest `
            -Method "DELETE" `
            -Uri "$($script:BaseUri)/admin/uploads" `
            -BearerToken $script:Token `
            -JsonPath $invalidPath
        Add-StatusCheck `
            -Name "Reject publicId $invalidPublicId" `
            -ExpectedStatus 400 `
            -ExpectedErrorCode "INVALID_PUBLIC_ID" `
            -Response $invalidResponse
    }

    $audioPublicId = "ktutor/audio/123e4567-e89b-42d3-a456-426614174000"
    if ($null -ne $script:Assets.Audio -and
        -not [string]::IsNullOrWhiteSpace($script:Assets.Audio.publicId)) {
        $audioPublicId = $script:Assets.Audio.publicId
    }
    $wrongKindPath = Write-JsonTempFile @{ publicId = $audioPublicId; kind = "image" }
    $wrongKindResponse = Invoke-ApiRequest `
        -Method "DELETE" `
        -Uri "$($script:BaseUri)/admin/uploads" `
        -BearerToken $script:Token `
        -JsonPath $wrongKindPath
    Add-StatusCheck `
        -Name "Reject audio publicId as image" `
        -ExpectedStatus 400 `
        -ExpectedErrorCode "INVALID_PUBLIC_ID" `
        -Response $wrongKindResponse

    foreach ($assetKind in @("Image", "Audio")) {
        $asset = $script:Assets[$assetKind]
        $checkName = "Delete uploaded $($assetKind.ToLowerInvariant())"
        if ($null -eq $asset -or [string]::IsNullOrWhiteSpace($asset.publicId)) {
            Add-Check -Name $checkName -Expected "200" -Actual "No publicId returned" -Passed $false
            continue
        }

        $assetKindValue = $assetKind.ToLowerInvariant()
        $deleteResponse = Invoke-DeleteAsset `
            -PublicId $asset.publicId `
            -Kind $assetKindValue `
            -BearerToken $script:Token
        Add-StatusCheck -Name $checkName -ExpectedStatus 200 -Response $deleteResponse
        if ($deleteResponse.StatusCode -eq 200) {
            $script:DeletedPublicIds[$asset.publicId] = $true
        }
    }
}
catch {
    $errorMessage = Protect-Output -Value $_.Exception.Message
    Write-Host "ERROR: $errorMessage" -ForegroundColor Red
    Add-Check -Name "Script execution" -Expected "Completed" -Actual $errorMessage -Passed $false
}
finally {
    if (-not [string]::IsNullOrWhiteSpace($script:Token)) {
        foreach ($assetKind in @("Image", "Audio")) {
            $asset = $script:Assets[$assetKind]
            if ($null -ne $asset -and
                -not [string]::IsNullOrWhiteSpace($asset.publicId) -and
                -not $script:DeletedPublicIds.ContainsKey($asset.publicId)) {
                try {
                    $kindValue = $assetKind.ToLowerInvariant()
                    $cleanupResponse = Invoke-DeleteAsset `
                        -PublicId $asset.publicId `
                        -Kind $kindValue `
                        -BearerToken $script:Token
                    if ($cleanupResponse.StatusCode -eq 200) {
                        $script:DeletedPublicIds[$asset.publicId] = $true
                    }
                    else {
                        $cleanupError = Get-ResponseDescription -Response $cleanupResponse
                        Add-Check `
                            -Name "Cleanup uploaded $kindValue" `
                            -Expected "Deleted" `
                            -Actual $cleanupError `
                            -Passed $false
                    }
                }
                catch {
                    Add-Check `
                        -Name "Cleanup uploaded $($assetKind.ToLowerInvariant())" `
                        -Expected "Deleted" `
                        -Actual (Protect-Output -Value $_.Exception.Message) `
                        -Passed $false
                }
            }
        }
    }

    if (Test-Path -LiteralPath $script:TempDirectory) {
        try {
            Remove-Item -LiteralPath $script:TempDirectory -Recurse -Force
        }
        catch {
            Add-Check `
                -Name "Cleanup temporary files" `
                -Expected "Removed" `
                -Actual $_.Exception.Message `
                -Passed $false
        }
    }

    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
    if ($null -ne $securePassword) {
        $securePassword.Dispose()
    }
    $plainPassword = $null
}

$passedCount = @($script:Checks | Where-Object { $_.Result -eq "PASS" }).Count
$checkCount = $script:Checks.Count
$script:Checks | Format-Table -Property Check, Expected, Actual, Result -AutoSize -Wrap | Out-String | Write-Host
Write-Host "SUMMARY: $passedCount/$checkCount passed"
if ($passedCount -ne $checkCount) {
    exit 1
}
