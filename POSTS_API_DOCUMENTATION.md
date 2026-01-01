# Posts API Documentation - Share Your Travel Experiences 🌍

## Overview
The Posts API empowers travelers to share their incredible journeys, experiences, and adventures with the community. Whether you're a guest sharing your travel stories or a host offering services and treks, this API makes it easy to connect with fellow travelers through photos, videos, and detailed descriptions.

### What Can You Share?
- **📖 Experiences**: Share your travel stories, adventures, and memorable moments
- **🏔️ Treks**: Host-only feature to showcase trekking packages and adventures
- **🛎️ Services**: Host-only feature to offer travel-related services

> **Note**: For trip planning and itineraries, use the `/api/itineraries` endpoint.

### 💡 Recommended Approach

**Use Dedicated Endpoints** for cleaner, simpler code:
- **For Experiences**: Use `/api/posts/experiences` endpoints (see [EXPERIENCES_API_DOCUMENTATION.md](./EXPERIENCES_API_DOCUMENTATION.md))
- **For Services**: Use `/api/posts/services` endpoints
- **For Treks**: Use `/api/posts/treks` endpoints

These dedicated endpoints **automatically set the `postType`** for you, making your code cleaner and less error-prone!

**General Endpoint**: The `/api/posts` endpoint still works if you need to work with multiple post types or have specific requirements.

## Base URL
```
/api/posts
```

## 🌟 Dedicated Experience Endpoints

For simplified experience sharing, use these dedicated endpoints that automatically set `postType: "experience"`:

```
POST   /api/posts/experiences              - Create experience (All users)
GET    /api/posts/experiences              - Get all experiences
GET    /api/posts/experiences/:id          - Get single experience
GET    /api/posts/experiences/featured/list - Get featured experiences
GET    /api/posts/experiences/my/list      - Get my experiences (Auth)
GET    /api/posts/experiences/user/:userId - Get user's experiences
PUT    /api/posts/experiences/:id          - Update experience (Owner)
DELETE /api/posts/experiences/:id          - Delete experience (Owner)
```

**Benefits:** No need to specify `postType` - it's automatically set to `"experience"`!

**📚 Full Documentation:** See [EXPERIENCES_API_DOCUMENTATION.md](./EXPERIENCES_API_DOCUMENTATION.md) for complete details.

---

## 🛎️ Dedicated Service Endpoints

For hosts to offer travel services, use these dedicated endpoints that automatically set `postType: "service"`:

```
POST   /api/posts/services              - Create service (Host only)
GET    /api/posts/services              - Get all services
GET    /api/posts/services/:id          - Get single service
GET    /api/posts/services/featured/list - Get featured services
GET    /api/posts/services/my/list      - Get my services (Auth Host)
GET    /api/posts/services/host/:userId  - Get services by host
PUT    /api/posts/services/:id          - Update service (Owner)
DELETE /api/posts/services/:id          - Delete service (Owner)
```

**Benefits:** No need to specify `postType` - it's automatically set to `"service"`! Only hosts can create services.

**📚 Full Documentation:** See [SERVICES_API_DOCUMENTATION.md](./SERVICES_API_DOCUMENTATION.md) for complete details.

---

## �🎯 Who Can Post What?

| User Type | Can Post Experiences | Can Post Services | Can Post Treks |
|-----------|---------------------|-------------------|----------------|
| **Guest** | ✅ Yes              | ❌ No             | ❌ No          |
| **Host**  | ✅ Yes              | ✅ Yes            | ✅ Yes         |

---

## 📝 API Endpoints

### 1. Create a Post - Share Your Story!
**POST** `/api/posts`

Share your travel experience with the world! Upload photos and videos, describe your adventure, and inspire others to explore.

**Authentication:** Required (you must be logged in)

**Content-Type:** `multipart/form-data`

#### Experience Sharing - Perfect for Travelers

> **💡 Tip:** For cleaner code, use the dedicated `/api/posts/experiences` endpoint instead. See [EXPERIENCES_API_DOCUMENTATION.md](./EXPERIENCES_API_DOCUMENTATION.md)

**Example: Sharing Your Mountain Adventure**
```javascript
// Form Data
{
  postType: "experience",  // Note: Use /api/posts/experiences to skip this field!
  title: "Solo Trek to Kedarkantha Peak - A Life-Changing Journey",
  description: "I embarked on this incredible 6-day solo trek through the Himalayas. The snow-capped peaks, pristine forests, and the warmth of local villagers made this an unforgettable experience. Here's my story...",
  
  location: {
    "city": "Sankri",
    "state": "Uttarakhand",
    "country": "India"
  },
  
  // Optional: If you want to mention costs
  pricePerPerson: 18000,
  
  // Optional: Trek details
  duration: {
    "days": 6,
    "nights": 5
  },
  difficulty: "Moderate",
  
  // Tags to help others find your post
  categories: ["Adventure", "Mountain", "Snow", "Solo Travel"],
  
  // Your photos (max 10 images, 3MB each)
  photos: [summit_photo.jpg, campsite.jpg, sunrise.jpg],
  
  // Your videos (max 5 videos, 3MB each)
  videos: [trek_journey.mp4]
}
```

