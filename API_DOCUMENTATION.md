# Athithya Backend API Documentation

## Featured Treks & Experiences API

This API allows hosts to create, manage, and showcase featured treks and experiences similar to the interface shown.

---

## Base URL
```
http://localhost:3000/api
```

---

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Create Trek/Experience (Host Only)

**POST** `/api/posts`

Create a new trek or experience post.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (Form Data):**
```javascript
{
  "postType": "trek",                    // Required: "trek", "experience", "service", "plan"
  "title": "Kedarkantha Summit Trek",   // Required
  "description": "Experience the...",    // Required
  "duration": {                          // For treks
    "days": 5,
    "nights": 4
  },
  "difficulty": "Easy-Moderate",         // "Easy", "Easy-Moderate", "Moderate", "Moderate-Difficult", "Difficult", "Challenging"
  "isFeatured": true,                    // Boolean - for featured section
  "location": {
    "city": "Dehradun",
    "state": "Uttarakhand",
    "country": "India",
    "coordinates": {                     // OPTIONAL - For nearby search feature
      "type": "Point",                   // Required if coordinates included
      "coordinates": [78.0322, 30.3165]  // [LONGITUDE, LATITUDE] - Order matters!
    }
  },
  "price": {
    "perPerson": 7999,
    "currency": "INR"
  },
  "photos": [<files>],                   // Up to 10 images
  "videos": [<files>],                   // Up to 5 videos
  "availability": {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "isAvailable": true
  },
  "capacity": {
    "maxPeople": 15
  }
}
```

**⚠️ Important Note About Location Coordinates:**

If you include `location.coordinates`, you MUST provide a complete array with both longitude and latitude:

```javascript
// ✅ CORRECT - Complete coordinates
"coordinates": {
  "type": "Point",
  "coordinates": [78.0322, 30.3165]  // [longitude, latitude]
}

// ✅ CORRECT - No coordinates at all (coordinates are optional)
"location": {
  "city": "Dehradun",
  "country": "India"
  // No coordinates field
}

// ❌ WRONG - Incomplete coordinates (will cause error)
"coordinates": {
  "type": "Point"
  // Missing coordinates array
}
```

**Remember:** Coordinates use `[longitude, latitude]` order, NOT `[latitude, longitude]`. See [FRONTEND_LOCATION_GUIDE.md](./FRONTEND_LOCATION_GUIDE.md) for complete details.

**Response:**
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "_id": "...",
    "title": "Kedarkantha Summit Trek",
    "postType": "trek",
    "duration": { "days": 5, "nights": 4 },
    "difficulty": "Easy-Moderate",
    "isFeatured": true,
    "price": { "perPerson": 7999, "currency": "INR" },
    "location": { "city": "Dehradun", "state": "Uttarakhand", "country": "India" },
    "photos": [...],
    "createdAt": "2025-12-10T...",
    "updatedAt": "2025-12-10T..."
  }
}
```

---

### 2. Get Featured Treks

**GET** `/api/posts/featured/treks`

Retrieve all featured treks (public endpoint).

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "posts": [
    {
      "_id": "...",
      "title": "Kedarkantha Summit Trek",
      "postType": "trek",
      "duration": { "days": 5, "nights": 4 },
      "difficulty": "Easy-Moderate",
      "price": { "perPerson": 7999, "currency": "INR" },
      "location": { "city": "Dehradun", "state": "Uttarakhand", "country": "India" },
      "photos": [...],
      "isFeatured": true,
      "user": {
        "_id": "...",
        "firstname": "John",
        "lastname": "Doe",
        "role": "host"
      }
    }
  ]
}
```

---

### 3. Get All Posts (with Filters)

**GET** `/api/posts`

Get all posts with optional filtering.

**Query Parameters:**
- `postType`: Filter by type ("trek", "experience", "service", "plan")
- `difficulty`: Filter by difficulty level
- `isFeatured`: Filter featured items (true/false)
- `city`: Filter by city
- `state`: Filter by state
- `country`: Filter by country
- `minPrice`: Minimum price per person
- `maxPrice`: Maximum price per person
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Example:**
```
GET /api/posts?postType=trek&difficulty=Moderate&isFeatured=true&limit=10
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "totalPages": 5,
  "posts": [...]
}
```

---

### 4. Get Single Post

**GET** `/api/posts/:id`

Get details of a specific post.

**Response:**
```json
{
  "success": true,
  "post": {
    "_id": "...",
    "title": "Valley of Flowers Trek",
    "description": "...",
    "postType": "trek",
    "duration": { "days": 6, "nights": 5 },
    "difficulty": "Moderate",
    "price": { "perPerson": 10499, "currency": "INR" },
    "photos": [...],
    "videos": [...],
    "user": {...}
  }
}
```

---

### 5. Get User's Posts

**GET** `/api/posts/user/:userId`

Get all posts by a specific user (public).

---

### 6. Get My Posts (Authenticated)

**GET** `/api/posts/my/posts`

Get all posts created by the authenticated user.

**Headers:**
- `Authorization: Bearer <token>`

---

### 7. Update Post

**PUT** `/api/posts/:id`

Update an existing post (owner only).

**Headers:**
- `Authorization: Bearer <token>`

