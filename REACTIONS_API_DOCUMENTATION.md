# Post Reactions API Documentation

## Overview

The Post Reactions API allows authenticated users to react to posts with emoji reactions. Users can add, update, or remove their reactions on any post. Each user can have only one active reaction per post, but they can change it or remove it at any time.

## Features

- ✅ Add emoji reactions to posts
- ✅ Update existing reactions (change emoji)
- ✅ Remove reactions (toggle off)
- ✅ Track reaction statistics per post
- ✅ View all users who reacted with specific emojis
- ✅ Get user's own reaction status
- ✅ Real-time reaction counts
- ✅ Multiple emoji types supported

## Supported Emoji Reactions

The following emojis are commonly used on the Athithya platform:
- 🔥 Fire
- ❤️ Heart
- 👍 Thumbs Up
- 😍 Heart Eyes
- 😱 Surprised Face
- 👏 Clapping Hands

*Note: Any valid emoji can be used as a reaction.*

---

## API Endpoints

### 1. Toggle Reaction (Add/Update/Remove)

Add a reaction to a post, update an existing reaction, or remove a reaction by toggling the same emoji.

**Endpoint:** `PUT /posts/:id/react`

**Authentication:** Required (JWT Token)

**Method:** `PUT`

**URL Parameters:**
- `id` (string, required) - The post ID

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "emoji": "🔥"
}
```

**Request Body Parameters:**
| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| emoji     | string | Yes      | The emoji to react with (e.g., "🔥") |

**Response (Success - Added):**
```json
{
  "success": true,
  "message": "Reaction added",
  "action": "added",
  "reactions": [
    {
      "user": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "emoji": "🔥",
      "timestamp": "2026-01-09T10:30:00.000Z",
      "_id": "507f1f77bcf86cd799439012"
    }
  ],
  "reactionStats": {
    "🔥": 1,
    "❤️": 3,
    "👍": 2
  },
  "totalReactions": 6,
  "userReaction": "🔥"
}
```

**Response (Success - Removed):**
```json
{
  "success": true,
  "message": "Reaction removed",
  "action": "removed",
  "reactions": [
    {
      "user": "507f1f77bcf86cd799439013",
      "name": "Jane Smith",
      "emoji": "❤️",
      "timestamp": "2026-01-09T09:15:00.000Z",
      "_id": "507f1f77bcf86cd799439014"
    }
  ],
  "reactionStats": {
    "❤️": 3,
    "👍": 2
  },
  "totalReactions": 5,
  "userReaction": null
}
```

**Response (Success - Updated):**
```json
{
  "success": true,
  "message": "Reaction updated",
  "action": "updated",
  "reactions": [
    {
      "user": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "emoji": "❤️",
      "timestamp": "2026-01-09T10:35:00.000Z",
      "_id": "507f1f77bcf86cd799439012"
    }
  ],
  "reactionStats": {
    "❤️": 4,
    "👍": 2
  },
  "totalReactions": 6,
  "userReaction": "❤️"
}
```

**Response Fields:**
| Field          | Type   | Description                                           |
|----------------|--------|-------------------------------------------------------|
| success        | boolean| Indicates if the request was successful              |
| message        | string | Descriptive message about the action                  |
| action         | string | The action performed: "added", "updated", or "removed"|
| reactions      | array  | Complete array of all reactions on the post          |
| reactionStats  | object | Count of each emoji type                             |
| totalReactions | number | Total number of reactions on the post                |
| userReaction   | string | The current user's active reaction (null if removed) |

**Error Responses:**

**400 Bad Request - Invalid Emoji:**
```json
{
  "success": false,
  "message": "Valid emoji is required"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Post not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Error updating reaction",
  "error": "Detailed error message"
}
```

---

### 2. Get Reaction Statistics

Get detailed reaction statistics for a specific post, including counts, user lists, and the current user's reaction.

**Endpoint:** `GET /posts/:id/reactions`

**Authentication:** Optional (shows user's reaction if authenticated)

**Method:** `GET`

**URL Parameters:**
- `id` (string, required) - The post ID

**Request Headers:**
```
Authorization: Bearer <jwt_token> (optional)
```

**Response (Success):**
```json
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
      "users": [
        {
          "userId": "507f1f77bcf86cd799439013",
          "name": "Alice Johnson",
          "timestamp": "2026-01-09T08:00:00.000Z"
        }
      ]
    },
    "👍": {
      "count": 2,
      "users": [
        {
          "userId": "507f1f77bcf86cd799439014",
          "name": "Bob Wilson",
          "timestamp": "2026-01-09T07:45:00.000Z"
        }
      ]
    }
  },
  "userReaction": "🔥",
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

