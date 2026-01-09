# Top-Rated Hosts API Documentation ⭐

## Overview
The **Top-Rated Hosts API** provides a curated list of the highest-rated hosts based on real user reviews. This endpoint aggregates review data to calculate average ratings and presents hosts sorted by their rating scores, helping users discover the best-reviewed travel hosts and service providers.

## Base URL
```
/api/users/top-rated/hosts
```

## 📚 Endpoint Details

### Get Top-Rated Hosts
**GET** `/api/users/top-rated/hosts`

Retrieve a list of hosts sorted by their average rating from user reviews. Only includes hosts that have received at least one review.

**Authentication:** Not required (Public)

#### Query Parameters

All parameters are optional:

- `limit` (number): Maximum number of hosts to return
  - Default: `10`
  - Example: `?limit=20`
  
- `minRating` (number): Minimum average rating filter (1.0 to 5.0)
  - Default: `0`
  - Example: `?minRating=4.0` (only hosts with 4+ stars)

- `location` (string): Filter by location (city, state, or country)
  - Example: `?location=Uttarakhand`

#### Example Requests

**Get top 10 rated hosts:**
```bash
GET /api/users/top-rated/hosts
```

**Using cURL:**
```bash
curl -X GET "http://localhost:3000/api/users/top-rated/hosts?limit=10&minRating=4.0" \
  -H "Accept: application/json"
```

**Get top 20 hosts with minimum 4-star rating:**
```bash
GET /api/users/top-rated/hosts?limit=20&minRating=4.0
```

**Get top 5 excellent hosts (4.5+ stars):**
```bash
GET /api/users/top-rated/hosts?limit=5&minRating=4.5
```

**Get top rated hosts in a specific location:**
```bash
GET /api/users/top-rated/hosts?location=Uttarakhand&minRating=4.0
```

**Using cURL with location filter:**
```bash
curl -X GET "http://localhost:3000/api/users/top-rated/hosts?location=Uttarakhand&minRating=4.0&limit=15" \
  -H "Accept: application/json"
```

#### Success Response (200 OK)