#### Request Fields Explained

**Required Fields:**
- `postType` (string): Type of post
  - `"experience"` - Share your travel story (all users)
  - `"service"` - Offer a service (hosts only)
  - `"trek"` - Offer a trek package (hosts only)
- `title` (string): Eye-catching title for your post
- `description` (string): Detailed description of your experience

**Location (object):**
```javascript
location: {
  city: "Mumbai",      // City name
  state: "Maharashtra", // State/Province
  country: "India"      // Country
}
```

**Media Uploads:**
- `photos` (files[]): Upload up to 10 photos (max 3MB each)
- `videos` (files[]): Upload up to 5 videos (max 3MB each)
- Supported formats: JPEG, PNG, MP4, MOV

**Optional - Price Information:**
- `priceTotal` (number): Total cost of your trip
- `pricePerPerson` (number): Per-person cost

**Optional - Trip Details:**
- `duration` (object): Trip duration
  ```javascript
  duration: {
    days: 6,
    nights: 5
  }
  ```
- `difficulty` (string): Difficulty level
  - Valid values: `"Easy"`, `"Easy-Moderate"`, `"Moderate"`, `"Moderate-Difficult"`, `"Difficult"`, `"Challenging"`

**Optional - Categories/Tags:**
- `categories` (array): Help others discover your post
  - Available: `Adventure`, `Wildlife`, `Spiritual`, `Cultural`, `Beach`, `Mountain`, `Desert`, `Forest`, `Historical`, `Pilgrimage`, `Snow`, `Camping`, `Backpacking`, `Photography`, `Nature`, `Luxury`, `Budget`, `Solo Travel`, `Family Trip`

**Optional - Additional Features:**
- `amenities` (array): What was included? (Guide, Meals, Transport, etc.)
- `maxPeople` (number): Group size (if applicable)
- `availability` (object): When did you go or when is it available?
  ```javascript
  availability: {
    startDate: "2025-01-01",
    endDate: "2025-01-10",
    isAvailable: true
  }
  ```

#### Success Response
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "_id": "67abc123def456789",
    "user": "65xyz789abc123456",
    "userRole": "guest",
    "postType": "experience",
    "title": "Solo Trek to Kedarkantha Peak",
    "description": "I embarked on this incredible 6-day...",
    "photos": [
      {
        "url": "https://res.cloudinary.com/your-app/image/upload/v1234567890/photo1.jpg",
        "public_id": "posts/photo1",
        "resource_type": "image"
      }
    ],
    "videos": [
      {
        "url": "https://res.cloudinary.com/your-app/video/upload/v1234567890/video1.mp4",
        "public_id": "posts/video1",
        "resource_type": "video"
      }
    ],
    "location": {
      "city": "Sankri",
      "state": "Uttarakhand",
      "country": "India"
    },
    "price": {
      "perPerson": 18000
    },
    "duration": {
      "days": 6,
      "nights": 5
    },
    "difficulty": "Moderate",
    "categories": ["Adventure", "Mountain", "Snow", "Solo Travel"],
    "isFeatured": false,
    "status": "active",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

#### Error Responses
```json
// Missing authentication
{
  "success": false,
  "message": "Authentication required"
}

// Missing required fields
{
  "success": false,
  "message": "Title and description are required"
}

// Invalid post type
{
  "success": false,
  "message": "Invalid post type. Must be one of: 'experience', 'service', 'trek'"
}

// Permission denied (guest trying to post service/trek)
{
  "success": false,
  "message": "Guests can only post 'experience'. Hosts can post 'service' and 'trek' as well."
}

// File too large
{
  "success": false,
  "message": "File size too large. Maximum size is 3MB per file"
}
```

---

### 2. Explore All Posts - Discover Adventures
**GET** `/api/posts`

Browse through all shared experiences and adventures. Filter by location, difficulty, price range, and more!

**Authentication:** Not required (public access)

#### Query Parameters - Find Exactly What You're Looking For

**Filter by Type:**
- `postType` - Filter by type: `experience`, `service`, or `trek`

**Filter by Location:**
- `city` - Find posts from a specific city (e.g., `Mumbai`)
- `state` - Find posts from a state (e.g., `Maharashtra`)
- `country` - Find posts from a country (e.g., `India`)

**Filter by User:**
- `userRole` - Filter by poster: `guest` or `host`

**Filter by Price:**
- `minPrice` - Minimum price per person (e.g., `5000`)
- `maxPrice` - Maximum price per person (e.g., `20000`)

**Filter by Difficulty:**
- `difficulty` - Trek difficulty: `Easy`, `Moderate`, `Difficult`, etc.

**Filter by Categories:**
- `categories` - Comma-separated tags (e.g., `Adventure,Mountain,Snow`)

**Other Filters:**
- `isFeatured` - Show featured posts only: `true` or `false`
- `status` - Post status: `active` (default), `inactive`, `pending`, `archived`