**Response Fields:**
| Field          | Type    | Description                                                      |
|----------------|---------|------------------------------------------------------------------|
| success        | boolean | Indicates if the request was successful                         |
| totalReactions | number  | Total number of reactions on the post                           |
| reactionStats  | object  | Detailed statistics for each emoji type                         |
| userReaction   | string  | Current user's reaction emoji (null if not reacted/not logged in)|
| allReactions   | array   | Complete array of all reactions with full details               |

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Post not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Error fetching reactions",
  "error": "Detailed error message"
}
```

---

## Usage Examples

### JavaScript/Fetch Example

#### Add/Toggle Reaction
```javascript
// Add or toggle a reaction
const addReaction = async (postId, emoji) => {
  try {
    const response = await fetch(`https://api.athithya.in/posts/${postId}/react`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ emoji })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`Reaction ${data.action}:`, data.userReaction);
      console.log('Total reactions:', data.totalReactions);
      console.log('Reaction stats:', data.reactionStats);
    }
    
    return data;
  } catch (error) {
    console.error('Error adding reaction:', error);
  }
};

// Usage
addReaction('507f1f77bcf86cd799439011', '🔥');
```

#### Get Reaction Statistics
```javascript
const getReactions = async (postId) => {
  try {
    const response = await fetch(`https://api.athithya.in/posts/${postId}/reactions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // optional
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Total reactions:', data.totalReactions);
      console.log('Stats:', data.reactionStats);
      console.log('Your reaction:', data.userReaction);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching reactions:', error);
  }
};

// Usage
getReactions('507f1f77bcf86cd799439011');
```

### React Example Component

```jsx
import React, { useState, useEffect } from 'react';

const ReactionComponent = ({ postId }) => {
  const [reactions, setReactions] = useState({});
  const [userReaction, setUserReaction] = useState(null);
  const [totalReactions, setTotalReactions] = useState(0);

  const emojis = ['🔥', '❤️', '👍', '😍', '😱', '👏'];

  useEffect(() => {
    fetchReactions();
  }, [postId]);

  const fetchReactions = async () => {
    try {
      const response = await fetch(`/posts/${postId}/reactions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setReactions(data.reactionStats);
        setUserReaction(data.userReaction);
        setTotalReactions(data.totalReactions);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleReaction = async (emoji) => {
    try {
      const response = await fetch(`/posts/${postId}/react`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ emoji })
      });

      const data = await response.json();
      
      if (data.success) {
        setReactions(data.reactionStats);
        setUserReaction(data.userReaction);
        setTotalReactions(data.totalReactions);
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  return (
    <div className="reaction-container">
      <div className="reactions-bar">
        {emojis.map(emoji => (
          <button
            key={emoji}
            className={`reaction-btn ${userReaction === emoji ? 'active' : ''}`}
            onClick={() => handleReaction(emoji)}
          >
            <span className="emoji">{emoji}</span>
            {reactions[emoji] && (
              <span className="count">{reactions[emoji].count}</span>
            )}
          </button>
        ))}
      </div>
      {totalReactions > 0 && (
        <div className="total-reactions">
          {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
        </div>
      )}
    </div>
  );
};

export default ReactionComponent;
```

### Axios Example

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.athithya.in',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authentication token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Toggle reaction
export const toggleReaction = async (postId, emoji) => {
  try {
    const response = await api.put(`/posts/${postId}/react`, { emoji });
    return response.data;
  } catch (error) {
    console.error('Error toggling reaction:', error);
    throw error;
  }
};

// Get reactions
export const getReactions = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}/reactions`);
    return response.data;
  } catch (error) {
    console.error('Error getting reactions:', error);
    throw error;
  }
};
```

---

## Database Schema

The reactions are stored in the Post model with the following structure:

```javascript
reactions: [{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  name: {
    type: String
  },
  emoji: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}]
```

### Example Document Structure

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Amazing Trek to Himalayas",
  "description": "Join us for an unforgettable journey...",
  "reactions": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "user": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "emoji": "🔥",
      "timestamp": "2026-01-09T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "user": "507f1f77bcf86cd799439015",
      "name": "Jane Smith",
      "emoji": "❤️",
      "timestamp": "2026-01-09T09:15:00.000Z"
    }
  ],
  "createdAt": "2026-01-08T12:00:00.000Z",
  "updatedAt": "2026-01-09T10:30:00.000Z"
}
```

---

## Business Logic

### Reaction Rules

