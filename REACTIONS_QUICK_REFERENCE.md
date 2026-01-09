# Post Reactions - Quick Reference Guide

## 🚀 Quick Start

### Add a Reaction
```javascript
PUT /posts/:postId/react
Body: { "emoji": "🔥" }
Headers: Authorization: Bearer <token>
```

### Get Reaction Statistics
```javascript
GET /posts/:postId/reactions
Headers: Authorization: Bearer <token> (optional)
```

---

## 📊 Common Use Cases

### 1. Display Reaction Buttons
```jsx
const emojis = ['🔥', '❤️', '👍', '😍', '😱', '👏'];

{emojis.map(emoji => (
  <button onClick={() => react(emoji)}>
    {emoji} {reactionCounts[emoji] || 0}
  </button>
))}
```

### 2. Show User's Active Reaction
```javascript
const getUserReaction = async (postId) => {
  const { data } = await axios.get(`/posts/${postId}/reactions`);
  return data.userReaction; // Returns emoji or null
};
```

### 3. Toggle Reaction (Remove if Same)
```javascript
// If user clicks same emoji, it will be removed
await axios.put(`/posts/${postId}/react`, { emoji: '🔥' }); // Added
await axios.put(`/posts/${postId}/react`, { emoji: '🔥' }); // Removed
```

---

## 📋 Response Structure

### Reaction Object
```typescript
interface Reaction {
  user: string;          // User ID
  name: string;          // User's full name
  emoji: string;         // Emoji character
  timestamp: Date;       // When reacted
  _id: string;          // Reaction ID
}
```

### Reaction Stats
```typescript
interface ReactionStats {
  [emoji: string]: {
    count: number;
    users: Array<{
      userId: string;
      name: string;
      timestamp: Date;
    }>;
  };
}
```

---

## 🎯 Key Behaviors

| Action | Behavior |
|--------|----------|
| Click emoji (no existing) | ✅ Add reaction |
| Click same emoji | ❌ Remove reaction |
| Click different emoji | 🔄 Update to new emoji |
| Fetch without auth | ℹ️ See all reactions, no user status |
| Fetch with auth | ✅ See all reactions + your current reaction |

---

## 🔐 Authentication

**Required for:**
- Adding/updating/removing reactions

**Optional for:**
- Viewing reaction statistics (but won't show user's current reaction without auth)

---

## ⚡ Quick Implementation

### Complete React Hook
```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const useReactions = (postId) => {
  const [reactions, setReactions] = useState({});
  const [userReaction, setUserReaction] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReactions = async () => {
    try {
      const { data } = await axios.get(`/posts/${postId}/reactions`);
      setReactions(data.reactionStats);
      setUserReaction(data.userReaction);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const toggleReaction = async (emoji) => {
    setLoading(true);
    try {
      const { data } = await axios.put(`/posts/${postId}/react`, { emoji });
      setReactions(data.reactionStats);
      setUserReaction(data.userReaction);
    } catch (error) {
      console.error('Toggle error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReactions();
  }, [postId]);

  return { reactions, userReaction, toggleReaction, loading };
};

export default useReactions;
```

### Usage
```jsx
function Post({ postId }) {
  const { reactions, userReaction, toggleReaction, loading } = useReactions(postId);
  
  return (
    <div>
      {['🔥', '❤️', '👍', '😍', '😱', '👏'].map(emoji => (
        <button
          key={emoji}
          onClick={() => toggleReaction(emoji)}
          disabled={loading}
          className={userReaction === emoji ? 'active' : ''}
        >
          {emoji} {reactions[emoji]?.count || 0}
        </button>
      ))}
    </div>
  );
}
```

---

## 🎨 Styling Tips

### Highlight Active Reaction
```css
.reaction-btn {
  padding: 8px 12px;
  border: 2px solid transparent;
  border-radius: 20px;
  cursor: pointer;
}

.reaction-btn.active {
  border-color: #f59e0b;
  background-color: #fef3c7;
}

.reaction-btn:hover {
  background-color: #f3f4f6;
}
```

---

## 🐛 Common Issues

### Issue: Reaction not updating
**Solution:** Ensure JWT token is valid and included in headers

### Issue: Emoji not displaying
**Solution:** Use UTF-8 encoding and ensure font supports emoji

### Issue: Count seems wrong
**Solution:** Fetch latest reactions after toggling

### Issue: Unauthorized error
**Solution:** User must be logged in to react

---

## 📈 Analytics Ideas

```javascript
// Track most popular reactions
const getMostPopular = (reactionStats) => {
  return Object.entries(reactionStats)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 3);
};

// Get reaction diversity
const getDiversity = (reactionStats) => {
  return Object.keys(reactionStats).length;
};

// Get total engagement
const getTotalEngagement = (reactionStats) => {
  return Object.values(reactionStats)
    .reduce((sum, stat) => sum + stat.count, 0);
};
```

---

## 🔗 Related Endpoints

- `GET /posts` - List all posts (includes reactions)
- `GET /posts/:id` - Get single post (includes reactions)
- `POST /posts` - Create post (reactions start empty)
- `DELETE /posts/:id` - Delete post (removes all reactions)

---

## 💡 Best Practices

1. ✅ Debounce rapid clicks (300ms)
2. ✅ Show loading state during API calls
3. ✅ Update UI optimistically
4. ✅ Handle errors gracefully
5. ✅ Cache reaction data
6. ✅ Refresh on window focus
7. ✅ Show tooltip with user names on hover

---

## 📞 Quick Support

- Full Docs: [REACTIONS_API_DOCUMENTATION.md](./REACTIONS_API_DOCUMENTATION.md)
- API Docs: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Posts API: [POSTS_API_DOCUMENTATION.md](./POSTS_API_DOCUMENTATION.md)