**Body:** Same as create, all fields optional

---

### 8. Delete Post

**DELETE** `/api/posts/:id`

Delete a post (owner only). Also deletes associated Cloudinary media.

**Headers:**
- `Authorization: Bearer <token>`

---

## Trek/Experience Data Model

```javascript
{
  user: ObjectId,                        // Host who created the post
  userRole: "host",                      // Role of creator
  postType: "trek",                      // Type of post
  title: String,                         // Trek/Experience name
  description: String,                   // Detailed description
  
  // Trek-specific fields
  duration: {
    days: Number,                        // e.g., 5
    nights: Number                       // e.g., 4
  },
  difficulty: String,                    // Difficulty level
  isFeatured: Boolean,                   // Show in featured section
  
  // Media
  photos: [{
    url: String,
    public_id: String,
    resource_type: String
  }],
  videos: [{
    url: String,
    public_id: String,
    resource_type: String
  }],
  
  // Location
  location: {
    city: String,                        // e.g., "Jaisalmer"
    state: String,                       // e.g., "Rajasthan"
    country: String                      // e.g., "India"
  },
  
  // Pricing
  price: {
    perPerson: Number,                   // e.g., 7999
    currency: String,                    // e.g., "INR"
    period: String                       // e.g., "person"
  },
  
  // Additional fields
  amenities: [String],                   // Available amenities
  capacity: {
    maxPeople: Number                    // Maximum participants
  },
  availability: {
    startDate: Date,
    endDate: Date,
    isAvailable: Boolean
  },
  rating: {
    average: Number,
    count: Number
  },
  status: String,                        // "active", "inactive", "pending"
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Difficulty Levels

- **Easy**: Suitable for beginners
- **Easy-Moderate**: Some experience helpful
- **Moderate**: Regular fitness required
- **Moderate-Difficult**: Good fitness needed
- **Difficult**: Experienced trekkers only
- **Challenging**: Expert level

---

## Example: Creating a Featured Trek

```javascript
const formData = new FormData();
formData.append('postType', 'trek');
formData.append('title', 'Kedarkantha Summit Trek');
formData.append('description', 'Experience the magical winter wonderland...');
formData.append('duration', JSON.stringify({ days: 5, nights: 4 }));
formData.append('difficulty', 'Easy-Moderate');
formData.append('isFeatured', 'true');
formData.append('location', JSON.stringify({
  city: 'Dehradun',
  state: 'Uttarakhand',
  country: 'India'
}));
formData.append('price', JSON.stringify({
  perPerson: 7999,
  currency: 'INR'
}));
formData.append('availability', JSON.stringify({
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  isAvailable: true
}));

// Add photos
formData.append('photos', imageFile1);
formData.append('photos', imageFile2);

const response = await fetch('http://localhost:3000/api/posts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

---

### 9. Get Top-Rated Hosts

**GET** `/api/users/top-rated/hosts`

Retrieve hosts sorted by average rating from user reviews (public endpoint).

**Query Parameters:**
- `limit` (optional): Maximum number of hosts to return (default: 10)
- `minRating` (optional): Minimum average rating filter (0-5, default: 0)
- `location` (optional): Filter by city, state, or country

**Example:**
```
GET /api/users/top-rated/hosts?limit=10&minRating=4.0&location=Uttarakhand
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "hosts": [
    {
      "_id": "64f7e8a9b1234567890abcdf",
      "firstname": "Rajesh",
      "lastname": "Kumar",
      "email": "rajesh@example.com",
      "role": "host",
      "isVerified": true,
      "location": {
        "city": "Rishikesh",
        "state": "Uttarakhand",
        "country": "India"
      },
      "averageRating": 4.8,
      "reviewCount": 42,
      "totalPosts": 15,
      "activePosts": 12,
      "postsByType": {
        "trek": 8,
        "service": 4,
        "experience": 0
      }
    }
  ]
}
```

---

## Notes

1. **Host Access**: Only users with `role: "host"` can create treks and services
2. **Media Upload**: Images and videos are uploaded to Cloudinary
3. **Featured Treks**: Set `isFeatured: true` to display in the featured section
4. **Currency**: Default is INR (Indian Rupees)
5. **Sorting**: Featured posts appear first, then sorted by creation date
6. **Route Order**: Specific routes (like `/experiences`) are matched before catch-all routes (like `/:id`)

---

## Detailed Documentation

For comprehensive API documentation, refer to:
- [Experiences API](EXPERIENCES_API_DOCUMENTATION.md)
- [Services API](SERVICES_API_DOCUMENTATION.md)
- [Top-Rated Treks](TOP_RATED_TREKS_API_DOCUMENTATION.md)
- [Top-Rated Hosts](TOP_RATED_HOSTS_API_DOCUMENTATION.md)
- [Nearby Treks](NEARBY_TREKS_API_DOCUMENTATION.md)
- [Reviews API](REVIEWS_API_DOCUMENTATION.md)
- [User Profile API](USER_PROFILE_API_DOCUMENTATION.md)
- [Itinerary API](ITINERARY_API_DOCUMENTATION.md)

---

## Error Responses

```json
{
  "success": false,
  "message": "Error description"
}
```

Common error codes:
- 400: Bad Request (invalid data)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error
