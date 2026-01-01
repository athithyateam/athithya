# Testing Nearby Treks Feature 🗺️

This guide will help you test the "Nearby Treks" feature with sample data showing treks at various distances.

## 📍 Overview

The nearby treks feature uses geolocation to find and sort treks by distance from the user's current location. The results show:
- **Nearest treks first** (closest)
- **Medium distance treks** (farther)
- **Farthest treks** (most distant)

## 🚀 Quick Start

### Step 1: Seed the Database with Location Data

Run one of these commands to add sample trek data with coordinates:

```bash
# Option 1: Using Node.js direct insertion (Recommended)
node seed-treks.js

# Option 2: Using HTTP API (requires server running)
node add-sample-data.js
```

### Step 2: Verify the Data

Check that treks have coordinates:
```bash
# Connect to MongoDB and verify
mongosh
use athithya
db.posts.find({ postType: 'trek', 'location.coordinates': { $exists: true } }).count()
```

You should see 8 treks with location coordinates.

## 🧪 Testing the API

### Test Location: Dehradun, Uttarakhand
**Coordinates:** Latitude `30.3165`, Longitude `78.0322`

### Example API Calls

#### 1. Find Treks Within 50km (Nearest)
```bash
GET http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=50000
```

**Expected Results (sorted by distance):**
- ✅ Nag Tibba Trek (~30km)
- ✅ Kedarkantha Trek (~35km)
- ✅ Har Ki Dun Trek (~35km)

#### 2. Find Treks Within 100km (Medium Distance)
```bash
GET http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=100000
```

**Expected Results:**
- ✅ All treks from 50km range
- ✅ Chopta Chandrashila Trek (~75km)
- ✅ Valley of Flowers Trek (~80km)

#### 3. Find All Treks Within 300km (Farthest)
```bash
GET http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=300000
```

**Expected Results (all treks sorted by distance):**
1. Nag Tibba Trek - ~30km
2. Kedarkantha Trek - ~35km
3. Har Ki Dun Trek - ~35km
4. Chopta Chandrashila Trek - ~75km
5. Valley of Flowers Trek - ~80km
6. Brahmatal Trek - ~105km
7. Triund Trek - ~220km
8. Hampta Pass Trek - ~260km

#### 4. Filter by Difficulty
```bash
GET http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=100000&difficulty=Easy
```

**Expected Results:**
- Only Easy difficulty treks within 100km

#### 5. Filter by Price Range
```bash
GET http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=200000&minPrice=5000&maxPrice=10000
```

**Expected Results:**
- Treks priced between ₹5,000 and ₹10,000

#### 6. Filter by Categories
```bash
GET http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=150000&categories=Adventure,Snow
```

**Expected Results:**
- Treks tagged with Adventure or Snow categories

## 📊 Sample Trek Locations

Here's a reference of all trek coordinates for testing:

| Trek Name | City | Coordinates (Lat, Lng) | Approx Distance from Dehradun |
|-----------|------|------------------------|------------------------------|
| Nag Tibba | Pantwari | 30.5645, 78.0996 | ~30 km |
| Kedarkantha | Sankri | 31.0480, 78.3894 | ~35 km |
| Har Ki Dun | Sankri | 31.0480, 78.3894 | ~35 km |
| Chopta Chandrashila | Chopta | 30.4679, 79.0317 | ~75 km |
| Valley of Flowers | Joshimath | 30.5569, 79.5636 | ~80 km |
| Brahmatal | Lohajung | 30.1167, 79.6833 | ~105 km |
| Triund | McLeod Ganj | 32.2478, 76.3200 | ~220 km |
| Hampta Pass | Manali | 32.2396, 77.1892 | ~260 km |

## 🧭 Testing from Different Locations

### Test from Delhi
**Coordinates:** Latitude `28.7041`, Longitude `77.1025`

```bash
GET http://localhost:3000/api/posts/nearby/treks?latitude=28.7041&longitude=77.1025&maxDistance=300000
```

### Test from Manali
**Coordinates:** Latitude `32.2396`, Longitude `77.1892`

```bash
GET http://localhost:3000/api/posts/nearby/treks?latitude=32.2396&longitude=77.1892&maxDistance=200000
```

## 🎯 Testing Distance Sorting

The API should **always return treks sorted from nearest to farthest**. To verify:

1. Make a request with a large maxDistance
2. Check the `distance` field in the response for each trek
3. Verify that distances are in ascending order