**Pagination:**
- `page` - Page number (default: 1)
- `limit` - Posts per page (default: 20, max: 100)

#### Example Requests

**Find adventure experiences in India:**
```
GET /api/posts?postType=experience&country=India&categories=Adventure
```

**Find budget-friendly treks:**
```
GET /api/posts?postType=trek&maxPrice=15000&difficulty=Moderate&page=1&limit=10
```

**Find mountain experiences in Uttarakhand:**
```
GET /api/posts?categories=Mountain&state=Uttarakhand
```

#### Success Response
```json
{
  "success": true,
  "count": 10,           // Number of posts in current page
  "total": 45,           // Total number of posts matching filter
  "page": 1,             // Current page number
  "totalPages": 5,       // Total pages available
  "posts": [
    {
      "_id": "67abc123def456789",
      "user": {
        "firstname": "Priya",
        "lastname": "Sharma",
        "email": "priya@example.com",
        "role": "guest"
      },
      "title": "Solo Trek to Kedarkantha Peak",
      "postType": "experience",
      "description": "An incredible 6-day journey...",
      "photos": [...],
      "location": {
        "city": "Sankri",
        "state": "Uttarakhand",
        "country": "India"
      },
      "price": {
        "perPerson": 18000
      },
      "duration": {
        "days": 6,
        "nights": 5
      },
      "difficulty": "Moderate",
      "categories": ["Adventure", "Mountain", "Snow"],
      "isFeatured": false,
      "status": "active",
      "createdAt": "2025-01-15T10:30:00.000Z"
    },
    // ... more posts
  ]
}
```

---

### 3. Get Trek Packages - For Adventure Seekers
**GET** `/api/posts/treks`

Discover all available trek packages with advanced filtering and sorting options.

**Authentication:** Not required (public access)

#### Query Parameters

**All filters from "Get All Posts" plus:**

**Duration Filters:**
- `minDays` - Minimum trek duration in days (e.g., `3`)
- `maxDays` - Maximum trek duration in days (e.g., `10`)

**Sorting Options:**
- `sortBy` - Sort field:
  - `createdAt` - Newest first (default)
  - `price.perPerson` - Sort by price
  - `duration.days` - Sort by trek length
  - `difficulty` - Sort by difficulty
  - `title` - Alphabetical
- `order` - Sort direction: `asc` (ascending) or `desc` (descending, default)

#### Example Requests

**Weekend treks under ₹10,000:**
```
GET /api/posts/treks?maxDays=3&maxPrice=10000&sortBy=price.perPerson&order=asc
```

**Moderate difficulty Himalayan treks:**
```
GET /api/posts/treks?difficulty=Moderate&state=Uttarakhand&categories=Mountain,Snow
```

**Long treks sorted by duration:**
```
GET /api/posts/treks?minDays=7&sortBy=duration.days&order=desc
```

#### Success Response
```json
{
  "success": true,
  "count": 8,
  "total": 25,
  "page": 1,
  "totalPages": 3,
  "treks": [
    {
      "_id": "67abc123def456789",
      "user": {
        "firstname": "Rahul",
        "lastname": "Verma",
        "email": "rahul@example.com",
        "role": "host"
      },
      "title": "Kedarkantha Winter Trek",
      "postType": "trek",
      "description": "Experience the magic of Himalayan winter...",
      "photos": [...],
      "location": {
        "city": "Sankri",
        "state": "Uttarakhand",
        "country": "India"
      },
      "price": {
        "perPerson": 12000,
        "total": 12000
      },
      "duration": {
        "days": 6,
        "nights": 5
      },
      "difficulty": "Moderate",
      "categories": ["Adventure", "Mountain", "Snow"],
      "capacity": {
        "maxPeople": 15
      },
      "amenities": ["Guide", "Camping Equipment", "Meals", "First Aid"],
      "isFeatured": true,
      "status": "active",
      "createdAt": "2025-01-10T08:00:00.000Z"
    },
    // ... more treks
  ]
}
```

---

### 4. Get Featured Treks - Top Picks
**GET** `/api/posts/featured/treks`

Get handpicked featured trek packages - the best of the best!

**Authentication:** Not required (public access)

**Query Parameters:**
- `limit` - Number of featured treks to return (default: 10)

**Example:**
```
GET /api/posts/featured/treks?limit=5
```

**Success Response:**
```json
{
  "success": true,
  "count": 5,
  "posts": [
    // ... featured trek posts
  ]
}
```

---

### 5. Get Single Post - View Full Details
**GET** `/api/posts/:id`

View the complete details of a specific post, including all photos, videos, and information.

**Authentication:** Not required (public access)

**Parameters:**
- `:id` - The unique ID of the post

**Example:**
```
GET /api/posts/67abc123def456789
```