**Response Headers:**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 2456
Date: Fri, 20 Dec 2025 10:30:00 GMT
Connection: keep-alive
```

**Response Body:**
```json
{
  "success": true,
  "count": 10,
  "hosts": [
    {
      "_id": "64f7e8a9b1234567890abcdf",
      "firstname": "Rajesh",
      "lastname": "Kumar",
      "email": "rajesh@example.com",
      "role": "host",
      "isVerified": true,
      "location": {
        "latitude": 30.0668,
        "longitude": 79.0193,
        "address": "Dehradun Road",
        "city": "Rishikesh",
        "state": "Uttarakhand",
        "country": "India",
        "lastUpdated": "2025-01-15T10:30:00.000Z"
      },
      "createdAt": "2024-06-15T08:00:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z",
      "averageRating": 4.8,
      "reviewCount": 42,
      "totalPosts": 15,
      "activePosts": 12,
      "postsByType": {
        "trek": 8,
        "service": 4,
        "experience": 0
      }
    },
    {
      "_id": "64f7e8a9b1234567890abce0",
      "firstname": "Priya",
      "lastname": "Sharma",
      "email": "priya@example.com",
      "role": "host",
      "isVerified": true,
      "location": {
        "latitude": 32.2396,
        "longitude": 77.1887,
        "city": "Manali",
        "state": "Himachal Pradesh",
        "country": "India",
        "lastUpdated": "2025-01-10T08:15:00.000Z"
      },
      "createdAt": "2024-05-20T10:00:00.000Z",
      "updatedAt": "2025-01-10T08:15:00.000Z",
      "averageRating": 4.7,
      "reviewCount": 38,
      "totalPosts": 10,
      "activePosts": 9,
      "postsByType": {
        "trek": 5,
        "service": 5,
        "experience": 0
      }
    },
    {
      "_id": "64f7e8a9b1234567890abce1",
      "firstname": "Amit",
      "lastname": "Patel",
      "email": "amit.patel@example.com",
      "role": "host",
      "isVerified": true,
      "location": {
        "latitude": 30.3165,
        "longitude": 78.0322,
        "address": "Rajpur Road",
        "city": "Dehradun",
        "state": "Uttarakhand",
        "country": "India",
        "lastUpdated": "2025-01-18T14:20:00.000Z"
      },
      "createdAt": "2024-07-10T12:30:00.000Z",
      "updatedAt": "2025-01-18T14:20:00.000Z",
      "averageRating": 4.6,
      "reviewCount": 29,
      "totalPosts": 8,
      "activePosts": 7,
      "postsByType": {
        "trek": 6,
**Response Headers:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
Date: Fri, 20 Dec 2025 10:30:00 GMT
```

**Response Body:**
```json
{
  "success": false,
  "message": "Invalid minRating value. Must be between 0 and 5"
}
```

**Other validation errors:**
```json
{
  "success": false,
  "message": "Invalid limit value. Must be a positive number"
}
```

#### Error Response (500 Internal Server Error)

**Response Headers:**
```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json; charset=utf-8
Date: Fri, 20 Dec 2025 10:30:00 GMT
```

**Response Body:**      "email": "sneha.reddy@example.com",
      "role": "host",
      "isVerified": true,
      "location": {
        "city": "Leh",
        "state": "Ladakh",
        "country": "India"
      },
      "createdAt": "2024-08-01T09:00:00.000Z",
      "updatedAt": "2025-01-12T11:45:00.000Z",
      "averageRating": 4.9,
      "reviewCount": 51,
      "totalPosts": 20,
      "activePosts": 18,
      "postsByType": {
        "trek": 12,
        "service": 7,
        "experience": 1
      }
    },
    {
      "_id": "64f7e8a9b1234567890abce3",
      "firstname": "Vikram",
      "lastname": "Singh",
      "email": "vikram.singh@example.com",
      "role": "host",
      "isVerified": false,
      "location": {
        "latitude": 28.6139,
        "longitude": 77.2090,
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "lastUpdated": "2025-01-05T16:00:00.000Z"
      },
      "createdAt": "2024-09-15T07:30:00.000Z",
      "updatedAt": "2025-01-05T16:00:00.000Z",
      "averageRating": 4.5,
      "reviewCount": 22,
      "totalPosts": 6,
      "activePosts": 5,
      "postsByType": {
        "trek": 3,
        "service": 3,
        "experience": 0
      }
    }
  ]
}
```

**Minimal Response Example (Empty Result):**
```json
{
  "success": true,
  "count": 0,
  "hosts": []
}
```

#### Response Fields Explained

**Host Information:**
- `_id` - Unique host user ID
- `firstname` - Host's first name
- `lastname` - Host's last name
- `email` - Host's email address
- `role` - Always "host"
- `isVerified` - Whether the host account is verified
- `location` - Host's location details (optional)
  - `latitude` - Location latitude
  - `longitude` - Location longitude
  - `address` - Street address
  - `city` - City name
  - `state` - State/province name
  - `country` - Country name
  - `lastUpdated` - When location was last updated
- `createdAt` - When host account was created
- `updatedAt` - When host profile was last updated

**Rating Information:**
- `averageRating` - Average rating from all reviews (1.0 to 5.0, rounded to 1 decimal)
- `reviewCount` - Total number of reviews received

**Activity Information:**
- `totalPosts` - Total number of posts created by the host
- `activePosts` - Number of currently active posts
- `postsByType` - Breakdown of posts by type
  - `trek` - Number of trek posts
  - `service` - Number of service posts
  - `experience` - Number of experience posts

#### Error Response (400 Bad Request)

```json
{
  "success": false,
  "message": "Invalid minRating value. Must be between 0 and 5"
}
```

#### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Error fetching top-rated hosts"
}
```

---

## 🎨 Frontend Usage Examples

### JavaScript/Fetch API

```javascript
async function getTopRatedHosts() {
  try {
    const response = await fetch('/api/users/top-rated/hosts?limit=10&minRating=4.0');
    const data = await response.json();
    
    if (data.success) {
      console.log(`Found ${data.count} top-rated hosts`);
      
      data.hosts.forEach(host => {
        console.log(`⭐ ${host.averageRating} - ${host.firstname} ${host.lastname}`);
        console.log(`   ${host.reviewCount} reviews`);
        console.log(`   ${host.activePosts} active posts (${host.totalPosts} total)`);
        console.log(`   Location: ${host.location?.city || 'N/A'}, ${host.location?.state || 'N/A'}`);
        console.log(`   Posts: ${host.postsByType.trek} treks, ${host.postsByType.service} services`);
        console.log('---');
      });
    }
  } catch (error) {
    console.error('Error fetching top-rated hosts:', error);
  }
}

// Usage
getTopRatedHosts();
```

### React Component

```jsx
import { useState, useEffect } from 'react';

function TopRatedHosts() {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minRating, setMinRating] = useState(4.0);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchTopRatedHosts();
  }, [minRating, limit]);

  const fetchTopRatedHosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/users/top-rated/hosts?limit=${limit}&minRating=${minRating}`
      );
      const data = await response.json();
      
      if (data.success) {
        setHosts(data.hosts);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch top-rated hosts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading top-rated hosts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="top-rated-hosts">
      <h2>Top Rated Hosts ⭐</h2>
      
      {/* Filters */}
      <div className="filters">
        <label>
          Minimum Rating:
          <select 
            value={minRating} 
            onChange={(e) => setMinRating(Number(e.target.value))}
          >
            <option value="0">All Ratings</option>
            <option value="3.0">3.0+</option>
            <option value="3.5">3.5+</option>
            <option value="4.0">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
        </label>

        <label>
          Show:
          <select 
            value={limit} 
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value="5">5 hosts</option>
            <option value="10">10 hosts</option>
            <option value="20">20 hosts</option>
            <option value="50">50 hosts</option>
          </select>
        </label>
      </div>

      {/* Host Cards */}
      <div className="hosts-grid">
        {hosts.map(host => (
          <div key={host._id} className="host-card">
            <div className="host-header">
              <h3>{host.firstname} {host.lastname}</h3>
              {host.isVerified && <span className="verified-badge">✓ Verified</span>}
            </div>
            
            <div className="rating">
              <span className="stars">{'⭐'.repeat(Math.round(host.averageRating))}</span>
              <span className="rating-value">{host.averageRating}</span>
              <span className="review-count">({host.reviewCount} reviews)</span>
            </div>

            {host.location && (
              <div className="location">
                📍 {host.location.city}, {host.location.state}
              </div>
            )}

            <div className="stats">
              <div className="stat">
                <span className="stat-value">{host.activePosts}</span>
                <span className="stat-label">Active Posts</span>
              </div>
              <div className="stat">
                <span className="stat-value">{host.postsByType.trek}</span>
                <span className="stat-label">Treks</span>
              </div>
              <div className="stat">
                <span className="stat-value">{host.postsByType.service}</span>
                <span className="stat-label">Services</span>
              </div>
            </div>

            <button 
              onClick={() => window.location.href = `/profile/${host._id}`}
              className="view-profile-btn"
            >
              View Profile
            </button>
          </div>
        ))}
      </div>

      {hosts.length === 0 && (
        <div className="no-results">
          No hosts found with rating {minRating}+
        </div>
      )}
    </div>
  );
}

export default TopRatedHosts;
```

### Vue.js Component

```vue
<template>
  <div class="top-rated-hosts">
    <h2>Top Rated Hosts ⭐</h2>
    
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else>
      <!-- Filters -->
      <div class="filters">
        <label>
          Minimum Rating:
          <select v-model="minRating" @change="fetchHosts">
            <option :value="0">All Ratings</option>
            <option :value="3.0">3.0+</option>
            <option :value="4.0">4.0+</option>
            <option :value="4.5">4.5+</option>
          </select>
        </label>
      </div>

      <!-- Host List -->
      <div class="hosts-grid">
        <div 
          v-for="host in hosts" 
          :key="host._id" 
          class="host-card"
        >
          <h3>{{ host.firstname }} {{ host.lastname }}</h3>
          <div class="rating">
            ⭐ {{ host.averageRating }} ({{ host.reviewCount }} reviews)
          </div>
          <div v-if="host.location" class="location">
            📍 {{ host.location.city }}, {{ host.location.state }}
          </div>
          <div class="stats">
            <span>{{ host.activePosts }} active posts</span>
            <span>{{ host.postsByType.trek }} treks</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopRatedHosts',
  data() {
    return {
      hosts: [],
      loading: false,
      error: null,
      minRating: 4.0,
      limit: 10
    };
  },
  mounted() {
    this.fetchHosts();
  },
  methods: {
    async fetchHosts() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch(
          `/api/users/top-rated/hosts?limit=${this.limit}&minRating=${this.minRating}`
        );
        const data = await response.json();
        
        if (data.success) {
          this.hosts = data.hosts;
        } else {
          this.error = data.message;
        }
      } catch (err) {
        this.error = 'Failed to fetch hosts';
        console.error(err);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.hosts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.host-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.3s;
}

.host-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.rating {
  color: #f59e0b;
  font-weight: bold;
  margin: 10px 0;
}

.location {
  color: #6b7280;
  margin: 8px 0;
}

.stats {
  display: flex;
  gap: 15px;
  margin-top: 12px;
  font-size: 0.9em;
  color: #6b7280;
}
</style>
```

### Angular Component

```typescript
// top-rated-hosts.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Host {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  averageRating: number;
  reviewCount: number;
  activePosts: number;
  totalPosts: number;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  postsByType: {
    trek: number;
    service: number;
    experience: number;
  };
}

@Component({
  selector: 'app-top-rated-hosts',
  templateUrl: './top-rated-hosts.component.html',
  styleUrls: ['./top-rated-hosts.component.css']
})
export class TopRatedHostsComponent implements OnInit {
  hosts: Host[] = [];
  loading = false;
  error: string | null = null;
  minRating = 4.0;
  limit = 10;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchTopRatedHosts();
  }

  fetchTopRatedHosts(): void {
    this.loading = true;
    this.error = null;

    const url = `/api/users/top-rated/hosts?limit=${this.limit}&minRating=${this.minRating}`;

    this.http.get<{ success: boolean; hosts: Host[]; count: number }>(url)
      .subscribe({
        next: (data) => {
          if (data.success) {
            this.hosts = data.hosts;
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to fetch top-rated hosts';
          this.loading = false;
          console.error(err);
        }
      });
  }

  getStars(rating: number): string {
    return '⭐'.repeat(Math.round(rating));
  }
}
```

```html
<!-- top-rated-hosts.component.html -->
<div class="top-rated-hosts">
  <h2>Top Rated Hosts ⭐</h2>

  <div class="filters">
    <label>
      Minimum Rating:
      <select [(ngModel)]="minRating" (change)="fetchTopRatedHosts()">
        <option [value]="0">All Ratings</option>
        <option [value]="3.0">3.0+</option>
        <option [value]="4.0">4.0+</option>
        <option [value]="4.5">4.5+</option>
      </select>
    </label>
  </div>

  <div *ngIf="loading">Loading...</div>
  <div *ngIf="error" class="error">{{ error }}</div>

  <div class="hosts-grid" *ngIf="!loading && !error">
    <div *ngFor="let host of hosts" class="host-card">
      <h3>{{ host.firstname }} {{ host.lastname }}</h3>
      <div class="rating">
        {{ getStars(host.averageRating) }} {{ host.averageRating }}
        ({{ host.reviewCount }} reviews)
      </div>
      <div *ngIf="host.location" class="location">
        📍 {{ host.location.city }}, {{ host.location.state }}
      </div>
      <div class="stats">
        <span>{{ host.activePosts }} active posts</span>
        <span>{{ host.postsByType.trek }} treks</span>
      </div>
    </div>
  </div>
</div>
```

---

## 🔍 Use Cases

### 1. Homepage Featured Hosts
Display the top 5 highest-rated hosts on your homepage:

```javascript
fetch('/api/users/top-rated/hosts?limit=5&minRating=4.5')
  .then(res => res.json())
  .then(data => {
    // Display featured hosts
    displayFeaturedHosts(data.hosts);
  });
```

### 2. Find Hosts in Specific Location
Find top-rated hosts in a specific region:

```javascript
fetch('/api/users/top-rated/hosts?location=Uttarakhand&minRating=4.0&limit=20')
  .then(res => res.json())
  .then(data => {
    // Display location-specific hosts
    displayHostsByLocation(data.hosts);
  });
```

### 3. Filter by Excellence
Show only the best of the best (4.5+ stars):

```javascript
fetch('/api/users/top-rated/hosts?minRating=4.5&limit=10')
  .then(res => res.json())
  .then(data => {
    // Display premium hosts
    displayPremiumHosts(data.hosts);
  });
```

### 4. Host Discovery Page
Create a comprehensive host discovery page with filtering:

```javascript
class HostDiscovery {
  constructor() {
    this.filters = {
      minRating: 4.0,
      limit: 20,
      location: ''
    };
  }

  async searchHosts() {
    const params = new URLSearchParams();
    params.append('limit', this.filters.limit);
    params.append('minRating', this.filters.minRating);
    if (this.filters.location) {
      params.append('location', this.filters.location);
    }

    const response = await fetch(`/api/users/top-rated/hosts?${params}`);
    const data = await response.json();
    
    if (data.success) {
      return data.hosts;
    }
    throw new Error(data.message);
  }

  updateFilter(key, value) {
    this.filters[key] = value;
    return this.searchHosts();
  }
}
```

---

## 📊 Implementation Notes

### Backend Implementation

The endpoint uses MongoDB aggregation to:
1. Group reviews by host
2. Calculate average rating per host
3. Count total reviews per host
4. Filter by minimum rating
5. Sort by rating (highest first)
6. Limit results
7. Lookup host user details
8. Count posts by type and status
9. Filter to only include users with role='host'

### Performance Considerations

- **Indexed Queries**: The aggregation uses indexes on the Review collection for optimal performance
- **Caching**: Consider caching results for 5-10 minutes to reduce database load
- **Pagination**: Use the `limit` parameter to control response size
- **User Location**: Location filtering is performed on the User model's location field

### Data Freshness

- Ratings are calculated in real-time from the reviews collection
- No pre-computed rating cache is used
- Post counts are calculated dynamically from the Post collection

---

## 🔗 Related Endpoints

- **[Reviews API](REVIEWS_API_DOCUMENTATION.md)** - Create and manage reviews
- **[User Profile API](USER_PROFILE_API_DOCUMENTATION.md)** - Get detailed host profiles
- **[Posts API](POSTS_API_DOCUMENTATION.md)** - View host's posts (treks, services)
- **[Top-Rated Treks API](TOP_RATED_TREKS_API_DOCUMENTATION.md)** - Similar endpoint for treks

---

## 🐛 Error Handling

Always wrap API calls in try-catch blocks:

```javascript
async function safeGetTopHosts() {
  try {
    const response = await fetch('/api/users/top-rated/hosts?limit=10');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data.hosts;
  } catch (error) {
    console.error('Failed to fetch top hosts:', error);
    // Show user-friendly error message
    showError('Unable to load top-rated hosts. Please try again later.');
    return [];
  }
}
```

---

## ✅ Best Practices

1. **Optimize Requests**: Use appropriate `limit` values to avoid fetching unnecessary data
2. **Cache Results**: Cache the response on the client side for a few minutes
3. **Progressive Loading**: Load initial set (e.g., 10 hosts), then offer "load more"
4. **Filter Smart**: Combine filters (rating + location) for better user experience
5. **Handle Empty States**: Show helpful message when no hosts match the criteria
6. **Responsive Design**: Display host cards in a responsive grid layout
7. **Loading States**: Always show loading indicators during API calls
8. **Error Boundaries**: Implement proper error handling and user feedback

---

## 📱 Mobile Optimization

```javascript
// Adjust limit based on screen size
function getOptimalLimit() {
  const width = window.innerWidth;
  if (width < 768) return 5;  // Mobile
  if (width < 1024) return 10; // Tablet
  return 20; // Desktop
}

// Fetch with optimal limit
fetch(`/api/users/top-rated/hosts?limit=${getOptimalLimit()}`)
  .then(res => res.json())
  .then(data => displayHosts(data.hosts));
```

---

## 🎯 Key Takeaways

- ✅ Public endpoint - no authentication required
- ⭐ Returns hosts sorted by average rating
- 📊 Includes review counts and post statistics
- 🎚️ Flexible filtering with `minRating` and `limit`
- 🌍 Optional location-based filtering
- 📱 Mobile-friendly pagination support
- 🚀 Optimized with database indexes
- 🔄 Real-time rating calculations

---

## 💡 Tips

1. **For Homepage**: Use `limit=5&minRating=4.5` to show only top hosts
2. **For Browse Page**: Use `limit=20&minRating=3.0` for broader selection
3. **For Premium Section**: Use `minRating=4.8` for truly exceptional hosts
4. **Location Search**: Combine location filter with rating for targeted results
5. **Load More**: Implement infinite scroll or pagination for better UX

---

## 📞 Support

For issues or questions about this API, please contact the development team or refer to the main [API Documentation](API_DOCUMENTATION.md).
