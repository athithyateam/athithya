# Nearby Treks API Documentation 📍

## Overview
The **Nearby Treks API** helps users discover trekking adventures near their current location using GPS coordinates. This endpoint uses geospatial queries to find treks within a specified radius, making it perfect for travelers who want to explore nearby destinations.

## Base URL
```
/api/posts/nearby/treks
```

## 🗺️ How It Works

1. **User provides their location** (latitude & longitude)
2. **API searches** for treks within specified radius
3. **Results are sorted** by distance (nearest first)
4. **Distance is calculated** for each trek in kilometers

## 📚 Endpoint Details

### Get Nearby Treks
**GET** `/api/posts/nearby/treks`

Find treks near a specific location using GPS coordinates.

**Authentication:** Not required (Public)

#### Query Parameters

**Required:**
- `latitude` (number): Latitude of your current location
  - Range: -90 to 90
  - Example: `30.3165` (Dehradun)
  
- `longitude` (number): Longitude of your current location
  - Range: -180 to 180
  - Example: `78.0322` (Dehradun)

**Optional:**
- `maxDistance` (number): Maximum search radius in meters
  - Default: `100000` (100 km)
  - Example: `50000` (50 km)
  
- `limit` (number): Maximum number of treks to return
  - Default: `20`
  - Example: `10`
  
- `difficulty` (string): Filter by difficulty level
  - Values: `Easy`, `Easy-Moderate`, `Moderate`, `Moderate-Difficult`, `Difficult`, `Challenging`
  
- `minPrice` (number): Minimum price per person
  - Example: `5000`
  
- `maxPrice` (number): Maximum price per person
  - Example: `15000`
  
- `categories` (string): Comma-separated categories
  - Example: `Adventure,Mountain,Snow`

#### Example Requests

**Find treks within 50km of Dehradun:**
```bash
GET /api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=50000
```

**Find easy treks within 100km:**
```bash
GET /api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=100000&difficulty=Easy
```

**Find budget-friendly treks nearby:**
```bash
GET /api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxPrice=10000&limit=10
```

**Find mountain treks within 30km:**
```bash
GET /api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=30000&categories=Mountain,Adventure
```

#### Success Response (200 OK)

**Response Headers:**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 3245
Date: Fri, 20 Dec 2025 10:30:00 GMT
Connection: keep-alive
```

**Response Body:**
```json
{
  "success": true,
  "count": 5,
  "searchLocation": {
    "latitude": 30.3165,
    "longitude": 78.0322,
    "maxDistance": "100km"
  },
  "treks": [
    {
      "_id": "64f7e8a9b1234567890abcde",
      "postType": "trek",
      "title": "Kedarkantha Winter Summit Trek",
      "description": "Experience the magical Himalayan winter on this spectacular 6-day trek to Kedarkantha summit at 12,500 feet. Trek through pristine snow-covered meadows, ancient forests, and witness breathtaking sunrise views from the summit.",
      "user": {
        "_id": "64f7e8a9b1234567890abcdf",
        "firstname": "Rajesh",
        "lastname": "Kumar",
        "email": "rajesh@example.com",
        "role": "host"
      },
      "photos": [
        {
          "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/treks/kedarkantha_summit.jpg",
          "public_id": "posts/photo1",
          "resource_type": "image"
        },
        {
          "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/treks/kedarkantha_trail.jpg",
          "public_id": "posts/photo2",
          "resource_type": "image"
        }
      ],
      "videos": [],
      "location": {
        "city": "Sankri",
        "state": "Uttarakhand",
        "country": "India",
        "address": "Sankri Village, Uttarkashi District",
        "meetingPoint": "Sankri Village Square",
        "coordinates": {
          "type": "Point",
          "coordinates": [78.2345, 31.0456]
        }
      },
      "price": {
        "perPerson": 12000,
        "total": 12000,
        "currency": "INR",
        "period": "person"
      },
      "duration": {
        "days": 6,
        "nights": 5
      },
      "difficulty": "Moderate",
      "categories": ["Adventure", "Mountain", "Snow", "Winter Trek"],
      "amenities": [
        "Experienced Guide",
        "Camping Equipment",
        "All Meals",
        "First Aid Kit",
        "Permits",
        "Insurance"
      ],
      "capacity": {
        "maxPeople": 15
      },
      "availability": {
        "startDate": "2025-01-01T00:00:00.000Z",
        "endDate": "2025-12-31T00:00:00.000Z",
        "isAvailable": true
      },
      "isFeatured": true,
      "status": "active",
      "createdAt": "2025-01-10T08:00:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z",
      "distance": 85.3,
      "distanceUnit": "km"
    },
    {
      "_id": "64f7e8a9b1234567890abcdf",
      "title": "Valley of Flowers Trek",
      "distance": 92.7,
      "distanceUnit": "km",
      // ... other trek details
    }
    // ... more treks
  ]
}
```

#### Error Responses

**Missing coordinates (400 Bad Request):**
```json
{
  "success": false,
  "message": "Latitude and longitude are required"
}
```

**Invalid coordinates (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid latitude or longitude values"
}
```

