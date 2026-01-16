# Explore Experiences - Quick Start Guide 🚀

## API Endpoint for Explore Page

**GET** `/api/posts/experiences/latest`

Get the 12 most recently posted experiences - simple and perfect for your explore page!

## Quick Usage

### Basic Request (Returns 12 latest)
```javascript
fetch('/api/posts/experiences/latest')
  .then(res => res.json())
  .then(data => console.log(data.experiences));
```

### Custom Limit
```javascript
// Get 20 latest experiences
fetch('/api/posts/experiences/latest?limit=20')
  .then(res => res.json())
  .then(data => console.log(data.experiences));
```

## Query Parameters

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `limit` | Max items to return | 12 | `limit=20` |

## Response Structure

```json
{
  "success": true,
  "count": 12,
  "experiences": [
    {
      "_id": "...",
      "title": "Solo Trek to Kedarkantha Peak",
      "description": "An unforgettable journey...",
      "user": {
        "firstname": "John",
        "lastname": "Doe",
        "avatar": "..."
      },
      "photos": [...],
      "location": {
        "city": "Sankri",
        "state": "Uttarakhand",
        "country": "India"
      },
      "price": {
        "perPerson": 18000,
        "period": "per trip"
      },
      "duration": {
        "days": 6,
        "nights": 5
      },
      "difficulty": "Moderate",
      "categories": ["Adventure", "Mountain"],
      "createdAt": "2024-03-18T10:30:00.000Z"
    }
  ]
}
```

## React Example

```jsx
import { useState, useEffect } from 'react';

function ExploreExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts/experiences/latest')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setExperiences(data.experiences);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="explore-grid">
      {experiences.map(exp => (
        <div key={exp._id} className="experience-card">
          <img src={exp.photos[0]?.url} alt={exp.title} />
          <h3>{exp.title}</h3>
          <p>{exp.location?.city}, {exp.location?.country}</p>
          <div className="price">₹{exp.price?.perPerson}</div>
          <span className="difficulty">{exp.difficulty}</span>
        </div>
      ))}
    </div>
  );
}
```

## Vanilla JavaScript Example

```javascript
// Fetch and display latest experiences
async function loadExploreExperiences() {
  try {
    const response = await fetch('/api/posts/experiences/latest');
    const data = await response.json();
    
    if (data.success) {
      displayExperiences(data.experiences);
    }
  } catch (error) {
    console.error('Error loading experiences:', error);
  }
}

function displayExperiences(experiences) {
  const container = document.getElementById('explore-experiences');
  
  container.innerHTML = experiences.map(exp => `
    <div class="experience-card">
      <img src="${exp.photos[0]?.url}" alt="${exp.title}">
      <h3>${exp.title}</h3>
      <p>${exp.location?.city}, ${exp.location?.country}</p>
      <div class="price">₹${exp.price?.perPerson}</div>
      <div class="difficulty">${exp.difficulty}</div>
    </div>
  `).join('');
}

// Call on page load
loadExploreExperiences();
```

## Need Time-Based Filtering?

If you need experiences from a specific time period (e.g., last 30 days), use the `/recent` endpoint instead:

```javascript
// Get experiences from last 30 days
fetch('/api/posts/experiences/recent?days=30&limit=12')
```

## Full Documentation

For complete API documentation, see:
- [EXPERIENCES_API_DOCUMENTATION.md](./EXPERIENCES_API_DOCUMENTATION.md)

---

**Start building your explore page! 🎉**
