# Post Reactions - Testing Guide

## Test Environment Setup

### Prerequisites
- Backend server running on `http://localhost:3000`
- Valid JWT authentication token
- At least one post created in the database
- REST client (Postman, Thunder Client, or cURL)

### Test Data
```javascript
// Sample Post ID (replace with actual)
const POST_ID = "507f1f77bcf86cd799439011";

// Sample JWT Token (replace with actual)
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// Test Emojis
const EMOJIS = ["🔥", "❤️", "👍", "😍", "😱", "👏"];
```

---

## Manual Testing Checklist

### ✅ Test Case 1: Add First Reaction

**Objective:** User adds their first reaction to a post

**Steps:**
1. User is logged in
2. Post has no reactions from this user
3. Click on any emoji (e.g., 🔥)

**Expected Result:**
- API returns success: true
- Action: "added"
- userReaction: "🔥"
- totalReactions increases by 1
- reactionStats shows {"🔥": 1}

**cURL Command:**
```bash
curl -X PUT http://localhost:3000/api/posts/POST_ID/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"emoji": "🔥"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Reaction added",
  "action": "added",
  "reactions": [
    {
      "_id": "...",
      "user": "...",
      "name": "John Doe",
      "emoji": "🔥",
      "timestamp": "2026-01-09T10:30:00.000Z"
    }
  ],
  "reactionStats": {
    "🔥": 1
  },
  "totalReactions": 1,
  "userReaction": "🔥"
}
```

**Status:** ⬜ Pass / ⬜ Fail

---

### ✅ Test Case 2: Remove Reaction (Toggle Off)

**Objective:** User removes their existing reaction by clicking the same emoji

**Steps:**
1. User has already reacted with 🔥
2. Click on 🔥 again

**Expected Result:**
- API returns success: true
- Action: "removed"
- userReaction: null
- totalReactions decreases by 1
- reactionStats shows {"🔥": 0} or emoji removed from stats

**cURL Command:**
```bash
# Same command as adding, but executed twice
curl -X PUT http://localhost:3000/api/posts/POST_ID/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"emoji": "🔥"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Reaction removed",
  "action": "removed",
  "reactions": [],
  "reactionStats": {},
  "totalReactions": 0,
  "userReaction": null
}
```

**Status:** ⬜ Pass / ⬜ Fail

---

### ✅ Test Case 3: Change Reaction

**Objective:** User changes their reaction from one emoji to another

**Steps:**
1. User has reacted with 🔥
2. Click on ❤️

**Expected Result:**
- API returns success: true
- Action: "updated"
- userReaction: "❤️"
- reactionStats shows {"🔥": 0, "❤️": 1}

**cURL Commands:**
```bash
# First, add fire reaction
curl -X PUT http://localhost:3000/api/posts/POST_ID/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"emoji": "🔥"}'

# Then, change to heart
curl -X PUT http://localhost:3000/api/posts/POST_ID/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"emoji": "❤️"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Reaction updated",
  "action": "updated",
  "reactions": [
    {
      "_id": "...",
      "user": "...",
      "name": "John Doe",
      "emoji": "❤️",
      "timestamp": "2026-01-09T10:35:00.000Z"
    }
  ],
  "reactionStats": {
    "❤️": 1
  },
  "totalReactions": 1,
  "userReaction": "❤️"
}
```

**Status:** ⬜ Pass / ⬜ Fail

---

### ✅ Test Case 4: Get Reaction Statistics (Authenticated)

**Objective:** Logged-in user fetches reaction statistics

**Steps:**
1. User is logged in
2. Request reaction statistics for a post