**Server error (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Error fetching nearby treks"
}
```

---

## 🌍 Understanding Coordinates

### What are Coordinates?

Coordinates are pairs of numbers that pinpoint any location on Earth:
- **Latitude**: North/South position (-90 to 90)
  - Positive = North of Equator
  - Negative = South of Equator
  
- **Longitude**: East/West position (-180 to 180)
  - Positive = East of Prime Meridian
  - Negative = West of Prime Meridian

### Example Coordinates

| Location | Latitude | Longitude |
|----------|----------|-----------|
| Dehradun, India | 30.3165 | 78.0322 |
| Manali, India | 32.2432 | 77.1892 |
| Rishikesh, India | 30.0869 | 78.2676 |
| Mumbai, India | 19.0760 | 72.8777 |
| Delhi, India | 28.7041 | 77.1025 |
| Bangalore, India | 12.9716 | 77.5946 |

### How to Get User's Location

#### Browser Geolocation API

```javascript
// Get user's current location
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}

// Usage
getUserLocation()
  .then(coords => {
    console.log('User location:', coords);
    // Use coords to fetch nearby treks
  })
  .catch(error => {
    console.error('Error getting location:', error);
  });
```

---

## 🎨 Frontend Usage Examples

### JavaScript/Fetch API

```javascript
async function findNearbyTreks() {
  try {
    // 1. Get user's location
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    
    const { latitude, longitude } = position.coords;
    
    // 2. Fetch nearby treks (within 50km)
    const response = await fetch(
      `/api/posts/nearby/treks?latitude=${latitude}&longitude=${longitude}&maxDistance=50000&limit=10`
    );
    const data = await response.json();
    
    if (data.success) {
      console.log(`Found ${data.count} treks near you:`);
      
      data.treks.forEach(trek => {
        console.log(`📍 ${trek.title}`);
        console.log(`   Distance: ${trek.distance} km away`);
        console.log(`   Duration: ${trek.duration.days}D/${trek.duration.nights}N`);
        console.log(`   Price: ₹${trek.price.perPerson} per person`);
        console.log(`   Difficulty: ${trek.difficulty}`);
        console.log('---');
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage
findNearbyTreks();
```

### React Component with Map

```jsx
import { useState, useEffect } from 'react';

function NearbyTreks() {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [maxDistance, setMaxDistance] = useState(50000); // 50km default
  const [error, setError] = useState(null);

  useEffect(() => {
    getUserLocationAndFetchTreks();
  }, [maxDistance]);

  const getUserLocationAndFetchTreks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get user's location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const { latitude, longitude } = position.coords;
      setUserLocation({ latitude, longitude });
      
      // Fetch nearby treks
      const response = await fetch(
        `/api/posts/nearby/treks?latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}&limit=20`
      );
      const data = await response.json();
      
      if (data.success) {
        setTreks(data.treks);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Unable to get your location. Please enable location services.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance}km away`;
  };

  return (
    <div className="nearby-treks">
      <h1>🗺️ Treks Near You</h1>
      
      {/* Location Info */}
      {userLocation && (
        <div className="location-info">
          <p>📍 Searching near: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</p>
        </div>
      )}
      
      {/* Distance Filter */}
      <div className="filters">
        <label>
          Search Radius:
          <select 
            value={maxDistance} 
            onChange={(e) => setMaxDistance(Number(e.target.value))}
          >
            <option value="10000">Within 10 km</option>
            <option value="25000">Within 25 km</option>
            <option value="50000">Within 50 km</option>
            <option value="100000">Within 100 km</option>
            <option value="200000">Within 200 km</option>
          </select>
        </label>
      </div>

      {/* Error State */}
      {error && (
        <div className="error">
          <p>⚠️ {error}</p>
          <button onClick={getUserLocationAndFetchTreks}>
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="loading">
          <p>🔍 Finding treks near you...</p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          <p className="results-count">
            Found {treks.length} trek{treks.length !== 1 ? 's' : ''} near you
          </p>
          
          <div className="treks-grid">
            {treks.map(trek => (
              <div key={trek._id} className="trek-card">
                <img 
                  src={trek.photos[0]?.url} 
                  alt={trek.title}
                  className="trek-image"
                />
                
                <div className="trek-content">
                  <h3>{trek.title}</h3>
                  
                  <div className="distance-badge">
                    📍 {formatDistance(trek.distance)}
                  </div>
                  
                  <p className="location">
                    {trek.location.city}, {trek.location.state}
                  </p>
                  
                  <div className="trek-details">
                    <span>🕒 {trek.duration.days}D/{trek.duration.nights}N</span>
                    <span>💪 {trek.difficulty}</span>
                    <span>₹{trek.price.perPerson.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <button 
                    onClick={() => window.location.href = `/treks/${trek._id}`}
                    className="view-button"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {treks.length === 0 && (
            <div className="no-results">
              <p>No treks found within {maxDistance / 1000}km</p>
              <button onClick={() => setMaxDistance(maxDistance * 2)}>
                Expand Search Radius
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default NearbyTreks;
```

### Axios with Custom Hook

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

// Custom hook for nearby treks
function useNearbyTreks(maxDistance = 50000) {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchNearbyTreks();
  }, [maxDistance]);

  const fetchNearbyTreks = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });

      // Fetch nearby treks
      const response = await axios.get('/api/posts/nearby/treks', {
        params: {
          latitude,
          longitude,
          maxDistance,
          limit: 20
        }
      });

      setTreks(response.data.treks);
    } catch (err) {
      setError(err.message || 'Failed to fetch nearby treks');
    } finally {
      setLoading(false);
    }
  };

  return { treks, loading, error, location, refetch: fetchNearbyTreks };
}

