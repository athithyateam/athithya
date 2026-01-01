# Top-Rated Treks API Documentation ⭐

## Overview
The **Top-Rated Treks API** provides a curated list of the highest-rated trekking experiences based on real user reviews. This endpoint aggregates review data to calculate average ratings and presents treks sorted by their rating scores, helping users discover the best-reviewed trekking adventures.

## Base URL
```
/api/posts/top-rated/treks
```

## 📚 Endpoint Details

### Get Top-Rated Treks
**GET** `/api/posts/top-rated/treks`

Retrieve a list of trek posts sorted by their average rating from user reviews. Only includes treks that have received at least one review.

**Authentication:** Not required (Public)

#### Query Parameters

All parameters are optional:

- `limit` (number): Maximum number of treks to return
  - Default: `10`
  - Example: `?limit=20`
  
- `minRating` (number): Minimum average rating filter (1.0 to 5.0)
  - Default: `0`
  - Example: `?minRating=4.0` (only treks with 4+ stars)

#### Example Requests

**Get top 10 rated treks:**
```bash
GET /api/posts/top-rated/treks
```

**Get top 20 treks with minimum 4-star rating:**
```bash
GET /api/posts/top-rated/treks?limit=20&minRating=4.0
```

**Get top 5 excellent treks (4.5+ stars):**
```bash
GET /api/posts/top-rated/treks?limit=5&minRating=4.5
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "count": 10,
  "treks": [
    {
      "_id": "64f7e8a9b1234567890abcde",
      "postType": "trek",
      "title": "Kedarkantha Winter Summit Trek",
      "description": "Experience the magical Himalayan winter...",
      "user": {
        "_id": "64f7e8a9b1234567890abcdf",
        "firstname": "Rajesh",
        "lastname": "Kumar",
        "email": "rajesh@example.com",
        "role": "host"
      },
      "photos": [
        {
          "url": "https://res.cloudinary.com/.../photo1.jpg",
          "public_id": "posts/photo1",
          "resource_type": "image"
        }
      ],
      "videos": [],
      "location": {
        "city": "Sankri",
        "state": "Uttarakhand",
        "country": "India"
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
      "categories": ["Adventure", "Mountain", "Snow"],
      "amenities": [
        "Guide",
        "Camping Equipment",
        "Meals",
        "First Aid"
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
      "averageRating": 4.8,
      "reviewCount": 42
    },
    {
      "_id": "64f7e8a9b1234567890abcdf",
      "title": "Valley of Flowers Trek",
      "description": "UNESCO World Heritage site...",
      "averageRating": 4.7,
      "reviewCount": 38,
      // ... other trek details
    }
    // ... more treks
  ]
}
```

#### Response Fields Explained

**Trek Information:**
- `_id` - Unique trek post ID
- `title` - Trek name
- `description` - Detailed trek description
- `postType` - Always "trek"
- `photos` - Array of trek photos with Cloudinary URLs
- `videos` - Array of trek videos
- `location` - Trek starting location (city, state, country)
- `price` - Pricing details (per person, currency, period)
- `duration` - Trek duration (days and nights)
- `difficulty` - Difficulty level (Easy, Moderate, Difficult, etc.)
- `categories` - Trek categories/tags
- `amenities` - Included amenities (Guide, Meals, Equipment, etc.)
- `capacity` - Maximum group size
- `availability` - Date range when trek is available
- `isFeatured` - Whether trek is featured
- `status` - Post status (active, inactive, etc.)
- `user` - Host/organizer details

**Rating Information (New):**
- `averageRating` - Average rating from all reviews (1.0 to 5.0, rounded to 1 decimal)
- `reviewCount` - Total number of reviews received

#### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Error fetching top-rated treks"
}
```

---

## 🎨 Frontend Usage Examples

### JavaScript/Fetch API

```javascript
async function getTopRatedTreks() {
  try {
    const response = await fetch('/api/posts/top-rated/treks?limit=10&minRating=4.0');
    const data = await response.json();
    
    if (data.success) {
      console.log(`Found ${data.count} top-rated treks`);
      
      data.treks.forEach(trek => {
        console.log(`⭐ ${trek.averageRating} - ${trek.title}`);
        console.log(`   ${trek.reviewCount} reviews`);
        console.log(`   ₹${trek.price.perPerson} per person`);
        console.log(`   ${trek.duration.days}D/${trek.duration.nights}N`);
        console.log(`   Location: ${trek.location.city}, ${trek.location.state}`);
        console.log('---');
      });
    }
  } catch (error) {
    console.error('Error fetching top-rated treks:', error);
  }
}

// Usage
getTopRatedTreks();
```

### React Component

```jsx
import { useState, useEffect } from 'react';

