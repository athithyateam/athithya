# User Profile API Documentation 👤

## Overview
The User Profile API provides comprehensive information about users including their details, posts, and reviews. This endpoint is perfect for displaying user profiles, host information, and travel portfolios.

## Base URL
```
/api/users
```

---

## 📋 Get User Profile with All Details

**GET** `/api/users/profile/:userId`

Get complete user information including all their posts and reviews (for hosts).

**Authentication:** Not required (public access)

### URL Parameters
- `:userId` - The unique ID of the user

### Example Request
```
GET /api/users/profile/65xyz789abc123456
```

---

## 📊 Response Structure

### Success Response
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65xyz789abc123456",
      "firstname": "Rajesh",
      "lastname": "Kumar",
      "email": "rajesh@example.com",
      "role": "host",
      "isVerified": true,
      "location": {
        "city": "Manali",
        "state": "Himachal Pradesh",
        "country": "India",
        "latitude": 32.2396,
        "longitude": 77.1887,
        "lastUpdated": "2025-12-18T10:30:00.000Z"
      },
      "createdAt": "2024-06-15T08:20:00.000Z",
      "updatedAt": "2025-12-18T10:30:00.000Z"
    },
    "postStats": {
      "total": 15,
      "experiences": 3,
      "services": 8,
      "treks": 4,
      "plans": 0
    },
    "posts": [
      {
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
        "price": {
          "perPerson": 2500,
          "period": "night",
          "currency": "INR"
        },
        "duration": {
          "days": 1,
          "nights": 0
        },
        "capacity": {
          "maxPeople": 6
        },
        "amenities": ["WiFi", "Parking", "Kitchen"],
        "categories": ["Luxury", "Mountain"],
        "status": "active",
        "isFeatured": true,
        "createdAt": "2025-11-10T10:30:00.000Z"
      }
      // ... more posts
    ],
    "reviews": [
      {
        "_id": "67review123",
        "host": "65xyz789abc123456",
        "reviewer": {
          "_id": "65guest123",
          "firstname": "Priya",
          "lastname": "Sharma"
        },
        "rating": 5,
        "comment": "Amazing homestay! Rajesh was very helpful and the location is perfect.",
        "createdAt": "2025-12-01T14:30:00.000Z"
      }
      // ... more reviews (latest 10)
    ],
    "reviewStats": {
      "totalReviews": 25,
      "averageRating": "4.6",
      "ratings": {
        "5": 18,
        "4": 5,
        "3": 2,
        "2": 0,
        "1": 0
      }
    }
  }
}
```

---

## 🎯 Response Fields Explained

### User Object
Contains all user information except sensitive data (password, OTP):

| Field | Type | Description |
|-------|------|-------------|
| `_id` | String | User's unique ID |
| `firstname` | String | User's first name |
| `lastname` | String | User's last name |
| `email` | String | User's email address |
| `role` | String | User role: `guest`, `host`, or `admin` |
| `isVerified` | Boolean | Email verification status |
| `location` | Object | User's location details |
| `createdAt` | Date | Account creation date |
| `updatedAt` | Date | Last update date |

### Post Stats Object
Summary of user's posts by type:

| Field | Type | Description |
|-------|------|-------------|
| `total` | Number | Total number of posts |
| `experiences` | Number | Number of experience posts |
| `services` | Number | Number of service posts |
| `treks` | Number | Number of trek posts |
| `plans` | Number | Number of plan posts |

### Posts Array
Complete list of all active posts by the user, sorted by creation date (newest first). Each post includes:
- All post details (title, description, photos, videos)
- Location and pricing information
- Amenities and categories
- Availability and capacity
- Status and featured flag

### Reviews Array (Hosts Only)
Only included if user is a host. Contains latest 10 reviews with:
- Reviewer information
- Rating (1-5)
- Comment
- Review date

### Review Stats Object (Hosts Only)
Only included if user is a host and has reviews:

| Field | Type | Description |
|-------|------|-------------|
| `totalReviews` | Number | Total number of reviews received |
| `averageRating` | String | Average rating (1 decimal place) |
| `ratings` | Object | Count of each rating (5, 4, 3, 2, 1) |

---

## 🔍 Use Cases

### 1. **Display Host Profile Page**
Show complete host information with all their services and guest reviews.

```javascript
fetch('/api/users/profile/65xyz789abc123456')
  .then(response => response.json())
  .then(data => {
    const { user, postStats, posts, reviewStats } = data.data;
    
    // Display host info
    console.log(`${user.firstname} ${user.lastname}`);
    console.log(`Role: ${user.role}`);
    console.log(`Location: ${user.location.city}`);
    
    // Display statistics
    console.log(`Total Posts: ${postStats.total}`);
    console.log(`Average Rating: ${reviewStats.averageRating} ⭐`);
    
    // Display all services
    posts.forEach(post => {
      console.log(`- ${post.title} (${post.postType})`);
    });
  });
