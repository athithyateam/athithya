# Experiences API - Quick Reference 🚀

## Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/posts/experiences` | Create new experience | ✅ Required |
| GET | `/api/posts/experiences` | Get all experiences | ❌ Public |
| GET | `/api/posts/experiences/:id` | Get single experience | ❌ Public |
| GET | `/api/posts/experiences/featured/list` | Get featured experiences | ❌ Public |
| GET | `/api/posts/experiences/my/list` | Get my experiences | ✅ Required |
| GET | `/api/posts/experiences/user/:userId` | Get user's experiences | ❌ Public |
| PUT | `/api/posts/experiences/:id` | Update experience | ✅ Owner/Admin |
| DELETE | `/api/posts/experiences/:id` | Delete experience | ✅ Owner/Admin |

## Key Features ✨

- ✅ **Automatic `postType`**: No need to specify - automatically set to "experience"
- ✅ **All Users**: Both guests and hosts can share experiences
- ✅ **Rich Media**: Upload up to 10 photos + 5 videos (3MB each)
- ✅ **Advanced Filtering**: Filter by location, price, difficulty, categories
- ✅ **Cloudinary Integration**: Automatic file storage and cleanup

## Quick Start

### Backend (Node.js/Express)

```javascript
// The routes are already set up!
// Just use the endpoint: /api/posts/experiences
```

### Frontend (JavaScript/React)

```javascript
import { createExperience, listExperiences } from "./api/experiences";

// Create experience
const formData = new FormData();
formData.append("title", "Amazing Mountain Trek");
formData.append("description", "A journey through...");
formData.append("city", "Manali");
formData.append("photos", file);

const result = await createExperience(formData, { 
  token: authToken,
  onUploadProgress: (percent) => console.log(`${percent}%`)
});

// Get experiences
const experiences = await listExperiences({
  state: "Uttarakhand",
  maxPrice: 25000,
  page: 1
});
```

## Common Use Cases

### 1. Create Experience with Photos
```javascript
const formData = new FormData();
formData.append("title", "Solo Trek to Kedarkantha");
formData.append("description", "My amazing experience...");
formData.append("city", "Sankri");
formData.append("state", "Uttarakhand");
formData.append("country", "India");
formData.append("pricePerPerson", "18000");
formData.append("days", "6");
formData.append("nights", "5");
formData.append("difficulty", "Moderate");
formData.append("categories", JSON.stringify(["Adventure", "Mountain"]));
formData.append("photos", photoFile1);
formData.append("photos", photoFile2);

const response = await fetch("/api/posts/experiences", {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}` },
  body: formData
});
```

### 2. Get Featured Experiences
```javascript
const response = await fetch("/api/posts/experiences/featured/list?limit=5");
const data = await response.json();
console.log(data.experiences);
```

### 3. Filter Experiences
```javascript
const response = await fetch(
  "/api/posts/experiences?state=Uttarakhand&categories=Mountain&maxPrice=25000"
);
```

### 4. Update Experience
```javascript
const response = await fetch("/api/posts/experiences/64f7e8a9b1234567890abcde", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    title: "Updated Title",
    pricePerPerson: 20000
  })
});
```

### 5. Delete Experience
```javascript
const response = await fetch("/api/posts/experiences/64f7e8a9b1234567890abcde", {
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
- `difficulty` - Filter by difficulty level
- `categories` - Comma-separated categories
- `isFeatured` - Featured experiences only
- `status` - Filter by status (default: "active")
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

## Response Format

### Success Response
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "totalPages": 5,
  "experiences": [...]
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## File Upload Limits

- **Photos**: Max 10 files, 3MB each
- **Videos**: Max 5 files, 3MB each
- **Total**: Stay under Vercel's 4.5MB body limit

## Comparison: General Posts API vs Experiences API

| Feature | General Posts API | Experiences API |
|---------|------------------|-----------------|
| Endpoint | `/api/posts` | `/api/posts/experiences` |
| Must specify postType | ✅ Yes | ❌ No (automatic) |
| Cleaner code | ❌ | ✅ |
| Dedicated filtering | ❌ | ✅ |
| Recommended for experiences | ❌ | ✅ |

## Documentation

- **Full Documentation**: [EXPERIENCES_API_DOCUMENTATION.md](./EXPERIENCES_API_DOCUMENTATION.md)
- **General Posts API**: [POSTS_API_DOCUMENTATION.md](./POSTS_API_DOCUMENTATION.md)
- **Main API Docs**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

**Ready to share your adventures? Start using the Experiences API today! 🎉**