function TopRatedTreks() {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minRating, setMinRating] = useState(4.0);

  useEffect(() => {
    fetchTopRatedTreks();
  }, [minRating]);

  const fetchTopRatedTreks = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/posts/top-rated/treks?limit=12&minRating=${minRating}`
      );
      const data = await response.json();
      
      if (data.success) {
        setTreks(data.treks);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="stars">
        {'⭐'.repeat(fullStars)}
        {hasHalfStar && '⭐'}
        <span className="rating-text">{rating}/5.0</span>
      </div>
    );
  };

  return (
    <div className="top-rated-treks">
      <h1>Top-Rated Treks ⭐</h1>
      
      {/* Filter */}
      <div className="filters">
        <label>
          Minimum Rating:
          <select 
            value={minRating} 
            onChange={(e) => setMinRating(Number(e.target.value))}
          >
            <option value="0">All Ratings</option>
            <option value="3.5">3.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p>Loading top-rated treks...</p>
      ) : (
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
                
                <div className="rating">
                  {renderStars(trek.averageRating)}
                  <span className="review-count">
                    ({trek.reviewCount} reviews)
                  </span>
                </div>
                
                <p className="location">
                  📍 {trek.location.city}, {trek.location.state}
                </p>
                
                <p className="duration">
                  🕒 {trek.duration.days}D / {trek.duration.nights}N
                </p>
                
                <p className="difficulty">
                  💪 {trek.difficulty}
                </p>
                
                <p className="price">
                  ₹{trek.price.perPerson.toLocaleString('en-IN')} per person
                </p>
                
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
      )}
      
      {!loading && treks.length === 0 && (
        <p>No treks found with the selected rating filter.</p>
      )}
    </div>
  );
}

export default TopRatedTreks;
```

### Axios Example

```javascript
import axios from 'axios';

const getTopRatedTreks = async (options = {}) => {
  const { limit = 10, minRating = 0 } = options;
  
  try {
    const response = await axios.get('/api/posts/top-rated/treks', {
      params: { limit, minRating }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching top-rated treks:', error.message);
    throw error;
  }
};

// Usage
(async () => {
  // Get top 5 excellent treks
  const result = await getTopRatedTreks({ limit: 5, minRating: 4.5 });
  console.log(`Found ${result.count} excellent treks:`, result.treks);
})();
```

---

## 🌟 Rating System Overview

### How Ratings Work

1. **Reviews Collection**: Users can leave reviews for treks they've experienced
2. **Rating Aggregation**: This endpoint aggregates all reviews for each trek
3. **Average Calculation**: Calculates average rating from all reviews (1-5 stars)
4. **Sorting**: Treks are sorted by average rating (highest first)
5. **Secondary Sort**: If ratings are equal, sorts by review count

### Rating Scale

```
5.0 ⭐⭐⭐⭐⭐ - Exceptional
4.5-4.9 ⭐⭐⭐⭐⭐ - Excellent
4.0-4.4 ⭐⭐⭐⭐  - Very Good
3.5-3.9 ⭐⭐⭐   - Good
3.0-3.4 ⭐⭐⭐   - Average
< 3.0   ⭐⭐     - Below Average
```

### Requirements for Inclusion

A trek must meet these criteria to appear in top-rated results:
- ✅ Must have `postType: "trek"`
- ✅ Must have `status: "active"`
- ✅ Must have at least **1 review** with a rating
- ✅ Must meet the `minRating` filter (if specified)

### Treks Without Reviews

Treks that have **not received any reviews** will:
- ❌ **Not appear** in the top-rated treks endpoint
- ✅ Still appear in other endpoints (general treks, featured treks, etc.)

---

## 📊 Common Use Cases

### 1. Homepage "Best Treks" Section

Display the top 5 highest-rated treks on your homepage:

```javascript
fetch('/api/posts/top-rated/treks?limit=5')
  .then(res => res.json())
  .then(data => {
    displayBestTreks(data.treks);
  });
```

### 2. "Highly Rated" Filter

Let users filter to see only treks with 4+ stars:

```javascript
fetch('/api/posts/top-rated/treks?minRating=4.0&limit=20')
  .then(res => res.json())
  .then(data => {
    showHighlyRatedTreks(data.treks);
  });
```

### 3. Badge Display

Show rating badges on trek cards:

```javascript
function getTrekBadge(averageRating) {
  if (averageRating >= 4.5) return '🏆 Exceptional';
  if (averageRating >= 4.0) return '⭐ Excellent';
  if (averageRating >= 3.5) return '👍 Very Good';
  return '✓ Good';
}
```

### 4. Trust Indicator

Display review count alongside rating to build trust:

```javascript
function formatReviewText(count) {
  if (count === 1) return '1 review';
  if (count < 10) return `${count} reviews`;
  if (count < 100) return `${count}+ reviews`;
  return 'Highly reviewed';
}

// Usage
// ⭐ 4.8 (42 reviews)
```

---

## 🔍 Sorting Logic

### Primary Sort: Average Rating (Descending)
Treks with higher average ratings appear first.

### Secondary Sort: Review Count (Descending)
If two treks have the same rating, the one with more reviews appears first.

**Example:**
```
Trek A: 4.8 ⭐ (50 reviews)  <- Appears first
Trek B: 4.8 ⭐ (30 reviews)  <- Appears second
Trek C: 4.7 ⭐ (100 reviews) <- Appears third
```

---

## 💡 Best Practices

### 1. Cache Results
Top-rated treks don't change frequently. Consider caching:

