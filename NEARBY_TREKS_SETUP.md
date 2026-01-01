# 🗺️ Nearby Treks Setup & Testing Guide

Complete guide to set up and test the location-based "Nearby Treks" feature.

## ✅ What's Been Set Up

1. ✅ **Database Schema** - Location coordinates with GeoJSON format (`location.coordinates`)
2. ✅ **Geospatial Index** - MongoDB 2dsphere index for efficient location queries
3. ✅ **API Endpoint** - `/api/posts/nearby/treks` with distance-based sorting
4. ✅ **Sample Data** - 8+ treks with real coordinates across Uttarakhand & Himachal Pradesh
5. ✅ **Distance Calculation** - Haversine formula for accurate km measurements
6. ✅ **Sorting** - Results sorted by distance: **Nearest → Far → Farthest**

## 🚀 Quick Start (Step-by-Step)

### Step 1: Update Trek Coordinates
```bash
node update-trek-coordinates.js
```
This updates all existing treks with proper location coordinates.

**Expected Output:**
```
✅ All treks now have location coordinates!
Treks with valid coordinates: 16/16
```

### Step 2: Start the Server
```bash
npm start
```
**or**
```bash
node server.js
```

Server should start on `http://localhost:3000`

### Step 3: Test the API
```bash
node test-nearby-treks.js
```

This will test the API from multiple locations (Dehradun, Delhi, Manali) with various filters.

## 📍 API Usage Examples

### Basic Request - Find Nearest Treks
```bash
GET http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=100000
```

**Parameters:**
- `latitude` (required) - Your current latitude
- `longitude` (required) - Your current longitude  
- `maxDistance` (optional) - Search radius in meters (default: 100000 = 100km)
- `limit` (optional) - Maximum results (default: 20)
- `difficulty` (optional) - Filter by difficulty level
- `minPrice` (optional) - Minimum price filter
- `maxPrice` (optional) - Maximum price filter
- `categories` (optional) - Comma-separated categories

### Example Response
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
      "_id": "...",
      "title": "Nag Tibba Trek",
      "description": "The Serpent's Peak...",
      "distance": 29.8,
      "distanceUnit": "km",
      "location": {
        "city": "Pantwari",
        "state": "Uttarakhand",
        "coordinates": {
          "type": "Point",
          "coordinates": [78.0996, 30.5645]
        }
      },
      "price": {
        "perPerson": 3499,
        "currency": "INR"
      },
      "difficulty": "Easy",
      "duration": { "days": 2, "nights": 1 }
    },
    {
      "_id": "...",
      "title": "Kedarkantha Summit Trek",
      "distance": 35.2,
      "distanceUnit": "km",
      ...
    }
  ]
}
```

## 🧪 Testing Scenarios

### Scenario 1: From Dehradun (30.3165, 78.0322)

**Within 50km (Nearest):**
```bash
curl "http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=50000"
```
Expected: Nag Tibba, Kedarkantha, Har Ki Dun (~30-35km)

**Within 100km (Medium Distance):**
```bash
curl "http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=100000"
```
Expected: Above + Chopta, Valley of Flowers (~75-80km)

**Within 300km (Farthest):**
```bash
curl "http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=300000"
```
Expected: All treks sorted by distance (up to Manali ~260km)

### Scenario 2: Filter by Difficulty
```bash
curl "http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=100000&difficulty=Easy"
```
Expected: Only Easy difficulty treks within 100km

### Scenario 3: Filter by Price Range
```bash
curl "http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=200000&minPrice=5000&maxPrice=10000"
```
Expected: Treks priced between ₹5,000-₹10,000 within 200km

### Scenario 4: Filter by Categories
```bash
curl "http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=150000&categories=Adventure,Snow"
```
Expected: Adventure or Snow category treks within 150km

## 📊 Sample Trek Locations

| Trek Name | City | Lat, Lng | Distance from Dehradun |
|-----------|------|----------|------------------------|
| Nag Tibba | Pantwari | 30.5645, 78.0996 | ~30 km ⭐ **NEAREST** |
| Kedarkantha | Sankri | 31.0480, 78.3894 | ~35 km |
| Har Ki Dun | Sankri | 31.0480, 78.3894 | ~35 km |
| Chopta Chandrashila | Chopta | 30.4679, 79.0317 | ~75 km |
| Valley of Flowers | Joshimath | 30.5569, 79.5636 | ~80 km |
| Brahmatal | Lohajung | 30.1167, 79.6833 | ~105 km |
| Triund | McLeod Ganj | 32.2478, 76.3200 | ~220 km |
| Hampta Pass | Manali | 32.2396, 77.1892 | ~260 km ⭐ **FARTHEST** |

## 🎯 Verification Checklist

Run through this checklist to ensure everything works:

- [ ] **Step 1:** Run `node update-trek-coordinates.js` ✅
- [ ] **Step 2:** Start server with `npm start` ✅
- [ ] **Step 3:** Test API with `node test-nearby-treks.js` ✅
- [ ] **Step 4:** Verify treks sorted nearest → farthest ✅
- [ ] **Step 5:** Test with different locations (Delhi, Manali) ✅
- [ ] **Step 6:** Test filters (difficulty, price, categories) ✅
- [ ] **Step 7:** Check distance calculations are accurate ✅

## 🔧 Troubleshooting

### Issue: "No treks found"
**Check coordinates:**
```bash
node update-trek-coordinates.js
```

### Issue: "Distances seem wrong"
**Remember:** MongoDB uses `[longitude, latitude]` order (not lat, lng)

### Issue: "Results not sorted"
**Verify 2dsphere index exists** - Already created in schema:
```javascript
postSchema.index({ 'location.coordinates': '2dsphere' })
```

### Issue: "Server not responding"
**Ensure server is running:**
```bash
npm start
# or
node server.js
```

## 🌐 Frontend Integration

### Get User Location
```javascript
// Request user's location
navigator.geolocation.getCurrentPosition((position) => {
  const { latitude, longitude } = position.coords;
  fetchNearbyTreks(latitude, longitude);
});

