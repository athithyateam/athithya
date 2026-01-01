# Services API Documentation - Offer Your Travel Services 🛎️

## Overview
The **Services API** provides dedicated endpoints for hosts to offer travel-related services. With automatic `postType: "service"` setting, you don't need to manually specify the post type - making it simpler and cleaner to use!

### Key Benefits
- ✅ **Automatic Type Setting**: No need to specify `postType`, it's automatically set to `"service"`
- ✅ **Simplified API**: Clean, focused endpoints for service management
- ✅ **Host-Only Access**: Only hosts can create services (guests can view)
- ✅ **Rich Media Support**: Upload photos (max 10) and videos (max 5)
- ✅ **Flexible Filtering**: Search by location, price, categories, and more

## Base URL
```
/api/posts/services
```

⚠️ **IMPORTANT**: Use `/api/posts/services` endpoint (NOT `/api/posts/treks` or `/api/posts`)
- This endpoint automatically sets `postType: "service"`
- Only hosts can create services

## 📚 Available Endpoints

### 1. Create Service
**POST** `/api/posts/services`

Create a new travel service offering (hosts only).

**Authentication:** Required (Host only)

**Content-Type:** `multipart/form-data`

#### Request Fields

**Required:**
- `title` (string): Service name/title
- `description` (string): Detailed service description

**Optional:**
- `photos` (file[]): Up to 10 photos (3MB each)
- `videos` (file[]): Up to 5 videos (3MB each)
- `location` (object/string): Location details
  - `city` (string): City name
  - `state` (string): State/Province name
  - `country` (string): Country name
  - `meetingPoint` (string): Meeting point description
- `priceTotal` (number): Total price
- `pricePerPerson` (number): Price per person
- `period` (string): Pricing period (e.g., "per day", "per hour", "per trip")
- `maxPeople` (number): Maximum capacity
- `duration` (object/string): Duration details
  - `days` (number): Number of days
  - `nights` (number): Number of nights
- `categories` (array/string): Service categories (e.g., ["Transportation", "Guide"])
- `amenities` (array/string): Included amenities
- `availability` (object/string): Availability schedule
- `isFeatured` (boolean): Mark as featured (admin only)

#### Example Request
```javascript
const formData = new FormData();
formData.append("title", "Professional Mountain Guide Service");
formData.append("description", "Experienced guide for Himalayan treks with 10+ years expertise...");
formData.append("city", "Manali");
formData.append("state", "Himachal Pradesh");
formData.append("country", "India");
formData.append("pricePerPerson", "5000");
formData.append("period", "per day");
formData.append("maxPeople", "8");
formData.append("categories", JSON.stringify(["Guide", "Adventure"]));
formData.append("amenities", JSON.stringify(["Equipment", "First Aid", "Communication"]));
formData.append("photos", photoFile1);
formData.append("photos", photoFile2);

const response = await fetch("/api/posts/services", {
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
Content-Length: 1024
Date: Fri, 20 Dec 2025 10:30:00 GMT
Connection: keep-alive
```

**Response Body:**
```json
{
  "success": true,
  "message": "Service created successfully",
  "service": {
    "_id": "64f7e8a9b1234567890abcde",
    "postType": "service",
    "title": "Professional Mountain Guide Service",
    "description": "Experienced guide for Himalayan treks with 10+ years of expertise. Specialized in high-altitude expeditions, winter treks, and mountain safety. Certified wilderness first responder with extensive knowledge of local terrain, weather patterns, and emergency protocols.",
    "user": {
      "_id": "64f7e8a9b1234567890abcdf",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "role": "host"
    },
    "photos": [
      {
        "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/services/guide_profile.jpg",
        "public_id": "services/abc123",
        "resource_type": "image"
      },
      {
        "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/services/guide_certification.jpg",
        "public_id": "services/abc124",
        "resource_type": "image"
      }
    ],
    "videos": [],
    "location": {
      "city": "Manali",
      "state": "Himachal Pradesh",
      "country": "India",
      "address": "Old Manali Road",
      "meetingPoint": "Manali Bus Stand"
    },
    "price": {
      "perPerson": 5000,
      "currency": "INR",
      "period": "day"
    },
    "capacity": {
      "maxPeople": 8
    },
    "categories": ["Guide", "Adventure", "Professional Services"],
    "amenities": [
      "Equipment",
      "First Aid Kit",
      "Communication Devices",
      "Emergency Support",
      "Insurance"
    ],
    "isFeatured": false,
    "status": "active",
    "createdAt": "2025-12-20T10:30:00.000Z",
    "updatedAt": "2025-12-20T10:30:00.000Z"
  }
}
```