// Usage in component
function NearbyTreksPage() {
  const { treks, loading, error, location } = useNearbyTreks(50000);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Treks Near You</h1>
      {treks.map(trek => (
        <TrekCard key={trek._id} trek={trek} />
      ))}
    </div>
  );
}
```

---

## 📏 Distance Calculations

### Understanding Distance

- **Distance is calculated** using the Haversine formula (great-circle distance)
- **Results are sorted** by distance (nearest first)
- **Distance is provided** in kilometers with 1 decimal precision

### Distance Examples

```
5.2 km   - Very close, easy day trip
15.8 km  - Close, short drive
42.3 km  - Moderate distance, ~1 hour drive
89.5 km  - Far, ~2-3 hour drive
150+ km  - Very far, requires planning
```

### maxDistance Parameter

The `maxDistance` parameter defines the search radius:

```javascript
// Distance in meters
10000   = 10 km   - Very local
25000   = 25 km   - Local area
50000   = 50 km   - Nearby region
100000  = 100 km  - Extended region (default)
200000  = 200 km  - Wide area
```

---

## 🔍 Advanced Filtering

### Combine Location with Other Filters

```javascript
// Find easy treks within 30km under ₹10,000
fetch(`/api/posts/nearby/treks?
  latitude=30.3165&
  longitude=78.0322&
  maxDistance=30000&
  difficulty=Easy&
  maxPrice=10000
`);