1. **One Reaction Per User**: Each user can have only one active reaction per post
2. **Toggle Behavior**: Clicking the same emoji again removes the reaction
3. **Change Reaction**: Clicking a different emoji updates the existing reaction
4. **Authentication Required**: Users must be logged in to react
5. **Real-time Updates**: Reaction counts update immediately after each action

### Reaction Flow

```
User clicks emoji
    ↓
Check authentication
    ↓
Check if user already reacted
    ↓
├─ No existing reaction → Add new reaction
├─ Same emoji → Remove reaction (toggle off)
└─ Different emoji → Update to new emoji
    ↓
Save to database
    ↓
Calculate statistics
    ↓
Return updated data
```

---

## Best Practices

### Frontend Implementation

1. **Optimistic Updates**: Update UI immediately before API call for better UX
2. **Error Handling**: Show appropriate error messages if reaction fails
3. **Rate Limiting**: Prevent spam by debouncing reaction clicks
4. **Visual Feedback**: Highlight user's current reaction
5. **Loading States**: Show loading indicators during API calls

### Performance Optimization

1. **Caching**: Cache reaction data on the frontend
2. **Batch Updates**: If showing multiple posts, fetch reactions in parallel
3. **Lazy Loading**: Load reaction details only when needed
4. **Debouncing**: Prevent multiple rapid clicks

### Security Considerations

1. **Authentication**: Always verify JWT token before allowing reactions
2. **Validation**: Validate emoji input to prevent malicious data
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Authorization**: Ensure only valid users can react

---

## Error Handling

### Common Errors and Solutions

| Error Code | Error Message                  | Solution                                  |
|------------|--------------------------------|-------------------------------------------|
| 400        | Valid emoji is required        | Ensure emoji string is provided in body  |
| 401        | Authentication required        | Provide valid JWT token in header        |
| 404        | Post not found                 | Verify post ID exists in database        |
| 500        | Error updating reaction        | Check server logs for detailed error     |

---

## Testing

### Test Cases

#### 1. Add Reaction
```bash
curl -X PUT https://api.athithya.in/posts/507f1f77bcf86cd799439011/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"emoji": "🔥"}'
```

#### 2. Remove Reaction (Toggle)
```bash
# Click same emoji again
curl -X PUT https://api.athithya.in/posts/507f1f77bcf86cd799439011/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"emoji": "🔥"}'
```

#### 3. Change Reaction
```bash
# Click different emoji
curl -X PUT https://api.athithya.in/posts/507f1f77bcf86cd799439011/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"emoji": "❤️"}'
```

#### 4. Get Reactions
```bash
curl -X GET https://api.athithya.in/posts/507f1f77bcf86cd799439011/reactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Integration with Other Features

### Post Fetching

When fetching posts, reactions are automatically included:

```javascript
// GET /posts/:id
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Amazing Trek",
  "reactions": [
    {
      "user": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "emoji": "🔥",
      "timestamp": "2026-01-09T10:30:00.000Z"
    }
  ],
  // ... other post fields
}
```

### Notifications (Future Enhancement)

Consider adding notifications when:
- Someone reacts to your post
- Your post reaches certain reaction milestones (e.g., 10, 50, 100 reactions)

---

## FAQ

**Q: Can I react to my own post?**  
A: Yes, users can react to their own posts.

**Q: What happens if I click the same emoji twice?**  
A: The reaction will be removed (toggle behavior).

**Q: Can I see who reacted with each emoji?**  
A: Yes, use the GET `/posts/:id/reactions` endpoint to see detailed user lists.

**Q: Is there a limit to the number of reactions on a post?**  
A: No, there's no limit. Each unique user can add one reaction.

**Q: Can I react without being logged in?**  
A: No, authentication is required to add reactions.

**Q: Which emojis are supported?**  
A: Any valid emoji can be used. The platform commonly uses: 🔥, ❤️, 👍, 😍, 😱, 👏

---

## Changelog

### Version 1.0 (January 2026)
- Initial release of reactions API
- Support for emoji reactions on posts
- Toggle functionality (add/remove/update)
- Reaction statistics endpoint
- User reaction tracking

---

## Support

For API support or questions:
- Email: support@athithya.in
- Documentation: https://docs.athithya.in
- GitHub Issues: https://github.com/athithyateam/athithya/issues

---

## Related Documentation

- [Posts API Documentation](./POSTS_API_DOCUMENTATION.md)
- [User Profile API Documentation](./USER_PROFILE_API_DOCUMENTATION.md)
- [Reviews API Documentation](./REVIEWS_API_DOCUMENTATION.md)
- [Authentication Guide](./API_DOCUMENTATION.md)