#### Error Response (403 Forbidden)

**Response Headers:**
```http
HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8
Date: Fri, 20 Dec 2025 10:30:00 GMT
```

**Response Body:**
```json
{
  "success": false,
  "message": "Only hosts can create services"
}
```

---

### 2. Get All Services
**GET** `/api/posts/services`

Retrieve all services with optional filtering.

**Authentication:** Not required (Public)

#### Query Parameters

All parameters are optional:

- `city` (string): Filter by city name (case-insensitive)
- `state` (string): Filter by state/province (case-insensitive)
- `country` (string): Filter by country (case-insensitive)
- `minPrice` (number): Minimum price per person
- `maxPrice` (number): Maximum price per person
- `categories` (string): Comma-separated categories (e.g., "Guide,Transportation")
- `isFeatured` (boolean): Filter featured services ("true" or "false")
- `status` (string): Filter by status (default: "active")
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

#### Example Request
```javascript
// Get all guide services in Himachal Pradesh under ₹10,000
const response = await fetch(
  "/api/posts/services?state=Himachal Pradesh&categories=Guide&maxPrice=10000&page=1&limit=10"
);
```

#### Response (200 OK)
```json
{
  "success": true,
  "count": 10,
  "total": 35,
  "page": 1,
  "totalPages": 4,
  "services": [
    {
      "_id": "64f7e8a9b1234567890abcde",
      "postType": "service",
      "title": "Professional Mountain Guide Service",
      "description": "Experienced guide...",
      "user": {
        "_id": "64f7e8a9b1234567890abcdf",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com",
        "role": "host"
      },
      "photos": [...],
      "location": {...},
      "price": {...},
      "categories": ["Guide", "Adventure"],
      "isFeatured": false,
      "status": "active",
      "createdAt": "2024-03-20T10:30:00.000Z"
    },
    // ... more services
  ]
}
```

---

### 3. Get Single Service
**GET** `/api/posts/services/:id`

Get detailed information about a specific service.

**Authentication:** Not required (Public)

#### Example Request
```javascript
const response = await fetch("/api/posts/services/64f7e8a9b1234567890abcde");
```

#### Response (200 OK)
```json
{
  "success": true,
  "service": {
    "_id": "64f7e8a9b1234567890abcde",
    "postType": "service",
    "title": "Professional Mountain Guide Service",
    "description": "Experienced guide for Himalayan treks with 10+ years expertise...",
    "user": {
      "_id": "64f7e8a9b1234567890abcdf",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "role": "host"
    },
    "photos": [...],
    "videos": [...],
    "location": {...},
    "price": {...},
    "duration": {...},
    "categories": ["Guide", "Adventure"],
    "amenities": ["Equipment", "First Aid", "Communication"],
    "availability": {...},
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
  "message": "Service not found"
}
```

---

### 4. Get Featured Services
**GET** `/api/posts/services/featured/list`

Get a list of featured services (highlighted/promoted services).

**Authentication:** Not required (Public)

#### Query Parameters

- `limit` (number): Maximum number of results (default: 10)

#### Example Request
```javascript
const response = await fetch("/api/posts/services/featured/list?limit=5");
```

#### Response (200 OK)
```json
{
  "success": true,
  "count": 5,
  "services": [
    {
      "_id": "64f7e8a9b1234567890abcde",
      "postType": "service",
      "title": "Premium Guide Service",
      "isFeatured": true,
      // ... other fields
    },
    // ... more featured services
  ]
}
```

---

### 5. Get My Services
**GET** `/api/posts/services/my/list`

Get all services created by the authenticated host.

**Authentication:** Required (Host only)

#### Example Request
```javascript
const response = await fetch("/api/posts/services/my/list", {
  headers: {
    "Authorization": `Bearer ${token}`
  }
});
```

#### Response (200 OK)
```json
{
  "success": true,
  "count": 4,
  "services": [
    {
      "_id": "64f7e8a9b1234567890abcde",
      "postType": "service",
      "title": "My Guide Service",
      "status": "active",
      // ... other fields
    },
    // ... more of host's services
  ]
}
```