**Expected Result:**
- Returns all reactions
- Shows reactionStats grouped by emoji
- Includes userReaction (user's current reaction)
- Shows user lists for each emoji

**cURL Command:**
```bash
curl http://localhost:3000/api/posts/POST_ID/reactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "totalReactions": 15,
  "reactionStats": {
    "🔥": {
      "count": 5,
      "users": [
        {
          "userId": "...",
          "name": "John Doe",
          "timestamp": "2026-01-09T10:30:00.000Z"
        }
      ]
    },
    "❤️": {
      "count": 10,
      "users": [...]
    }
  },
  "userReaction": "🔥",
  "allReactions": [...]
}
```

**Status:** ⬜ Pass / ⬜ Fail

---

### ✅ Test Case 5: Get Reaction Statistics (Unauthenticated)

**Objective:** Non-logged-in user fetches reaction statistics

**Steps:**
1. No authentication token provided
2. Request reaction statistics

**Expected Result:**
- Returns all reactions
- Shows reactionStats
- userReaction: null (since not authenticated)

**cURL Command:**
```bash
curl http://localhost:3000/api/posts/POST_ID/reactions
```

**Expected Response:**
```json
{
  "success": true,
  "totalReactions": 15,
  "reactionStats": {
    "🔥": {...},
    "❤️": {...}
  },
  "userReaction": null,
  "allReactions": [...]
}
```

**Status:** ⬜ Pass / ⬜ Fail

---

### ✅ Test Case 6: Invalid Post ID

**Objective:** Handle invalid or non-existent post ID

**Steps:**
1. Use an invalid post ID
2. Try to add a reaction

**Expected Result:**
- Returns 404 Not Found
- Error message: "Post not found"

**cURL Command:**
```bash
curl -X PUT http://localhost:3000/api/posts/invalid_id/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"emoji": "🔥"}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Post not found"
}
```

**Status:** ⬜ Pass / ⬜ Fail

---

### ✅ Test Case 7: Missing Authentication

**Objective:** Ensure authentication is required for reactions

**Steps:**
1. Don't provide JWT token
2. Try to add a reaction

**Expected Result:**
- Returns 401 Unauthorized
- Error message about authentication

**cURL Command:**
```bash
curl -X PUT http://localhost:3000/api/posts/POST_ID/react \
  -H "Content-Type: application/json" \
  -d '{"emoji": "🔥"}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Status:** ⬜ Pass / ⬜ Fail

---

### ✅ Test Case 8: Invalid Emoji

**Objective:** Validate emoji input

**Steps:**
1. Send empty emoji or invalid data
2. Try to add a reaction

**Expected Result:**
- Returns 400 Bad Request
- Error message: "Valid emoji is required"

**cURL Commands:**
```bash
# Empty emoji
curl -X PUT http://localhost:3000/api/posts/POST_ID/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"emoji": ""}'

# Missing emoji
curl -X PUT http://localhost:3000/api/posts/POST_ID/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Valid emoji is required"
}
```

**Status:** ⬜ Pass / ⬜ Fail

---

### ✅ Test Case 9: Multiple Users Reacting

**Objective:** Test concurrent reactions from different users

**Steps:**
1. User A adds reaction 🔥
2. User B adds reaction ❤️
3. User C adds reaction 🔥
4. Fetch reaction statistics

**Expected Result:**
- Each user has only one reaction
- Stats show: {"🔥": 2, "❤️": 1}
- Total reactions: 3

**Test Script:**
```javascript
// Using different tokens for different users
const userA_token = "token_A";
const userB_token = "token_B";
const userC_token = "token_C";

// User A reacts
await react(POST_ID, "🔥", userA_token);

// User B reacts
await react(POST_ID, "❤️", userB_token);

// User C reacts
await react(POST_ID, "🔥", userC_token);

// Get stats
const stats = await getReactions(POST_ID);
console.log(stats); // Should show correct counts
```

**Status:** ⬜ Pass / ⬜ Fail

---

### ✅ Test Case 10: Rapid Click Prevention (Frontend)

**Objective:** Prevent double-clicking from causing multiple reactions

**Steps:**
1. Click emoji button rapidly (5 times in 1 second)
2. Check if only one reaction is recorded

**Expected Result:**
- Only one API call is made (debounced)
- UI shows loading state during API call
- Final state is consistent

**Implementation:**
```javascript
// Debounced reaction handler
const debouncedReact = debounce(toggleReaction, 300);
```

**Status:** ⬜ Pass / ⬜ Fail

---

## Integration Testing

### Test Scenario 1: Complete User Flow

```javascript
describe('Reactions Complete Flow', () => {
  let postId, userToken;
  
  beforeAll(async () => {
    // Setup: Create a post and login
    const post = await createPost({ title: "Test Post" });
    postId = post._id;
    
    const auth = await login({ email: "test@example.com", password: "password" });
    userToken = auth.token;
  });

  test('should add a reaction', async () => {
    const response = await request(app)
      .put(`/api/posts/${postId}/react`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ emoji: '🔥' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.action).toBe('added');
    expect(response.body.userReaction).toBe('🔥');
  });

  test('should update reaction', async () => {
    const response = await request(app)
      .put(`/api/posts/${postId}/react`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ emoji: '❤️' });
    
    expect(response.body.action).toBe('updated');
    expect(response.body.userReaction).toBe('❤️');
  });

  test('should remove reaction', async () => {
    const response = await request(app)
      .put(`/api/posts/${postId}/react`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ emoji: '❤️' });
    
    expect(response.body.action).toBe('removed');
    expect(response.body.userReaction).toBe(null);
  });

  test('should get reaction statistics', async () => {
    const response = await request(app)
      .get(`/api/posts/${postId}/reactions`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('reactionStats');
    expect(response.body).toHaveProperty('totalReactions');
  });
});
```

---

## Performance Testing

### Load Test: Multiple Reactions

**Objective:** Test system under concurrent reactions

**Test Setup:**
- 100 concurrent users
- Each user reacts to the same post
- Measure response time and success rate

**Expected Results:**
- Average response time: < 500ms
- Success rate: > 99%
- No duplicate reactions per user
- Accurate count in database

**Tools:** Apache JMeter, Artillery, or k6

**Sample k6 Script:**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 100 }, // Ramp up to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '10s', target: 0 },   // Ramp down
  ],
};

export default function () {
  const url = 'http://localhost:3000/api/posts/POST_ID/react';
  const payload = JSON.stringify({ emoji: '🔥' });
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
    },
  };

  let res = http.put(url, payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

---

## Security Testing

### Test Case S1: SQL Injection in Emoji Field

**Objective:** Ensure emoji field is sanitized

**Steps:**
```bash
curl -X PUT http://localhost:3000/api/posts/POST_ID/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"emoji": "'; DROP TABLE posts; --"}'
```

**Expected:** Should fail validation or sanitize input

**Status:** ⬜ Pass / ⬜ Fail

---

### Test Case S2: XSS in Emoji Field

**Objective:** Prevent XSS attacks through emoji field

**Steps:**
```bash
curl -X PUT http://localhost:3000/api/posts/POST_ID/react \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"emoji": "<script>alert(\"XSS\")</script>"}'
```

**Expected:** Should sanitize or reject malicious input

**Status:** ⬜ Pass / ⬜ Fail

---

### Test Case S3: Token Manipulation

**Objective:** Ensure only valid tokens can add reactions

**Steps:**
1. Use an expired token
2. Use a tampered token
3. Use another user's token

**Expected:** All should return 401 Unauthorized

**Status:** ⬜ Pass / ⬜ Fail

---

## UI/UX Testing Checklist

### Visual Tests

- [ ] Emoji buttons display correctly
- [ ] Active reaction is highlighted
- [ ] Counts update immediately
- [ ] Loading state is shown during API call
- [ ] Error messages are user-friendly
- [ ] Hover states work correctly
- [ ] Mobile responsive design

### Interaction Tests

- [ ] Click adds reaction
- [ ] Double-click removes reaction
- [ ] Rapid clicks are debounced
- [ ] Keyboard navigation works
- [ ] Accessibility (screen reader support)
- [ ] Touch gestures on mobile

### Error Handling UI

- [ ] Network error: Shows "Try again" message
- [ ] Unauthorized: Redirects to login
- [ ] Post not found: Shows appropriate message
- [ ] Loading indicator during request
- [ ] Success feedback (optional animation)

---

## Browser Compatibility Testing

| Browser | Version | Add Reaction | Remove Reaction | View Stats | Status |
|---------|---------|--------------|-----------------|------------|--------|
| Chrome  | Latest  | ⬜           | ⬜              | ⬜         | ⬜     |
| Firefox | Latest  | ⬜           | ⬜              | ⬜         | ⬜     |
| Safari  | Latest  | ⬜           | ⬜              | ⬜         | ⬜     |
| Edge    | Latest  | ⬜           | ⬜              | ⬜         | ⬜     |
| Mobile Safari | Latest | ⬜      | ⬜              | ⬜         | ⬜     |
| Chrome Mobile | Latest | ⬜      | ⬜              | ⬜         | ⬜     |

---

## Database Verification

### Check Reaction Storage

```javascript
// Connect to MongoDB
const post = await Post.findById(POST_ID);

