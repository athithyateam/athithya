# Booking API Documentation

## Overview
This API handles trip/experience bookings, allowing guests to request bookings and hosts to manage (accept/decline) booking requests.

---

## Endpoints

### 1. Create Booking Request (Guest)
**POST** `/api/bookings`

Allows authenticated guests to create a booking request for a trip/experience.

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body
```json
{
  "postId": "60d0fe4f5311236168a109ca",
  "numberOfPeople": 2,
  "startDate": "2026-02-15",
  "endDate": "2026-02-20",
  "guestMessage": "Looking forward to this trip!"
}
```

#### Required Fields
- `postId` (string): ID of the post/trip to book
- `numberOfPeople` (number): Number of people for the booking (minimum: 1)
- `startDate` (string): Start date in ISO format

#### Optional Fields
- `endDate` (string): End date in ISO format
- `guestMessage` (string): Message from guest to host (max 500 chars)

#### Success Response (201)
```json
{
  "success": true,
  "message": "Booking request sent successfully",
  "data": {
    "_id": "60d0fe4f5311236168a109cb",
    "guest": {
      "_id": "60d0fe4f5311236168a109c1",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "avatar": {
        "url": "https://...",
        "public_id": "..."
      }
    },
    "host": "60d0fe4f5311236168a109c2",
    "post": {
      "_id": "60d0fe4f5311236168a109ca",
      "title": "Amazing Trek to Himalayas",
      "postType": "trek",
      "photos": [...]
    },
    "postType": "trek",
    "postTitle": "Amazing Trek to Himalayas",
    "numberOfPeople": 2,
    "totalAmount": 20000,
    "bookingDate": "2026-01-17T10:30:00.000Z",
    "startDate": "2026-02-15T00:00:00.000Z",
    "endDate": "2026-02-20T00:00:00.000Z",
    "status": "pending",
    "guestMessage": "Looking forward to this trip!",
    "createdAt": "2026-01-17T10:30:00.000Z",
    "updatedAt": "2026-01-17T10:30:00.000Z"
  }
}
```

#### Error Responses
- **400** - Missing required fields or validation errors
- **404** - Post not found
- **401** - Unauthorized (not logged in)
- **500** - Server error

---

### 2. Get Host's Booking Requests
**GET** `/api/bookings/host/requests`

Allows hosts to view all booking requests for their trips/experiences.

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters
- `status` (optional): Filter by status - `pending`, `accepted`, `declined`, `cancelled`, `completed`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

#### Example Request
```
GET /api/bookings/host/requests?status=pending&page=1&limit=10
```

#### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109cb",
      "guest": {
        "_id": "60d0fe4f5311236168a109c1",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com",
        "avatar": {
          "url": "https://...",
          "public_id": "..."
        }
      },
      "host": "60d0fe4f5311236168a109c2",
      "post": {
        "_id": "60d0fe4f5311236168a109ca",
        "title": "Amazing Trek to Himalayas",
        "postType": "trek",
        "photos": [...],
        "location": {
          "city": "Manali",
          "state": "Himachal Pradesh",
          "country": "India"
        }
      },
      "numberOfPeople": 2,
      "totalAmount": 20000,
      "startDate": "2026-02-15T00:00:00.000Z",
      "endDate": "2026-02-20T00:00:00.000Z",
      "status": "pending",
      "guestMessage": "Looking forward to this trip!",
      "createdAt": "2026-01-17T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  },
  "summary": {
    "pending": 10,
    "accepted": 12,
    "declined": 3,
    "total": 25
  }
}
```

---

### 3. Accept Booking Request
**PATCH** `/api/bookings/:bookingId/accept`

Allows hosts to accept a pending booking request.

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### URL Parameters
- `bookingId` (required): ID of the booking to accept

#### Request Body (optional)
```json
{
  "hostResponse": "Great! Looking forward to hosting you. I'll send more details soon."
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Booking accepted successfully",
  "data": {
    "_id": "60d0fe4f5311236168a109cb",
    "status": "accepted",
    "hostResponse": "Great! Looking forward to hosting you. I'll send more details soon.",
    "respondedAt": "2026-01-17T11:00:00.000Z",
    ...
  }
}
```

#### Error Responses
- **404** - Booking not found
- **403** - Unauthorized (not the host of this booking)
- **400** - Booking is not in pending status
- **500** - Server error

---

### 4. Decline Booking Request
**PATCH** `/api/bookings/:bookingId/decline`

Allows hosts to decline a pending booking request.

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### URL Parameters
- `bookingId` (required): ID of the booking to decline

#### Request Body (optional)
```json
{
  "hostResponse": "Sorry, those dates are no longer available."
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Booking declined successfully",
  "data": {
    "_id": "60d0fe4f5311236168a109cb",
    "status": "declined",
    "hostResponse": "Sorry, those dates are no longer available.",
    "respondedAt": "2026-01-17T11:00:00.000Z",
    ...
  }
}
```

---

### 5. Get Booking Details
**GET** `/api/bookings/:bookingId`

Get detailed information about a specific booking. Only accessible by the guest or host involved.

#### Headers
```
Authorization: Bearer <token>
```

#### URL Parameters
- `bookingId` (required): ID of the booking

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109cb",
    "guest": {...},
    "host": {...},
    "post": {...},
    "numberOfPeople": 2,
    "totalAmount": 20000,
    "status": "accepted",
    "guestMessage": "...",
    "hostResponse": "...",
    "respondedAt": "2026-01-17T11:00:00.000Z",
    "createdAt": "2026-01-17T10:30:00.000Z"
  }
}
```

---

### 6. Get Guest's Bookings
**GET** `/api/bookings/guest/my-bookings`

Allows guests to view all their booking requests.

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters
- `status` (optional): Filter by status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

#### Success Response (200)
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

## Booking Status Flow

```
pending → accepted → completed
    ↓
declined
    ↓
cancelled
```

### Status Descriptions
- **pending**: Initial state when booking is created
- **accepted**: Host has accepted the booking
- **declined**: Host has declined the booking
- **cancelled**: Guest or host cancelled the booking
- **completed**: Trip/experience has been completed

---

## Notifications

The system automatically creates notifications:
- When a guest creates a booking → Host receives notification
- When host accepts a booking → Guest receives notification
- When host declines a booking → Guest receives notification

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

---

## Database Schema

### Booking Model
```javascript
{
  guest: ObjectId (ref: 'user'),
  host: ObjectId (ref: 'user'),
  post: ObjectId (ref: 'post'),
  postType: String ['experience', 'service', 'plan', 'trek'],
  postTitle: String,
  numberOfPeople: Number (min: 1),
  totalAmount: Number (min: 0),
  bookingDate: Date,
  startDate: Date,
  endDate: Date,
  status: String ['pending', 'accepted', 'declined', 'cancelled', 'completed'],
  guestMessage: String (max: 500),
  hostResponse: String (max: 500),
  respondedAt: Date,
  timestamps: true
}
```

---

## Example Use Cases

### Use Case 1: Guest Books a Trek
```javascript
// Step 1: Guest creates booking request
POST /api/bookings
{
  "postId": "trek123",
  "numberOfPeople": 3,
  "startDate": "2026-03-01",
  "guestMessage": "First time trekking, excited!"
}

// Step 2: Host views all pending requests
GET /api/bookings/host/requests?status=pending

// Step 3: Host accepts the booking
PATCH /api/bookings/booking123/accept
{
  "hostResponse": "Welcome! I'll guide you through everything."
}
```

### Use Case 2: Host Reviews All Bookings
```javascript
// Get all bookings with summary
GET /api/bookings/host/requests

// Filter only pending requests
GET /api/bookings/host/requests?status=pending

// Get accepted bookings with pagination
GET /api/bookings/host/requests?status=accepted&page=1&limit=5
```

---

## Authentication Required

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

To get a token, users must first log in through the authentication API.