#### Error Response (403 Forbidden)
```json
{
  "success": false,
  "message": "Only hosts can access this endpoint"
}
```

---

### 6. Get Services by Host
**GET** `/api/posts/services/host/:userId`

Get all active services offered by a specific host.

**Authentication:** Not required (Public)

#### Example Request
```javascript
const userId = "64f7e8a9b1234567890abcdf";
const response = await fetch(`/api/posts/services/host/${userId}`);
```

#### Response (200 OK)
```json
{
  "success": true,
  "count": 6,
  "services": [
    {
      "_id": "64f7e8a9b1234567890abcde",
      "postType": "service",
      "title": "Mountain Guide Service",
      "user": {
        "_id": "64f7e8a9b1234567890abcdf",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com",
        "role": "host"
      },
      // ... other fields
    },
    // ... more services
  ]
}
```

---

### 7. Update Service
**PUT** `/api/posts/services/:id`

Update an existing service. Only the owner or admin can update.

**Authentication:** Required (Owner or Admin)

**Content-Type:** `application/json`

#### Request Body

All fields are optional (update only what you need):

```json
{
  "title": "Updated Service Title",
  "description": "Updated description",
  "location": {
    "city": "New City",
    "state": "New State",
    "country": "India"
  },
  "price": {
    "perPerson": 6000,
    "period": "per day"
  },
  "capacity": {
    "maxPeople": 10
  },
  "categories": ["Guide", "Adventure", "Photography"],
  "amenities": ["Equipment", "First Aid", "Communication", "Meals"],
  "availability": {
    "monday": true,
    "tuesday": true
  },
  "status": "active",
  "isFeatured": true
}
```

#### Example Request
```javascript
const response = await fetch("/api/posts/services/64f7e8a9b1234567890abcde", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    title: "Updated Guide Service",
    price: { perPerson: 6000 }
  })
});
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Service updated successfully",
  "service": {
    "_id": "64f7e8a9b1234567890abcde",
    "title": "Updated Guide Service",
    "price": {
      "perPerson": 6000
    },
    // ... other fields
  }
}
```

#### Error Response (403 Forbidden)
```json
{
  "success": false,
  "message": "You can only update your own services"
}
```

---

### 8. Delete Service
**DELETE** `/api/posts/services/:id`

Delete a service. Only the owner or admin can delete. Also removes associated photos and videos from Cloudinary.

**Authentication:** Required (Owner or Admin)

#### Example Request
```javascript
const response = await fetch("/api/posts/services/64f7e8a9b1234567890abcde", {
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
  "message": "Service deleted successfully"
}
```

#### Error Response (403 Forbidden)
```json
{
  "success": false,
  "message": "You can only delete your own services"
}
```

---

## 🎨 Frontend Usage Examples

### Using the Services API Module

```javascript
import {
  createService,
  listServices,
  getService,
  getFeaturedServices,
  getMyServices,
  getHostServices,
  updateService,
  deleteService
} from "./api/services";

// 1. Create a new service (host only)
async function createNewService(formData, token) {
  try {
    const result = await createService(formData, {
      token,
      onUploadProgress: (percent) => {
        console.log(`Upload progress: ${percent}%`);
      }
    });
    console.log("Service created:", result.service);
  } catch (error) {
    console.error("Failed to create service:", error.message);
  }
}

// 2. Get all services with filters
async function getAllServices() {
  try {
    const result = await listServices({
      state: "Himachal Pradesh",
      categories: "Guide,Transportation",
      maxPrice: 10000,
      page: 1,
      limit: 10
    });
    console.log(`Found ${result.total} services`);
    console.log("Services:", result.services);
  } catch (error) {
    console.error("Failed to fetch services:", error.message);
  }
}

// 3. Get featured services
async function getFeatured() {
  try {
    const result = await getFeaturedServices({ limit: 5 });
    console.log("Featured services:", result.services);
  } catch (error) {
    console.error("Failed to fetch featured services:", error.message);
  }
}

// 4. Get my services (host only)
async function getMyServicesList(token) {
  try {
    const result = await getMyServices({ token });
    console.log("My services:", result.services);
  } catch (error) {
    console.error("Failed to fetch your services:", error.message);
  }
}

// 5. Update service
async function updateMyService(serviceId, updates, token) {
  try {
    const result = await updateService(serviceId, updates, { token });
    console.log("Updated service:", result.service);
  } catch (error) {
    console.error("Failed to update service:", error.message);
  }
}

// 6. Delete service
async function deleteMyService(serviceId, token) {
  try {
    const result = await deleteService(serviceId, { token });
    console.log(result.message);
  } catch (error) {
    console.error("Failed to delete service:", error.message);
  }
}
```

