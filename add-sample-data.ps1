# PowerShell script to add sample trek data to the backend

$baseUrl = "http://localhost:3000/api"

# Step 1: Register a host user
Write-Host "Step 1: Creating host user..." -ForegroundColor Cyan

$registerData = @{
    firstname = "Rajesh"
    lastname = "Kumar"
    email = "rajesh.host@example.com"
    password = "Test@123456"
    role = "host"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/signup" -Method Post -Body $registerData -ContentType "application/json"
    Write-Host "✓ Host user created successfully" -ForegroundColor Green
} catch {
    Write-Host "Note: User might already exist, trying to sign in..." -ForegroundColor Yellow
}

# Step 2: Sign in to get token
Write-Host "`nStep 2: Signing in..." -ForegroundColor Cyan

$signinData = @{
    email = "rajesh.host@example.com"
    password = "Test@123456"
} | ConvertTo-Json

$signinResponse = Invoke-RestMethod -Uri "$baseUrl/auth/signin" -Method Post -Body $signinData -ContentType "application/json"
$token = $signinResponse.token
Write-Host "✓ Signed in successfully" -ForegroundColor Green
Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray

# Step 3: Create sample trek posts
Write-Host "`nStep 3: Creating sample trek posts..." -ForegroundColor Cyan

$treks = @(
    @{
        postType = "trek"
        title = "Kedarkantha Summit Trek"
        description = "Experience the breathtaking Kedarkantha trek through pristine snow-covered trails and pine forests. Perfect for beginners and intermediate trekkers seeking an unforgettable Himalayan adventure with stunning 360-degree mountain views."
        duration = @{
            days = 5
            nights = 4
        }
        difficulty = "Easy-Moderate"
        isFeatured = $true
        location = @{
            city = "Sankri"
            state = "Uttarakhand"
            country = "India"
        }
        price = @{
            perPerson = 7999
            currency = "INR"
            period = "person"
        }
        capacity = @{
            maxPeople = 15
        }
        amenities = @("Camping Equipment", "Meals Included", "Guide Service", "First Aid Kit")
        categories = @("Adventure", "Mountain", "Snow", "Trekking")
        status = "active"
    },
    @{
        postType = "trek"
        title = "Valley of Flowers Trek"
        description = "Discover the UNESCO World Heritage site Valley of Flowers, a spectacular high-altitude valley filled with endemic alpine flowers and diverse flora. A must-visit destination for nature lovers and photography enthusiasts."
        duration = @{
            days = 6
            nights = 5
        }
        difficulty = "Moderate"
        isFeatured = $true
        location = @{
            city = "Joshimath"
            state = "Uttarakhand"
            country = "India"
        }
        price = @{
            perPerson = 10499
            currency = "INR"
            period = "person"
        }
        capacity = @{
            maxPeople = 12
        }
        amenities = @("Camping Equipment", "Meals Included", "Guide Service", "Photography Guide")
        categories = @("Nature", "Mountain", "Flora", "UNESCO Site")
        status = "active"
    },
    @{
        postType = "trek"
        title = "Hampta Pass Trek"
        description = "Cross the stunning Hampta Pass connecting the lush green Kullu Valley with the barren Lahaul Valley. Experience dramatic landscape changes, river crossings, and camping under star-studded skies."
        duration = @{
            days = 5
            nights = 4
        }
        difficulty = "Moderate"
        isFeatured = $true
        location = @{
            city = "Manali"
            state = "Himachal Pradesh"
            country = "India"
        }
        price = @{
            perPerson = 9299
            currency = "INR"
            period = "person"
        }
        capacity = @{
            maxPeople = 18
        }
        amenities = @("Camping Equipment", "Meals Included", "Guide Service", "River Crossing Equipment")
        categories = @("Adventure", "Mountain", "High Altitude", "Camping")
        status = "active"
    },
    @{
        postType = "trek"
        title = "Triund Trek"
        description = "A perfect weekend getaway trek offering panoramic views of the Dhauladhar ranges. Ideal for beginners with a well-marked trail through oak and rhododendron forests leading to a stunning ridge-top campsite."
        duration = @{
            days = 2
            nights = 1
        }
        difficulty = "Easy"
        isFeatured = $false
        location = @{
            city = "McLeod Ganj"
            state = "Himachal Pradesh"
            country = "India"
        }
        price = @{
            perPerson = 2499
            currency = "INR"
            period = "person"
        }
        capacity = @{
            maxPeople = 25
        }
        amenities = @("Camping Equipment", "Meals Included", "Guide Service")
        categories = @("Beginner Friendly", "Weekend Trek", "Mountain Views")
        status = "active"
    },
    @{
        postType = "trek"
        title = "Har Ki Dun Trek"
        description = "Trek through the cradle of gods in this stunning valley trek. Experience ancient villages, mythological significance, and spectacular views of Swargarohini peak. Rich in culture and natural beauty."
        duration = @{
            days = 7
            nights = 6
        }
        difficulty = "Moderate"
        isFeatured = $true
        location = @{
            city = "Sankri"
            state = "Uttarakhand"
            country = "India"
        }
        price = @{
            perPerson = 12999
            currency = "INR"
            period = "person"
        }
        capacity = @{
            maxPeople = 15
        }
        amenities = @("Camping Equipment", "Meals Included", "Guide Service", "Cultural Guide", "Porter Service")
        categories = @("Cultural Trek", "Mountain", "Long Trek", "Valley Trek")
        status = "active"
    },
    @{
        postType = "trek"
        title = "Chopta Chandrashila Trek"
        description = "Summit the Chandrashila peak at 13,000 feet offering 360-degree views of major Himalayan peaks. Visit the sacred Tungnath temple, the highest Shiva temple in the world, on this spiritually enriching trek."
        duration = @{
            days = 4
            nights = 3
        }
        difficulty = "Easy-Moderate"
        isFeatured = $false
        location = @{
            city = "Chopta"
            state = "Uttarakhand"
            country = "India"
        }
        price = @{
            perPerson = 6999
            currency = "INR"
            period = "person"
        }
        capacity = @{
            maxPeople = 20
        }
        amenities = @("Camping Equipment", "Meals Included", "Guide Service", "Temple Visit")
        categories = @("Spiritual", "Mountain", "Summit Trek", "Moderate")
        status = "active"
    },
    @{
        postType = "trek"
        title = "Nag Tibba Trek"
        description = "The Serpent's Peak - a perfect weekend trek from Delhi offering stunning views of Himalayan ranges. Experience snow-clad peaks (in winter), camping under stars, and breathtaking sunrise views."
        duration = @{
            days = 2
            nights = 1
        }
        difficulty = "Easy"
        isFeatured = $false
        location = @{
            city = "Pantwari"
            state = "Uttarakhand"
            country = "India"
        }
        price = @{
            perPerson = 3499
            currency = "INR"
            period = "person"
        }
        capacity = @{
            maxPeople = 30
        }
        amenities = @("Camping Equipment", "Meals Included", "Guide Service", "Bonfire")
        categories = @("Weekend Trek", "Beginner Friendly", "Snow Trek (Winter)")
        status = "active"
    },
    @{
        postType = "trek"
        title = "Brahmatal Trek"
        description = "A winter wonderland trek offering pristine snow trails, frozen Brahmatal lake, and stunning views of Mt. Trishul and Nanda Ghunti. Perfect for those seeking a true winter Himalayan experience."
        duration = @{
            days = 6
            nights = 5
        }
        difficulty = "Moderate"
        isFeatured = $true
        location = @{
            city = "Lohajung"
            state = "Uttarakhand"
            country = "India"
        }
        price = @{
            perPerson = 11499
            currency = "INR"
            period = "person"
        }
        capacity = @{
            maxPeople = 12
        }
        amenities = @("Winter Camping Equipment", "Meals Included", "Guide Service", "Snow Gear", "Crampons")
        categories = @("Winter Trek", "Snow Trek", "High Altitude", "Lake Trek")
        status = "active"
    }
)

$createdCount = 0
foreach ($trek in $treks) {
    try {
        $trekJson = $trek | ConvertTo-Json -Depth 10
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri "$baseUrl/posts" -Method Post -Body $trekJson -Headers $headers
        $createdCount++
        Write-Host "  ✓ Created: $($trek.title)" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Failed to create: $($trek.title)" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Total treks created: $createdCount/$($treks.Count)" -ForegroundColor Green
Write-Host "`nYou can now view the treks in your frontend at http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend API: http://localhost:3000/api/posts" -ForegroundColor Yellow
