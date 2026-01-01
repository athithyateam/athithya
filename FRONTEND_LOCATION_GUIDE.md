# Frontend Location Coordinates Guide 📍

## Common Error: "Can't extract geo keys"

### Error Message
```json
{
  "error": "Can't extract geo keys: ... Point must be an array or object, instead got type missing"
}
```

### Root Cause
The post was created with incomplete location coordinates. The `coordinates` array is missing or invalid.

---

## ❌ WRONG - What Causes the Error

```javascript
// Missing coordinates array
const locationData = {
  city: "Dehradun",
  country: "India",
  coordinates: {
    type: "Point"
    // ❌ Missing: coordinates array
  }
}

// Empty coordinates array
const locationData = {
  coordinates: {
    type: "Point",
    coordinates: []  // ❌ Empty array
  }
}

// Invalid coordinate values
const locationData = {
  coordinates: {
    type: "Point",
    coordinates: [null, null]  // ❌ Invalid values
  }
}

// Wrong order or format
const locationData = {
  coordinates: {
    type: "Point",
    coordinates: "30.3165, 78.0322"  // ❌ String instead of array
  }
}
```

---

## ✅ CORRECT - Proper Format

### Option 1: With Valid Coordinates
```javascript
const locationData = {
  city: "Dehradun",
  state: "Uttarakhand",
  country: "India",
  coordinates: {
    type: "Point",
    coordinates: [78.0322, 30.3165]  // ✅ [longitude, latitude]
  }
}
```

### Option 2: Without Coordinates (Safe)
```javascript
// If you don't have coordinates, just omit the field entirely
const locationData = {
  city: "Dehradun",
  state: "Uttarakhand",
  country: "India"
  // ✅ No coordinates field - this is perfectly fine
}
```

---

## 🌍 Getting Location Coordinates

### Method 1: Browser Geolocation API (Recommended)

```javascript
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          city: "", // Get from reverse geocoding or user input
          state: "",
          country: "India",
          coordinates: {
            type: "Point",
            coordinates: [
              position.coords.longitude,  // FIRST: longitude
              position.coords.latitude    // SECOND: latitude
            ]
          }
        };
        resolve(locationData);
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
}

// Usage
async function createPost() {
  try {
    const location = await getUserLocation();
    
    const postData = {
      title: "Amazing Trek",
      description: "Beautiful mountain trek",
      location: location,
      // ... other fields
    };
    
    const response = await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  } catch (error) {
    console.error('Location error:', error);
    // Fallback: create post without coordinates
  }
}
```

### Method 2: Manual Entry with Validation

```javascript
function createLocationFromInput(city, state, country, latitude, longitude) {
  const location = {
    city: city || "",
    state: state || "",
    country: country || "India"
  };

  // Only add coordinates if BOTH latitude and longitude are valid numbers
  if (latitude && longitude && 
      !isNaN(latitude) && !isNaN(longitude) &&
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180) {
    location.coordinates = {
      type: "Point",
      coordinates: [
        parseFloat(longitude),  // FIRST: longitude
        parseFloat(latitude)    // SECOND: latitude
      ]
    };
  }

  return location;
}

// Usage
const location = createLocationFromInput(
  "Dehradun",
  "Uttarakhand", 
  "India",
  30.3165,  // latitude
  78.0322   // longitude
);
```

### Method 3: Location Picker Component

```javascript
import React, { useState } from 'react';

function LocationPicker({ onLocationSelect }) {
  const [coords, setCoords] = useState(null);

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const newCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      setCoords(newCoords);
      onLocationSelect(newCoords);
    });
  };

  const formatLocation = (city, state, country, coords) => {
    const location = {
      city: city || "",
      state: state || "",
      country: country || "India"
    };

    // Only add coordinates if valid
    if (coords && coords.latitude && coords.longitude) {
      location.coordinates = {
        type: "Point",
        coordinates: [coords.longitude, coords.latitude]
      };
    }

    return location;
  };

  return (
    <div>
      <button onClick={getCurrentLocation}>
        📍 Use My Current Location
      </button>
      {coords && (
        <div>
          Location: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
        </div>
      )}
    </div>
  );
}
```

---

## ⚠️ Critical Rules

### 1. **Coordinate Order**
MongoDB uses `[longitude, latitude]`, NOT `[latitude, longitude]`

```javascript
// ❌ WRONG
coordinates: [30.3165, 78.0322]  // latitude, longitude

// ✅ CORRECT
coordinates: [78.0322, 30.3165]  // longitude, latitude
```

### 2. **Array Type**
Coordinates MUST be an array of exactly 2 numbers

```javascript
// ❌ WRONG
coordinates: { latitude: 30.3165, longitude: 78.0322 }

// ✅ CORRECT
coordinates: [78.0322, 30.3165]
```

### 3. **Valid Ranges**
- Latitude: -90 to +90
- Longitude: -180 to +180

```javascript
function validateCoordinates(lng, lat) {
  return (
    typeof lng === 'number' && !isNaN(lng) &&
    typeof lat === 'number' && !isNaN(lat) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}
```

### 4. **All or Nothing**
Either provide complete coordinates OR omit them entirely

