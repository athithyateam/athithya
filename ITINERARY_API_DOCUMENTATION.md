# Itinerary API Documentation

## Overview
The Itinerary API allows users to create, view, update, and delete trip plans/itineraries. This API is separate from the Posts API which handles experiences.

## Base URL
```
/api/itineraries
```

## Endpoints

### 1. Create Itinerary
**POST** `/api/itineraries`

Create a new trip plan/itinerary. **Note:** Itineraries do not support photo/video uploads. Use the Posts API for sharing experiences with media.

**Authentication:** Required (Both guests and hosts can create itineraries)

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "title": "5 Day Himalayan Adventure",
  "description": "Looking for companions to join a 5-day trek in the Himalayas",
  "planName": "Himalayan Trek Plan",
  "location": {
    "city": "Manali",
    "state": "Himachal Pradesh",
    "country": "India"
  },
  "priceTotal": 15000,
  "pricePerPerson": 3000,
  "maxPeople": 5,
  "duration": {
    "days": 5,
    "nights": 4
  },
  "difficulty": "Moderate",
  "categories": ["Adventure", "Mountain", "Backpacking"],
  "tags": ["himalayas", "group-trip", "budget-friendly"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Itinerary created successfully",
  "itinerary": {
    "_id": "...",
    "user": "...",
    "postType": "plan",
    "title": "5 Day Himalayan Adventure",
    ...
  }
}
```

---

### 2. Get All Itineraries
**GET** `/api/itineraries`

Get all itineraries with optional filtering.

**Authentication:** Not required

**Query Parameters:**
- `city` - Filter by city
- `state` - Filter by state
- `country` - Filter by country
- `minPrice` - Minimum price per person
- `maxPrice` - Maximum price per person
- `difficulty` - Filter by difficulty (Easy, Easy-Moderate, Moderate, Moderate-Difficult, Difficult, Challenging)
- `categories` - Comma-separated categories (Adventure, Wildlife, Spiritual, Cultural, Beach, Mountain, Desert, Forest, Historical, Pilgrimage, Snow, Camping, Backpacking, Photography, Nature, Luxury, Budget)
- `tags` - Comma-separated tags
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Example:**
```
GET /api/itineraries?country=India&difficulty=Moderate&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "totalPages": 5,
  "itineraries": [...]
}
```

---

### 3. Get Single Itinerary
**GET** `/api/itineraries/:id`

Get a specific itinerary by ID.

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "itinerary": {
    "_id": "...",
    "user": {
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com"
    },
    "title": "5 Day Himalayan Adventure",
    ...
  }
}
```

---

### 4. Get User's Itineraries
**GET** `/api/itineraries/user/:userId`

Get all itineraries created by a specific user.

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "count": 3,
  "itineraries": [...]
}
```

---

### 5. Get My Itineraries
**GET** `/api/itineraries/my/itineraries`

Get all itineraries created by the authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "count": 5,
  "itineraries": [...]
}
```

---

### 6. Update Itinerary
**PUT** `/api/itineraries/:id`

Update an existing itinerary. Only the owner can update.

**Authentication:** Required

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "pricePerPerson": 3500,
  "maxPeople": 6,
  "status": "active",
  "difficulty": "Difficult",
  "categories": ["Adventure", "Camping"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Itinerary updated successfully",
  "itinerary": {...}
}
```

---

### 7. Delete Itinerary
**DELETE** `/api/itineraries/:id`

Delete an itinerary. Only the owner can delete.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Itinerary deleted successfully"
}
```

---

## Differences Between Posts and Itineraries

### Posts API (`/api/posts`)
- **Purpose:** Share travel experiences, services, and treks
- **Post Types:** `experience`, `service`, `trek`
- **Media Support:** ✅ Photos and videos allowed
- **Who can post:**
  - Guests: `experience`
  - Hosts: `experience`, `service`, `trek`

### Itinerary API (`/api/itineraries`)
- **Purpose:** Share trip plans and find travel companions
- **Post Type:** Always `plan`
- **Media Support:** ❌ No photos/videos (text-only)
- **Who can post:** ✅ Both guests and hosts (all authenticated users)

---

## Example Use Cases

### Creating a Trip Plan
```javascript
const itineraryData = {
  title: 'Beach Vacation in Goa',
  description: 'Looking for 2-3 people to join a week-long beach vacation',
  planName: 'Goa Beach Trip',
  pricePerPerson: 5000,
  maxPeople: 4,
  location: { 
    city: 'Goa', 
    state: 'Goa',
    country: 'India' 
  },
  duration: { 
    days: 7, 
    nights: 6 
  },
  tags: ['beach', 'relaxation', 'group-trip'],
  difficulty: 'Easy',
  categories: ['Beach', 'Nature', 'Luxury']
};

fetch('/api/itineraries', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(itineraryData)
});
```

### Searching for Trip Plans
```javascript
// Find moderate difficulty treks in India under 10000
fetch('/api/itineraries?country=India&difficulty=Moderate&maxPrice=10000')
  .then(res => res.json())
  .then(data => console.log(data.itineraries));
```

---

## Error Responses

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not the owner)
- `404` - Not Found
- `500` - Server Error
