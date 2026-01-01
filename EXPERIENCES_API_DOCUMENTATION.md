# Experiences API Documentation - Share Your Travel Stories 🌟

## Overview
The **Experiences API** provides dedicated endpoints for sharing and discovering travel experiences. With automatic `postType: "experience"` setting, you don't need to manually specify the post type - making it simpler and cleaner to use!

### Key Benefits
- ✅ **Automatic Type Setting**: No need to specify `postType`, it's automatically set to `"experience"`
- ✅ **Simplified API**: Clean, focused endpoints for experience management
- ✅ **All User Types**: Both guests and hosts can share their travel stories
- ✅ **Rich Media Support**: Upload photos (max 10) and videos (max 5)
- ✅ **Flexible Filtering**: Search by location, price, difficulty, categories, and more

## Base URL
```
/api/posts/experiences
```

## 📚 Available Endpoints

### 1. Create Experience
**POST** `/api/posts/experiences`

Share your travel experience with the community!

**Authentication:** Required

**Content-Type:** `multipart/form-data`

#### Request Fields

**Required:**
- `title` (string): Title of your experience
- `description` (string): Detailed description of your experience

**Optional:**
- `photos` (file[]): Up to 10 photos (3MB each)
- `videos` (file[]): Up to 5 videos (3MB each)
- `location` (object/string): Location details
  - `city` (string): City name
  - `state` (string): State/Province name
  - `country` (string): Country name
  - `meetingPoint` (string): Meeting point description
- `pricePerPerson` (number): Cost per person
- `maxPeople` (number): Maximum number of people
- `duration` (object/string): Duration details
  - `days` (number): Number of days
  - `nights` (number): Number of nights
- `difficulty` (string): Difficulty level (e.g., "Easy", "Moderate", "Challenging")
- `categories` (array/string): Tags/categories (e.g., ["Adventure", "Mountain", "Solo Travel"])
- `amenities` (array/string): Available amenities
- `availability` (object/string): Availability details
- `isFeatured` (boolean): Mark as featured (admin/host only)
- `period` (string): Price period (e.g., "per day", "per trip")

