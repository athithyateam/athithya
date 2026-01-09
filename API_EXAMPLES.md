# API Testing Examples

## Using cURL

### 1. Register a Host User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Trek",
    "lastname": "Host",
    "email": "host@athithya.com",
    "password": "SecurePass123",
    "role": "host"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "host@athithya.com",
    "password": "SecurePass123"
  }'
```

**Save the token from response!**

### 3. Create a Featured Trek

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "postType=trek" \
  -F "title=Kedarkantha Summit Trek" \
  -F "description=Experience the magical winter wonderland of Kedarkantha with stunning snow views" \
  -F 'duration={"days":5,"nights":4}' \
  -F "difficulty=Easy-Moderate" \
  -F "isFeatured=true" \
  -F 'location={"city":"Sankri","state":"Uttarakhand","country":"India"}' \
  -F 'price={"perPerson":7999,"currency":"INR"}' \
  -F 'availability={"startDate":"2025-01-01","endDate":"2025-12-31","isAvailable":true}' \
  -F 'capacity={"maxPeople":15}' \
  -F "photos=@/path/to/your/image1.jpg" \
  -F "photos=@/path/to/your/image2.jpg"
```

### 4. Get Featured Treks

```bash
curl -X GET "http://localhost:3000/api/posts/featured/treks?limit=10"
```

### 5. Get All Treks with Filters

```bash
curl -X GET "http://localhost:3000/api/posts?postType=trek&difficulty=Moderate&isFeatured=true&limit=20"
```

### 6. Get Single Trek

```bash
curl -X GET "http://localhost:3000/api/posts/TREK_ID_HERE"
```

### 7. Update Trek (Set as Featured)

```bash
curl -X PUT http://localhost:3000/api/posts/TREK_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "isFeatured": true,
    "difficulty": "Moderate"
  }'
```

### 8. Delete Trek

