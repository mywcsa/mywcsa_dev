#Requires -Version 7.0
<#
.SYNOPSIS
  Preview or grant a dedicated MyWCDA Events archive app WRITE access to only
  the verified MyWCSA GovApps SharePoint site.
.DESCRIPTION
  An authorised Microsoft Entra / SharePoint tenant administrator must run this
  locally after the dedicated archive app has been created and consented to
  the Microsoft Graph APPLICATION permission Sites.Selected.
  The script never reads, creates or prints app client secrets and never changes
  SharePoint users or group memberships. Default mode is DRY RUN.
.EXAMPLE
  ./sharepoint-grant-site-selected.ps1 -TenantId <tenant-guid> -ApplicationClientId <app-guid>
.EXAMPLE
  ./sharepoint-grant-site-selected.ps1 -TenantId <tenant-guid> -ApplicationClientId <app-guid> -Apply
#>
[CmdletBinding(SupportsShouldProcess=$true,ConfirmImpact='High')]
param(
 [Parameter(Mandatory=$true)]
 [ValidatePattern('^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$')]
 [string]$TenantId,
 [Parameter(Mandatory=$true)]
 [ValidatePattern('^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$')]
 [string]$ApplicationClientId,
 [switch]$Apply
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$siteId='jemresourcesza.sharepoint.com,1bcfb157-80e4-44f8-9ad0-9a11c9af33c7,93ece2d5-3233-426d-869f-1a473342b366'
$siteUrl='https://jemresourcesza.sharepoint.com/sites/GovApps'
$expectedName='MyWCSA GovApps'
$appLabel='MyWCDA Events Archives'
$endpoint="https://graph.microsoft.com/v1.0/sites/$siteId"

if (-not (Get-Module -ListAvailable -Name Microsoft.Graph.Authentication)) {
 throw 'Install Microsoft.Graph.Authentication from PSGallery in an approved admin workstation before running this script.'
}

function Get-GraphValue($item,[string]$property){
 if($null -eq $item){return $null}
 if($item -is [System.Collections.IDictionary]){return $item[$property]}
 $p=$item.PSObject.Properties[$property]
 if($null -ne $p){return $p.Value}
 return $null
}

try {
 # This is an interactive delegated admin token, used ONLY to grant a narrower
 # application permission; it is not a credential for GovApps production.
 Connect-MgGraph -TenantId $TenantId -Scopes 'Sites.FullControl.All' -NoWelcome

 $ctx=Get-MgContext
 if (-not $ctx -or $ctx.TenantId -ne $TenantId) {
  throw 'Microsoft Graph signed into a different tenant. Nothing was changed.'
 }
 $site=Invoke-MgGraphRequest -Method GET -Uri ("{0}?{1}" -f $endpoint,'$select=id,displayName,webUrl')
 if ($site.id -ne $siteId -or $site.displayName -ne $expectedName -or $site.webUrl.TrimEnd('/') -ne $siteUrl) {
  throw 'Site does not match the verified MyWCSA GovApps site. Nothing was changed.'
 }
 Write-Host ("Verified site: {0}" -f $site.webUrl) -ForegroundColor Green
 Write-Host ("Target app ID: {0}" -f $ApplicationClientId)
 Write-Host 'Requested assignment: Sites.Selected / write on THIS SITE only.'
 Write-Warning 'This grants site-wide app write access, not folder-only access. Use a DEDICATED app registration for the archive.'

 $permissions=Invoke-MgGraphRequest -Method GET -Uri ("{0}/permissions" -f $endpoint)
 $matches=@((Get-GraphValue $permissions 'value') | Where-Object {
  $item=$_
  $a=@(Get-GraphValue $item 'grantedToIdentitiesV2')+@(Get-GraphValue $item 'grantedToIdentities')
  @($a | Where-Object {
   $identity=Get-GraphValue $_ 'application'
   $identity -and (Get-GraphValue $identity 'id') -eq $ApplicationClientId
  }).Count -gt 0
 })
 if($matches.Count -gt 0){
  Write-Warning ('The app already has {0} site permission(s). Review existing roles; no new grant was created.' -f $matches.Count)
  $matches | ForEach-Object { Write-Host ("Permission ID: {0}; Roles: {1}" -f $_.id,($_.roles -join ',')) }
  return
 }
 if(-not $Apply){
  Write-Host 'DRY RUN completed; no permission was created.' -ForegroundColor Yellow
  Write-Host 'After reviewing tenant, app ID, and its GRAPH application Sites.Selected consent, rerun with -Apply.'
  return
 }
 if($PSCmdlet.ShouldProcess($siteUrl,"Grant app $ApplicationClientId the Sites.Selected write role on this site")){
  $body=@{
   roles=@('write')
   grantedToIdentities=@(@{
    application=@{id=$ApplicationClientId;displayName=$appLabel}
   })
  } | ConvertTo-Json -Depth 8
  $result=Invoke-MgGraphRequest -Method POST -Uri ("{0}/permissions" -f $endpoint) -Body $body -ContentType 'application/json'
  if(-not $result.id){throw 'Microsoft Graph did not return an assignment ID; check the site permission list before retrying.'}
  Write-Host ("Created selected-site permission ID: {0}" -f $result.id) -ForegroundColor Green
  Write-Host 'This does NOT enable GovApps archiving and does NOT change folder group permissions.'
 }
}
finally {
 Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null
}