#### Example Request
```javascript
const formData = new FormData();
formData.append("title", "Solo Trek to Kedarkantha Peak");
formData.append("description", "An unforgettable 6-day journey through the Himalayas...");
formData.append("city", "Sankri");
formData.append("state", "Uttarakhand");
formData.append("country", "India");
formData.append("pricePerPerson", "18000");
formData.append("days", "6");
formData.append("nights", "5");
formData.append("difficulty", "Moderate");
formData.append("categories", JSON.stringify(["Adventure", "Mountain", "Snow"]));
formData.append("photos", photoFile1);
formData.append("photos", photoFile2);

// Using the experiences API
const response = await fetch("/api/posts/experiences", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`
  },
  body: formData
});
```

#### Response (201 Created)

**Response Headers:**
```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Content-Length: 945
Date: Fri, 20 Dec 2025 10:30:00 GMT
Connection: keep-alive
```

**Response Body:**
```json
{
  "success": true,
  "message": "Experience created successfully",
  "experience": {
    "_id": "64f7e8a9b1234567890abcde",
    "postType": "experience",
    "title": "Solo Trek to Kedarkantha Peak",
    "description": "An unforgettable 6-day journey through the pristine snow-covered trails of Kedarkantha. This moderate difficulty trek offers breathtaking views of the Himalayan peaks, dense pine forests, and serene alpine meadows. Perfect for winter trekking enthusiasts!",
    "user": {
      "_id": "64f7e8a9b1234567890abcdf",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "role": "guest"
    },
    "photos": [
      {
        "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/experiences/kedarkantha_summit.jpg",
        "public_id": "experiences/abc123",
        "resource_type": "image"
      },
      {
        "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/experiences/kedarkantha_trail.jpg",
        "public_id": "experiences/abc124",
        "resource_type": "image"
      }
    ],
    "videos": [],
    "location": {
      "city": "Sankri",
      "state": "Uttarakhand",
      "country": "India",
      "address": "Sankri Village, Uttarkashi District",
      "meetingPoint": "Sankri Village Square"
    },
    "price": {
      "perPerson": 18000,
      "currency": "INR",
      "period": "person"
    },
    "duration": {
      "days": 6,
      "nights": 5
    },
    "difficulty": "Moderate",
    "categories": ["Adventure", "Mountain", "Snow"],
    "amenities": [
      "Guide",
      "Camping Equipment",
      "Meals",
      "First Aid Kit"
    ],
    "capacity": {
      "maxPeople": 15
    },
    "isFeatured": false,
    "status": "active",
    "createdAt": "2025-12-20T10:30:00.000Z",
    "updatedAt": "2025-12-20T10:30:00.000Z"
  }
}
```

---

### 2. Get All Experiences
**GET** `/api/posts/experiences`

Retrieve all experiences with optional filtering.

**Authentication:** Not required (Public)

#### Query Parameters

All parameters are optional:

- `city` (string): Filter by city name (case-insensitive)
- `state` (string): Filter by state/province (case-insensitive)
- `country` (string): Filter by country (case-insensitive)
- `minPrice` (number): Minimum price per person
- `maxPrice` (number): Maximum price per person
- `difficulty` (string): Filter by difficulty level
- `categories` (string): Comma-separated categories (e.g., "Adventure,Mountain")
- `isFeatured` (boolean): Filter featured experiences ("true" or "false")
- `status` (string): Filter by status (default: "active")
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

#### Example Request
```javascript
// Get all mountain adventures in Uttarakhand under ₹25,000
const response = await fetch(
  "/api/posts/experiences?state=Uttarakhand&categories=Mountain,Adventure&maxPrice=25000&page=1&limit=10"
);
```

#### Response (200 OK)
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "totalPages": 5,
  "experiences": [
    {
      "_id": "64f7e8a9b1234567890abcde",
      "postType": "experience",
      "title": "Solo Trek to Kedarkantha Peak",
      "description": "An unforgettable 6-day journey...",
      "user": {
        "_id": "64f7e8a9b1234567890abcdf",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com",
        "role": "guest"
      },
      "photos": [...],
      "location": {...},
      "price": {...},
      "duration": {...},
      "difficulty": "Moderate",
      "categories": ["Adventure", "Mountain", "Snow"],
      "isFeatured": false,
      "status": "active",
      "createdAt": "2024-03-20T10:30:00.000Z"
    },
    // ... more experiences
  ]
}
```

---

### 3. Get Single Experience
**GET** `/api/posts/experiences/:id`

Get detailed information about a specific experience.

**Authentication:** Not required (Public)

#### Example Request
```javascript
const response = await fetch("/api/posts/experiences/64f7e8a9b1234567890abcde");
```

#### Response (200 OK)
```json
{
  "success": true,
  "experience": {
    "_id": "64f7e8a9b1234567890abcde",
    "postType": "experience",
    "title": "Solo Trek to Kedarkantha Peak",
    "description": "An unforgettable 6-day journey through the Himalayas...",
    "user": {
      "_id": "64f7e8a9b1234567890abcdf",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "role": "guest"
    },
    "photos": [...],
    "videos": [...],
    "location": {...},
    "price": {...},
    "duration": {...},
    "difficulty": "Moderate",
    "categories": ["Adventure", "Mountain", "Snow"],
    "amenities": ["Guide", "Meals", "Equipment"],
    "isFeatured": false,
    "status": "active",
    "createdAt": "2024-03-20T10:30:00.000Z",
    "updatedAt": "2024-03-20T10:30:00.000Z"
  }
}
```

#### Error Response (404 Not Found)
```json
{
  "success": false,
  "message": "Experience not found"
}
```

---

### 4. Get Featured Experiences
**GET** `/api/posts/experiences/featured/list`

Get a list of featured experiences (highlighted/promoted experiences).

**Authentication:** Not required (Public)

#### Query Parameters

- `limit` (number): Maximum number of results (default: 10)

#### Example Request
```javascript
const response = await fetch("/api/posts/experiences/featured/list?limit=5");
```

#### Response (200 OK)
```json
{
  "success": true,
  "count": 5,
  "experiences": [
    {
      "_id": "64f7e8a9b1234567890abcde",
      "postType": "experience",
      "title": "Amazing Himalayan Adventure",
      "isFeatured": true,
      // ... other fields
    },
    // ... more featured experiences
  ]
}
```