```bash
curl -X DELETE http://localhost:3000/api/posts/TREK_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Using JavaScript (Fetch API)

### 1. Register Host

```javascript
const registerHost = async () => {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstname: 'Trek',
      lastname: 'Host',
      email: 'host@athithya.com',
      password: 'SecurePass123',
      role: 'host'
    })
  });
  
  const data = await response.json();
  console.log(data);
};
```

### 2. Login

```javascript
const login = async () => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'host@athithya.com',
      password: 'SecurePass123'
    })
  });
  
  const data = await response.json();
  const token = data.token;
  localStorage.setItem('token', token);
  return token;
};
```

### 3. Create Featured Trek

```javascript
const createTrek = async (token) => {
  const formData = new FormData();
  
  formData.append('postType', 'trek');
  formData.append('title', 'Kedarkantha Summit Trek');
  formData.append('description', 'Experience the magical winter wonderland...');
  formData.append('duration', JSON.stringify({ days: 5, nights: 4 }));
  formData.append('difficulty', 'Easy-Moderate');
  formData.append('isFeatured', 'true');
  formData.append('location', JSON.stringify({
    city: 'Sankri',
    state: 'Uttarakhand',
    country: 'India'
  }));
  formData.append('price', JSON.stringify({
    perPerson: 7999,
    currency: 'INR'
  }));
  formData.append('availability', JSON.stringify({
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isAvailable: true
  }));
  formData.append('capacity', JSON.stringify({ maxPeople: 15 }));
  
  // Add photos from file input
  const photoInput = document.querySelector('#photo-input');
  for (let file of photoInput.files) {
    formData.append('photos', file);
  }
  
  const response = await fetch('http://localhost:3000/api/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const data = await response.json();
  console.log(data);
};
```

### 4. Get Featured Treks

```javascript
const getFeaturedTreks = async () => {
  const response = await fetch('http://localhost:3000/api/posts/featured/treks?limit=10');
  const data = await response.json();
  
  console.log(`Found ${data.count} featured treks:`);
  data.posts.forEach(trek => {
    console.log(`
      ${trek.title}
      ${trek.duration.days}D • ${trek.duration.nights}N
      ${trek.difficulty}
      ₹${trek.price.perPerson.toLocaleString('en-IN')} per person
      ${trek.location.state}, ${trek.location.country}
    `);
  });
};
```

### 5. Filter Treks

```javascript
const filterTreks = async (filters) => {
  const params = new URLSearchParams({
    postType: 'trek',
    ...filters
  });
  
  const response = await fetch(`http://localhost:3000/api/posts?${params}`);
  const data = await response.json();
  return data.posts;
};

// Usage:
filterTreks({ 
  difficulty: 'Moderate', 
  state: 'Uttarakhand',
  minPrice: 5000,
  maxPrice: 15000,
  isFeatured: true
});
```

### 6. Update Trek

```javascript
const updateTrek = async (trekId, updates, token) => {
  const response = await fetch(`http://localhost:3000/api/posts/${trekId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  
  const data = await response.json();
  return data;
};

// Usage:
updateTrek('trek123', {
  isFeatured: true,
  difficulty: 'Moderate',
  price: { perPerson: 8999 }
}, token);
```

### 7. Delete Trek

```javascript
const deleteTrek = async (trekId, token) => {
  const response = await fetch(`http://localhost:3000/api/posts/${trekId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log(data.message);
};
```

---

## Using Axios

### Setup

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';
const api = axios.create({ baseURL: API_BASE });

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Examples

```javascript
// Register
await api.post('/auth/register', {
  firstname: 'Trek',
  lastname: 'Host',
  email: 'host@athithya.com',
  password: 'SecurePass123',
  role: 'host'
});

// Login
const { data } = await api.post('/auth/login', {
  email: 'host@athithya.com',
  password: 'SecurePass123'
});
localStorage.setItem('token', data.token);

// Create Trek
const formData = new FormData();
formData.append('postType', 'trek');
formData.append('title', 'Kedarkantha Summit Trek');
formData.append('duration', JSON.stringify({ days: 5, nights: 4 }));
formData.append('difficulty', 'Easy-Moderate');
formData.append('isFeatured', 'true');
// ... add other fields

await api.post('/posts', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Get Featured Treks
const { data: treks } = await api.get('/posts/featured/treks', {
  params: { limit: 10 }
});

// Filter Treks
const { data: filtered } = await api.get('/posts', {
  params: {
    postType: 'trek',
    difficulty: 'Moderate',
    isFeatured: true,
    minPrice: 5000,
    maxPrice: 15000
  }
});

// Update Trek
await api.put(`/posts/${trekId}`, {
  isFeatured: true,
  difficulty: 'Moderate'
});

// Delete Trek
await api.delete(`/posts/${trekId}`);
```

---

## React Example Component

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const FeaturedTreks = () => {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTreks = async () => {
      try {
        const { data } = await axios.get(
          'http://localhost:3000/api/posts/featured/treks?limit=10'
        );
        setTreks(data.posts);
      } catch (error) {
        console.error('Error fetching treks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTreks();
  }, []);

  if (loading) return <div>Loading featured treks...</div>;

  return (
    <div className="featured-treks">
      <h2>Featured Treks & Experiences</h2>
      <p>Handpicked adventures curated by verified hosts</p>
      
      <div className="trek-grid">
        {treks.map(trek => (
          <div key={trek._id} className="trek-card">
            <img src={trek.photos[0]?.url} alt={trek.title} />
            
            <div className="trek-info">
              <div className="badges">
                <span className="duration">
                  {trek.duration.days}D • {trek.duration.nights}N
                </span>
                <span className="difficulty">{trek.difficulty}</span>
              </div>
              
              <h3>{trek.title}</h3>
              <p className="location">
                {trek.location.state}, {trek.location.country}
              </p>
              
              <div className="price">
                ₹{trek.price.perPerson.toLocaleString('en-IN')}
                <span>per person</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedTreks;
```

---

## Testing Checklist

- [ ] Register a host user
- [ ] Login and save token
- [ ] Create a trek with photos
- [ ] Set trek as featured (isFeatured: true)
- [ ] Fetch featured treks
- [ ] Filter by difficulty
- [ ] Filter by price range
- [ ] Filter by location
- [ ] Update trek details
- [ ] Delete trek (verify Cloudinary cleanup)

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "post": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### List Response
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "totalPages": 5,
  "posts": [...]
}
```
