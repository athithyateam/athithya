# Reviews API Documentation

Complete guide for the Reviews API endpoints. Anyone (guests and hosts) can write reviews for hosts.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Create Review](#1-create-review)
  - [Get Reviews for a Host](#2-get-reviews-for-a-host)
  - [Get Reviews by Reviewer](#3-get-reviews-by-reviewer)
  - [Get My Reviews](#4-get-my-reviews)
  - [Get Reviews Received (Host Only)](#5-get-reviews-received-host-only)
  - [Get Single Review](#6-get-single-review)
  - [Update Review](#7-update-review)
  - [Delete Review](#8-delete-review)

---

## Overview

The Reviews API allows users to rate and review hosts. Reviews can be optionally linked to specific posts (treks, services, experiences).

**Key Features:**
- ⭐ Rate hosts from 1 to 5 stars
- 💬 Leave detailed comments
- 🔗 Link reviews to specific posts
- 📊 View rating statistics and distributions
- ✏️ Edit and delete your own reviews
- 🚫 Prevent duplicate reviews for the same host/post

**Rules:**
- Only authenticated users can create reviews
- Reviews can only be given to users with "host" role
- Users cannot review themselves
- One review per host per post (if post is specified)
- Rating must be between 1 and 5

---

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

Get a token by signing in:
```http
POST /api/auth/signin
```

---

## Endpoints

### 1. Create Review

Create a new review for a host.

**Endpoint:** `POST /api/reviews`

**Authentication:** Required ✅

**Request Body (JSON):**

```json
{
  "hostId": "507f1f77bcf86cd799439011",
  "postId": "507f1f77bcf86cd799439012",
  "rating": 5,
  "comment": "Amazing trek experience! The host was very professional and helpful."
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| hostId | String | Yes | MongoDB ObjectId of the host being reviewed |
| postId | String | No | MongoDB ObjectId of the related post (trek/service/experience) |
| rating | Number | Yes | Rating from 1 to 5 |
| comment | String | Yes | Review comment (max 1000 characters) |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Review created successfully",
  "review": {
    "_id": "507f1f77bcf86cd799439013",
    "host": {
      "_id": "507f1f77bcf86cd799439011",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "role": "host"
    },
    "reviewer": {
      "_id": "507f1f77bcf86cd799439014",
      "firstname": "Jane",
      "lastname": "Smith",
      "email": "jane@example.com",
      "role": "guest"
    },
    "post": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Kedarkantha Summit Trek",
      "postType": "trek"
    },
    "rating": 5,
    "comment": "Amazing trek experience! The host was very professional and helpful.",
    "reviewerRole": "guest",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

```json
// 400 - Missing required fields
{
  "success": false,
  "message": "Host ID, rating, and comment are required"
}

// 400 - Invalid rating
{
  "success": false,
  "message": "Rating must be between 1 and 5"
}

// 400 - Self review
{
  "success": false,
  "message": "You cannot review yourself"
}

// 400 - Not a host
{
  "success": false,
  "message": "Reviews can only be given to hosts"
}

// 400 - Duplicate review
{
  "success": false,
  "message": "You have already reviewed this host for this post"
}

// 404 - Host not found
{
  "success": false,
  "message": "Host not found"
}
```

**Postman Example:**

```
POST http://localhost:3000/api/reviews
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

Body (raw JSON):
{
  "hostId": "507f1f77bcf86cd799439011",
  "postId": "507f1f77bcf86cd799439012",
  "rating": 5,
  "comment": "Excellent service and great experience!"
}
```

---

### 2. Get Reviews for a Host

Get all reviews for a specific host with rating statistics.

**Endpoint:** `GET /api/reviews/host/:hostId`

**Authentication:** Not required ❌ (Public)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| rating | Number | No | Filter by specific rating (1-5) |
| page | Number | No | Page number (default: 1) |
| limit | Number | No | Items per page (default: 20) |

**Example Request:**

```
GET /api/reviews/host/507f1f77bcf86cd799439011?rating=5&page=1&limit=10
```

**Success Response (200):**

```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "totalPages": 5,
  "averageRating": 4.67,
  "totalReviews": 45,
  "ratingDistribution": {
    "5": 30,
    "4": 10,
    "3": 3,
    "2": 1,
    "1": 1
  },
  "reviews": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "reviewer": {
        "_id": "507f1f77bcf86cd799439014",
        "firstname": "Jane",
        "lastname": "Smith",
        "email": "jane@example.com",
        "role": "guest"
      },
      "post": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Kedarkantha Summit Trek",
        "postType": "trek"
      },
      "rating": 5,
      "comment": "Amazing trek experience!",
      "reviewerRole": "guest",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Reviews by Reviewer

Get all reviews written by a specific user.

**Endpoint:** `GET /api/reviews/reviewer/:reviewerId`

**Authentication:** Not required ❌ (Public)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | Number | No | Page number (default: 1) |
| limit | Number | No | Items per page (default: 20) |

**Example Request:**

```
GET /api/reviews/reviewer/507f1f77bcf86cd799439014?page=1&limit=10
```

**Success Response (200):**

```json
{
  "success": true,
  "count": 3,
  "total": 3,
  "page": 1,
  "totalPages": 1,
  "reviews": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "host": {
        "_id": "507f1f77bcf86cd799439011",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com",
        "role": "host"
      },
      "post": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Kedarkantha Summit Trek",
        "postType": "trek"
      },
      "rating": 5,
      "comment": "Great experience!",
      "reviewerRole": "guest",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 4. Get My Reviews

Get all reviews written by the authenticated user.

**Endpoint:** `GET /api/reviews/my/reviews`

**Authentication:** Required ✅

**Example Request:**

```
GET /api/reviews/my/reviews
Authorization: Bearer YOUR_TOKEN
```

**Success Response (200):**

```json
{
  "success": true,
  "count": 5,
  "reviews": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "host": {
        "_id": "507f1f77bcf86cd799439011",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com",
        "role": "host"
      },
      "post": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Kedarkantha Summit Trek",
        "postType": "trek"
      },
      "rating": 5,
      "comment": "Excellent trek!",
      "reviewerRole": "guest",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 5. Get Reviews Received (Host Only)

Get all reviews received by the authenticated host.

**Endpoint:** `GET /api/reviews/received`

**Authentication:** Required ✅ (Host only)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| rating | Number | No | Filter by specific rating (1-5) |
| page | Number | No | Page number (default: 1) |
| limit | Number | No | Items per page (default: 20) |

**Example Request:**

```
GET /api/reviews/received?rating=5&page=1&limit=10
Authorization: Bearer YOUR_HOST_TOKEN
```

**Success Response (200):**

```json
{
  "success": true,
  "count": 10,
  "total": 30,
  "page": 1,
  "totalPages": 3,
  "reviews": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "reviewer": {
        "_id": "507f1f77bcf86cd799439014",
        "firstname": "Jane",
        "lastname": "Smith",
        "email": "jane@example.com",
        "role": "guest"
      },
      "post": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Kedarkantha Summit Trek",
        "postType": "trek"
      },
      "rating": 5,
      "comment": "Amazing host!",
      "reviewerRole": "guest",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Response:**

```json
// 403 - Not a host
{
  "success": false,
  "message": "Only hosts can view received reviews"
}
```

---

### 6. Get Single Review

Get a specific review by ID.

**Endpoint:** `GET /api/reviews/:id`

**Authentication:** Not required ❌ (Public)

**Example Request:**

```
GET /api/reviews/507f1f77bcf86cd799439013
```

**Success Response (200):**

```json
{
  "success": true,
  "review": {
    "_id": "507f1f77bcf86cd799439013",
    "host": {
      "_id": "507f1f77bcf86cd799439011",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "role": "host"
    },
    "reviewer": {
      "_id": "507f1f77bcf86cd799439014",
      "firstname": "Jane",
      "lastname": "Smith",
      "email": "jane@example.com",
      "role": "guest"
    },
    "post": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Kedarkantha Summit Trek",
      "postType": "trek"
    },
    "rating": 5,
    "comment": "Great experience!",
    "reviewerRole": "guest",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Response:**

```json
// 404 - Not found
{
  "success": false,
  "message": "Review not found"
}
```

---

### 7. Update Review

Update your own review.

**Endpoint:** `PUT /api/reviews/:id`

**Authentication:** Required ✅

**Request Body (JSON):**

```json
{
  "rating": 4,
  "comment": "Updated review comment. Still a great experience but with some suggestions."
}
```

**Example Request:**

```
PUT /api/reviews/507f1f77bcf86cd799439013
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

Body:
{
  "rating": 4,
  "comment": "Updated review comment"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Review updated successfully",
  "review": {
    "_id": "507f1f77bcf86cd799439013",
    "host": {
      "_id": "507f1f77bcf86cd799439011",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "role": "host"
    },
    "reviewer": {
      "_id": "507f1f77bcf86cd799439014",
      "firstname": "Jane",
      "lastname": "Smith",
      "email": "jane@example.com",
      "role": "guest"
    },
    "post": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Kedarkantha Summit Trek",
      "postType": "trek"
    },
    "rating": 4,
    "comment": "Updated review comment",
    "reviewerRole": "guest",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T12:30:00.000Z"
  }
}
```

**Error Responses:**

```json
// 403 - Not owner
{
  "success": false,
  "message": "You can only edit your own reviews"
}

// 404 - Not found
{
  "success": false,
  "message": "Review not found"
}

// 400 - Invalid rating
{
  "success": false,
  "message": "Rating must be between 1 and 5"
}
```

---

### 8. Delete Review

Delete your own review.

**Endpoint:** `DELETE /api/reviews/:id`

**Authentication:** Required ✅

**Example Request:**

```
DELETE /api/reviews/507f1f77bcf86cd799439013
Authorization: Bearer YOUR_TOKEN
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

**Error Responses:**

```json
// 403 - Not owner
{
  "success": false,
  "message": "You can only delete your own reviews"
}

// 404 - Not found
{
  "success": false,
  "message": "Review not found"
}
```

---

## 📝 Usage Examples

### Example 1: Review a Trek Host

```javascript
// Step 1: Find the host's ID from a trek post
const trek = await fetch('http://localhost:3000/api/posts/507f1f77bcf86cd799439012');
const hostId = trek.user._id;

// Step 2: Create a review
const response = await fetch('http://localhost:3000/api/reviews', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    hostId: hostId,
    postId: '507f1f77bcf86cd799439012',
    rating: 5,
    comment: 'Amazing trek! Highly recommended.'
  })
});

const result = await response.json();
console.log(result);
```

### Example 2: Display Host Rating Profile

```javascript
// Get all reviews for a host
const response = await fetch('http://localhost:3000/api/reviews/host/507f1f77bcf86cd799439011');
const data = await response.json();

console.log(`Average Rating: ${data.averageRating} ⭐`);
console.log(`Total Reviews: ${data.totalReviews}`);
console.log('Rating Distribution:');
console.log(`5 Stars: ${data.ratingDistribution[5]}`);
console.log(`4 Stars: ${data.ratingDistribution[4]}`);
console.log(`3 Stars: ${data.ratingDistribution[3]}`);
console.log(`2 Stars: ${data.ratingDistribution[2]}`);
console.log(`1 Star: ${data.ratingDistribution[1]}`);
```

### Example 3: cURL Commands

```bash
# Create a review
curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hostId": "507f1f77bcf86cd799439011",
    "postId": "507f1f77bcf86cd799439012",
    "rating": 5,
    "comment": "Excellent host and amazing experience!"
  }'

# Get reviews for a host
curl -X GET "http://localhost:3000/api/reviews/host/507f1f77bcf86cd799439011?page=1&limit=10"

# Update a review
curl -X PUT http://localhost:3000/api/reviews/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Updated review comment"
  }'

# Delete a review
curl -X DELETE http://localhost:3000/api/reviews/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Common Use Cases

### 1. Display Reviews on Host Profile

```javascript
async function displayHostReviews(hostId) {
  const response = await fetch(`/api/reviews/host/${hostId}?limit=5`);
  const data = await response.json();
  
  // Show average rating
  document.getElementById('avgRating').textContent = data.averageRating;
  
  // Display recent reviews
  data.reviews.forEach(review => {
    const reviewElement = `
      <div class="review">
        <div class="rating">${'⭐'.repeat(review.rating)}</div>
        <p>${review.comment}</p>
        <span>- ${review.reviewer.firstname} ${review.reviewer.lastname}</span>
      </div>
    `;
    document.getElementById('reviews').innerHTML += reviewElement;
  });
}
```

### 2. Check if User Already Reviewed

```javascript
async function hasUserReviewed(hostId, postId) {
  const response = await fetch('/api/reviews/my/reviews', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  return data.reviews.some(review => 
    review.host._id === hostId && 
    review.post?._id === postId
  );
}
```

### 3. Calculate Rating Statistics

The API automatically provides rating distribution when fetching host reviews:

```javascript
const response = await fetch(`/api/reviews/host/${hostId}`);
const data = await response.json();

// data.averageRating: 4.67
// data.totalReviews: 45
// data.ratingDistribution: { 5: 30, 4: 10, 3: 3, 2: 1, 1: 1 }
```

---

## ⚠️ Important Notes

1. **Authentication**: Most endpoints require a valid JWT token
2. **Permissions**: Users can only edit/delete their own reviews
3. **Duplicate Prevention**: Can't review the same host for the same post twice
4. **Rating Validation**: Rating must be between 1 and 5
5. **Host Verification**: Reviews can only be given to users with "host" role
6. **Self-Review Prevention**: Users cannot review themselves
7. **Post Validation**: If postId is provided, it must exist and belong to the host

---

## 🔗 Related Documentation

- [Authentication API](./README.md#authentication)
- [Posts API](./POSTS_API_DOCUMENTATION.md)
- [Itineraries API](./ITINERARY_API_DOCUMENTATION.md)

---

## 📞 Support

For questions or issues, please refer to the main `API_DOCUMENTATION.md` file.
