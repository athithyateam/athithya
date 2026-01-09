# 📚 Complete API Overview - Experiences & Services

## Quick Navigation

- [Experiences API](#experiences-api) - Share travel stories
- [Services API](#services-api) - Offer travel services
- [Comparison](#comparison)
- [Frontend Integration](#frontend-integration)

---

## 🌟 Experiences API

### Purpose
Allow **all users** (guests and hosts) to share their travel experiences, stories, and adventures.

### Key Features
- ✅ Open to all users (guests & hosts)
- ✅ Share travel stories with photos and videos
- ✅ Automatic `postType: "experience"`
- ✅ Rich filtering and search

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/posts/experiences` | Create experience | ✅ All Users |
| GET | `/api/posts/experiences` | Get all experiences | ❌ Public |
| GET | `/api/posts/experiences/:id` | Get single experience | ❌ Public |
| GET | `/api/posts/experiences/featured/list` | Get featured | ❌ Public |
| GET | `/api/posts/experiences/my/list` | Get my experiences | ✅ Auth |
| GET | `/api/posts/experiences/user/:userId` | Get user's experiences | ❌ Public |
| PUT | `/api/posts/experiences/:id` | Update experience | ✅ Owner |
| DELETE | `/api/posts/experiences/:id` | Delete experience | ✅ Owner |

### Quick Example
```javascript
import { createExperience, listExperiences } from "./api/experiences";

// Create experience
const formData = new FormData();
formData.append("title", "Solo Trek to Kedarkantha");
formData.append("description", "My amazing journey...");
formData.append("city", "Sankri");
formData.append("photos", photoFile);

await createExperience(formData, { token });

// List experiences
const experiences = await listExperiences({ 
  state: "Uttarakhand",
  maxPrice: 25000 
});
```

### Documentation
- **Full Docs**: [EXPERIENCES_API_DOCUMENTATION.md](./EXPERIENCES_API_DOCUMENTATION.md)
- **Quick Ref**: [EXPERIENCES_API_QUICK_REFERENCE.md](./EXPERIENCES_API_QUICK_REFERENCE.md)
- **Frontend**: `src/api/experiences.js`

---

## 🛎️ Services API

### Purpose
Allow **hosts only** to offer travel-related services (guides, transportation, equipment, etc.).

### Key Features
- ✅ Host-only creation (automatic verification)
- ✅ Professional service listings
- ✅ Automatic `postType: "service"`
- ✅ Rich filtering and categorization

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/posts/services` | Create service | ✅ Host Only |
| GET | `/api/posts/services` | Get all services | ❌ Public |
| GET | `/api/posts/services/:id` | Get single service | ❌ Public |
| GET | `/api/posts/services/featured/list` | Get featured | ❌ Public |
| GET | `/api/posts/services/my/list` | Get my services | ✅ Host Only |
| GET | `/api/posts/services/host/:userId` | Get host's services | ❌ Public |
| PUT | `/api/posts/services/:id` | Update service | ✅ Owner |
| DELETE | `/api/posts/services/:id` | Delete service | ✅ Owner |

### Quick Example
```javascript
import { createService, listServices } from "./api/services";

// Create service (host only)
const formData = new FormData();
formData.append("title", "Professional Guide Service");
formData.append("description", "Experienced mountain guide...");
formData.append("city", "Manali");
formData.append("pricePerPerson", "5000");
formData.append("period", "per day");
formData.append("categories", JSON.stringify(["Guide", "Adventure"]));
formData.append("photos", photoFile);

await createService(formData, { token });

// List services
const services = await listServices({ 
  state: "Himachal Pradesh",
  categories: "Guide" 
});
```

### Documentation
- **Full Docs**: [SERVICES_API_DOCUMENTATION.md](./SERVICES_API_DOCUMENTATION.md)
- **Quick Ref**: [SERVICES_API_QUICK_REFERENCE.md](./SERVICES_API_QUICK_REFERENCE.md)
- **Frontend**: `src/api/services.js`

---

## 🔄 Comparison

### Experiences vs Services

| Feature | Experiences | Services |
|---------|-------------|----------|
| **Who can create** | All users (guests & hosts) | Hosts only |
| **Purpose** | Share travel stories | Offer professional services |
| **postType** | Automatic: `"experience"` | Automatic: `"service"` |
| **Typical content** | Travel stories, adventures | Guide services, rentals, transportation |
| **Media support** | ✅ 10 photos + 5 videos | ✅ 10 photos + 5 videos |
| **Filtering** | ✅ Location, price, difficulty | ✅ Location, price, categories |
| **Featured option** | ✅ Yes | ✅ Yes |

### When to Use Each

**Use Experiences API when:**
- User wants to share a travel story
- Documenting a journey or adventure
- Sharing tips and recommendations
- Creating travel content

**Use Services API when:**
- Host wants to offer a professional service
- Listing guide services, transportation, equipment
- Creating a business offering
- Providing paid services to travelers

---

## 🎨 Frontend Integration

### Installation

All API modules are ready to use in `src/api/`:

```javascript
// Import what you need
import { 
  createExperience, 
  listExperiences, 
  getExperience 
} from "./api/experiences";

import { 
  createService, 
  listServices, 
  getService 
} from "./api/services";
```

### Complete Example: Travel Platform

```javascript
import { listExperiences, getFeaturedExperiences } from "./api/experiences";
import { listServices, getFeaturedServices } from "./api/services";

// Homepage: Show featured content
async function loadHomepage() {
  try {
    // Get featured experiences and services
    const [experiences, services] = await Promise.all([
      getFeaturedExperiences({ limit: 6 }),
      getFeaturedServices({ limit: 6 })
    ]);
    
    displayFeaturedExperiences(experiences.experiences);
    displayFeaturedServices(services.services);
  } catch (error) {
    console.error("Failed to load homepage:", error);
  }
}

// Search page: Filter by location
async function searchByLocation(state) {
  try {
    const [experiences, services] = await Promise.all([
      listExperiences({ 
        state, 
        status: "active",
        limit: 20 
      }),
      listServices({ 
        state, 
        status: "active",
        limit: 20 
      })
    ]);
    
    displaySearchResults({
      experiences: experiences.experiences,
      services: services.services
    });
  } catch (error) {
    console.error("Search failed:", error);
  }
}

// Profile page: User's content
async function loadUserProfile(userId, token) {
  try {
    // Check if current user
    const isCurrentUser = userId === getCurrentUserId();
    
    if (isCurrentUser) {
      // Load user's own content
      const { getMyExperiences } = await import("./api/experiences");
      const { getMyServices } = await import("./api/services");
      
      const [experiences, services] = await Promise.all([
        getMyExperiences({ token }),
        getMyServices({ token })
      ]);
      
      displayUserContent({ 
        experiences: experiences.experiences,
        services: services.services,
        editable: true
      });
    } else {
      // Load other user's public content
      const { getUserExperiences } = await import("./api/experiences");
      const { getHostServices } = await import("./api/services");
      
      const [experiences, services] = await Promise.all([
        getUserExperiences(userId),
        getHostServices(userId)
      ]);
      
      displayUserContent({ 
        experiences: experiences.experiences,
        services: services.services,
        editable: false
      });
    }
  } catch (error) {
    console.error("Failed to load profile:", error);
  }
}
```

### Error Handling

All API functions return consistent error objects:

```javascript
try {
  const result = await createExperience(formData, { token });
  console.log("Success:", result);
} catch (error) {
  // Normalized error object
  console.error("Error:", error.message);
  console.error("Status:", error.status);
  
  // Handle specific errors
  if (error.status === 401) {
    // Redirect to login
  } else if (error.status === 403) {
    // Show permission error
  } else {
    // Show generic error
  }
}
```

---

## 📊 API Architecture

### Backend Structure

```
athithya-backend-main/
├── routes/
│   └── posts.js                    # All post routes
│       ├── General endpoints       # /api/posts
│       ├── Experience endpoints    # /api/posts/experiences
│       ├── Service endpoints       # /api/posts/services
│       └── Trek endpoints          # /api/posts/treks
├── EXPERIENCES_API_DOCUMENTATION.md
├── EXPERIENCES_API_QUICK_REFERENCE.md
├── SERVICES_API_DOCUMENTATION.md
└── SERVICES_API_QUICK_REFERENCE.md
```

### Frontend Structure

```
frontend-api-main/
└── src/
    └── api/
        ├── allApi.js               # All endpoint URLs
        ├── experiences.js          # Experience API functions
        ├── services.js             # Service API functions
        └── posts.js                # General posts functions
```

---

## 🚀 Getting Started

### For Developers

1. **Backend** - Routes are already implemented!
2. **Frontend** - Import the API modules:
   ```javascript
   import { createExperience } from "./api/experiences";
   import { createService } from "./api/services";
   ```
3. **Use the APIs** - Follow the examples above

### For Users

**Travelers (Guests):**
- ✅ Share your travel experiences
- ✅ View and search all content
- ❌ Cannot create services

**Hosts:**
- ✅ Share travel experiences
- ✅ Create and manage services
- ✅ Offer professional services

---

## 📞 Support & Resources

### Documentation
- **Experiences**: [Full Docs](./EXPERIENCES_API_DOCUMENTATION.md) | [Quick Ref](./EXPERIENCES_API_QUICK_REFERENCE.md)
- **Services**: [Full Docs](./SERVICES_API_DOCUMENTATION.md) | [Quick Ref](./SERVICES_API_QUICK_REFERENCE.md)
- **Posts API**: [POSTS_API_DOCUMENTATION.md](./POSTS_API_DOCUMENTATION.md)

### Related APIs
- [Itineraries API](./ITINERARY_API_DOCUMENTATION.md) - Trip planning
- [Reviews API](./REVIEWS_API_DOCUMENTATION.md) - Rate experiences
- [Users API](./API_DOCUMENTATION.md) - Authentication

---

## ✨ Summary

**Two powerful, dedicated APIs** for different needs:

1. **Experiences API** 🌟
   - Share travel stories
   - Open to all users
   - Inspire other travelers

2. **Services API** 🛎️
   - Offer professional services
   - Host-only access
   - Build travel business

Both with:
- ✅ Automatic postType setting
- ✅ Rich media support
- ✅ Advanced filtering
- ✅ Clean, semantic code
- ✅ Production-ready

**Start building amazing travel experiences today! 🎉**