// Find mountain treks within 50km
fetch(`/api/posts/nearby/treks?
  latitude=30.3165&
  longitude=78.0322&
  maxDistance=50000&
  categories=Mountain,Adventure
`);

// Find budget-friendly weekend treks nearby
fetch(`/api/posts/nearby/treks?
  latitude=30.3165&
  longitude=78.0322&
  maxDistance=50000&
  maxPrice=8000&
  limit=5
`);
```

---

## 💡 Best Practices

### 1. Request Location Permission Early

```javascript
// Ask for permission on page load
useEffect(() => {
  navigator.permissions.query({ name: 'geolocation' }).then(result => {
    if (result.state === 'prompt') {
      // Show explanation before requesting
      showLocationPermissionDialog();
    }
  });
}, []);
```

### 2. Handle Location Errors Gracefully

```javascript
const getLocation = async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    return position.coords;
  } catch (error) {
    if (error.code === 1) {
      // Permission denied
      showFallbackLocationSelector();
    } else if (error.code === 2) {
      // Position unavailable
      showErrorMessage('Unable to determine your location');
    } else if (error.code === 3) {
      // Timeout
      showErrorMessage('Location request timed out');
    }
  }
};
```

### 3. Show Distance Visually

```jsx
// Distance badge with color coding
const DistanceBadge = ({ distance }) => {
  const getColor = () => {
    if (distance < 10) return 'green';
    if (distance < 50) return 'orange';
    return 'red';
  };
  
  return (
    <span className={`badge badge-${getColor()}`}>
      📍 {distance}km away
    </span>
  );
};
```

### 4. Provide Manual Location Override

```jsx
// Let users manually enter location
const [useManualLocation, setUseManualLocation] = useState(false);

