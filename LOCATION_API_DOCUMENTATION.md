# Location API Documentation

## Overview
The Location API allows both hosts and users (guests) to update and retrieve their geographic location. This feature supports the "Use My Location" functionality in the frontend.

## Base URL
```
/api/auth
```

## Authentication
All location endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Update User Location

Update the current user's location (works for both hosts and guests).

**Endpoint:** `PUT /api/auth/location`

**Authentication Required:** Yes

**Request Body:**
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "address": "123 Main Street",
  "city": "San Francisco",
  "state": "California",
  "country": "United States"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description | Constraints |
|-----------|------|----------|-------------|-------------|
| latitude | Number | Yes | Latitude coordinate | Must be between -90 and 90 |
| longitude | Number | Yes | Longitude coordinate | Must be between -180 and 180 |
| address | String | No | Full address | |
| city | String | No | City name | |
| state | String | No | State/Province name | |
| country | String | No | Country name | |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "role": "guest",
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "address": "123 Main Street",
      "city": "San Francisco",
      "state": "California",
      "country": "United States",
      "lastUpdated": "2025-12-18T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 Bad Request - Missing coordinates:**
```json
{
  "success": false,
  "message": "Latitude and longitude are required"
}
```

**400 Bad Request - Invalid latitude:**
```json
{
  "success": false,
  "message": "Latitude must be between -90 and 90"
}
```

**400 Bad Request - Invalid longitude:**
```json
{
  "success": false,
  "message": "Longitude must be between -180 and 180"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 2. Get User Location

Retrieve the current user's location (works for both hosts and guests).

**Endpoint:** `GET /api/auth/location`

**Authentication Required:** Yes

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "role": "host",
    "name": "John Doe",
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "address": "123 Main Street",
      "city": "San Francisco",
      "state": "California",
      "country": "United States",
      "lastUpdated": "2025-12-18T10:30:00.000Z"
    }
  }
}
```

**Response when location not set:**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "role": "guest",
    "name": "Jane Smith",
    "location": null
  }
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Frontend Integration Examples

### Using Fetch API

#### Update Location
```javascript
// Get coordinates from browser's geolocation API
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/location', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourToken}`
      },
      body: JSON.stringify({
        latitude: latitude,
        longitude: longitude,
        // Optional: Add reverse geocoding results
        address: '123 Main Street',
        city: 'San Francisco',
        state: 'California',
        country: 'United States'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Location updated:', data.data);
    } else {
      console.error('Failed to update location:', data.message);
    }
  } catch (error) {
    console.error('Error updating location:', error);
  }
});
```

#### Get Location
```javascript
async function getUserLocation() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/location', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${yourToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('User location:', data.data.location);
      return data.data;
    } else {
      console.error('Failed to fetch location:', data.message);
    }
  } catch (error) {
    console.error('Error fetching location:', error);
  }
}
```

### Using Axios

#### Update Location
```javascript
import axios from 'axios';

// Get coordinates from browser's geolocation API
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;
  
  try {
    const response = await axios.put(
      'http://localhost:3000/api/auth/location',
      {
        latitude: latitude,
        longitude: longitude,
        address: '123 Main Street',
        city: 'San Francisco',
        state: 'California',
        country: 'United States'
      },
      {
        headers: {
          'Authorization': `Bearer ${yourToken}`
        }
      }
    );
    
    console.log('Location updated:', response.data.data);
  } catch (error) {
    console.error('Error updating location:', error.response?.data || error.message);
  }
});
```

#### Get Location
```javascript
import axios from 'axios';

async function getUserLocation() {
  try {
    const response = await axios.get(
      'http://localhost:3000/api/auth/location',
      {
        headers: {
          'Authorization': `Bearer ${yourToken}`
        }
      }
    );
    
    console.log('User location:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching location:', error.response?.data || error.message);
  }
}
```

---

## Complete Frontend Implementation Example

### React Component with Location Feature

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function LocationFeature() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem('token'); // Your JWT token
  
  // Update location using browser's geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Optionally: Use reverse geocoding API to get address details
          // For example, using Google Maps Geocoding API or other services
          
          const response = await axios.put(
            'http://localhost:3000/api/auth/location',
            {
              latitude: latitude,
              longitude: longitude,
              // Add address details if available from reverse geocoding
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          setLocation(response.data.data.location);
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to update location');
          setLoading(false);
        }
      },
      (err) => {
        setError(`Geolocation error: ${err.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };
  
  // Fetch current location
  const fetchCurrentLocation = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3000/api/auth/location',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setLocation(response.data.data.location);
    } catch (err) {
      console.error('Error fetching location:', err);
    }
  };
  
  useEffect(() => {
    fetchCurrentLocation();
  }, []);
  
  return (
    <div>
      <h2>My Location</h2>
      
      <button 
        onClick={handleUseMyLocation} 
        disabled={loading}
      >
        {loading ? 'Getting location...' : 'Use My Location'}
      </button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {location ? (
        <div>
          <h3>Current Location:</h3>
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
          {location.city && <p>City: {location.city}</p>}
          {location.state && <p>State: {location.state}</p>}
          {location.country && <p>Country: {location.country}</p>}
          {location.lastUpdated && (
            <p>Last Updated: {new Date(location.lastUpdated).toLocaleString()}</p>
          )}
        </div>
      ) : (
        <p>No location set</p>
      )}
    </div>
  );
}

export default LocationFeature;
```

---

## Database Schema

The location data is stored in the User collection with the following structure:

```javascript
location: {
  latitude: Number,          // Required when updating
  longitude: Number,         // Required when updating
  address: String,           // Optional
  city: String,              // Optional
  state: String,             // Optional
  country: String,           // Optional
  lastUpdated: Date         // Automatically set when location is updated
}
```

---

## Notes

1. **Privacy**: Location data is stored per user and only accessible to that authenticated user
2. **Role Support**: Works for both 'guest' and 'host' roles automatically
3. **Coordinate Validation**: Ensures latitude and longitude are within valid ranges
4. **Timestamp**: Automatically tracks when the location was last updated
5. **Optional Fields**: Address, city, state, and country are optional but recommended for better UX
6. **Reverse Geocoding**: Frontend should implement reverse geocoding to get address details from coordinates

---

## Security Considerations

1. Always use HTTPS in production to protect location data
2. Location data is personal information - handle according to privacy regulations
3. Consider implementing rate limiting to prevent abuse
4. Users should be able to delete their location data
5. Inform users when their location is being accessed or stored

---

## Error Handling Best Practices

1. Always handle geolocation permission denials gracefully
2. Provide clear error messages to users
3. Implement fallback options (e.g., manual address entry)
4. Set appropriate timeouts for geolocation requests
5. Log errors for debugging but don't expose sensitive information to users
