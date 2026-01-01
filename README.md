# Athithya Backend API

A comprehensive travel and trekking platform API built with Node.js, Express, MongoDB, and JWT.

## Features

### 🔐 Authentication
- ✅ User Registration with OTP Verification
- ✅ User Login (Signin)
- ✅ Password Hashing with bcrypt
- ✅ JWT Token Authentication
- ✅ Role-based Access (Guest, Host, Admin)

### 🏔️ Posts & Experiences
- ✅ Create Treks, Services, and Experiences
- ✅ Featured Content Management
- ✅ Top-Rated Treks with Reviews
- ✅ Nearby Trek Discovery (Geospatial)
- ✅ Photo & Video Upload (Cloudinary)

### 👥 User Management
- ✅ User Profiles
- ✅ Host Rating System
- ✅ Top-Rated Hosts
- ✅ Location-based User Discovery

### ⭐ Reviews & Ratings
- ✅ Review Hosts and Treks
- ✅ Rating Aggregation
- ✅ Review Management

### 🛠️ Technical
- ✅ Input Validation with Zod
- ✅ CORS Enabled
- ✅ MongoDB with Mongoose
- ✅ Cloudinary Integration
- ✅ Email Service (OTP)

## Quick Links

📚 **Detailed API Documentation:**
- [Complete API Documentation](API_DOCUMENTATION.md)
- [Experiences API](EXPERIENCES_API_DOCUMENTATION.md)
- [Services API](SERVICES_API_DOCUMENTATION.md)
- [Top-Rated Treks API](TOP_RATED_TREKS_API_DOCUMENTATION.md)
- [Top-Rated Hosts API](TOP_RATED_HOSTS_API_DOCUMENTATION.md)
- [Nearby Treks API](NEARBY_TREKS_API_DOCUMENTATION.md)
- [Reviews API](REVIEWS_API_DOCUMENTATION.md)
- [User Profile API](USER_PROFILE_API_DOCUMENTATION.md)

## API Endpoints Overview

### Base URL
```
http://localhost:3000
```

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/signup/initiate` | Send OTP for signup | No |
| POST | `/signup/complete` | Complete signup with OTP | No |
| POST | `/signin` | User login | No |
| POST | `/send-otp` | Send OTP to email | No |
| POST | `/verify-otp` | Verify OTP | No |

### 📝 Posts (`/api/posts`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create post (trek/service/experience) | Yes |
| GET | `/` | Get all posts with filters | No |
| GET | `/:id` | Get single post by ID | No |
| PUT | `/:id` | Update post | Yes (Owner) |
| DELETE | `/:id` | Delete post | Yes (Owner) |

### 🏔️ Experiences (`/api/posts/experiences`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/experiences` | Create experience | Yes |
| GET | `/experiences` | Get all experiences | No |
| GET | `/experiences/:id` | Get single experience | No |
| GET | `/experiences/featured/list` | Get featured experiences | No |
| GET | `/experiences/my/list` | Get my experiences | Yes |
| GET | `/experiences/user/:userId` | Get user's experiences | No |
| PUT | `/experiences/:id` | Update experience | Yes (Owner) |
| DELETE | `/experiences/:id` | Delete experience | Yes (Owner) |

### 🛎️ Services (`/api/posts/services`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/services` | Create service | Yes (Host) |
| GET | `/services` | Get all services | No |
| GET | `/services/:id` | Get single service | No |
| GET | `/services/featured/list` | Get featured services | No |
| GET | `/services/my/list` | Get my services | Yes (Host) |
| GET | `/services/host/:userId` | Get host's services | No |
| PUT | `/services/:id` | Update service | Yes (Host/Owner) |
| DELETE | `/services/:id` | Delete service | Yes (Host/Owner) |

### ⛰️ Treks (`/api/posts`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/featured/treks` | Get featured treks | No |
| GET | `/top-rated/treks` | Get top-rated treks | No |
| GET | `/nearby/treks` | Find nearby treks (GPS) | No |

### 👤 Users (`/api/users`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profile/:userId` | Get user profile | No |
| GET | `/top-rated/hosts` | Get top-rated hosts | No |
| PUT | `/location` | Update user location | Yes |
| GET | `/location` | Get user location | Yes |

