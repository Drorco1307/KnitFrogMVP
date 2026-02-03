# Knitting Pattern Editor - File Reorganization Script
# This script moves files from a flat structure into the proper folder hierarchy

Write-Host "Knitting Pattern Editor - Reorganizing Files" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Create directory structure
Write-Host "Creating directory structure..." -ForegroundColor Yellow

$directories = @(
    "src",
    "src\components",
    "src\components\layout",
    "src\components\pattern-editor",
    "src\components\text-input",
    "src\components\3d-viewer",
    "src\components\metadata",
    "src\components\modals",
    "src\store",
    "src\types",
    "src\utils",
    "src\services",
    "src\services\api",
    "public"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✓ Created $dir" -ForegroundColor Green
    } else {
        Write-Host "  → $dir already exists" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Moving files to correct locations..." -ForegroundColor Yellow

# Define file movements (source -> destination)
$fileMoves = @{
    # Root src files
    "main.tsx" = "src\main.tsx"
    "App.tsx" = "src\App.tsx"
    "index.css" = "src\index.css"
    
    # Layout components
    "Header.tsx" = "src\components\layout\Header.tsx"
    "Sidebar.tsx" = "src\components\layout\Sidebar.tsx"
    "MainContent.tsx" = "src\components\layout\MainContent.tsx"
    
    # Pattern editor components
    "PatternGrid.tsx" = "src\components\pattern-editor\PatternGrid.tsx"
    "GridCell.tsx" = "src\components\pattern-editor\GridCell.tsx"
    "StitchPalette.tsx" = "src\components\pattern-editor\StitchPalette.tsx"
    "ColorPalette.tsx" = "src\components\pattern-editor\ColorPalette.tsx"
    "Toolbar.tsx" = "src\components\pattern-editor\Toolbar.tsx"
    "StatusBar.tsx" = "src\components\pattern-editor\StatusBar.tsx"
    
    # Store
    "patternStore.ts" = "src\store\patternStore.ts"
    
    # Types
    "pattern.types.ts" = "src\types\pattern.types.ts"
    
    # Utils
    "stitchData.ts" = "src\utils\stitchData.ts"
    "stitchEffects.ts" = "src\utils\stitchEffects.ts"
}

foreach ($source in $fileMoves.Keys) {
    $destination = $fileMoves[$source]
    
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $destination -Force
        Write-Host "  ✓ Moved $source -> $destination" -ForegroundColor Green
    } else {
        Write-Host "  ✗ File not found: $source" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Reorganization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: npm install" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