```javascript
// ✅ GOOD: Complete coordinates
location: {
  city: "Delhi",
  coordinates: {
    type: "Point",
    coordinates: [77.1025, 28.7041]
  }
}

// ✅ GOOD: No coordinates at all
location: {
  city: "Delhi",
  country: "India"
}

// ❌ BAD: Incomplete coordinates
location: {
  city: "Delhi",
  coordinates: {
    type: "Point"
    // Missing coordinates array
  }
}
```

---

## 🧪 Testing Coordinates

### Quick Validation Function

```javascript
function validateLocationData(location) {
  const errors = [];

  if (!location) {
    errors.push("Location object is required");
    return errors;
  }

  // If coordinates exist, validate them
  if (location.coordinates) {
    if (!location.coordinates.type || location.coordinates.type !== "Point") {
      errors.push("Coordinates type must be 'Point'");
    }

    if (!location.coordinates.coordinates) {
      errors.push("Coordinates array is missing");
    } else if (!Array.isArray(location.coordinates.coordinates)) {
      errors.push("Coordinates must be an array");
    } else if (location.coordinates.coordinates.length !== 2) {
      errors.push("Coordinates array must have exactly 2 values");
    } else {
      const [lng, lat] = location.coordinates.coordinates;
      
      if (typeof lng !== 'number' || isNaN(lng)) {
        errors.push("Longitude must be a valid number");
      }
      if (typeof lat !== 'number' || isNaN(lat)) {
        errors.push("Latitude must be a valid number");
      }
      if (lat < -90 || lat > 90) {
        errors.push("Latitude must be between -90 and 90");
      }
      if (lng < -180 || lng > 180) {
        errors.push("Longitude must be between -180 and 180");
      }
    }
  }

  return errors;
}

// Usage
const location = {
  city: "Test",
  coordinates: {
    type: "Point",
    coordinates: [78.0322, 30.3165]
  }
};

const errors = validateLocationData(location);
if (errors.length > 0) {
  console.error("Validation errors:", errors);
}
```

---

## 📱 Complete Form Example

```javascript
import React, { useState } from 'react';

function CreatePostForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    state: '',
    country: 'India',
    useCoordinates: false,
    latitude: '',
    longitude: ''
  });

  const handleLocationToggle = () => {
    setFormData(prev => ({
      ...prev,
      useCoordinates: !prev.useCoordinates
    }));
  };

  const getMyLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setFormData(prev => ({
        ...prev,
        latitude: position.coords.latitude.toString(),
        longitude: position.coords.longitude.toString(),
        useCoordinates: true
      }));
    });
  };

  const buildLocationObject = () => {
    const location = {
      city: formData.city,
      state: formData.state,
      country: formData.country
    };

    // Only add coordinates if enabled AND valid
    if (formData.useCoordinates) {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);

      if (!isNaN(lat) && !isNaN(lng) && 
          lat >= -90 && lat <= 90 && 
          lng >= -180 && lng <= 180) {
        location.coordinates = {
          type: "Point",
          coordinates: [lng, lat]  // [longitude, latitude]
        };
      }
    }

    return location;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      title: formData.title,
      description: formData.description,
      location: buildLocationObject(),
      // ... other fields
    };

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        alert('Post created successfully!');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        required
      />

      <input
        type="text"
        placeholder="City"
        value={formData.city}
        onChange={(e) => setFormData({...formData, city: e.target.value})}
      />

      <label>
        <input
          type="checkbox"
          checked={formData.useCoordinates}
          onChange={handleLocationToggle}
        />
        Add GPS Coordinates (for nearby search)
      </label>

      {formData.useCoordinates && (
        <div>
          <button type="button" onClick={getMyLocation}>
            📍 Use My Location
          </button>
          <input
            type="number"
            placeholder="Latitude"
            value={formData.latitude}
            onChange={(e) => setFormData({...formData, latitude: e.target.value})}
            step="0.0001"
          />
          <input
            type="number"
            placeholder="Longitude"
            value={formData.longitude}
            onChange={(e) => setFormData({...formData, longitude: e.target.value})}
            step="0.0001"
          />
        </div>
      )}

      <button type="submit">Create Post</button>
    </form>
  );
}
```

---

## 🔧 Backend Protection

The backend now automatically validates and sanitizes coordinates:

- ✅ Validates coordinate array exists
- ✅ Checks array has exactly 2 numbers
- ✅ Verifies numbers are valid (not NaN)
- ✅ Removes invalid coordinates instead of failing
- ✅ Posts can be created without coordinates

**This means:** Even if frontend sends invalid data, the backend will handle it gracefully by removing the invalid coordinates field.

---

## 📚 Additional Resources

- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [GeoJSON Specification](https://geojson.org/)
- [MongoDB Geospatial Queries](https://docs.mongodb.com/manual/geospatial-queries/)

---

## ✅ Checklist for Frontend Developers

- [ ] Always use `[longitude, latitude]` order (not lat, lng)
- [ ] Validate coordinates before sending to API
- [ ] Handle geolocation errors gracefully
- [ ] Provide fallback option (create post without coordinates)
- [ ] Test with valid, invalid, and missing coordinates
- [ ] Show clear error messages to users
- [ ] Use user's current location when possible
- [ ] Allow manual coordinate entry as backup

---

**Remember:** It's better to omit coordinates entirely than to send incomplete or invalid data!
