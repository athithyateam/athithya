# Location-Based Search API 📍

## Overview
Search for **everything** in a specific location - plans, experiences, treks, services, and monuments! Perfect for creating a location-specific explore page.

## Endpoint
**GET** `/api/search?location={locationName}`

Returns all active posts (itineraries, experiences, treks, services) for the specified location.

---

## Quick Start

### Get Everything for a Location
```javascript
// Get all content for Manali
fetch('/api/search?location=Manali')
  .then(res => res.json())
  .then(data => {
    console.log(data.data.results); // All posts for Manali
    console.log(data.data.pagination.totalResults); // Total count
  });
```

---

## Query Parameters

| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `location` | string | - | City, state, or country name | `location=Manali` |
| `type` | string | `all` | Filter by type | `type=experience` |
| `q` | string | - | Additional search query | `q=mountain` |
| `difficulty` | string | - | Filter by difficulty | `difficulty=Moderate` |
| `category` | string | - | Filter by category | `category=Adventure` |
| `minPrice` | number | - | Minimum price filter | `minPrice=5000` |
| `maxPrice` | number | - | Maximum price filter | `maxPrice=20000` |
| `sortBy` | string | `createdAt` | Sort field | `sortBy=price` |
| `sortOrder` | string | `desc` | Sort order | `sortOrder=asc` |
| `page` | number | `1` | Page number | `page=2` |
| `limit` | number | `20` | Results per page | `limit=12` |

### Type Options
- `all` - Everything (plans, experiences, treks, services)
- `itinerary` - Only itineraries/plans
- `experience` - Only experiences
- `trek` - Only treks
- `service` - Only services

---

## Common Use Cases

### 1. Location Explore Page
```javascript
// Show everything available in Manali
fetch('/api/search?location=Manali&limit=20')
```

### 2. Experiences Only for a Location
```javascript
// Show only experiences in Uttarakhand
fetch('/api/search?location=Uttarakhand&type=experience&limit=12')
```

### 3. Treks in a Location
```javascript
// Show treks in Nepal
fetch('/api/search?location=Nepal&type=trek&limit=15')
```

### 4. Location + Category Filter
```javascript
// Adventure activities in Rishikesh
fetch('/api/search?location=Rishikesh&category=Adventure')
```

### 5. Location + Price Range
```javascript
// Budget options in Goa (under ₹10,000)
fetch('/api/search?location=Goa&maxPrice=10000')
```

### 6. Location + Difficulty
```javascript
// Easy treks in Himachal Pradesh
fetch('/api/search?location=Himachal%20Pradesh&difficulty=Easy')
```

---

## Response Structure

```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "results": [
      {
        "_id": "64f7e8a9b1234567890abcde",
        "postType": "experience",
        "title": "Paragliding in Manali",
        "description": "Thrilling paragliding experience...",
        "location": {
          "city": "Manali",
          "state": "Himachal Pradesh",
          "country": "India"
        },
        "price": {
          "perPerson": 2500
        },
        "difficulty": "Easy",
        "categories": ["Adventure", "Air Sports"],
        "user": {
          "firstname": "John",
          "lastname": "Doe",
          "avatar": "...",
          "role": "host"
        },
        "photos": [...],
        "createdAt": "2024-03-15T10:00:00.000Z"
      },
      {
        "_id": "64f7e8a9b1234567890abcdf",
        "postType": "trek",
        "title": "Hampta Pass Trek",
        "description": "5-day trek through stunning valleys...",
        "location": {
          "city": "Manali",
          "state": "Himachal Pradesh",
          "country": "India"
        },
        "price": {
          "perPerson": 15000
        },
        "duration": {
          "days": 5,
          "nights": 4
        },
        "difficulty": "Moderate",
        "categories": ["Trekking", "Mountain"],
        "user": {...},
        "photos": [...],
        "createdAt": "2024-03-10T08:00:00.000Z"
      },
      {
        "_id": "64f7e8a9b1234567890abce0",
        "postType": "plan",
        "title": "5 Days in Manali Itinerary",
        "description": "Complete travel plan for Manali...",
        "location": {
          "city": "Manali",
          "state": "Himachal Pradesh",
          "country": "India"
        },
        "user": {...},
        "createdAt": "2024-03-08T12:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalResults": 45,
      "resultsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "query": null,
      "type": "all",
      "location": "Manali",
      "difficulty": null,
      "category": null,
      "priceRange": {
        "min": null,
        "max": null
      }
    }
  }
}
```

---

## React Component Example

### Complete Location Explore Page