console.log('Reactions:', post.reactions);
// Verify:
// - User IDs are correct
// - Emojis are stored correctly
// - Timestamps are valid
// - No duplicate user entries
// - Name field is populated
```

### Check Indexes

```javascript
// Ensure reactions queries are efficient
db.posts.getIndexes();

// Should include:
// - Index on post._id
// - Index on reactions.user (if needed for performance)
```

---

## Regression Testing Checklist

After any code changes, verify:

- [ ] Existing reactions are not lost
- [ ] All endpoints still work
- [ ] Response format unchanged (breaking changes)
- [ ] Performance hasn't degraded
- [ ] Error handling still works
- [ ] Authentication still required
- [ ] Statistics calculation is accurate

---

## Test Results Summary

| Test Category | Total Tests | Passed | Failed | Skipped |
|---------------|-------------|--------|--------|---------|
| Functional    | 10          | ⬜     | ⬜     | ⬜      |
| Integration   | 4           | ⬜     | ⬜     | ⬜      |
| Performance   | 1           | ⬜     | ⬜     | ⬜      |
| Security      | 3           | ⬜     | ⬜     | ⬜      |
| UI/UX         | 13          | ⬜     | ⬜     | ⬜      |
| Browser       | 6           | ⬜     | ⬜     | ⬜      |
| Database      | 2           | ⬜     | ⬜     | ⬜      |
| Regression    | 7           | ⬜     | ⬜     | ⬜      |

**Total:** 46 tests

---

## Reporting Bugs

When reporting issues, include:

1. **Test Case ID**
2. **Steps to Reproduce**
3. **Expected Result**
4. **Actual Result**
5. **Screenshots/Logs**
6. **Environment Details** (OS, Browser, API version)

**Example Bug Report:**
```
Test Case: TC-002 (Remove Reaction)
Expected: Reaction should be removed and count decreased
Actual: Reaction removed but count shows incorrect value
Steps:
1. Add reaction 🔥
2. Click 🔥 again
3. Check count
Environment: Chrome 120, Windows 11, API v1.0
Logs: [attach logs]
```

---

## Next Steps After Testing

1. ✅ Fix any failed tests
2. ✅ Optimize performance bottlenecks
3. ✅ Improve error messages based on findings
4. ✅ Update documentation with any discoveries
5. ✅ Set up automated testing
6. ✅ Deploy to staging environment
7. ✅ Final QA round
8. ✅ Deploy to production

---

**Happy Testing! 🧪**
