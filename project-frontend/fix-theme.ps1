$content = Get-Content 'App.tsx' -Raw

# Plasma colors - white for both modes
$content = $content -replace "color=\{isDark \? '#3b82f6' : '#3b82f6'\}", "color={isDark ? '#ffffff' : '#ffffff'}"

# Background colors - black instead of slate
$content = $content -replace 'dark:bg-slate-950', 'dark:bg-black'
$content = $content -replace 'dark:text-slate-100', 'dark:text-white'
$content = $content -replace 'dark:bg-slate-900', 'dark:bg-neutral-900'
$content = $content -replace 'dark:border-slate-800', 'dark:border-neutral-800'
$content = $content -replace 'dark:border-slate-700', 'dark:border-neutral-800'
$content = $content -replace 'dark:bg-slate-800', 'dark:bg-neutral-800'

# Star icon and branding - white instead of blue
$content = $content -replace 'dark:bg-blue-500', 'dark:bg-white'
$content = $content -replace 'dark:before:bg-blue-500', 'dark:before:bg-white'
$content = $content -replace 'dark:from-blue-500 dark:to-blue-600', 'dark:text-white'

# Cart icon and badge
$content = $content -replace 'dark:text-blue-500', 'dark:text-white'
$content = $content -replace 'bg-gray-900 dark:bg-blue-500 text-white text-\[10px\]', 'bg-stone-900 dark:bg-white text-white dark:text-black text-[10px]'

# Loading spinner
$content = $content -replace 'border-blue-500', 'border-stone-900 dark:border-white'

# Category buttons - white background in dark mode
$content = $content -replace 'from-gray-900 to-black dark:from-blue-500 dark:to-blue-600 shadow-lg shadow-gray-900/25 dark:shadow-blue-500/25', 'bg-stone-900 dark:bg-white dark:text-black shadow-lg shadow-stone-900/25 dark:shadow-white/25'

# Search bar focus
$content = $content -replace 'dark:focus:ring-blue-500/20', 'dark:focus:ring-white/20'
$content = $content -replace 'dark:focus:border-blue-500', 'dark:focus:border-white'

# Product cards
$content = $content -replace 'dark:hover:shadow-blue-500/20', 'dark:hover:shadow-white/5'
$content = $content -replace 'dark:hover:border-blue-500/30', 'dark:hover:border-neutral-700'
$content = $content -replace 'dark:text-blue-600', 'dark:text-stone-300'
$content = $content -replace 'dark:bg-slate-900/90', 'dark:bg-neutral-900/90'

Set-Content 'App.tsx' -Value $content -NoNewline
Write-Host "Theme changes applied successfully!"