```jsx
import { useState, useEffect } from 'react';

function LocationExplorePage({ locationName }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchLocationContent();
  }, [locationName, filter]);

  const fetchLocationContent = async (page = 1) => {
    setLoading(true);
    try {
      const url = `/api/search?location=${locationName}&type=${filter}&page=${page}&limit=12`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setResults(data.data.results);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group results by type
  const groupedResults = results.reduce((acc, item) => {
    const type = item.postType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {});

  return (
    <div className="location-explore-page">
      <h1>Explore {locationName}</h1>
      <p>Found {pagination.totalResults} results</p>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All ({pagination.totalResults})
        </button>
        <button 
          className={filter === 'experience' ? 'active' : ''} 
          onClick={() => setFilter('experience')}
        >
          Experiences
        </button>
        <button 
          className={filter === 'trek' ? 'active' : ''} 
          onClick={() => setFilter('trek')}
        >
          Treks
        </button>
        <button 
          className={filter === 'itinerary' ? 'active' : ''} 
          onClick={() => setFilter('itinerary')}
        >
          Itineraries
        </button>
        <button 
          className={filter === 'service' ? 'active' : ''} 
          onClick={() => setFilter('service')}
        >
          Services
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {filter === 'all' ? (
            // Show grouped by type
            <div>
              {Object.entries(groupedResults).map(([type, items]) => (
                <section key={type}>
                  <h2>{type.charAt(0).toUpperCase() + type.slice(1)}s</h2>
                  <div className="grid">
                    {items.map(item => (
                      <ResultCard key={item._id} item={item} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            // Show flat list for filtered type
            <div className="grid">
              {results.map(item => (
                <ResultCard key={item._id} item={item} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => fetchLocationContent(pagination.currentPage - 1)}
              >
                Previous
              </button>
              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => fetchLocationContent(pagination.currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ResultCard({ item }) {
  const typeIcons = {
    experience: '✨',
    trek: '🏔️',
    plan: '📋',
    service: '🔧'
  };

  return (
    <div className="result-card">
      <span className="type-badge">
        {typeIcons[item.postType]} {item.postType}
      </span>
      {item.photos?.[0] && (
        <img src={item.photos[0].url} alt={item.title} />
      )}
      <h3>{item.title}</h3>
      <p className="location">
        {item.location?.city}, {item.location?.country}
      </p>
      {item.price?.perPerson && (
        <div className="price">₹{item.price.perPerson}</div>
      )}
      {item.difficulty && (
        <span className="difficulty">{item.difficulty}</span>
      )}
      <div className="author">
        by {item.user?.firstname} {item.user?.lastname}
      </div>
    </div>
  );
}
```

### Simple Vanilla JavaScript Example

```javascript
// Fetch everything for a location
async function loadLocationContent(location) {
  const response = await fetch(`/api/search?location=${location}&limit=20`);
  const data = await response.json();
  
  if (data.success) {
    displayResults(data.data.results);
    displayStats(data.data);
  }
}

function displayResults(results) {
  const container = document.getElementById('results-container');
  
  container.innerHTML = results.map(item => `
    <div class="result-card">
      <span class="type">${item.postType}</span>
      <img src="${item.photos?.[0]?.url || 'placeholder.jpg'}" alt="${item.title}">
      <h3>${item.title}</h3>
      <p>${item.location.city}, ${item.location.country}</p>
      ${item.price?.perPerson ? `<div class="price">₹${item.price.perPerson}</div>` : ''}
    </div>
  `).join('');
}

function displayStats(data) {
  const stats = document.getElementById('stats');
  stats.innerHTML = `
    <p>Found ${data.pagination.totalResults} results in ${data.filters.location}</p>
  `;
}

// Usage
loadLocationContent('Manali');
```

---

## Advanced Filtering

### Combine Multiple Filters

```javascript
// Experiences in Manali, Adventure category, under ₹15000
const url = new URLSearchParams({
  location: 'Manali',
  type: 'experience',
  category: 'Adventure',
  maxPrice: 15000,
  limit: 12
});

fetch(`/api/search?${url}`)
  .then(res => res.json())
  .then(data => console.log(data.data.results));
```

### Sort Results

```javascript
// Cheapest options first
fetch('/api/search?location=Goa&sortBy=price&sortOrder=asc')

// Highest rated first
fetch('/api/search?location=Manali&sortBy=rating&sortOrder=desc')

// Most recent first
fetch('/api/search?location=Rishikesh&sortBy=createdAt&sortOrder=desc')
```

---

## Pro Tips

1. **URL Encode Spaces**: Use `%20` or `encodeURIComponent()` for locations with spaces
   ```javascript
   const location = 'Himachal Pradesh';
   fetch(`/api/search?location=${encodeURIComponent(location)}`);
   ```

2. **Hierarchical Search**: Search works with city, state, or country
   ```javascript
   fetch('/api/search?location=India')          // Country-level
   fetch('/api/search?location=Uttarakhand')    // State-level
   fetch('/api/search?location=Rishikesh')      // City-level
   ```

3. **Pagination**: Always implement pagination for better UX
   ```javascript
   fetch('/api/search?location=Manali&page=1&limit=12')
   ```

4. **Loading States**: Show loading indicators while fetching

5. **Error Handling**: Always handle network errors gracefully

---

## Related Endpoints

- **Latest Experiences**: `/api/posts/experiences/latest`
- **Featured Treks**: `/api/posts/treks/featured/list`
- **Nearby Treks**: `/api/posts/treks/nearby`
- **Advanced Search**: `POST /api/search/advanced`

---

## Full API Documentation

For complete details, see:
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- [EXPERIENCES_API_DOCUMENTATION.md](./EXPERIENCES_API_DOCUMENTATION.md)

---

**Build your location-based explore page! 🚀**