---

### 5. Get My Experiences
**GET** `/api/posts/experiences/my/list`

Get all experiences posted by the authenticated user.

**Authentication:** Required

#### Example Request
```javascript
const response = await fetch("/api/posts/experiences/my/list", {
  headers: {
    "Authorization": `Bearer ${token}`
  }
});
```

#### Response (200 OK)
```json
{
  "success": true,
  "count": 3,
  "experiences": [
    {
      "_id": "64f7e8a9b1234567890abcde",
      "postType": "experience",
      "title": "My First Trek Experience",
      "status": "active",
      // ... other fields
    },
    // ... more of user's experiences
  ]
}
```

---

### 6. Get Experiences by User
**GET** `/api/posts/experiences/user/:userId`

Get all active experiences posted by a specific user.

**Authentication:** Not required (Public)

#### Example Request
```javascript
const userId = "64f7e8a9b1234567890abcdf";
const response = await fetch(`/api/posts/experiences/user/${userId}`);
```

#### Response (200 OK)
```json
{
  "success": true,
  "count": 8,
  "experiences": [
    {
      "_id": "64f7e8a9b1234567890abcde",
      "postType": "experience",
      "title": "Mountain Trek Adventure",
      "user": {
        "_id": "64f7e8a9b1234567890abcdf",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com",
        "role": "guest"
      },
      // ... other fields
    },
    // ... more experiences
  ]
}
```

---

### 7. Update Experience
**PUT** `/api/posts/experiences/:id`

Update an existing experience. Only the owner or admin can update.

**Authentication:** Required (Owner or Admin)

**Content-Type:** `application/json`

#### Request Body

All fields are optional (update only what you need):

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "location": {
    "city": "New City",
    "state": "New State",
    "country": "India"
  },
  "price": {
    "perPerson": 20000
  },
  "duration": {
    "days": 7,
    "nights": 6
  },
  "difficulty": "Challenging",
  "categories": ["Adventure", "Mountain", "Expert"],
  "amenities": ["Guide", "Meals", "Equipment", "Transport"],
  "status": "active",
  "isFeatured": true
}
```

#### Example Request
```javascript
const response = await fetch("/api/posts/experiences/64f7e8a9b1234567890abcde", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    title: "Updated Experience Title",
    pricePerPerson: 20000
  })
});
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Experience updated successfully",
  "experience": {
    "_id": "64f7e8a9b1234567890abcde",
    "title": "Updated Experience Title",
    "price": {
      "perPerson": 20000
    },
    // ... other fields
  }
}
```

#### Error Response (403 Forbidden)
```json
{
  "success": false,
  "message": "You can only update your own experiences"
}
```

---

### 8. Delete Experience
**DELETE** `/api/posts/experiences/:id`

Delete an experience. Only the owner or admin can delete. Also removes associated photos and videos from Cloudinary.

**Authentication:** Required (Owner or Admin)

#### Example Request
```javascript
const response = await fetch("/api/posts/experiences/64f7e8a9b1234567890abcde", {
  method: "DELETE",
  headers: {
    "Authorization": `Bearer ${token}`
  }
});
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Experience deleted successfully"
}
```

#### Error Response (403 Forbidden)
```json
{
  "success": false,
  "message": "You can only delete your own experiences"
}
```

---

## 🎨 Frontend Usage Examples

### Using the Experiences API Module

```javascript
import {
  createExperience,
  listExperiences,
  getExperience,
  getFeaturedExperiences,
  getMyExperiences,
  getUserExperiences,
  updateExperience,
  deleteExperience
} from "./api/experiences";

// 1. Create a new experience
async function shareExperience(formData, token) {
  try {
    const result = await createExperience(formData, {
      token,
      onUploadProgress: (percent) => {
        console.log(`Upload progress: ${percent}%`);
      }
    });
    console.log("Experience created:", result.experience);
  } catch (error) {
    console.error("Failed to create experience:", error.message);
  }
}

// 2. Get all experiences with filters
async function getExperiences() {
  try {
    const result = await listExperiences({
      state: "Uttarakhand",
      categories: "Mountain,Adventure",
      maxPrice: 25000,
      page: 1,
      limit: 10
    });
    console.log(`Found ${result.total} experiences`);
    console.log("Experiences:", result.experiences);
  } catch (error) {
    console.error("Failed to fetch experiences:", error.message);
  }
}