```

### 2. **View User's Travel Portfolio**
Display all experiences and adventures shared by a traveler.

```javascript
const response = await fetch('/api/users/profile/65traveler456');
const { data } = await response.json();

const experiences = data.posts.filter(p => p.postType === 'experience');
console.log(`${data.user.firstname} has shared ${experiences.length} travel experiences`);
```

### 3. **Check Host Credibility**
Verify host rating and reviews before booking a service.

```javascript
const response = await fetch('/api/users/profile/65host789');
const { data } = await response.json();

if (data.reviewStats) {
  const rating = parseFloat(data.reviewStats.averageRating);
  const totalReviews = data.reviewStats.totalReviews;
  
  if (rating >= 4.5 && totalReviews >= 10) {
    console.log('✅ Highly rated host!');
  }
}
```

### 4. **List All Services by Host**
Get all services offered by a specific host.

```javascript
const response = await fetch('/api/users/profile/65host789');
const { data } = await response.json();

const services = data.posts.filter(p => p.postType === 'service');
services.forEach(service => {
  console.log(`${service.title} - ₹${service.price.perPerson}/${service.price.period}`);
});
```

---

## 📱 Frontend Example - React Component

```javascript
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/profile/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>User not found</div>;

  const { user, postStats, posts, reviewStats } = profile;

  return (
    <div className="user-profile">
      {/* User Info */}
      <div className="user-header">
        <h1>{user.firstname} {user.lastname}</h1>
        <p>{user.role.toUpperCase()}</p>
        {user.location && (
          <p>📍 {user.location.city}, {user.location.country}</p>
        )}
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-box">
          <h3>{postStats.total}</h3>
          <p>Total Posts</p>
        </div>
        {postStats.services > 0 && (
          <div className="stat-box">
            <h3>{postStats.services}</h3>
            <p>Services</p>
          </div>
        )}
        {reviewStats && (
          <div className="stat-box">
            <h3>{reviewStats.averageRating} ⭐</h3>
            <p>{reviewStats.totalReviews} Reviews</p>
          </div>
        )}
      </div>

      {/* Posts Grid */}
      <div className="posts-section">
        <h2>Posts ({posts.length})</h2>
        <div className="posts-grid">
          {posts.map(post => (
            <div key={post._id} className="post-card">
              {post.photos[0] && (
                <img src={post.photos[0].url} alt={post.title} />
              )}
              <h3>{post.title}</h3>
              <p className="post-type">{post.postType}</p>
              {post.price?.perPerson && (
                <p className="price">₹{post.price.perPerson}/{post.price.period}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reviews (for hosts) */}
      {profile.reviews && profile.reviews.length > 0 && (
        <div className="reviews-section">
          <h2>Reviews</h2>
          {profile.reviews.map(review => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <strong>
                  {review.reviewer.firstname} {review.reviewer.lastname}
                </strong>
                <span className="rating">{'⭐'.repeat(review.rating)}</span>
              </div>
              <p>{review.comment}</p>
              <small>{new Date(review.createdAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserProfile;
```

---

## ❌ Error Responses

### User Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### Invalid User ID
```json
{
  "success": false,
  "message": "Failed to fetch user profile",
  "error": "Cast to ObjectId failed..."
}
```

---

## 🔐 Security & Privacy

### What's Excluded:
- ❌ Password (always excluded)
- ❌ OTP codes and expiry (always excluded)
- ❌ Inactive/archived posts (only active posts shown)

### What's Public:
- ✅ User name and role
- ✅ Email address
- ✅ Location information
- ✅ All active posts
- ✅ Reviews (for hosts)

---

## 💡 Tips for Using This Endpoint

### 1. **Cache User Profiles**
User profiles don't change frequently, so consider caching:
```javascript
// Cache for 5 minutes
const cacheKey = `user_profile_${userId}`;
const cachedData = localStorage.getItem(cacheKey);

if (cachedData) {
  const { data, timestamp } = JSON.parse(cachedData);
  if (Date.now() - timestamp < 300000) { // 5 minutes
    return data;
  }
}
```

### 2. **Filter Posts by Type**
Separate different types of content:
```javascript
const { posts } = profileData;
const services = posts.filter(p => p.postType === 'service');
const experiences = posts.filter(p => p.postType === 'experience');
const treks = posts.filter(p => p.postType === 'trek');
```

### 3. **Display Rating Stars**
Convert numeric rating to visual stars:
```javascript
const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return '⭐'.repeat(fullStars) + (hasHalfStar ? '½' : '');
};
```

### 4. **Show Post Variety**
Highlight diverse content:
```javascript
const postTypes = [...new Set(posts.map(p => p.postType))];
console.log(`Offers ${postTypes.join(', ')}`);
```

---

## 🎨 UI Suggestions

### Host Profile Page Should Display:
1. **Header Section**
   - Host name and photo
   - Role badge
   - Location
   - Average rating ⭐
   - Member since date

2. **Statistics Bar**
   - Total posts
   - Total reviews
   - Response rate (if available)
   - Languages spoken (if added)

3. **Services Grid**
   - Featured services first
   - Service cards with images
   - Price and capacity
   - Quick booking button

4. **Reviews Section**
   - Average rating breakdown
   - Latest reviews
   - "View all reviews" button

5. **About Section**
   - Bio/description (if added to schema)
   - Verified badges
   - Contact button

### Guest Profile Page Should Display:
1. **Header Section**
   - Guest name
   - Location
   - Member since date

2. **Travel Portfolio**
   - Grid of experiences shared
   - Photo galleries
   - Travel statistics

3. **Activity Timeline**
   - Recent posts
   - Places visited
   - Trip count

---

## 🔗 Related Endpoints

- `GET /api/posts/services/host/:userId` - Get only services by host
- `GET /api/posts/user/:userId` - Get all posts by user (alternative)
- `GET /api/reviews/host/:hostId` - Get all reviews for host
- `GET /api/users/admin/users/:id` - Get user details (Admin only)

---

## 📝 Notes

- This endpoint returns **public information only**
- **Reviews are limited to 10** most recent (use dedicated review endpoint for all)
- Only **active posts** are returned (status: 'active')
- Posts are sorted by **creation date** (newest first)
- For hosts with no reviews, `reviews` and `reviewStats` will be `null` or `undefined`
- Location data is included if user has set their location

---

## 🚀 Performance Considerations

- **Response Size**: Can be large for users with many posts
- **Recommendation**: Implement pagination for posts if needed
- **Optimization**: Consider adding query parameters like `?postsLimit=10&reviewsLimit=5`
- **Caching**: Suitable for client-side caching (5-10 minutes)

---

## 📊 Example Use in Mobile App

```javascript
// Fetch and display host profile
async function displayHostProfile(hostId) {
  const response = await fetch(`/api/users/profile/${hostId}`);
  const { success, data } = await response.json();
  
  if (!success) {
    alert('Host not found');
    return;
  }
  
  const { user, postStats, reviewStats } = data;
  
  // Display in mobile UI
  return {
    name: `${user.firstname} ${user.lastname}`,
    role: user.role,
    location: `${user.location?.city || 'Location not set'}`,
    rating: reviewStats?.averageRating || 'No ratings yet',
    totalReviews: reviewStats?.totalReviews || 0,
    totalServices: postStats.services,
    memberSince: new Date(user.createdAt).getFullYear()
  };
}
```

---

**Need Help?** 
- Check out the [API Examples](API_EXAMPLES.md) for more usage patterns
- See [Posts API Documentation](POSTS_API_DOCUMENTATION.md) for post details
- See [Reviews API Documentation](REVIEWS_API_DOCUMENTATION.md) for review details
