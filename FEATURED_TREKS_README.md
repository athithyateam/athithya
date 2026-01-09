Make # Featured Treks & Experiences Backend

Backend system for managing featured treks and experiences, allowing hosts to create and showcase adventures like the UI shown in the reference image.

## 🎯 Features

### ✅ Implemented Features

1. **Trek/Experience Management**
   - Create, read, update, delete treks and experiences
   - Host-only posting for treks and services
   - Guest posting for experiences and plans

2. **Featured System**
   - Mark treks as featured for homepage display
   - Separate endpoint for fetching featured treks
   - Priority sorting (featured items first)

3. **Trek-Specific Fields**
   - Duration (days/nights) - e.g., "5D • 4N"
   - Difficulty levels (Easy, Easy-Moderate, Moderate, etc.)
   - Per-person pricing in INR
   - Location (city, state, country)
   - Multiple photos and videos

4. **Advanced Filtering**
   - Filter by post type, difficulty, location
   - Price range filtering
   - Featured status filtering
   - Tag-based search

5. **Media Management**
   - Multiple photo uploads (up to 10)
   - Video uploads (up to 5)
   - Cloudinary integration for storage
   - Automatic deletion on post removal

6. **User Roles**
   - Guest: Can post experiences and plans
   - Host: Can post all types including treks
   - Admin: Full access

## 📊 Database Schema

### Post Schema Enhancement

```javascript
{
  // New Trek-specific fields
  duration: {
    days: Number,      // e.g., 5
    nights: Number     // e.g., 4
  },
  difficulty: String,  // "Easy", "Easy-Moderate", "Moderate", etc.
  isFeatured: Boolean, // Display in featured section
  
  // Updated fields
  postType: ["experience", "service", "plan", "trek"],
  price: {
    currency: "INR",   // Default changed to INR
    period: "person"   // Default for treks
  }
}
```

## 🚀 Quick Start

### 1. Environment Setup

Ensure your `.env` file is configured:
```env
PORT=3000
MONGO_URL=mongodb://localhost:27017/athithya
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
BREVO_API_KEY=your-brevo-key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Server

```bash
npm start
# or
node server.js
```

## 📡 API Endpoints

### Dedicated Trek Endpoints ✨

All trek operations can now be performed through dedicated `/api/treks` endpoints for cleaner API usage.

**🎯 Key Feature:** All endpoints automatically handle `postType: 'trek'` - you never need to specify it!

#### Create Trek (Host Only)
```http
POST /api/treks
Authorization: Bearer <YOUR_TOKEN>
Content-Type: multipart/form-data
```

**✅ Automatic:** `postType` is automatically set to `'trek'`

**Postman Body (form-data):**
```
title: Kedarkantha Summit Trek
description: Experience the magical winter wonderland of Uttarakhand. This moderate trek takes you through snow-covered trails, pine forests, and offers stunning views of the Himalayan peaks.
pricePerPerson: 7999
maxPeople: 15
duration: {"days": 5, "nights": 4}
difficulty: Easy-Moderate
isFeatured: true
location: {"city": "Sankri", "state": "Uttarakhand", "country": "India"}
categories: ["Adventure", "Mountain", "Snow"]
amenities: ["Guide", "Camping Equipment", "Meals", "First Aid"]
availability: {"startDate":"2025-01-01","endDate":"2025-12-31","isAvailable":true}
photos: [Select files - max 10]
videos: [Select files - max 5]
```

#### Get All Treks (With Filtering)
```http
GET /api/treks?difficulty=Moderate&minPrice=5000&maxPrice=15000&page=1&limit=20
```

**✅ Automatic:** Only returns posts with `postType: 'trek'`

**Query parameters:**
- `city`, `state`, `country`: Location filters
- `minPrice`, `maxPrice`: Price range (INR)
- `difficulty`: Easy, Easy-Moderate, Moderate, etc.
- `categories`: Comma-separated (e.g., "Adventure,Mountain")
- `minDays`, `maxDays`: Duration range
- `isFeatured`: true/false
- `sortBy`: createdAt, price.perPerson, duration.days, difficulty, title
- `order`: asc or desc
- `page`, `limit`: Pagination (default: page=1, limit=20)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "page": 1,
  "totalPages": 3,
  "treks": [
    {
      "_id": "...",
      "title": "Kedarkantha Summit Trek",
      "difficulty": "Easy-Moderate",
      "duration": { "days": 5, "nights": 4 },
      "price": { "perPerson": 7999, "currency": "INR" },
      "location": { "city": "Sankri", "state": "Uttarakhand", "country": "India" },
      "isFeatured": true,
      "photos": [...],
      "user": {...}
    }
  ]
}
```

