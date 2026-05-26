param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [string]$ProjectId = 'xinshing-gdp-training-20260525',
  [string]$ApiKey = 'AIzaSyBX6Z31XPRIMEzQuIpHL-6ptgV40rum8gI'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

function ConvertTo-PlainText {
  param([string]$Xml)
  if (-not $Xml) { return '' }
  $text = $Xml -replace '<w:tab[^>]*/>', "`t"
  $text = $text -replace '</w:p>', "`n"
  $text = $text -replace '</a:p>', "`n"
  $text = $text -replace '<[^>]+>', ' '
  $text = [System.Net.WebUtility]::HtmlDecode($text)
  $text = $text -replace '\s+', ' '
  return $text.Trim()
}

function Read-ZipEntryText {
  param([System.IO.Compression.ZipArchive]$Zip, [string]$EntryName)
  $entry = $Zip.GetEntry($EntryName)
  if (-not $entry) { return '' }
  $reader = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
  try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
}

function Read-DocxText {
  param([string]$Path)
  $zip = [System.IO.Compression.ZipFile]::OpenRead($Path)
  try {
    $parts = @()
    $main = Read-ZipEntryText $zip 'word/document.xml'
    if ($main) { $parts += ConvertTo-PlainText $main }
    foreach ($entry in $zip.Entries | Where-Object { $_.FullName -like 'word/header*.xml' -or $_.FullName -like 'word/footer*.xml' }) {
      $parts += ConvertTo-PlainText (Read-ZipEntryText $zip $entry.FullName)
    }
    return ($parts -join "`n")
  } finally { $zip.Dispose() }
}

function Read-XlsxText {
  param([string]$Path)
  $zip = [System.IO.Compression.ZipFile]::OpenRead($Path)
  try {
    $shared = @()
    $sharedXml = Read-ZipEntryText $zip 'xl/sharedStrings.xml'
    if ($sharedXml) {
      [regex]::Matches($sharedXml, '<si[\s\S]*?</si>') | ForEach-Object {
        $shared += ConvertTo-PlainText $_.Value
      }
    }
    $parts = @()
    foreach ($entry in $zip.Entries | Where-Object { $_.FullName -like 'xl/worksheets/*.xml' }) {
      $xml = Read-ZipEntryText $zip $entry.FullName
      foreach ($m in [regex]::Matches($xml, '<c[^>]*?(?:t="(?<t>[^"]+)")?[^>]*>[\s\S]*?</c>')) {
        $cell = $m.Value
        $value = ([regex]::Match($cell, '<v>(.*?)</v>')).Groups[1].Value
        if ($value -ne '') {
          if ($cell -match 't="s"' -and $value -match '^\d+$' -and [int]$value -lt $shared.Count) {
            $parts += $shared[[int]$value]
          } else {
            $parts += [System.Net.WebUtility]::HtmlDecode($value)
          }
        }
      }
    }
    return (($parts | Where-Object { $_ }) -join ' ')
  } finally { $zip.Dispose() }
}

function Read-PptxText {
  param([string]$Path)
  $zip = [System.IO.Compression.ZipFile]::OpenRead($Path)
  try {
    $parts = @()
    foreach ($entry in $zip.Entries | Where-Object { $_.FullName -like 'ppt/slides/slide*.xml' }) {
      $parts += ConvertTo-PlainText (Read-ZipEntryText $zip $entry.FullName)
    }
    return ($parts -join "`n")
  } finally { $zip.Dispose() }
}

function Get-SourceText {
  param([string]$Path)
  $ext = [IO.Path]::GetExtension($Path).ToLowerInvariant()
  try {
    if ($ext -eq '.docx') { return Read-DocxText $Path }
    if ($ext -eq '.xlsx') { return Read-XlsxText $Path }
    if ($ext -eq '.pptx') { return Read-PptxText $Path }
    if ($ext -in @('.md','.html','.txt','.json','.rules')) { return Get-Content -LiteralPath $Path -Encoding UTF8 -Raw }
  } catch {
    return ''
  }
  return ''
}

function Split-Text {
  param([string]$Text, [int]$Size = 9000)
  $clean = ($Text -replace '\s+', ' ').Trim()
  if (-not $clean) { return @('') }
  $chunks = @()
  for ($i = 0; $i -lt $clean.Length; $i += $Size) {
    $len = [Math]::Min($Size, $clean.Length - $i)
    $chunks += $clean.Substring($i, $len)
  }
  return $chunks
}

