# Location Coordinates Quick Reference 🎯

## The Error
```
"Can't extract geo keys: Point must be an array or object, instead got type missing"
```

## The Fix

### ❌ WRONG
```javascript
{
  "location": {
    "city": "Dehradun",
    "coordinates": {
      "type": "Point"
      // Missing: coordinates array!
    }
  }
}
```

### ✅ CORRECT (Option 1: With Coordinates)
```javascript
{
  "location": {
    "city": "Dehradun",
    "country": "India",
    "coordinates": {
      "type": "Point",
      "coordinates": [78.0322, 30.3165]  // [LONGITUDE, LATITUDE]
    }
  }
}
```

### ✅ CORRECT (Option 2: Without Coordinates)
```javascript
{
  "location": {
    "city": "Dehradun",
    "state": "Uttarakhand",
    "country": "India"
    // No coordinates field - perfectly fine!
  }
}
```

---

## Copy-Paste Solution

```javascript
// Get user's location
navigator.geolocation.getCurrentPosition((position) => {
  const location = {
    city: "Your City",
    country: "India",
    coordinates: {
      type: "Point",
      coordinates: [
        position.coords.longitude,  // FIRST
        position.coords.latitude    // SECOND
      ]
    }
  };
  
  // Use location in your API call
  createPost({ title: "...", location });
});
```

---

## Remember
1. **Order:** `[longitude, latitude]` NOT `[latitude, longitude]`
2. **Array:** Must be an array of 2 numbers
3. **Optional:** Can omit coordinates entirely
4. **Complete:** If included, must have both values

---

## More Details
See [FRONTEND_LOCATION_GUIDE.md](./FRONTEND_LOCATION_GUIDE.md) for complete documentation.
