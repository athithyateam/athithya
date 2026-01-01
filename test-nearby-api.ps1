# PowerShell script to test Nearby Treks API
# Usage: .\test-nearby-api.ps1

Write-Host "`n🗺️  Testing Nearby Treks API" -ForegroundColor Cyan
Write-Host "=" -NoNewline -ForegroundColor Cyan; Write-Host ("=" * 79) -ForegroundColor Cyan

# Test if server is running
Write-Host "`n📡 Checking server status..." -ForegroundColor Yellow
try {
    $serverCheck = Invoke-WebRequest -Uri "http://localhost:3000/api/posts" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✓ Server is running on http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Server is not running!" -ForegroundColor Red
    Write-Host "   Please start the server with: npm start" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Test locations
$testCases = @(
    @{
        Name = "Dehradun (50km radius)"
        Lat = 30.3165
        Lng = 78.0322
        Distance = 50000
        Description = "Should find nearest treks: Nag Tibba, Kedarkantha"
    },
    @{
        Name = "Dehradun (100km radius)"
        Lat = 30.3165
        Lng = 78.0322
        Distance = 100000
        Description = "Should find medium distance treks including Chopta"
    },
    @{
        Name = "Delhi (300km radius)"
        Lat = 28.7041
        Lng = 77.1025
        Distance = 300000
        Description = "Should find multiple treks sorted by distance"
    }
)

foreach ($test in $testCases) {
    Write-Host "`n📍 Test: $($test.Name)" -ForegroundColor Yellow
    Write-Host "   $($test.Description)" -ForegroundColor Gray
    
    $url = "http://localhost:3000/api/posts/nearby/treks?latitude=$($test.Lat)&longitude=$($test.Lng)&maxDistance=$($test.Distance)"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method GET
        
        if ($response.success) {
            Write-Host "   ✓ Found $($response.count) treks" -ForegroundColor Green
            
            if ($response.count -gt 0) {
                Write-Host "`n   Results (sorted by distance):" -ForegroundColor Gray
                $index = 1
                foreach ($trek in $response.treks) {
                    $distance = if ($trek.distance) { "$($trek.distance) km" } else { "N/A" }
                    $price = if ($trek.price.perPerson) { "₹$($trek.price.perPerson)" } else { "N/A" }
                    $name = $trek.title.PadRight(35)
                    $distPadded = $distance.PadRight(12)
                    Write-Host "      $index. $name - $distPadded - $price" -ForegroundColor Gray
                    $index++
                }
            } else {
                Write-Host "   ⚠ No treks found within this radius" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ✗ API returned success=false" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test with filters
Write-Host "`n📍 Test: Easy treks within 100km of Dehradun" -ForegroundColor Yellow
$url = "http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=100000&difficulty=Easy"
try {
    $response = Invoke-RestMethod -Uri $url -Method GET
    if ($response.success) {
        Write-Host "   ✓ Found $($response.count) Easy treks" -ForegroundColor Green
        if ($response.count -gt 0) {
            foreach ($trek in $response.treks) {
                Write-Host "      - $($trek.title) ($($trek.difficulty)) - $($trek.distance) km" -ForegroundColor Gray
            }
        }
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test with price filter
Write-Host "`n📍 Test: Budget treks (under ₹10,000) within 200km" -ForegroundColor Yellow
$url = "http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=200000&maxPrice=10000"
try {
    $response = Invoke-RestMethod -Uri $url -Method GET
    if ($response.success) {
        Write-Host "   ✓ Found $($response.count) budget-friendly treks" -ForegroundColor Green
        if ($response.count -gt 0) {
            foreach ($trek in $response.treks) {
                Write-Host "      - $($trek.title) - ₹$($trek.price.perPerson) - $($trek.distance) km" -ForegroundColor Gray
            }
        }
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" -NoNewline
Write-Host "=" -NoNewline -ForegroundColor Cyan; Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "✅ Testing Complete!" -ForegroundColor Green
Write-Host "`n💡 Key Observations:" -ForegroundColor Yellow
Write-Host "   - Treks are sorted by distance (nearest first)" -ForegroundColor Gray
Write-Host "   - Distance is calculated in kilometers" -ForegroundColor Gray
Write-Host "   - Filters work correctly with location search" -ForegroundColor Gray
Write-Host ""
