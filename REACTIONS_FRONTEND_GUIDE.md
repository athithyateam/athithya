# Post Reactions - Frontend Developer Guide

## 📋 Quick Overview

The Athithya platform supports emoji reactions on **both Momentos (Posts) and Plans (Itineraries)**. Users can react with emojis, change their reactions, or remove them entirely. Each user can have only one active reaction per post/plan.

**Works For:**
- 📖 **Momentos** - Travel experiences, treks, and service posts
- 🗺️ **Plans** - Trip itineraries and travel plans

**Supported Emojis:** 🔥 ❤️ 👍 😍 😱 👏 (any emoji can be used)

---

## 🚀 API Endpoints

### Base URLs
```
Posts/Momentos: https://api.athithya.in/api/posts
Plans/Itineraries: https://api.athithya.in/api/itineraries
```

**Note:** The reaction endpoints work identically for both posts and itineraries. Simply use the appropriate base URL and ID.

### Authentication
All reaction modifications require JWT authentication. Include in headers:
```javascript
Authorization: Bearer <your_jwt_token>
```

---

## 1. Toggle Reaction

Add, update, or remove a reaction on a momento or plan.

**Endpoints:** 
- Momentos: `PUT /posts/:postId/react`
- Plans: `PUT /itineraries/:itineraryId/react`

**Headers:**
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Request Body:**
```javascript
{
  "emoji": "🔥"
}
```

**Behavior:**
- No existing reaction → **Adds** the reaction
- Same emoji clicked → **Removes** the reaction
- Different emoji clicked → **Updates** to new emoji

**Success Response (200):**
```javascript
{
  "success": true,
  "message": "Reaction added",  // or "updated" or "removed"
  "action": "added",             // or "updated" or "removed"
  "reactions": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "user": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "emoji": "🔥",
      "timestamp": "2026-01-09T10:30:00.000Z"
    }
  ],
  "reactionStats": {
    "🔥": 5,
    "❤️": 12,
    "👍": 3
  },
  "totalReactions": 20,
  "userReaction": "🔥"  // Current user's reaction, null if removed
}
```

**Error Responses:**

**400 Bad Request** - Invalid or missing emoji:
```javascript
{
  "success": false,
  "message": "Valid emoji is required"
}
```

**401 Unauthorized** - Missing or invalid token:
```javascript
{
  "success": false,
  "message": "Authentication required"
}
```/Plan doesn't exist:
```javascript
{
  "success": false,
  "message": "Post not found"  // or "Itinerary not found"
}
```

---

## 2. Get Reaction Statistics

Get all reactions and statistics for a momento or plan.