**Success Response:**
```json
{
  "success": true,
  "post": {
    "_id": "67abc123def456789",
    "user": {
      "firstname": "Anjali",
      "lastname": "Patel",
      "email": "anjali@example.com",
      "role": "guest"
    },
    "title": "My Spiritual Journey to Rishikesh",
    "description": "A transformative 5-day spiritual retreat in the yoga capital of the world...",
    "postType": "experience",
    "photos": [
      {
        "url": "https://res.cloudinary.com/...",
        "public_id": "posts/photo1"
      }
    ],
    "videos": [...],
    "location": {
      "city": "Rishikesh",
      "state": "Uttarakhand",
      "country": "India"
    },
    "categories": ["Spiritual", "Yoga", "Nature"],
    "duration": {
      "days": 5,
      "nights": 4
    },
    "price": {
      "perPerson": 8000
    },
    "status": "active",
    "isFeatured": false,
    "createdAt": "2025-01-12T14:30:00.000Z",
    "updatedAt": "2025-01-12T14:30:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Post not found"
}
```

---

### 6. View User's Posts - Explore Someone's Adventures
**GET** `/api/posts/user/:userId`

See all the experiences and adventures shared by a specific user. Great for following inspiring travelers!

**Authentication:** Not required (public access)

**Parameters:**
- `:userId` - The unique ID of the user

**Example:**
```
GET /api/posts/user/65xyz789abc123456
```

**Success Response:**
```json
{
  "success": true,
  "count": 12,
  "posts": [
    {
      "_id": "...",
      "title": "Hiking in the Himalayas",
      "postType": "experience",
      "photos": [...],
      "location": {...},
      "createdAt": "2025-01-10T10:00:00.000Z"
    },
    // ... more posts from this user
  ]
}
```

---

### 7. Get My Posts - View Your Shared Stories
**GET** `/api/posts/my/posts`

View all the experiences and posts you've shared with the community.

**Authentication:** Required (must be logged in)

**Example:**
```
GET /api/posts/my/posts
```

**Success Response:**
```json
{
  "success": true,
  "count": 8,
  "posts": [
    {
      "_id": "...",
      "title": "My Solo Backpacking Trip",
      "postType": "experience",
      "photos": [...],
      "videos": [...],
      "status": "active",
      "createdAt": "2025-01-08T12:00:00.000Z"
    },
    // ... your other posts
  ]
}
```

---

### 8. Update Your Post - Edit Your Story
**PUT** `/api/posts/:id`

Update your shared experience or post. Only you (the owner) can edit your posts.

**Authentication:** Required (must be logged in)

**Content-Type:** `application/json`

**Parameters:**
- `:id` - The ID of your post to update

**What You Can Update:**
- Title, description, location
- Price information
- Duration, difficulty, categories
- Amenities, capacity, availability
- Status (active, inactive, etc.)

**Example Request:**
```json
{
  "title": "Updated: My Epic Himalayan Adventure",
  "description": "Updated description with more details...",
  "pricePerPerson": 20000,
  "difficulty": "Moderate-Difficult",
  "status": "active",
  "location": {
    "city": "Manali",
    "state": "Himachal Pradesh",
    "country": "India"
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "post": {
    // ... updated post data
  }
}
```

**Error Responses:**
```json
// Not your post
{
  "success": false,
  "message": "You can only edit your own posts"
}

// Post not found
{
  "success": false,
  "message": "Post not found"
}
```

---

### 9. Delete Your Post - Remove Your Story
**DELETE** `/api/posts/:id`

Permanently delete one of your posts. This will also remove all associated photos and videos from cloud storage.

**Authentication:** Required (must be logged in)

**Parameters:**
- `:id` - The ID of your post to delete

**Example:**
```
DELETE /api/posts/67abc123def456789
```

**Success Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

**Error Responses:**
```json
// Not your post
{
  "success": false,
  "message": "You can only delete your own posts"
}

// Post not found
{
  "success": false,
  "message": "Post not found"
}
```

---

## 📚 Understanding Post Types

### 🌟 Experience Posts
**Best for:** Sharing your travel stories and adventures

**Who can create:** Anyone (Guests and Hosts)

**Perfect for:**
- Solo travel adventures
- Group trip experiences
- Cultural experiences
- Food and culinary journeys
- Photography expeditions
- Spiritual journeys
- Beach vacations
- Mountain adventures

**Example:** "My 10-Day Backpacking Trip Across Rajasthan"

**Features:**
- ✅ Photos and videos
- ✅ Location details
- ✅ Optional cost information
- ✅ Duration and categories
- ✅ Personal story and tips

---

### 🏔️ Trek Posts
**Best for:** Professional trek organizers offering guided expeditions

**Who can create:** Hosts only

**Perfect for:**
- Multi-day trekking packages
- Mountain expeditions
- Adventure tours
- Guided hiking trips

**Example:** "Kedarkantha Winter Trek - 6 Days Package"

**Features:**
- ✅ Photos and videos
- ✅ Difficulty level
- ✅ Duration (days/nights)
- ✅ Price per person
- ✅ Maximum group size
- ✅ Included amenities
- ✅ Availability calendar

---

### 🛎️ Service Posts
**Best for:** Offering travel-related services

