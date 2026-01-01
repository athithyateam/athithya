# 🚀 Quick Start Guide - Athithya Backend

## ⚠️ IMPORTANT: Endpoint PostType Mapping

**Common Issue**: Creating services but getting `postType: "trek"` instead of `postType: "service"`

### Which Endpoint Creates Which postType?

| Endpoint | postType | Who Can Use |
|----------|----------|-------------|
| `POST /api/posts/experiences` | `experience` | Guest + Host |
| `POST /api/posts/services` | `service` | **Host only** |
| `POST /api/posts/treks` | `trek` | **Host only** |

### ✅ Correct Usage:
```javascript
// Create a SERVICE
fetch("http://localhost:3000/api/posts/services", {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}` },
  body: formData
});

// Create a TREK  
fetch("http://localhost:3000/api/posts/treks", {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}` },
  body: formData
});
```

### ❌ Common Mistake:
```javascript
// This creates a TREK, not a service!
fetch("http://localhost:3000/api/posts/treks", { /* service data */ })
```

---

## Setup in 5 Minutes

### Step 1: Environment Setup ✅
Your `.env` file is already configured with all required variables.

### Step 2: Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# Or use MongoDB Atlas connection string in .env
```

### Step 3: Start the Server
```bash
npm start
```

Server will run on: `http://localhost:3000`

---

## Test the API in 3 Steps

### 1️⃣ Create a Host Account

**Request:**
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Host",
  "email": "host@test.com",
  "password": "password123",
  "role": "host"
}
```

### 2️⃣ Login and Get Token

**Request:**
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "host@test.com",
  "password": "password123"
}
```

**Copy the token from response!**

### 3️⃣ Create Your First Featured Trek

**Request:**
```bash
POST http://localhost:3000/api/posts
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: multipart/form-data

postType: trek
title: Kedarkantha Summit Trek
description: Experience the magical winter wonderland with stunning Himalayan views
duration: {"days": 5, "nights": 4}
difficulty: Easy-Moderate
isFeatured: true
location: {"city": "Sankri", "state": "Uttarakhand", "country": "India"}
price: {"perPerson": 7999, "currency": "INR"}
availability: {"startDate":"2025-01-01","endDate":"2025-12-31","isAvailable":true}
photos: [upload your image files]
```

---

## View Your Featured Trek

**Get all featured treks:**
```bash
GET http://localhost:3000/api/posts/featured/treks
```

**Response will look like:**
```json
{
  "success": true,
  "count": 1,
  "posts": [
    {
      "_id": "...",
      "title": "Kedarkantha Summit Trek",
      "duration": { "days": 5, "nights": 4 },
      "difficulty": "Easy-Moderate",
      "price": { "perPerson": 7999, "currency": "INR" },
      "location": {
        "city": "Sankri",
        "state": "Uttarakhand",
        "country": "India"
      },
      "isFeatured": true,
      "photos": [...],
      "createdAt": "2025-12-10T..."
    }
  ]
}
```

---

## Key Features Implemented ✨

### 1. Trek-Specific Fields
- ✅ Duration (days/nights) - displayed as "5D • 4N"
- ✅ Difficulty levels (Easy, Easy-Moderate, Moderate, etc.)
- ✅ Featured flag for homepage display
- ✅ Per-person pricing in INR

### 2. Complete CRUD Operations
- ✅ Create trek (hosts only)
- ✅ Get all treks with filters
- ✅ Get featured treks (dedicated endpoint)
- ✅ Get single trek details
- ✅ Update trek
- ✅ Delete trek (with Cloudinary cleanup)

### 3. Advanced Filtering
- ✅ Filter by difficulty
- ✅ Filter by location (city, state, country)
- ✅ Filter by price range
- ✅ Filter by featured status
- ✅ Filter by tags

### 4. Media Management
- ✅ Multiple photo uploads (up to 10)
- ✅ Video uploads (up to 5)
- ✅ Cloudinary integration
- ✅ Automatic cleanup on deletion

---

## Available Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/posts/featured/treks` | Get featured treks | No |
| GET | `/api/posts` | Get all posts (with filters) | No |
| GET | `/api/posts/:id` | Get single post | No |
| POST | `/api/posts` | Create trek/experience | Yes (Host) |
| PUT | `/api/posts/:id` | Update trek | Yes (Owner) |
| DELETE | `/api/posts/:id` | Delete trek | Yes (Owner) |

---

## Testing Tools

### Option 1: Use cURL
See `API_EXAMPLES.md` for ready-to-use cURL commands

### Option 2: Use Postman/Thunder Client
Import the examples from `API_EXAMPLES.md`

### Option 3: Use the provided seed data
Check `seedData.js` for 5 example treks matching the UI

---

## Project Structure

```
athithya-backend/
├── 📄 API_DOCUMENTATION.md      ← Full API reference
├── 📄 API_EXAMPLES.md           ← Code examples & testing
├── 📄 FEATURED_TREKS_README.md  ← Feature overview
├── 📄 QUICK_START.md            ← This file
├── 📄 seedData.js               ← Example trek data
├── 📁 db/
│   └── mongoose.js              ← Enhanced schema
├── 📁 routes/
│   ├── posts.js                 ← Trek endpoints
│   └── users.js                 ← Auth endpoints
└── 📁 middleware/
    └── checkRole.js             ← Access control
```

---

## Difficulty Levels

Choose from these when creating treks:
- `Easy` - Beginners welcome
- `Easy-Moderate` - Some experience helpful  
- `Moderate` - Regular fitness required
- `Moderate-Difficult` - Good fitness needed
- `Difficult` - Experienced only
- `Challenging` - Expert level

---

## Sample Trek Data (Copy & Paste)

```json
{
  "postType": "trek",
  "title": "Valley of Flowers Trek",
  "description": "UNESCO World Heritage Site with 300+ alpine flowers",
  "duration": {"days": 6, "nights": 5},
  "difficulty": "Moderate",
  "isFeatured": true,
  "location": {
    "city": "Govindghat",
    "state": "Uttarakhand",
    "country": "India"
  },
  "price": {
    "perPerson": 10499,
    "currency": "INR"
  },
  "tags": ["flowers", "valley", "unesco", "nature"],
  "capacity": {"maxPeople": 20}
}
```

---

## Common Issues & Solutions

### ❌ "User role 'guest' cannot post treks"
**Solution:** Use a host account (role: "host") to create treks

### ❌ "Invalid post type"
**Solution:** Use one of: "trek", "experience", "service", "plan"

### ❌ "Cloudinary upload failed"
**Solution:** Check your Cloudinary credentials in `.env`

### ❌ "MongoDB connection error"
**Solution:** Ensure MongoDB is running and MONGO_URL is correct

---

## Next Steps

1. ✅ Test the featured treks endpoint
2. ✅ Create multiple treks to see the list
3. ✅ Test filtering by difficulty and location
4. ✅ Integrate with your frontend
5. ✅ Add more fields as needed

---

## Documentation Files

- **API_DOCUMENTATION.md** - Complete API reference with all endpoints
- **API_EXAMPLES.md** - Code examples in cURL, JavaScript, React
- **FEATURED_TREKS_README.md** - Feature overview and architecture
- **seedData.js** - Ready-to-use example trek data

---

## Support

All endpoints return JSON with this format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Ready to Go! 🎉

Your backend now supports:
- ✅ Featured treks like the UI reference
- ✅ Duration display (5D • 4N)
- ✅ Difficulty badges
- ✅ Per-person pricing in INR
- ✅ Location-based filtering
- ✅ Multiple photo uploads
- ✅ Host-based posting

Start creating amazing trek experiences! 🏔️