**Endpoints:**
- Momentos: `GET /posts/:postId/reactions`
- Plans: `GET /itineraries/:itinerarys for a post.

**Endpoint:** `GET /posts/:postId/reactions`

**Authentication:** Optional (but recommended to see user's own reaction)

**Success Response (200):**
```javascript
{
  "success": true,
  "totalReactions": 15,
  "reactionStats": {
    "🔥": {
      "count": 5,
      "users": [
        {
          "userId": "507f1f77bcf86cd799439011",
          "name": "John Doe",
          "timestamp": "2026-01-09T10:30:00.000Z"
        },
        {
          "userId": "507f1f77bcf86cd799439012",
          "name": "Jane Smith",
          "timestamp": "2026-01-09T09:15:00.000Z"
        }
      ]
    },
    "❤️": {
      "count": 8,
      "users": [...]
    },
    "👍": {
      "count": 2,
      "users": [...]
    }
  },
  "userReaction": "🔥",  // null if user hasn't reacted or not authenticated
  "allReactions": [
    {
      "user": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "emoji": "🔥",
      "timestamp": "2026-01-09T10:30:00.000Z",
      "_id": "507f1f77bcf86cd799439015"
    }
  ]
}
```

---

## 💻 Frontend Implementation

### Complete React Component with Hook

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
contentId, type = 'post') => {
  // type: 'post' for Momentos, 'itinerary' for Plans
  const [reactions, setReactions] = useState({});
  const [userReaction, setUserReaction] = useState(null);
  const [totalReactions, setTotalReactions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = type === 'itinerary' 
    ? 'https://api.athithya.in/api/itineraries'
    : 'https://api.athithya.in/api/posts';
  const token = localStorage.getItem('authToken'); // Adjust based on your auth

  // Fetch reactions on mount
  useEffect(() => {
    fetchReactions();
  }, [contentId, type() => {
    fetchReactions();
  }, [postId]);
conten
  const fetchReactions = async () => {
    try {
      const response = await axios.get(`${API_BASE}/${postId}/reactions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.success) {
        setReactions(response.data.reactionStats);
        setUserReaction(response.data.userReaction);
        setTotalReactions(response.data.totalReactions);
      }
    } catch (err) {
      console.error('Error fetching reactions:', err);
      setError('Failed to load reactions');
    }
  };

  const toggleReaction = async (emoji) => {
    if (!token) {
      setError('Please login to react');
      return;
    }

    // Optimistic update
    const previousReaction = userReaction;
    const previousReactions = { ...reactions };
    const previousTotal = totalReactions;

    try {
      setLoading(true);
      setError(null);

      // Update UI optimistically
      if (userReaction === emoji) {
        // Removing reaction
        setUserReaction(null);
        setTotalReactions(prev => prev - 1);
        setReactions(prev => ({
          ...prev,
          [emoji]: { ...prev[emoji], count: (prev[emoji]?.count || 0) - 1 }
        }));
      } else if (userReaction) {
        // Changing reaction
        setUserReaction(emoji);
        setReactions(prev => ({
          ...prev,
          [previousReaction]: {
            ...prev[previousReaction],
            count: (prev[previousReaction]?.count || 0) - 1
          },
          [emoji]: { ...prev[emoji], count: (prev[emoji]?.count || 0) + 1 }
        }));
      } else {
        // Adding new reaction
        setUserReaction(emoji);
        setTotalReactions(prev => prev + 1);
        setReactions(prev => ({
          ...prev,
          [emoji]: { ...prev[emoji], count: (prev[emoji]?.count || 0) + 1 }
        }));
      }
conten
      // Make API call
      const response = await axios.put(
        `${API_BASE}/${postId}/react`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update with server data
        setReactions(response.data.reactionStats);
        setUserReaction(response.data.userReaction);
        setTotalReactions(response.data.totalReactions);
      }
    } catch (err) {
      // Revert optimistic update on error
      setUserReaction(previousReaction);
      setReactions(previousReactions);
      setTotalReactions(previousTotal);
      
      if (err.response?.status === 401) {
        setError('Please login to react');
      } else {
        setError('Failed to update reaction. Please try again.');
      }
      console.error('Error toggling reaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return { 
    reactions, 
    userReaction, 
    totalReactions, 
    loading, 
    error,
    toggleReaction,
    refreshReactions: fetchReactions
  };
};
, type = 'post' }) => {
  // type can be 'post' for Momentos or 'itinerary' for Plans
  const { 
    reactions, 
    userReaction, 
    totalReactions, 
    loading, 
    error, 
    toggleReaction 
  } = useReactions(postId, type
    toggleReaction 
  } = useReactions(postId);

  const emojis = ['🔥', '❤️', '👍', '😍', '😱', '👏'];

  return (
    <div className="post-reactions">
      <div className="reaction-buttons">
        {emojis.map(emoji => {
          const count = reactions[emoji]?.count || 0;
          const isActive = userReaction === emoji;
          
          return (
            <button
              key={emoji}
              onClick={() => toggleReaction(emoji)}
              disabled={loading}
              className={`reaction-btn ${isActive ? 'active' : ''} ${loading ? 'loading' : ''}`}
              title={`${emoji} ${count}`}
            >
              <span className="emoji">{emoji}</span>
              {count > 0 && <span className="count">{count}</span>}
            </button>
          );
        })}
      </div>
      
      {totalReactions > 0 && (
        <div className="total-reactions">
          {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );

// Usage Examples:
// For Momentos (Posts):
<PostReactions postId="507f1f77bcf86cd799439011" type="post" />

// For Plans (Itineraries):
<PostReactions postId="507f1f77bcf86cd799439012" type="itinerary" />
};

export default PostReactions;
```

---

### CSS Styling

```css
/* Reaction Container */
.post-reactions {
  margin: 16px 0;
}

.reaction-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Reaction Button */
.reaction-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.reaction-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: scale(1.05);
}

/* Active state (user has reacted) */
.reaction-btn.active {
  border-color: #f59e0b;
  background: #fef3c7;
  font-weight: 600;
}

/* Loading state */
.reaction-btn.loading {
  opacity: 0.6;
  cursor: wait;
}

.reaction-btn:disabled {
  cursor: not-allowed;
}

/* Emoji styling */
.reaction-btn .emoji {
  font-size: 20px;
  line-height: 1;
}

/* Count badge */
.reaction-btn .count {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.reaction-btn.active .count {
  color: #f59e0b;
}

/* Total reactions */
.total-reactions {
  margin-top: 8px;
  font-size: 13px;
  color: #6b7280;
}

/* Error message */
.error-message {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .reaction-btn {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .reaction-btn .emoji {
    font-size: 18px;
  }
}
```

---contentId, authToken, type = 'post') {
    // type: 'post' for Momentos, 'itinerary' for Plans
    this.contentId = contentId;
    this.authToken = authToken;
    this.apiBase = type === 'itinerary'
      ? 'https://api.athithya.in/api/itineraries'
      :
```javascript
// reactions.js
class ReactionManager {
  constructor(postId, authToken) {
    this.postId = postId;
    this.authToken = authToken;
    this.apiBase = 'https://api.athithya.in/api/posts';
    this.reactions = {};
    this.userReaction = null;conten
    this.totalReactions = 0;
  }

  async fetchReactions() {
    try {
      const headers = this.authToken 
        ? { 'Authorization': `Bearer ${this.authToken}` }
        : {};
      
      const response = await fetch(`${this.apiBase}/${this.postId}/reactions`, {
        headers
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.reactions = data.reactionStats;
        this.userReaction = data.userReaction;
        this.totalReactions = data.totalReactions;
        return data;
      }
      throw new Error(data.message || 'Failed to fetch reactions');
    } catch (error) {
      console.error('Fetch reactions error:', error);
      throw error;conten
    }
  }

  async toggleReaction(emoji) {
    if (!this.authToken) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${this.apiBase}/${this.postId}/react`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ emoji })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to toggle reaction');
      }

      if (data.success) {
        this.reactions = data.reactionStats;
        this.userReaction = data.userReaction;
        this.totalReactions = data.totalReactions;
        return data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error('Toggle reaction error:', error);
      throw error;
    }
  }
s
// For Momentos (Posts):
const initPostReactions = async (postId, containerId) => {
  const authToken = localStorage.getItem('authToken');
  const manager = new ReactionManager(postId, authToken, 'post');
  
  try {
    await manager.fetchReactions();
    renderReactions(manager, containerId);
  } catch (error) {
    console.error('Error initializing reactions:', error);
  }
};

// For Plans (Itineraries):
const initItineraryReactions = async (itineraryId, containerId) => {
  const authToken = localStorage.getItem('authToken');
  const manager = new ReactionManager(itineraryId, authToken, 'itinerary'

  isUserReacted(emoji) {
    return this.userReaction === emoji;
  }
}

// Usage Example
const initReactions = async (postId, containerId) => {
  const authToken = localStorage.getItem('authToken');
  const manager = new ReactionManager(postId, authToken);
  
  try {
    await manager.fetchReactions();
    renderReactions(manager, containerId);
  } catch (error) {
    console.error('Error initializing reactions:', error);
  }
};

const renderReactions = (manager, containerId) => {
  const container = document.getElementById(containerId);
  const emojis = ['🔥', '❤️', '👍', '😍', '😱', '👏'];
  
  const html = `
    <div class="reaction-buttons">
      ${emojis.map(emoji => {
        const count = manager.getReactionCount(emoji);
        const isActive = manager.isUserReacted(emoji);
        return `
          <button 
            class="reaction-btn ${isActive ? 'active' : ''}" 
            data-emoji="${emoji}"
          >
            <span class="emoji">${emoji}</span>
            ${count > 0 ? `<span class="count">${count}</span>` : ''}
          </button>
        `;
      }).join('')}
    </div>
    ${manager.totalReactions > 0 
      ? `<div class="total-reactions">${manager.totalReactions} reactions</div>`
      : ''
    }
  `;
  
  coFor Momentos (Posts)

#### Add a Reaction
```bash
curl -X PUT https://api.athithya.in/api/posts/YOUR_POST_ID/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"emoji": "🔥"}'
```

#### Remove Reaction (click same emoji)
```bash
# Execute the same command twice to toggle off
curl -X PUT https://api.athithya.in/api/posts/YOUR_POST_ID/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"emoji": "🔥"}'
```

#### Get Reaction Statistics
```bash
# With authentication (shows your reaction)
curl https://api.athithya.in/api/posts/YOUR_POST_ID/reactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### For Plans (Itineraries)

#### Add a Reaction
```bash
curl -X PUT https://api.athithya.in/api/itineraries/YOUR_ITINERARY_ID/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"emoji": "🔥"}'
```

#### Remove Reaction
```bash
curl -X PUT https://api.athithya.in/api/itineraries/YOUR_ITINERARY_ID/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"emoji": "🔥"}'
```

#### Get Reaction Statistics
```bash
curl https://api.athithya.in/api/itineraries/YOUR_ITINERARY_ID/reactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

### Change Reaction
```bash
# First add fire
curl -X PUT https://api.athithya.in/api/posts/YOUR_POST_ID/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"emoji": "🔥"}'

# Then change to heart
curl -X PUT https://api.athithya.in/api/posts/YOUR_POST_ID/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"emoji": "❤️"}'
```

### Get Reaction Statistics
```bash
# With authentication (shows your reaction)
curl https://api.athithya.in/api/posts/YOUR_POST_ID/reactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Without authentication (public view)
curl https://api.athithya.in/api/posts/YOUR_POST_ID/reactions
```

---

## 🎯 Best Practices

### 1. Debouncing
Prevent rapid clicks from causing multiple API calls:

```javascript
import { debounce } from 'lodash'; // or implement your own

const debouncedToggle = debounce(toggleReaction, 300);
```

### 2. Optimistic Updates
Update UI immediately before API call for better UX:

```javascript
// Update UI first
setUserReaction(emoji);
setCount(prev => prev + 1);

// Then make API call
try {
  await api.toggleReaction(emoji);
} catch (error) {
  // Revert on error
  setUserReaction(previousReaction);
  setCount(previousCount);
}
```

### 3. Error Handling
Handle common errors gracefully:

```javascript
try {
  await toggleReaction(emoji);
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
    router.push('/login');
  } else if (error.response?.status === 404) {
    showError('Post not found');
  } else {
    showError('Something went wrong. Please try again.');
  }
}
```

### 4. Loading States
Show loading indicators during API calls:

```javascript
const [loading, setLoading] = useState(false);

const handleReaction = async (emoji) => {
  setLoading(true);
  try {
    await toggleReaction(emoji);
  } finally {
    setLoading(false);
  }
};
```

### 5. Caching
Cache reactions to reduce API calls:

```javascript
// Fetch on mount
useEffect(() => {
  fetchReactions();
}, [postId]);

// Refresh on window focus
useEffect(() => {
  const handleFocus = () => fetchReactions();
  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, []);
```

---

## 🐛 Common Issues & Solutions
/plan. If you see multiple, there may be a bug in the logic.

### Issue 6: Wrong Base URL
**Problem:** Getting 404 errors  
**Solution:** Ensure you're using the correct base URL:
- Momentos: `/api/posts/:id/react`
- Plans: `/api/itineraries/:id/react`
### Issue 1: Emoji Not Displaying
**Problem:** Emoji shows as box or question mark  
**Solution:** Ensure UTF-8 encoding in HTML:
```html
<meta charset="UTF-8">
```

### Issue 2: "Authentication required" Error
**Problem:** Getting 401 error when reacting  
**Solution:** Ensure JWT token is valid and included in headers:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Issue 3: Count Not Updating
**Problem:** Reaction count doesn't update after clicking  
**Solution:** Fetch latest reactions after toggle or use the returned data:
```javascript
const response = await toggleReaction(emoji);
setReactions(response.data.reactionStats);
```

### Issue 4: Multiple Reactions Added
**Problem:** User can add multiple reactions  
**Solution:** This is a backend validation. Each user can only have ONE active reaction per post. If you see multiple, there may be a bug in the logic.

### Issue 5: Slow Performance
**Problem:** Reactions feel sluggish  
**Solutions:**
- Implement optimistic updates
- Add debouncing to prevent rapid clicks
- Cache reaction data
- Use loading states

---

## 📱 Mobile Considerations

### Touch Interactions
```css
.reaction-btn {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.reaction-btn:active {
  transform: scale(0.95);
}
```

### Responsive Design
```css
@media (max-width: 640px) {
  .reaction-buttons {
    gap: 6px;
  }
  
  .reaction-btn {
    padding: 6px 10px;
    font-size: 13px;
  }
}
```

---

## 🔐 Security Notes

1. **Always validate JWT token** - Never trust client-side data
2. **Sanitize emoji input** - Backend validates, but also validate on frontend
3. **Rate limiting** - Consider implementing rate limiting on repeated reactions
4. **HTTPS only** - Always use HTTPS in production

---

## 🎨 UI/UX Recommendations

### Visual Feedback
```javascript
// Add animation on reaction
const handleReaction = async (emoji) => {
  // Visual feedback
  playReactionAnimation(emoji);
  
  // Then API call
  await toggleReaction(emoji);
};
```

### Tooltips
Show who reacted:
```jsx
<Tooltip content={`${count} people reacted with ${emoji}`}>
  <button>...</button>
</Tooltip>
```

### Accessibility
```jsx
<button
  aria-label={`React with ${emoji}`}
  aria-pressed={isActive}
  role="button"
>
  {emoji}
</button>
```

---

## 📊 TypeScript Types

```typescript
// types.ts
export interface Reaction {
  _id: string;
  user: string;
  name: string;
  emoji: string;
  timestamp: string;
}

export interface ReactionStats {
  [emoji: string]: {
    count: number;
    users: Array<{
      Determine content type (momento or plan)
- [ ] Test with a post/itinerary ID
- [ ] Handle loading and error states
- [ ] Implement optimistic updates
- [ ] Add debouncing
- [ ] Test on mobile devices
- [ ] Test both momentos and plan
}

export interface ToggleReactionResponse {
  success: boolean;
  message: string;
  action: 'added' | 'updated' | 'removed';
  reactions: Reaction[];
  reactionStats: { [emoji: string]: number };
  totalReactions: number;
  userReaction: string | null;
}

export interface GetReactionsResponse {
  success: boolean;
  totalReactions: number;
  reactionStats: ReactionStats;
  userReaction: string | null;
  allReactions: Reaction[];
}
```

---

## 🚀 Quick Start Checklist

- [ ] Get JWT authentication token
- [ ] Copy the React component code
- [ ] Add CSS styling
- [ ] Test with a post ID
- [ ] Handle loading and error states
- [ ] Implement optimistic updates
- [ ] Add debouncing
- [ ] Test on mobile devices
- [ ] Deploy to production

---

## 📞 Support

If you encounter any issues:

1. Check this documentation
2. Test with cURL to verify API works
3. Check browser console for errors
4. Verify JWT token is valid
5. Contact backend team: support@athithya.in

---

## 🎉 You're Ready!

You now have everything needed to implement post reactions. The API is live and ready for integration. Happy coding! 🚀

---

**Last Updated:** January 9, 2026  
**API Version:** 1.0  
**Athithya Platform**