**Example Response Structure:**
```json
{
  "success": true,
  "count": 8,
  "searchLocation": {
    "latitude": 30.3165,
    "longitude": 78.0322,
    "maxDistance": "300km"
  },
  "treks": [
    {
      "_id": "...",
      "title": "Nag Tibba Trek",
      "distance": 29.8,
      "distanceUnit": "km",
      "location": {
        "city": "Pantwari",
        "coordinates": {
          "type": "Point",
          "coordinates": [78.0996, 30.5645]
        }
      },
      ...
    },
    {
      "_id": "...",
      "title": "Kedarkantha Trek",
      "distance": 35.2,
      "distanceUnit": "km",
      ...
    }
  ]
}
```

## ✅ Validation Checklist

- [ ] All treks have `location.coordinates` with proper GeoJSON format
- [ ] MongoDB has a 2dsphere index on `location.coordinates`
- [ ] API returns treks sorted by distance (nearest first)
- [ ] Distance is calculated correctly in kilometers
- [ ] Filters (difficulty, price, categories) work with location search
- [ ] API handles invalid coordinates gracefully
- [ ] maxDistance parameter works correctly

## 🛠️ Troubleshooting

### Issue: No treks returned
**Solution:** Verify treks have coordinates:
```javascript
db.posts.find({ 
  postType: 'trek', 
  'location.coordinates.coordinates': { $exists: true } 
}).pretty()
```

### Issue: Distances seem incorrect
**Solution:** Check coordinate order. MongoDB uses `[longitude, latitude]`, not `[latitude, longitude]`.

### Issue: Sorting not working
**Solution:** Ensure the 2dsphere index exists:
```javascript
db.posts.getIndexes()
```

Look for: `{ "location.coordinates": "2dsphere" }`

### Issue: "Can't extract geo keys" error when creating posts
**Error Message:** `Point must be an array or object, instead got type missing`

**Root Cause:** The post was created with incomplete coordinates:
```json
// ❌ WRONG - Missing coordinates array
"coordinates": { "type": "Point" }

// ✅ CORRECT - Complete structure
"coordinates": { 
  "type": "Point",
  "coordinates": [78.0322, 30.3165]  // [longitude, latitude]
}
```

**Frontend Fix:** Always include both longitude and latitude when submitting location:
```javascript
// Option 1: Get from browser geolocation API
navigator.geolocation.getCurrentPosition((position) => {
  const locationData = {
    city: "City Name",
    state: "State Name",
    country: "India",
    coordinates: {
      type: "Point",
      coordinates: [
        position.coords.longitude,  // FIRST: longitude
        position.coords.latitude    // SECOND: latitude
      ]
    }
  };
});

// Option 2: Use a location picker or manual entry
const locationData = {
  city: "Dehradun",
  country: "India",
  coordinates: {
    type: "Point",
    coordinates: [78.0322, 30.3165]  // [lng, lat]
  }
};

// Option 3: If coordinates unknown, omit the coordinates field entirely
const locationData = {
  city: "Dehradun",
  state: "Uttarakhand",
  country: "India"
  // NO coordinates field - this is safe
};
```

**Backend Protection:** The backend now validates coordinates and removes invalid ones automatically, preventing this error.

## 📱 Frontend Integration Tips

### 1. Get User's Location
```javascript
navigator.geolocation.getCurrentPosition((position) => {
  const { latitude, longitude } = position.coords;
  fetchNearbyTreks(latitude, longitude);
});
```

### 2. Display Distance in UI
```javascript
treks.map(trek => (
  <div key={trek._id}>
    <h3>{trek.title}</h3>
    <span className="distance">📍 {trek.distance} km away</span>
  </div>
))
```

### 3. Progressive Loading
- First show treks within 50km
- Load more treks up to 100km
- Show all treks up to 300km

## 🎨 UI/UX Best Practices

1. **Show distance prominently** - Users want to know how far they need to travel
2. **Sort by nearest first** - Most relevant results at the top
3. **Add distance filters** - Let users choose their preferred travel radius
4. **Display on map** - Visual representation of trek locations
5. **Add "Get Directions"** - Link to Google Maps with coordinates

## 📚 Additional Resources

- [MongoDB Geospatial Queries](https://docs.mongodb.com/manual/geospatial-queries/)
- [GeoJSON Specification](https://geojson.org/)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)

## 🎉 Success Criteria

Your nearby treks feature is working correctly when:

✅ Treks appear sorted by distance (nearest → farthest)
✅ Distance calculations are accurate
✅ Filters work in combination with location
✅ API responds quickly (< 500ms)
✅ Users can discover treks near their location
✅ Mobile users can share their location easily

---

**Happy Testing! 🏔️**