// Fetch nearby treks
async function fetchNearbyTreks(lat, lng, maxDistance = 100000) {
  const response = await fetch(
    `http://localhost:3000/api/posts/nearby/treks?latitude=${lat}&longitude=${lng}&maxDistance=${maxDistance}`
  );
  const data = await response.json();
  return data.treks;
}
```

### Display Distance
```javascript
// Show distance prominently in UI
treks.map(trek => (
  <div className="trek-card" key={trek._id}>
    <h3>{trek.title}</h3>
    <div className="distance">
      📍 <strong>{trek.distance} km</strong> away
    </div>
    <div className="location">{trek.location.city}, {trek.location.state}</div>
    <div className="price">₹{trek.price.perPerson}</div>
  </div>
))
```

### Progressive Distance Loading
```javascript
// Load treks in stages
const [nearbyTreks, setNearbyTreks] = useState([]);

// First: 50km radius
const nearest = await fetchNearbyTreks(lat, lng, 50000);

// Then: 100km radius
const medium = await fetchNearbyTreks(lat, lng, 100000);

// Finally: 300km radius
const all = await fetchNearbyTreks(lat, lng, 300000);
```

## 📱 Mobile-Friendly Features

1. **Show user's location** on map with marker
2. **Display trek markers** with distance badges
3. **"Get Directions"** button linking to Google Maps
4. **Distance filters** - Let users choose travel radius
5. **Sort toggle** - Distance, Price, Rating, or Popularity

## 🎨 UI Best Practices

✅ **Highlight nearest treks** - Users prioritize nearby options
✅ **Show distance prominently** - "29 km away"
✅ **Add map view** - Visual representation of locations  
✅ **Include travel time** - "~1 hour drive"
✅ **Group by distance** - "Nearby (0-50km)", "Medium (50-100km)", "Far (100km+)"

## 🔗 Related Documentation

- [NEARBY_TREKS_API_DOCUMENTATION.md](NEARBY_TREKS_API_DOCUMENTATION.md) - Complete API reference
- [NEARBY_TREKS_TESTING_GUIDE.md](NEARBY_TREKS_TESTING_GUIDE.md) - Detailed testing scenarios
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - All API endpoints

## 🎉 Success Metrics

Your nearby treks feature is working perfectly when:

✅ Treks are sorted by distance (nearest first)
✅ Distance calculations are accurate (±1 km precision)
✅ API responds quickly (< 500ms)
✅ Filters work correctly with location search
✅ Mobile users can easily share their location
✅ Frontend displays distances clearly

## 📞 Testing Commands Summary

```bash
# 1. Update coordinates
node update-trek-coordinates.js

# 2. Start server
npm start

# 3. Test API
node test-nearby-treks.js

# 4. Manual API test (Windows PowerShell)
Invoke-WebRequest -Uri "http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=100000" -Method GET

# 5. Check database (if MongoDB shell installed)
mongosh
use athithya
db.posts.find({ postType: 'trek', 'location.coordinates.coordinates': { $exists: true } }).count()
```

---

**🏔️ Happy Trekking! The nearest adventure is just a location share away!**
