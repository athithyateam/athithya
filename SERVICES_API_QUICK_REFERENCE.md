# Services API - Quick Reference 🚀

## Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/posts/services` | Create new service | ✅ Host Only |
| GET | `/api/posts/services` | Get all services | ❌ Public |
| GET | `/api/posts/services/:id` | Get single service | ❌ Public |
| GET | `/api/posts/services/featured/list` | Get featured services | ❌ Public |
| GET | `/api/posts/services/my/list` | Get my services | ✅ Host Only |
| GET | `/api/posts/services/host/:userId` | Get host's services | ❌ Public |
| PUT | `/api/posts/services/:id` | Update service | ✅ Owner/Admin |
| DELETE | `/api/posts/services/:id` | Delete service | ✅ Owner/Admin |

## Key Features ✨

- ✅ **Automatic `postType`**: No need to specify - automatically set to "service"
- ✅ **Host Only**: Only hosts can create services (guests can view)
- ✅ **Rich Media**: Upload up to 10 photos + 5 videos (3MB each)
- ✅ **Advanced Filtering**: Filter by location, price, categories
- ✅ **Cloudinary Integration**: Automatic file storage and cleanup

## Quick Start

### Backend (Node.js/Express)

```javascript
// The routes are already set up!
// Just use the endpoint: /api/posts/services
```

### Frontend (JavaScript/React)

```javascript
import { createService, listServices } from "./api/services";

// Create service (host only)
const formData = new FormData();
formData.append("title", "Professional Guide Service");
formData.append("description", "Experienced mountain guide...");
formData.append("city", "Manali");
formData.append("pricePerPerson", "5000");
formData.append("period", "per day");
formData.append("categories", JSON.stringify(["Guide", "Adventure"]));
formData.append("photos", file);

const result = await createService(formData, { 
  token: authToken,
  onUploadProgress: (percent) => console.log(`${percent}%`)
});

// Get services
const services = await listServices({
  state: "Himachal Pradesh",
  categories: "Guide",
  maxPrice: 10000,
  page: 1
});
```

## Common Use Cases

### 1. Create Service with Photos
```javascript
const formData = new FormData();
formData.append("title", "Mountain Guide Service");
formData.append("description", "Professional guide services...");
formData.append("city", "Manali");
formData.append("state", "Himachal Pradesh");
formData.append("country", "India");
formData.append("pricePerPerson", "5000");
formData.append("period", "per day");
formData.append("maxPeople", "8");
formData.append("categories", JSON.stringify(["Guide", "Adventure"]));
formData.append("amenities", JSON.stringify(["Equipment", "First Aid"]));
formData.append("photos", photoFile1);
formData.append("photos", photoFile2);

const response = await fetch("/api/posts/services", {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}` },
  body: formData
});
```

### 2. Get Featured Services
```javascript
const response = await fetch("/api/posts/services/featured/list?limit=5");
const data = await response.json();
console.log(data.services);
```

### 3. Filter Services
```javascript
const response = await fetch(
  "/api/posts/services?state=Himachal Pradesh&categories=Guide&maxPrice=10000"
);
```

### 4. Update Service
```javascript
const response = await fetch("/api/posts/services/64f7e8a9b1234567890abcde", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    title: "Updated Service Title",
    price: { perPerson: 6000 }
  })
});
```

### 5. Delete Service
```javascript
const response = await fetch("/api/posts/services/64f7e8a9b1234567890abcde", {
  method: "DELETE",
  headers: { "Authorization": `Bearer ${token}` }
});
```

## Available Filters

- `city` - Filter by city name
- `state` - Filter by state/province
- `country` - Filter by country
- `minPrice` - Minimum price per person
- `maxPrice` - Maximum price per person
- `categories` - Comma-separated categories
- `isFeatured` - Featured services only
- `status` - Filter by status (default: "active")
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

## Response Format

### Success Response
```json
{
  "success": true,
  "count": 10,
  "total": 35,
  "page": 1,
  "totalPages": 4,
  "services": [...]
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## Common Service Categories

**Transportation:**
- Airport Transfer, Car Rental, Bike Rental, Taxi Service

**Guide Services:**
- Trek Guide, City Tour Guide, Wildlife Guide, Photography Guide

**Activities:**
- River Rafting, Paragliding, Rock Climbing, Skiing

**Equipment:**
- Trekking Gear Rental, Camping Equipment, Photography Equipment

**Support Services:**
- Porter Service, Cook Service, First Aid, Emergency Support

## File Upload Limits

- **Photos**: Max 10 files, 3MB each
- **Videos**: Max 5 files, 3MB each
- **Total**: Stay under Vercel's 4.5MB body limit

## Comparison: General Posts API vs Services API

| Feature | General Posts API | Services API |
|---------|------------------|--------------|
| Endpoint | `/api/posts` | `/api/posts/services` |
| Must specify postType | ✅ Yes | ❌ No (automatic) |
| Host verification | Manual | ✅ Automatic |
| Cleaner code | ❌ | ✅ |
| Recommended for services | ❌ | ✅ |

## Documentation

- **Full Documentation**: [SERVICES_API_DOCUMENTATION.md](./SERVICES_API_DOCUMENTATION.md)
- **General Posts API**: [POSTS_API_DOCUMENTATION.md](./POSTS_API_DOCUMENTATION.md)
- **Main API Docs**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

**Ready to offer your services? Start using the Services API today! 🎉**
