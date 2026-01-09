# 🗺️ Nearby Treks - Quick Reference Card

## ⚡ Quick Commands

```bash
# Update coordinates
node update-trek-coordinates.js

# Start server
npm start

# Test API
node test-nearby-treks.js

# PowerShell test
.\test-nearby-api.ps1
```

## 📍 API Endpoint

```
GET /api/posts/nearby/treks
```

**Required:** `latitude`, `longitude`  
**Optional:** `maxDistance`, `limit`, `difficulty`, `minPrice`, `maxPrice`, `categories`

## 🧪 Test URLs

```bash
# Nearest (50km)
http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=50000

# Medium (100km)
http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=100000

# All (300km)
http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=300000

# Easy treks
http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=100000&difficulty=Easy

# Budget (under ₹10k)
http://localhost:3000/api/posts/nearby/treks?latitude=30.3165&longitude=78.0322&maxDistance=200000&maxPrice=10000
```

## 📊 Sample Coordinates

| Location | Latitude | Longitude |
|----------|----------|-----------|
| **Dehradun** | 30.3165 | 78.0322 |
| **Delhi** | 28.7041 | 77.1025 |
| **Manali** | 32.2396 | 77.1892 |

## 🏔️ Trek Distances (from Dehradun)

```
  30 km → Nag Tibba Trek         ⭐ NEAREST
  35 km → Kedarkantha Trek
  35 km → Har Ki Dun Trek
  75 km → Chopta Chandrashila
  80 km → Valley of Flowers
 105 km → Brahmatal Trek
 220 km → Triund Trek
 260 km → Hampta Pass Trek       ⭐ FARTHEST
```

## 🎯 Response Format

```json
{
  "success": true,
  "count": 5,
  "searchLocation": { "latitude": 30.3165, "longitude": 78.0322 },
  "treks": [
    {
      "title": "Nag Tibba Trek",
      "distance": 29.8,
      "distanceUnit": "km",
      "location": { "city": "Pantwari", "coordinates": {...} },
      "price": { "perPerson": 3499 },
      "difficulty": "Easy"
    }
  ]
}
```

## 💡 Frontend Snippet

```javascript
// Get location and fetch treks
navigator.geolocation.getCurrentPosition(async (pos) => {
  const { latitude, longitude } = pos.coords;
  const res = await fetch(
    `http://localhost:3000/api/posts/nearby/treks?latitude=${latitude}&longitude=${longitude}&maxDistance=100000`
  );
  const data = await res.json();
  console.log(`Found ${data.count} treks`);
});
```

## 📚 Documentation

- **[NEARBY_TREKS_SETUP.md](NEARBY_TREKS_SETUP.md)** - Full setup guide
- **[NEARBY_TREKS_TESTING_GUIDE.md](NEARBY_TREKS_TESTING_GUIDE.md)** - Testing guide
- **[NEARBY_TREKS_API_DOCUMENTATION.md](NEARBY_TREKS_API_DOCUMENTATION.md)** - API docs

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| No treks found | Run `node update-trek-coordinates.js` |
| Server not running | Run `npm start` |
| Wrong distances | Check coordinate order [lng, lat] |
| Need more data | Edit [seed-treks.js](seed-treks.js) |

## ✅ Checklist

- [ ] Coordinates updated (`node update-trek-coordinates.js`)
- [ ] Server running (`npm start`)
- [ ] API tested (`node test-nearby-treks.js`)
- [ ] Results sorted by distance (nearest → farthest)
- [ ] Filters working (difficulty, price, categories)

---

**Status:** ✅ Ready for Production  
**Last Updated:** December 21, 2025