**Who can create:** Hosts only

**Perfect for:**
- Homestays and accommodations
- Guided tours
- Transportation services
- Travel photography
- Equipment rentals
- Car/bike rentals
- Local guide services

**Example:** "Cozy Mountain Homestay in Manali"

**Features:**
- ✅ Photos and videos (10 + 5)
- ✅ Service description
- ✅ Location with meeting point
- ✅ Duration (days/nights)
- ✅ Pricing options (per person, per night, per hour, etc.)
- ✅ Maximum capacity
- ✅ Amenities included
- ✅ Availability calendar

---

## 📋 Service Post Fields

### Required Fields:
```javascript
{
  title: "Professional Photography Services",       // Required
  description: "I offer professional photography..." // Required
}
```

### Location & Trip Details:
```javascript
{
  location: {
    city: "Manali",                    // City name
    state: "Himachal Pradesh",         // State/Province
    country: "India",                  // Country
    meetingPoint: "Mall Road, Near Bus Stand" // Meeting point/landmark (NEW)
  }
}
```

### Duration & Capacity:
```javascript
{
  duration: {
    days: 1,      // Number of days
    nights: 0     // Number of nights
  },
  capacity: {
    maxPeople: 6  // Maximum people allowed
  }
}
```

### Pricing:
```javascript
{
  price: {
    total: 20000,          // Total price (optional)
    perPerson: 4000,       // Price per person
    period: "person",      // Charged per: "person", "night", "hour", "day", "total"
    currency: "INR"        // Default: INR
  }
}
```

### Amenities:
```javascript
{
  amenities: ["WiFi", "Parking", "Kitchen", "Meals", "Guide", "Equipment"]
}
```

### Availability:
```javascript
{
  availability: {
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    isAvailable: true
  }
}
```

### Categories:
```javascript
{
  categories: ["Luxury", "Mountain", "Photography", "Adventure"]
}
```

### Media Files:
- `photos`: Up to 10 images (max 3MB each)
- `videos`: Up to 5 videos (max 3MB each)

---

## 🚀 Create Service Example

### Using Dedicated Service Endpoint:
```javascript
POST /api/posts/services
Authorization: Bearer <HOST_TOKEN>
Content-Type: multipart/form-data

// Form Data
{
  title: "Cozy Mountain Homestay in Manali",
  description: "Beautiful homestay with valley views. Perfect for families.",
  
  // Location
  city: "Manali",
  state: "Himachal Pradesh",
  country: "India",
  meetingPoint: "Mall Road, Near HDFC Bank",
  
  // Duration & Capacity
  days: 1,
  nights: 0,
  maxPeople: 6,
  
  // Pricing
  pricePerPerson: 2500,
  period: "night",
  
  // Amenities
  amenities: ["WiFi", "Parking", "Kitchen", "Bonfire"],
  
  // Categories
  categories: ["Luxury", "Mountain", "Nature"],
  
  // Media
  photos: [file1, file2, file3],
  
  // Availability
  availability: {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "isAvailable": true
  }
}
```

### Response:
```json
{
  "success": true,
  "message": "Service created successfully",
  "service": {
    "_id": "67abc123def456789",
    "user": "65xyz789abc123456",
    "userRole": "host",
    "postType": "service",
    "title": "Cozy Mountain Homestay in Manali",
    "description": "Beautiful homestay with valley views...",
    "photos": [
      {
        "url": "https://res.cloudinary.com/.../photo1.jpg",
        "public_id": "posts/photo1",
        "resource_type": "image"
      }
    ],
    "location": {
      "city": "Manali",
      "state": "Himachal Pradesh",
      "country": "India",
      "meetingPoint": "Mall Road, Near HDFC Bank"
    },
    "duration": {
      "days": 1,
      "nights": 0
    },
    "price": {
      "perPerson": 2500,
      "period": "night",
      "currency": "INR"
    },
    "capacity": {
      "maxPeople": 6
    },
    "amenities": ["WiFi", "Parking", "Kitchen", "Bonfire"],
    "categories": ["Luxury", "Mountain", "Nature"],
    "availability": {
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T00:00:00.000Z",
      "isAvailable": true
    },
    "status": "active",
    "isFeatured": false,
    "createdAt": "2025-12-18T10:30:00.000Z",
    "updatedAt": "2025-12-18T10:30:00.000Z"
  }
}
```

---

## 🔍 Get All Services

```javascript
GET /api/posts/services

// Filter by location
GET /api/posts/services?city=Manali&state=Himachal Pradesh

// Filter by price range
GET /api/posts/services?minPrice=1000&maxPrice=5000

// Filter by categories
GET /api/posts/services?categories=Luxury,Mountain

// Pagination
GET /api/posts/services?page=1&limit=20
```

### Query Parameters:
- `city` - Filter by city
- `state` - Filter by state
- `country` - Filter by country
- `minPrice` - Minimum price per person
- `maxPrice` - Maximum price per person
- `categories` - Comma-separated categories
- `isFeatured` - Show featured only (true/false)
- `status` - Filter by status (default: active)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

