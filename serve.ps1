$root = [System.IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$rootPrefix = $root.TrimEnd('\') + '\'
$port = 8083
$lanAddress = [System.Net.Dns]::GetHostEntry([System.Net.Dns]::GetHostName()).AddressList |
    Where-Object { $_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork -and $_.ToString() -notlike '127.*' } |
    Select-Object -First 1
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
$listener.Start()
Write-Host "Server started at http://$($lanAddress):$port/"

while ($true) {
    $client = $listener.AcceptTcpClient()
    $stream = $client.GetStream()
    $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)

    try {
        $requestLine = $reader.ReadLine()
        if ([string]::IsNullOrWhiteSpace($requestLine)) {
            continue
        }

        while ($true) {
            $headerLine = $reader.ReadLine()
            if ([string]::IsNullOrEmpty($headerLine)) { break }
        }

        $requestParts = $requestLine.Split(' ')
        $requestUri = [System.Uri]::new("http://localhost$($requestParts[1])")
        $requestPath = [System.Uri]::UnescapeDataString($requestUri.AbsolutePath)
        if ($requestPath -eq '/') { $requestPath = '/index.html' }

        $relativePath = $requestPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $fullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $relativePath))
        if (-not $fullPath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
            $status = '403 Forbidden'
            $contentType = 'text/plain; charset=utf-8'
            $body = [System.Text.Encoding]::UTF8.GetBytes('Forbidden')
        }
        elseif ([System.IO.File]::Exists($fullPath)) {
            $status = '200 OK'
            $body = [System.IO.File]::ReadAllBytes($fullPath)
            $extension = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $contentType = switch ($extension) {
                '.html' { 'text/html; charset=utf-8' }
                '.js' { 'application/javascript; charset=utf-8' }
                '.css' { 'text/css; charset=utf-8' }
                '.png' { 'image/png' }
                '.jpg' { 'image/jpeg' }
                '.jpeg' { 'image/jpeg' }
                '.gif' { 'image/gif' }
                '.svg' { 'image/svg+xml' }
                '.mp3' { 'audio/mpeg' }
                default { 'application/octet-stream' }
            }
        }
        else {
            $status = '404 Not Found'
            $contentType = 'text/plain; charset=utf-8'
            $body = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
        }

        $responseHeader = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
        $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($responseHeader)
        $stream.Write($headerBytes, 0, $headerBytes.Length)
        $stream.Write($body, 0, $body.Length)
        $stream.Flush()
    }
    catch {
        Write-Warning $_.Exception.Message
    }
    finally {
        $reader.Dispose()
        $client.Close()
    }
}