#### Get Single Trek by ID
```http
GET /api/treks/:id
```

**✅ Automatic:** Only returns posts with `postType: 'trek'`

Returns detailed information about a specific trek.

#### Update Trek (Owner Only)
```http
PUT /api/treks/:id
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

**✅ Automatic:** Only updates posts with `postType: 'trek'`

**Postman Body (raw JSON):**
```json
{
  "title": "Updated Trek Title",
  "pricePerPerson": 8499,
  "difficulty": "Moderate",
  "isFeatured": true,
  "status": "active",
  "duration": {"days": 6, "nights": 5}
}
```

#### Delete Trek (Owner Only)
```http
DELETE /api/treks/:id
Authorization: Bearer <YOUR_TOKEN>
```

**✅ Automatic:** Only deletes posts with `postType: 'trek'`

Deletes the trek and all associated media from Cloudinary.

---

### Additional Trek Endpoints

#### Get All Treks (Simple)
```http
GET /api/posts/all/treks?limit=50&page=1
```

Returns all active treks (featured treks appear first).

#### Get Featured Treks
```http
GET /api/posts/featured/treks?limit=10
```

Returns only featured treks for homepage display.

#### Legacy Create Trek (via Posts API)
```http
POST /api/posts
Authorization: Bearer <YOUR_TOKEN>
Content-Type: multipart/form-data
```

**Postman Body (form-data):**
```
postType: trek
title: Kedarkantha Summit Trek
description: Experience the magical winter wonderland of Uttarakhand. This moderate trek takes you through snow-covered trails, pine forests, and offers stunning views of the Himalayan peaks.
pricePerPerson: 7999
maxPeople: 15
duration: {"days": 5, "nights": 4}
difficulty: Easy-Moderate
isFeatured: true
location: {"city": "Sankri", "state": "Uttarakhand", "country": "India"}
categories: ["Adventure", "Mountain", "Snow"]
amenities: ["Guide", "Camping Equipment", "Meals", "First Aid"]
availability: {"startDate":"2025-01-01","endDate":"2025-12-31","isAvailable":true}
photos: [Select files - max 10]
videos: [Select files - max 5]
```

#### Filter Treks (Legacy)
```http
GET /api/posts?postType=trek&difficulty=Moderate&isFeatured=true
```

**Note:** Use `/api/treks` endpoint instead for better filtering options.

---

## 🎯 API Quick Reference

### Dedicated Trek Endpoints (Recommended)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/treks` | Host | Create a new trek |
| GET | `/api/treks` | Public | Get all treks with filtering |
| GET | `/api/treks/:id` | Public | Get single trek by ID |
| PUT | `/api/treks/:id` | Owner | Update a trek |
| DELETE | `/api/treks/:id` | Owner | Delete a trek |

### Additional Trek Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts/all/treks` | Public | Get all treks (simple) |
| GET | `/api/posts/featured/treks` | Public | Get only featured treks |

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup/initiate` | Start signup process |
| POST | `/api/auth/signup/complete` | Complete signup with OTP |
| POST | `/api/auth/signin` | Login and get JWT token |

## 🧪 Testing the API

### 1. Create a Host User (Signup Initiate)

```http
POST /api/auth/signup/initiate
Content-Type: application/json
```

**Postman Body (raw JSON):**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "host@example.com",
  "password": "password123",
  "role": "host"
}
```