---

## 🔑 Key Features

### Automatic Type Setting
Unlike the general posts API where you need to specify `postType: "service"`, these dedicated endpoints **automatically set the post type for you**!

**Before (General Posts API):**
```javascript
formData.append("postType", "service"); // Must specify manually
```

**Now (Services API):**
```javascript
// postType is automatically set to "service" - no need to specify!
```

### Host-Only Creation
Only users with `role: "host"` can create services. Guests can view and search services but cannot create them.

### Rich Filtering
Filter services by:
- 📍 Location (city, state, country)
- 💰 Price range
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
interface Service {
  _id: string;
  postType: "service"; // Automatically set
  user: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: "host";
  };
  userRole: "host";
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
    total?: number;
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

## 🏷️ Common Service Categories

**Transportation:**
- Airport Transfer
- Car Rental
- Bike Rental
- Taxi Service

**Accommodation:**
- Homestay
- Guest House
- Camping

**Guide Services:**
- Trek Guide
- City Tour Guide
- Wildlife Guide
- Photography Guide

**Activities:**
- River Rafting
- Paragliding
- Rock Climbing
- Skiing

**Equipment:**
- Trekking Gear Rental
- Camping Equipment
- Photography Equipment

**Support Services:**
- Porter Service
- Cook Service
- First Aid
- Emergency Support

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
- `403` - Forbidden (insufficient permissions or not a host)
- `404` - Not Found
- `500` - Internal Server Error

---

## 💡 Best Practices

1. **Use FormData for Creation**: When creating services with files, use `FormData`
2. **Handle Upload Progress**: Provide user feedback during file uploads
3. **Validate on Frontend**: Validate required fields before submission
4. **Compress Images**: Compress images before upload (max 3MB per file)
5. **Error Handling**: Always handle errors gracefully
6. **Host Verification**: Ensure user is a host before showing service creation forms
7. **Clear Descriptions**: Write detailed service descriptions with clear terms

---

## 🚀 Quick Start

```javascript
// 1. Import the API module
import { createService, listServices } from "./api/services";

// 2. Create a service (host only)
const formData = new FormData();
formData.append("title", "Professional Guide Service");
formData.append("description", "Experienced mountain guide...");
formData.append("city", "Manali");
formData.append("pricePerPerson", "5000");
formData.append("period", "per day");
formData.append("categories", JSON.stringify(["Guide", "Adventure"]));
formData.append("photos", photoFile);

const result = await createService(formData, { 
  token: yourAuthToken,
  onUploadProgress: (percent) => console.log(`${percent}%`)
});

// 3. Fetch services
const services = await listServices({
  state: "Himachal Pradesh",
  categories: "Guide",
  limit: 10
});
```

---

## � Troubleshooting

### Issue: Service is created as "trek" postType

**Problem**: Your service is showing `postType: "trek"` instead of `postType: "service"`

**Solution**: Make sure you're using the correct endpoint:
- ✅ **CORRECT**: `POST /api/posts/services`
- ❌ **WRONG**: `POST /api/posts/treks`
- ❌ **WRONG**: `POST /api/posts` (with `postType: "service"` in body)

**Example - Correct way:**
```javascript
// ✅ This will create a SERVICE
const response = await fetch("http://localhost:3000/api/posts/services", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`
  },
  body: formData
});
```

**Example - Wrong way:**
```javascript
// ❌ This will create a TREK (even if you specify service in the body)
const response = await fetch("http://localhost:3000/api/posts/treks", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`
  },
  body: formData
});
```

### Issue: "Only hosts can create services"

**Problem**: Getting 403 Forbidden error

**Solution**: Make sure you're logged in as a **host**:
- Guests cannot create services (only experiences)
- Sign up or login with `role: "host"`

---

## �📞 Support

For issues or questions:
- Check the main [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Review [POSTS_API_DOCUMENTATION.md](./POSTS_API_DOCUMENTATION.md) for general posts API

---

**Happy Service Sharing! 🎉**
