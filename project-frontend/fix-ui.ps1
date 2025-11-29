$content = Get-Content 'App.tsx' -Raw

# 1. Header is already sticky, but ensure it's there
$content = $content -replace 'className="top-0 z-50', 'className="sticky top-0 z-50'

# 2. Category buttons - white background with black text in dark mode
$content = $content -replace 'bg-gradient-to-r from-gray-900 to-black dark:from-blue-500 dark:to-blue-600 shadow-lg shadow-gray-900/25 dark:shadow-blue-500/25', 'bg-stone-900 dark:bg-white dark:text-black shadow-lg shadow-stone-900/25 dark:shadow-white/25'

# 3. Quick View button - black hover in dark mode
$content = $content -replace 'hover:bg-white dark:hover:bg-slate-900 transition-all', 'hover:bg-white dark:hover:bg-black transition-all'

# 4. Cart badge - white text in light mode, black text in dark mode
$content = $content -replace 'bg-gray-900 dark:bg-blue-500 text-white', 'bg-stone-900 dark:bg-white text-white dark:text-black'

# 5. Search bar - white border only when focused in dark mode
$content = $content -replace 'focus:border-gray-900 dark:focus:border-blue-500', 'focus:border-stone-900 dark:focus:border-white'

Set-Content 'App.tsx' -Value $content -NoNewline
Write-Host "All UI fixes applied successfully!"
