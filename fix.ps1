$filepath = 'c:\Users\54225\Desktop\ProyectoCaipi\supabase.js'
$content = Get-Content $filepath -Raw
$content = $content -replace 'let supabase;', 'let supabaseClient;'
$content = $content -replace 'supabase = createClient', 'supabaseClient = createClient'
$content = $content -replace 'return supabase;', 'return supabaseClient;'
$content = $content -replace 'await supabase\.', 'await supabaseClient.'
Set-Content $filepath $content
Write-Host 'Fixed: Renamed supabase to supabaseClient'