function Get-Keywords {
  param([string]$RelativePath, [string]$Text)
  $name = [IO.Path]::GetFileNameWithoutExtension($RelativePath)
  $words = New-Object System.Collections.Generic.List[string]
  $words.Add($name)
  $words.Add($RelativePath)
  foreach ($m in [regex]::Matches("$RelativePath $Text", '[A-Z]{2}\d{2}-\d{2}|[A-Z]{2}\d{2}|FR\d{2}-\d{2}|WI\d{2}-\d{2}|DM\d{2}-\d{2}')) { $words.Add($m.Value) }
  return @($words | Where-Object { $_ } | Select-Object -Unique | Select-Object -First 80)
}

function New-DocId {
  param([string]$RelativePath, [int]$Chunk)
  $raw = "$RelativePath-$Chunk"
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($raw)
  $sha = [System.Security.Cryptography.SHA256]::Create()
  $hash = [BitConverter]::ToString($sha.ComputeHash($bytes)).Replace('-','').Substring(0,16).ToLowerInvariant()
  $base = ([IO.Path]::GetFileNameWithoutExtension($RelativePath) -replace '[^A-Za-z0-9]+','-').Trim('-')
  if (-not $base) { $base = 'source' }
  return "$base-$hash".Substring(0, [Math]::Min(120, "$base-$hash".Length))
}

function FieldValue {
  param($Value)
  if ($Value -is [array]) {
    return @{ arrayValue = @{ values = @($Value | ForEach-Object { @{ stringValue = ([string]$_).Substring(0, [Math]::Min(1400, ([string]$_).Length)) } }) } }
  }
  $s = [string]$Value
  return @{ stringValue = $s.Substring(0, [Math]::Min(12000, $s.Length)) }
}

function Write-FirestoreDoc {
  param([string]$DocId, [hashtable]$Doc)
  $fields = @{}
  foreach ($key in $Doc.Keys) { $fields[$key] = FieldValue $Doc[$key] }
  $body = @{ fields = $fields } | ConvertTo-Json -Depth 8
  $url = "https://firestore.googleapis.com/v1/projects/$ProjectId/databases/(default)/documents/gdpKnowledgeBase/$([uri]::EscapeDataString($DocId))?key=$ApiKey"
  Invoke-RestMethod -Method Patch -Uri $url -ContentType 'application/json; charset=utf-8' -Body $body | Out-Null
}

$includeExt = @('.docx','.xlsx','.pptx','.md','.html')
$exclude = '\\.git\\|\\outputs\\|\\preview_|\\visual_check_|\\.claude\\|HTML資料庫\\assets\\'
$files = Get-ChildItem -LiteralPath $ProjectRoot -Recurse -File |
  Where-Object { $includeExt -contains $_.Extension.ToLowerInvariant() -and $_.FullName -notmatch $exclude } |
  Sort-Object FullName

$uploaded = 0
$failed = @()
foreach ($file in $files) {
  $relative = $file.FullName.Substring($ProjectRoot.Length).TrimStart('\') -replace '\\','/'
  $text = Get-SourceText $file.FullName
  $chunks = Split-Text $text
  for ($i = 0; $i -lt $chunks.Count; $i++) {
    $chunkText = $chunks[$i]
    $docId = New-DocId $relative $i
    $doc = @{
      topic = [IO.Path]::GetFileName($relative)
      keywords = Get-Keywords $relative $chunkText
      international = 'Project source index. Do not infer international regulation content from this source document unless explicitly present.'
      taiwan = 'Project source index. Do not infer Taiwan regulation content from this source document unless explicitly present.'
      xinshing = if ($chunkText) { $chunkText } else { "File exists but no readable text was extracted: $relative" }
      sop_ref = @([regex]::Matches($relative, "[A-Z]{2}\d{2}-\d{2}") | ForEach-Object { $_.Value } | Select-Object -Unique)
      sourceType = 'project-source-file'
      file = $relative
      chunk = "$($i + 1)/$($chunks.Count)"
      updatedAt = (Get-Date).ToString('s')
    }
    try {
      Write-FirestoreDoc $docId $doc
      $uploaded++
    } catch {
      $failed += [pscustomobject]@{ file = $relative; chunk = $i + 1; error = $_.Exception.Message }
    }
  }
}

$summary = [pscustomobject]@{
  projectId = $ProjectId
  sourceFiles = $files.Count
  uploadedDocuments = $uploaded
  failed = $failed.Count
  failures = $failed
}
$summary | ConvertTo-Json -Depth 5