### Response:
```json
{
  "success": true,
  "count": 15,
  "total": 45,
  "page": 1,
  "totalPages": 3,
  "services": [
    {
      "_id": "67abc123",
      "title": "Cozy Mountain Homestay",
      "location": {
        "city": "Manali",
        "meetingPoint": "Mall Road"
      },
      "price": { "perPerson": 2500 },
      "photos": [...]
    }
  ]
}
```

---

## 📍 Get Single Service

```javascript
GET /api/posts/services/:id
```

### Response:
```json
{
  "success": true,
  "service": {
    "_id": "67abc123",
    "user": {
      "firstname": "Rajesh",
      "lastname": "Kumar",
      "email": "rajesh@example.com",
      "role": "host"
    },
    "title": "Cozy Mountain Homestay",
    "description": "Beautiful homestay...",
    "location": {
      "city": "Manali",
      "state": "Himachal Pradesh",
      "country": "India",
      "meetingPoint": "Mall Road, Near HDFC Bank"
    },
    "duration": { "days": 1, "nights": 0 },
    "price": { "perPerson": 2500, "period": "night" },
    "capacity": { "maxPeople": 6 },
    "amenities": ["WiFi", "Parking"],
    "availability": { "isAvailable": true }
  }
}
```

---

## ⭐ Get Featured Services

```javascript
GET /api/posts/services/featured/list?limit=10
```

---

## 👤 Get My Services (Host)

```javascript
GET /api/posts/services/my/list
Authorization: Bearer <HOST_TOKEN>
```

---

## 🏠 Get Services by Host

```javascript
GET /api/posts/services/host/:userId
```

---

## ✏️ Update Service

```javascript
PUT /api/posts/services/:id
Authorization: Bearer <OWNER_TOKEN>
Content-Type: application/json

{
  "title": "Updated Title",
  "pricePerPerson": 3000,
  "status": "active",
  "amenities": ["WiFi", "Parking", "Kitchen", "Garden"]
}
```

---

## 🗑️ Delete Service

```javascript
DELETE /api/posts/services/:id
Authorization: Bearer <OWNER_TOKEN>
```

---

## 🆚 Posts vs Itineraries - What's the Difference?

| Feature | Posts API | Itineraries API |
|---------|-----------|-----------------|
| **Purpose** | Share completed experiences & offer services | Plan upcoming trips & find companions |
| **Type** | Experience, Service, Trek | Trip Plan only |
| **Media** | ✅ Photos & Videos (10 + 5) | ❌ No media |
| **Who Posts** | Guests (experience only), Hosts (all) | Everyone |
| **Best For** | Showing what you've done | Planning what you'll do |
| **Example** | "My amazing Goa trip" | "Planning a Goa trip in March" |

**Quick Rule:** 
- Already traveled? → Use **Posts** to share your experience
- Planning to travel? → Use **Itineraries** to find companions

---

## 💡 Tips for Creating Great Posts

### 1. Write Engaging Titles
**Good:** "Solo Trek to Kedarkantha Peak - A Life-Changing Journey"
**Bad:** "Trek"

### 2. Tell Your Story
Include:
- What made it special?
- Challenges you faced
- Tips for others
- Best moments
- Cost breakdown

### 3. Use High-Quality Photos
- Upload clear, well-lit images
- Show different aspects (landscape, activities, people)
- Maximum 10 photos - choose your best ones!

### 4. Add Accurate Details
- Exact location (helps others find it)
- Real costs (helps with planning)
- Difficulty level (sets expectations)
- Duration (helps with time planning)

### 5. Use Relevant Categories
Help others discover your post by using appropriate tags:
- Adventure, Mountain, Beach, Cultural, Spiritual, etc.

---

## 📱 Example Code Snippets

### JavaScript/Node.js - Share an Experience