// 3. Get featured experiences
async function getFeatured() {
  try {
    const result = await getFeaturedExperiences({ limit: 5 });
    console.log("Featured experiences:", result.experiences);
  } catch (error) {
    console.error("Failed to fetch featured experiences:", error.message);
  }
}

// 4. Get my experiences
async function getMyPosts(token) {
  try {
    const result = await getMyExperiences({ token });
    console.log("My experiences:", result.experiences);
  } catch (error) {
    console.error("Failed to fetch your experiences:", error.message);
  }
}

// 5. Update experience
async function updateMyExperience(experienceId, updates, token) {
  try {
    const result = await updateExperience(experienceId, updates, { token });
    console.log("Updated experience:", result.experience);
  } catch (error) {
    console.error("Failed to update experience:", error.message);
  }
}

// 6. Delete experience
async function deleteMyExperience(experienceId, token) {
  try {
    const result = await deleteExperience(experienceId, { token });
    console.log(result.message);
  } catch (error) {
    console.error("Failed to delete experience:", error.message);
  }
}
```

---

## 🔑 Key Features

### Automatic Type Setting
Unlike the general posts API where you need to specify `postType: "experience"`, these dedicated endpoints **automatically set the post type for you**!

**Before (General Posts API):**
```javascript
formData.append("postType", "experience"); // Must specify manually
```

**Now (Experiences API):**
```javascript
// postType is automatically set to "experience" - no need to specify!
```

### Rich Filtering
Filter experiences by:
- 📍 Location (city, state, country)
- 💰 Price range
- ⛰️ Difficulty level
- 🏷️ Categories/tags
- ⭐ Featured status

### File Upload Support
- Upload up to **10 photos** (3MB each)
- Upload up to **5 videos** (3MB each)
- Automatic Cloudinary storage
- Automatic cleanup on deletion

---

## 📝 Data Model

```typescript
interface Experience {
  _id: string;
  postType: "experience"; // Automatically set
  user: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: "guest" | "host";
  };
  userRole: "guest" | "host";
  title: string;
  description: string;
  photos: Array<{
    url: string;
    public_id: string;
    resource_type: "image";
  }>;
  videos: Array<{
    url: string;
    public_id: string;
    resource_type: "video";
  }>;
  location: {
    city?: string;
    state?: string;
    country?: string;
    meetingPoint?: string;
  };
  price: {
    perPerson?: number;
    period?: string;
    currency?: string;
  };
  duration: {
    days?: number;
    nights?: number;
  };
  capacity: {
    maxPeople?: number;
  };
  difficulty?: string;
  categories: string[];
  amenities: string[];
  availability: object;
  isFeatured: boolean;
  status: "active" | "inactive" | "archived";
  createdAt: Date;
  updatedAt: Date;
}
```

---

## ⚠️ Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 💡 Best Practices

1. **Use FormData for Creation**: When creating experiences with files, use `FormData`
2. **Handle Upload Progress**: Provide user feedback during file uploads
3. **Validate on Frontend**: Validate required fields before submission
4. **Compress Images**: Compress images before upload (max 3MB per file)
5. **Error Handling**: Always handle errors gracefully
6. **Token Management**: Store and refresh authentication tokens securely

---

## 🚀 Quick Start

```javascript
// 1. Import the API module
import { createExperience, listExperiences } from "./api/experiences";

// 2. Create an experience
const formData = new FormData();
formData.append("title", "My Amazing Trek");
formData.append("description", "Description here...");
formData.append("city", "Manali");
formData.append("photos", photoFile);

const result = await createExperience(formData, { 
  token: yourAuthToken,
  onUploadProgress: (percent) => console.log(`${percent}%`)
});

// 3. Fetch experiences
const experiences = await listExperiences({
  state: "Uttarakhand",
  limit: 10
});
```

---

## 📞 Support

For issues or questions:
- Check the main [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Review [POSTS_API_DOCUMENTATION.md](./POSTS_API_DOCUMENTATION.md) for general posts API

---

**Happy Experience Sharing! 🎉**