```javascript
// Cache for 1 hour
const CACHE_DURATION = 3600000; // 1 hour in ms
let cachedTreks = null;
let cacheTime = null;

async function getCachedTopRatedTreks() {
  const now = Date.now();
  
  if (cachedTreks && cacheTime && (now - cacheTime < CACHE_DURATION)) {
    return cachedTreks;
  }
  
  const response = await fetch('/api/posts/top-rated/treks');
  const data = await response.json();
  
  cachedTreks = data;
  cacheTime = now;
  
  return data;
}
```

### 2. Show Loading States
Rating aggregation can take a moment. Show loading indicators:

```jsx
{loading ? (
  <div className="loading">
    <Spinner />
    <p>Finding the best-rated treks...</p>
  </div>
) : (
  <TreksList treks={treks} />
)}
```

### 3. Handle Empty Results
Show helpful message when no treks meet the criteria:

```jsx
{treks.length === 0 && (
  <div className="no-results">
    <p>No treks found with {minRating}+ star rating.</p>
    <button onClick={() => setMinRating(0)}>
      Show All Rated Treks
    </button>
  </div>
)}
```

### 4. Display Review Count
Always show review count alongside rating for transparency:

```jsx
<div className="rating">
  ⭐ {trek.averageRating}/5.0
  <span className="reviews">({trek.reviewCount} reviews)</span>
</div>
```

### 5. Link to Reviews
Make it easy for users to read reviews:

```jsx
<a href={`/treks/${trek._id}#reviews`}>
  Read {trek.reviewCount} reviews
</a>
```

---

## 🆚 Comparison with Other Trek Endpoints

| Endpoint | Use Case | Sorting | Requires Reviews |
|----------|----------|---------|------------------|
| `/api/posts/top-rated/treks` | Show highest-rated treks | **Average rating** | ✅ Yes |
| `/api/posts/featured/treks` | Show handpicked/promoted treks | Newest first | ❌ No |
| `/api/posts/all/treks` | Show all treks | Newest first | ❌ No |
| `/api/posts/treks` | Search/filter treks | Multiple options | ❌ No |

### When to Use Top-Rated Endpoint

✅ **Use top-rated endpoint when:**
- Building a "Best Treks" section
- Showing quality-focused recommendations
- Users want to see proven, well-reviewed options
- Building trust through social proof

❌ **Don't use when:**
- You want to show ALL treks (including new ones without reviews)
- You need to filter by specific location/price
- You want to show admin-curated featured treks

---

## 🔗 Related APIs

### Reviews API
To allow users to leave reviews that power the top-rated system:
- See [REVIEWS_API_DOCUMENTATION.md](./REVIEWS_API_DOCUMENTATION.md)

### General Treks API
For more trek filtering and search options:
- See [FEATURED_TREKS_README.md](./FEATURED_TREKS_README.md)
- See [POSTS_API_DOCUMENTATION.md](./POSTS_API_DOCUMENTATION.md)

### Featured Treks API
For admin-curated featured treks:
- `GET /api/posts/featured/treks`

---

## 📝 Response Type Definition (TypeScript)

```typescript
interface TopRatedTreksResponse {
  success: boolean;
  count: number;
  treks: TopRatedTrek[];
}

interface TopRatedTrek {
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
  
  // Rating fields
  averageRating: number;  // 1.0 to 5.0, rounded to 1 decimal
  reviewCount: number;    // Total number of reviews
}

interface Media {
  url: string;
  public_id: string;
  resource_type: "image" | "video";
}
```

---

## 🚀 Quick Start

```javascript
// 1. Import or setup fetch/axios
import axios from 'axios';

// 2. Fetch top-rated treks
const getTopTreks = async () => {
  const { data } = await axios.get('/api/posts/top-rated/treks', {
    params: {
      limit: 10,
      minRating: 4.0
    }
  });
  
  return data.treks;
};

// 3. Display results
getTopTreks().then(treks => {
  treks.forEach(trek => {
    console.log(`${trek.title} - ⭐ ${trek.averageRating} (${trek.reviewCount} reviews)`);
  });
});
```

---

## ⚠️ Important Notes

1. **Only Reviewed Treks**: This endpoint only returns treks that have at least one review. New treks without reviews won't appear here.

2. **Rating Calculation**: Average rating is calculated from all reviews, rounded to 1 decimal place.

3. **Active Treks Only**: Only treks with `status: "active"` and `postType: "trek"` are included.

4. **Review Count Matters**: More reviews generally indicate more reliable ratings.

5. **Performance**: The aggregation pipeline is optimized but may be slower than simple queries for large datasets. Consider caching results.

---

## 📞 Support & Resources

- **Main API Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Posts API:** [POSTS_API_DOCUMENTATION.md](./POSTS_API_DOCUMENTATION.md)
- **Featured Treks:** [FEATURED_TREKS_README.md](./FEATURED_TREKS_README.md)
- **Reviews API:** [REVIEWS_API_DOCUMENTATION.md](./REVIEWS_API_DOCUMENTATION.md)

---

**Happy Trekking! 🏔️⭐**

Discover the best-rated trekking adventures backed by real traveler reviews!