```javascript
// Prepare your post data
const formData = new FormData();
formData.append('postType', 'experience');
formData.append('title', 'Incredible Ladakh Adventure - 15 Days');
formData.append('description', `
  Just returned from an epic 15-day journey through Ladakh. 
  Highlights include:
  - Visiting Pangong Lake
  - Crossing Khardung La Pass (World's highest motorable road!)
  - Staying with local families
  - Trying authentic Tibetan cuisine
  
  Total cost: ₹35,000 including everything.
  Best time to visit: June-September
`);

// Location details
formData.append('location', JSON.stringify({
  city: 'Leh',
  state: 'Ladakh',
  country: 'India'
}));

// Trip details
formData.append('duration', JSON.stringify({
  days: 15,
  nights: 14
}));
formData.append('pricePerPerson', '35000');
formData.append('difficulty', 'Moderate');
formData.append('categories', JSON.stringify([
  'Adventure',
  'Mountain',
  'Cultural',
  'Photography'
]));

// Add your photos (from file input)
const photoInput = document.getElementById('photoInput');
for (let i = 0; i < photoInput.files.length; i++) {
  formData.append('photos', photoInput.files[i]);
}

// Upload video (optional)
const videoInput = document.getElementById('videoInput');
if (videoInput.files[0]) {
  formData.append('videos', videoInput.files[0]);
}

// Send the request
fetch('https://your-api.com/api/posts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Post created!', data.post);
    alert('Your experience has been shared! 🎉');
  } else {
    alert('Error: ' + data.message);
  }
})
.catch(error => {
  console.error('Error:', error);
  alert('Failed to create post');
});
```

### React - Browse Experiences

```javascript
import { useState, useEffect } from 'react';

function ExperienceBrowser() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    country: 'India',
    postType: 'experience',
    categories: 'Adventure,Mountain',
    page: 1,
    limit: 12
  });

  useEffect(() => {
    fetchExperiences();
  }, [filters]);

  const fetchExperiences = async () => {
    setLoading(true);
    const queryParams = new URLSearchParams(filters).toString();
    
    try {
      const response = await fetch(`/api/posts?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setExperiences(data.posts);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Explore Travel Experiences</h1>
      
      {/* Filters */}
      <div className="filters">
        <select 
          value={filters.country}
          onChange={(e) => setFilters({...filters, country: e.target.value})}
        >
          <option value="">All Countries</option>
          <option value="India">India</option>
          <option value="Nepal">Nepal</option>
          {/* More options */}
        </select>
        
        <select 
          value={filters.categories}
          onChange={(e) => setFilters({...filters, categories: e.target.value})}
        >
          <option value="">All Categories</option>
          <option value="Adventure">Adventure</option>
          <option value="Beach">Beach</option>
          <option value="Mountain">Mountain</option>
          {/* More options */}
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <p>Loading amazing experiences...</p>
      ) : (
        <div className="experience-grid">
          {experiences.map(exp => (
            <div key={exp._id} className="experience-card">
              <img src={exp.photos[0]?.url} alt={exp.title} />
              <h3>{exp.title}</h3>
              <p>{exp.description.substring(0, 150)}...</p>
              <div className="meta">
                <span>📍 {exp.location.city}, {exp.location.country}</span>
                {exp.price?.perPerson && (
                  <span>💰 ₹{exp.price.perPerson}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExperienceBrowser;
```

### Python - Search for Treks

```python
import requests

def search_treks(country='India', difficulty='Moderate', max_price=20000):
    """Search for trek packages with filters"""
    
    url = 'https://your-api.com/api/posts/treks'
    params = {
        'country': country,
        'difficulty': difficulty,
        'maxPrice': max_price,
        'sortBy': 'price.perPerson',
        'order': 'asc',
        'page': 1,
        'limit': 10
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data['success']:
        print(f"Found {data['total']} treks matching your criteria:\n")
        
        for trek in data['treks']:
            print(f"🏔️  {trek['title']}")
            print(f"   Location: {trek['location']['city']}, {trek['location']['state']}")
            print(f"   Duration: {trek['duration']['days']} days")
            print(f"   Difficulty: {trek['difficulty']}")
            print(f"   Price: ₹{trek['price']['perPerson']} per person")
            print(f"   Max Group: {trek['capacity']['maxPeople']} people")
            print()
    else:
        print(f"Error: {data['message']}")

# Usage
search_treks(country='India', difficulty='Moderate', max_price=15000)
```

---

## 🔒 Authentication

Most endpoints require authentication using a JWT token. Include it in the Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

**How to get a token:**
1. Register/Login using the `/api/users/register` or `/api/users/login` endpoints
2. Store the received token securely
3. Include it in all authenticated requests

---

## 📝 File Upload Best Practices

### Size Limits
- Each photo: Max 3MB
- Each video: Max 3MB
- Total per post: Stay under 30MB to avoid timeouts

### Optimization Tips
1. **Resize images before upload**
   - Recommended: 1920x1080px for photos
   - Use tools like TinyPNG or ImageOptim

2. **Compress videos**
   - Recommended: 720p resolution
   - Use HandBrake or similar tools

3. **Supported formats**
   - Images: JPG, PNG, WEBP (JPG recommended for smaller size)
   - Videos: MP4, MOV (MP4 recommended)

### Example: Image Compression in JavaScript

```javascript
function compressImage(file, maxWidth = 1920) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          }));
        }, 'image/jpeg', 0.8);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Usage
const compressedFile = await compressImage(originalFile);
formData.append('photos', compressedFile);
```

---

## ❌ Common Errors & Solutions

### Error: "File size too large"
**Problem:** Your file exceeds 3MB
**Solution:** Compress your photos/videos before uploading

### Error: "Guests can only post 'experience'"
**Problem:** You're trying to post a trek or service as a guest
**Solution:** 
- Either change to an experience post
- Or contact admin to upgrade to host account

### Error: "Title and description are required"
**Problem:** Missing required fields
**Solution:** Ensure you include both title and description

### Error: "Authentication required"
**Problem:** Not logged in or invalid token
**Solution:** 
- Login first using `/api/users/login`
- Include the token in Authorization header

### Error: "You can only edit your own posts"
**Problem:** Trying to edit someone else's post
**Solution:** You can only edit posts that you created

---

## 🎨 Response Format Reference

### Post Object Structure
```typescript
interface Post {
  _id: string;                    // Unique post ID
  user: User | string;            // Post creator info or ID
  userRole: 'guest' | 'host';     // Creator's role
  postType: 'experience' | 'service' | 'trek';
  
  // Basic info
  title: string;
  description: string;
  
  // Media
  photos: Media[];
  videos: Media[];
  
  // Location
  location: {
    city?: string;
    state?: string;
    country?: string;
  };
  
  // Pricing
  price?: {
    total?: number;
    perPerson?: number;
  };
  
  // Trek-specific
  duration?: {
    days: number;
    nights: number;
  };
  difficulty?: string;
  categories?: string[];
  amenities?: string[];
  
  // Capacity
  capacity?: {
    maxPeople?: number;
  };
  
  // Availability
  availability?: {
    startDate?: string;
    endDate?: string;
    isAvailable?: boolean;
  };
  
  // Status
  status: 'active' | 'inactive' | 'pending' | 'archived';
  isFeatured: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

interface Media {
  url: string;
  public_id: string;
  resource_type: 'image' | 'video';
}

interface User {
  firstname: string;
  lastname: string;
  email: string;
  role: 'guest' | 'host';
}
```

---

## 🚀 Quick Start Guide

### For Travelers (Guests) - Share Your Experience

1. **Login** to your account
2. **Prepare your content:**
   - Choose your best photos (max 10)
   - Write an engaging title
   - Describe your experience in detail
3. **Create post:**
   
   **Recommended - Using dedicated endpoint:**
   ```javascript
   POST /api/posts/experiences  // postType is automatic!
   title: "Your Title"
   description: "Your Story"
   photos: [files]
   ```
   
   **Alternative - Using general endpoint:**
   ```javascript
   POST /api/posts
   postType: "experience"  // Must specify manually
   title: "Your Title"
   description: "Your Story"
   photos: [files]
   ```
4. **Share** your post ID with friends!

### For Trek Organizers (Hosts) - List Your Trek

1. **Login** as a host
2. **Prepare trek details:**
   - Professional photos of the trek route
   - Detailed itinerary in description
   - Pricing and group size
   - Difficulty level and duration
3. **Create trek post:**
   
   **Recommended - Using dedicated endpoint:**
   ```javascript
   POST /api/posts/treks  // postType is automatic!
   title: "Trek Name"
   pricePerPerson: 15000
   duration: {days: 6, nights: 5}
   difficulty: "Moderate"
   ```
   
   **Alternative - Using general endpoint:**
   ```javascript
   POST /api/posts
   postType: "trek"  // Must specify manually
   title: "Trek Name"
   pricePerPerson: 15000
   duration: {days: 6, nights: 5}
   difficulty: "Moderate"
   ```
4. **Promote** your trek!

---

## � API Comparison: General vs Dedicated Endpoints

### Which Endpoint Should I Use?

| Feature | General `/api/posts` | Dedicated Endpoints |
|---------|---------------------|---------------------|
| **Must specify postType** | ✅ Yes | ❌ No (automatic) |
| **Code cleanliness** | Good | **Excellent** ✨ |
| **Filtering specificity** | General | **Optimized** ✨ |
| **Semantic clarity** | Good | **Excellent** ✨ |
| **Error prevention** | Good | **Better** ✨ |
| **Use case** | Multiple types | Single type |

### Examples Comparison

**General Endpoint (Old way):**
```javascript
// Must specify postType manually
const formData = new FormData();
formData.append("postType", "experience");  // Easy to forget or typo!
formData.append("title", "My Trek");
// ... more fields
```

**Dedicated Endpoint (Recommended):**
```javascript
// postType is automatic!
const formData = new FormData();
// No postType needed - cleaner code!
formData.append("title", "My Trek");
// ... more fields

// POST to /api/posts/experiences instead
```

### Recommendation
✅ **Use dedicated endpoints** (`/experiences`, `/services`, `/treks`) for cleaner, more maintainable code
✅ **Use general endpoint** only when you need to work with multiple post types in one call

---

## 📞 Support & Resources

- **API Base URL:** `https://your-api.com/api/posts`
- **Dedicated Endpoints:**
  - [Experiences API](./EXPERIENCES_API_DOCUMENTATION.md) - For sharing travel experiences
  - [Quick Reference](./EXPERIENCES_API_QUICK_REFERENCE.md) - Experience endpoints cheat sheet
- **Related APIs:** 
  - [Itineraries API](./ITINERARY_API_DOCUMENTATION.md) - For trip planning
  - [Reviews API](./REVIEWS_API_DOCUMENTATION.md) - For rating experiences
  - [Users API](./API_DOCUMENTATION.md) - For authentication

---

**Happy Sharing! 🌟** 

Share your adventures, inspire others, and build a community of passionate travelers!