**Then complete signup with OTP:**
```http
POST /api/auth/signup/complete
Content-Type: application/json
```

**Postman Body (raw JSON):**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "host@example.com",
  "password": "password123",
  "role": "host",
  "otp": "123456"
}
```

### 2. Login

```http
POST /api/auth/signin
Content-Type: application/json
```

**Postman Body (raw JSON):**
```json
{
  "email": "host@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

Save the returned JWT token for authenticated requests.

### 3. Create a Trek Using Dedicated Endpoint

```http
POST /api/treks
Authorization: Bearer <YOUR_TOKEN>
Content-Type: multipart/form-data
```

**Postman Body (form-data):**
```
title: Kedarkantha Summit Trek
description: Experience the magical winter wonderland of Uttarakhand
pricePerPerson: 7999
maxPeople: 15
duration: {"days": 5, "nights": 4}
difficulty: Easy-Moderate
isFeatured: true
location: {"city": "Sankri", "state": "Uttarakhand", "country": "India"}
categories: ["Adventure", "Mountain"]
amenities: ["Guide", "Meals"]
photos: [Select files]
```

**Response:**
```json
{
  "success": true,
  "message": "Trek created successfully",
  "trek": {
    "_id": "trek123",
    "title": "Kedarkantha Summit Trek",
    "postType": "trek",
    ...
  }
}
```

### 4. Get All Treks with Filters

```http
GET /api/treks?difficulty=Easy-Moderate&minPrice=5000&maxPrice=10000&state=Uttarakhand&page=1&limit=10
```

### 5. Get Single Trek

```http
GET /api/treks/trek123
```

### 6. Update Trek

```http
PUT /api/treks/trek123
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

**Postman Body (raw JSON):**
```json
{
  "pricePerPerson": 8499,
  "difficulty": "Moderate",
  "isFeatured": true
}
```

### 7. Delete Trek

```http
DELETE /api/treks/trek123
Authorization: Bearer <YOUR_TOKEN>
```

### 8. View Featured Treks

```http
GET /api/posts/featured/treks?limit=10
```

No body required. No authentication required.

---

## More Postman Examples

### Create Experience Post (Guest)
```http
POST /api/posts
Authorization: Bearer <YOUR_TOKEN>
Content-Type: multipart/form-data
```

**Postman Body (form-data):**
```
postType: experience
title: Amazing Beach Vacation in Goa
description: Had an incredible time exploring the beaches of Goa. The sunset at Anjuna beach was breathtaking!
location: {"city": "Goa", "state": "Goa", "country": "India"}
photos: [Select files - max 10]
videos: [Select files - max 5]
```

### Create Service Post (Host)
```http
POST /api/posts
Authorization: Bearer <YOUR_TOKEN>
Content-Type: multipart/form-data
```

**Postman Body (form-data):**
```
postType: service
title: Cozy Mountain Homestay in Manali
description: Beautiful homestay with amazing valley views. Perfect for families and couples seeking a peaceful retreat.
pricePerPerson: 2500
maxPeople: 6
location: {"city": "Manali", "state": "Himachal Pradesh", "country": "India"}
amenities: ["WiFi", "Parking", "Kitchen", "Bonfire"]
categories: ["Luxury", "Mountain", "Nature"]
photos: [Select files - max 10]
```

### Update Post
```http
PUT /api/posts/:postId
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

**Postman Body (raw JSON):**
```json
{
  "title": "Updated Title",
  "pricePerPerson": 8499,
  "difficulty": "Moderate",
  "isFeatured": true,
  "status": "active"
}
```

### Delete Post
```http
DELETE /api/posts/:postId
Authorization: Bearer <YOUR_TOKEN>
```

No body required.

## 📋 Example Data

See `seedData.js` for example trek data matching the reference UI:
- Kedarkantha Summit Trek (5D • 4N, Easy-Moderate, ₹7,999)
- Valley of Flowers Trek (6D • 5N, Moderate, ₹10,499)
- Hampta Pass Trek (5D • 4N, Moderate, ₹9,299)
- Sand Dunes Desert Safari (2D • 1N, Easy, ₹3,499)

## 🎨 Frontend Integration

### Display Featured Treks

```javascript
// Fetch featured treks
const response = await fetch('http://localhost:3000/api/posts/featured/treks?limit=10');
const data = await response.json();

// Display each trek
data.posts.forEach(trek => {
  console.log(`${trek.title}`);
  console.log(`${trek.duration.days}D • ${trek.duration.nights}N`);
  console.log(`${trek.difficulty}`);
  console.log(`₹${trek.price.perPerson.toLocaleString('en-IN')}`);
  console.log(`${trek.location.state}, ${trek.location.country}`);
});
```

### Create Trek Form

```javascript
const formData = new FormData();
formData.append('postType', 'trek');
formData.append('title', trekTitle);
formData.append('description', trekDescription);
formData.append('duration', JSON.stringify({ days: 5, nights: 4 }));
formData.append('difficulty', 'Easy-Moderate');
formData.append('isFeatured', 'true');
formData.append('location', JSON.stringify({
  city: 'Sankri',
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
photoFiles.forEach(file => formData.append('photos', file));

const response = await fetch('http://localhost:3000/api/posts', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

## 🔐 Permissions

| Action | Guest | Host | Admin |
|--------|-------|------|-------|
| View all posts | ✅ | ✅ | ✅ |
| Create experience | ✅ | ✅ | ✅ |
| Create trek | ❌ | ✅ | ✅ |
| Create service | ❌ | ✅ | ✅ |
| Edit own posts | ✅ | ✅ | ✅ |
| Delete own posts | ✅ | ✅ | ✅ |
| Mark as featured | ❌ | ✅ | ✅ |

## 📁 Project Structure

```
athithya-backend/
├── db/
│   └── mongoose.js          # Enhanced schema with trek fields
├── routes/
│   ├── posts.js             # Trek/experience routes
│   └── users.js             # Authentication routes
├── middleware/
│   └── checkRole.js         # Role-based access control
├── utils/
│   ├── cloudinary.js        # Media upload
│   └── emailService.js      # OTP emails
├── API_DOCUMENTATION.md     # Full API docs
├── seedData.js              # Example trek data
├── server.js                # Server entry point
└── .env                     # Environment variables
```

## 🐛 Troubleshooting

### Posts not showing up
- Check `status` field is "active"
- Verify user role is "host" for trek posts
- Ensure MongoDB connection is working

### Featured treks not appearing
- Confirm `isFeatured` is set to `true`
- Check the dedicated endpoint: `/api/posts/featured/treks`

### Image upload failing
- Verify Cloudinary credentials in `.env`
- Check image file size (keep under 10MB)
- Ensure `multer` is properly configured

## 📝 Notes

- Default currency is INR (Indian Rupees)
- Featured posts appear first in listings
- Price is per person for treks
- Duration format: "5D • 4N" (5 days, 4 nights)
- All dates use ISO 8601 format

## 🔜 Future Enhancements

- [ ] Booking system for treks
- [ ] Review and rating system
- [ ] Admin dashboard for managing featured items
- [ ] Advanced search with multiple filters
- [ ] Wishlist/favorites functionality
- [ ] Trek calendar and availability management
- [ ] Payment gateway integration
- [ ] Email notifications for bookings

## 📞 Support

For questions or issues, please refer to `API_DOCUMENTATION.md` for detailed API specifications.