{useManualLocation ? (
  <div>
    <input 
      type="number" 
      placeholder="Latitude"
      value={latitude}
      onChange={e => setLatitude(e.target.value)}
    />
    <input 
      type="number" 
      placeholder="Longitude"
      value={longitude}
      onChange={e => setLongitude(e.target.value)}
    />
  </div>
) : (
  <button onClick={getUserLocation}>
    Use My Location
  </button>
)}
```

### 5. Cache Results

```javascript
// Cache nearby treks for 5 minutes
const CACHE_KEY = 'nearby_treks_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedTreks = (latitude, longitude) => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  
  const { data, timestamp, location } = JSON.parse(cached);
  const isExpired = Date.now() - timestamp > CACHE_DURATION;
  const isSameLocation = 
    location.latitude === latitude && 
    location.longitude === longitude;
  
  if (!isExpired && isSameLocation) {
    return data;
  }
  
  return null;
};
```

---

## 🗂️ Data Requirements

### For Treks to Appear in Results

A trek must have:
1. ✅ `postType: "trek"`
2. ✅ `status: "active"`
3. ✅ **Coordinates stored** in `location.coordinates`
4. ✅ Coordinates within the search radius

### Setting Coordinates for Treks

When creating/updating treks, include coordinates:

```javascript
// Create trek with coordinates
const trekData = {
  title: "Kedarkantha Trek",
  description: "...",
  location: {
    city: "Sankri",
    state: "Uttarakhand",
    country: "India",
    coordinates: {
      type: "Point",
      coordinates: [78.2345, 31.0456]  // [longitude, latitude]
    }
  },
  // ... other fields
};
```

**Important:** MongoDB expects coordinates in `[longitude, latitude]` order!

---

## 🆚 Comparison with Other Trek Endpoints

| Endpoint | Use Case | Sorting | Location Method |
|----------|----------|---------|-----------------|
| `/api/posts/nearby/treks` | Find treks near me | **Distance** | GPS coordinates |
| `/api/posts/top-rated/treks` | Best rated treks | Average rating | Not location-based |
| `/api/posts/featured/treks` | Featured treks | Newest first | Not location-based |
| `/api/posts/treks` | Search/filter | Multiple options | City/state/country (text) |

### When to Use Nearby Endpoint

✅ **Use nearby endpoint when:**
- User wants treks close to them
- Building "Near Me" features
- User has GPS location available
- Distance is important factor

❌ **Don't use when:**
- User doesn't have location
- Searching by city/state name
- Need all treks regardless of location
- Privacy concerns about sharing location

---

## 🔒 Privacy Considerations

### User Location Privacy

1. **Always ask permission** before accessing location
2. **Explain why** you need location (to find nearby treks)
3. **Don't store** user coordinates without consent
4. **Provide alternatives** (manual location input or city search)

### Example Permission Dialog

```jsx
const LocationPermissionDialog = ({ onAllow, onDeny }) => (
  <div className="permission-dialog">
    <h3>📍 Enable Location</h3>
    <p>
      We need your location to find treks near you.
      Your location is not stored or shared.
    </p>
    <button onClick={onAllow}>Allow</button>
    <button onClick={onDeny}>Use City Search Instead</button>
  </div>
);
```

---

## 📝 Response Type Definition (TypeScript)

```typescript
interface NearbyTreksResponse {
  success: boolean;
  count: number;
  searchLocation: {
    latitude: number;
    longitude: number;
    maxDistance: string;  // e.g., "100km"
  };
  treks: NearbyTrek[];
}

interface NearbyTrek {
  _id: string;
  postType: "trek";
  title: string;
  description: string;
  user: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: "host";
  };
  photos: Media[];
  videos: Media[];
  location: {
    city?: string;
    state?: string;
    country?: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number];  // [longitude, latitude]
    };
  };
  price: {
    perPerson?: number;
    total?: number;
    currency?: string;
    period?: string;
  };
  duration: {
    days: number;
    nights: number;
  };
  difficulty?: string;
  categories?: string[];
  amenities?: string[];
  capacity?: {
    maxPeople?: number;
  };
  availability?: {
    startDate?: string;
    endDate?: string;
    isAvailable?: boolean;
  };
  isFeatured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  
  // Distance fields (added by API)
  distance: number;      // Distance in km (e.g., 45.3)
  distanceUnit: "km";
}
```

---

## 🚀 Quick Start

```javascript
// 1. Get user's location
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;
  
  // 2. Fetch nearby treks within 50km
  const response = await fetch(
    `/api/posts/nearby/treks?latitude=${latitude}&longitude=${longitude}&maxDistance=50000`
  );
  const data = await response.json();
  
  // 3. Display results
  if (data.success) {
    data.treks.forEach(trek => {
      console.log(`${trek.title} - ${trek.distance}km away`);
    });
  }
});
```

---

## 📞 Support & Resources

- **Main API Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Posts API:** [POSTS_API_DOCUMENTATION.md](./POSTS_API_DOCUMENTATION.md)
- **Top-Rated Treks:** [TOP_RATED_TREKS_API_DOCUMENTATION.md](./TOP_RATED_TREKS_API_DOCUMENTATION.md)
- **Featured Treks:** [FEATURED_TREKS_README.md](./FEATURED_TREKS_README.md)

---

**Happy Exploring! 🗺️🏔️**

Discover amazing treks right in your backyard!