### ⭐ Reviews (`/api/reviews`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create review | Yes |
| GET | `/host/:hostId` | Get reviews for host | No |
| GET | `/my/reviews` | Get my reviews | Yes |
| GET | `/received` | Get reviews received (Host) | Yes (Host) |
| PUT | `/:reviewId` | Update review | Yes (Owner) |
| DELETE | `/:reviewId` | Delete review | Yes (Owner) |

### 🗺️ Itineraries (`/api/itineraries`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create itinerary | Yes |
| GET | `/` | Get all itineraries | No |
| GET | `/:id` | Get single itinerary | No |
| PUT | `/:id` | Update itinerary | Yes (Owner) |
| DELETE | `/:id` | Delete itinerary | Yes (Owner) |

### 🏥 Health Check
```
GET /health
```
Response:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
MONGO_URL=mongodb://localhost:27017/athithya
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000

# Cloudinary Configuration (for image/video uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (for OTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 4. Run the Server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

Server will start on: `http://localhost:3000`

---

## 📖 Example Usage

### Create an Experience
```javascript
const formData = new FormData();
formData.append("title", "Kedarkantha Winter Trek");
formData.append("description", "Amazing winter trek experience...");
formData.append("city", "Sankri");
formData.append("state", "Uttarakhand");
formData.append("pricePerPerson", "18000");
formData.append("days", "6");
formData.append("nights", "5");
formData.append("difficulty", "Moderate");
formData.append("categories", JSON.stringify(["Adventure", "Mountain", "Snow"]));
formData.append("photos", photoFile);

const response = await fetch("http://localhost:3000/api/posts/experiences", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`
  },
  body: formData
});
```

### Get Top-Rated Hosts
```javascript
const response = await fetch(
  "http://localhost:3000/api/users/top-rated/hosts?limit=10&minRating=4.5"
);
const data = await response.json();
console.log(data.hosts);
```

### Find Nearby Treks
```javascript
const response = await fetch(
  "http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=50000"
);
const data = await response.json();
console.log(data.treks);
```

---

## 🔒 Authentication Flow

1. **Initiate Signup**: User provides details and receives OTP via email
2. **Complete Signup**: User enters OTP to create verified account
3. **Signin**: User logs in with email and password
4. **Access Protected Routes**: Use JWT token in Authorization header

```javascript
// Example authentication flow
// 1. Initiate signup
await fetch("/api/auth/signup/initiate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    firstname: "John",
    lastname: "Doe",
    email: "john@example.com",
    password: "secure123",
    role: "guest"
  })
});

// 2. Complete signup with OTP
const signupRes = await fetch("/api/auth/signup/complete", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    firstname: "John",
    lastname: "Doe",
    email: "john@example.com",
    password: "secure123",
    role: "guest",
    otp: "123456"
  })
});

const { token } = await signupRes.json();

// 3. Use token for authenticated requests
await fetch("/api/posts/experiences/my/list", {
  headers: {
    "Authorization": `Bearer ${token}`
  }
});
```

---

## 🎯 User Roles

### Guest
- Create experiences
- Post reviews
- View all public content
- Manage own posts

### Host
- All guest permissions
- Create services and treks
- Receive reviews
- Featured content eligibility

### Admin
- Full access to all features
- User management
- Content moderation
- Analytics access

---

## ✨ Key Features Explained

### 🌟 Featured Content
Posts can be marked as featured (`isFeatured: true`) to appear in priority listings.

### ⭐ Rating System
- Users can review hosts (1-5 stars)
- Automatic average rating calculation
- Top-rated treks and hosts endpoints

### 📍 Location Services
- Store user location with coordinates
- Find nearby treks using geospatial queries
- Filter by city, state, or country

### 📸 Media Management
- Upload up to 10 photos per post
- Upload up to 5 videos per post
- Automatic Cloudinary integration
- Media cleanup on post deletion

---

## 📋 Validation Rules

### Signup
- `firstname`: Required, minimum 1 character
- `lastname`: Required, minimum 1 character
- `email`: Required, must be valid email format
- `password`: Required, minimum 6 characters

### Signin
- `email`: Required, must be valid email format
- `password`: Required

## Error Responses

### 400 Bad Request
```json
{
  "message": "User already exists"
}
```
or
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [...]
}
```

### 404 Not Found
```json
{
  "message": "Route not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error creating user"
}
```

## Security Features

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens expire after 1 hour
- Email addresses are stored in lowercase and trimmed
- CORS enabled for cross-origin requests
- Input validation on all endpoints

## Technologies Used

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Zod** - Schema validation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## License

ISC
