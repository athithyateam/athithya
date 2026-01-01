# 🔒 ADMIN ENDPOINTS TESTING GUIDE

## ✅ Deployment Status
**Admin endpoints are LIVE on Render!**
- Base URL: `https://athithya-backend.onrender.com/api/auth`
- Commit: `42545df` - "Add admin endpoints with role-based access control"

---

## 📋 Prerequisites

### 1. Set a User as Admin in MongoDB
1. Open [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to: **Database** → **Browse Collections** → **users** collection
3. Find any user (or create new one)
4. Click **Edit** on that user document
5. Change the `role` field to: `"admin"`
6. Click **Update**

**Recommended test user:**
- Email: `testuser@example.com` (already exists)
- Just change their role to `admin`

---

## 🧪 Testing Commands

### Step 1: Sign in with Admin User
```powershell
# Replace email/password with your admin user
$signinBody = '{"email":"testuser@example.com","password":"Test123456"}'
$signinResponse = Invoke-WebRequest -Uri "https://athithya-backend.onrender.com/api/auth/signin" -Method Post -Body $signinBody -ContentType "application/json"
$userData = $signinResponse.Content | ConvertFrom-Json
$adminToken = $userData.token
Write-Host "Admin Token: $adminToken"
Write-Host "User Role: $($userData.user.role)"
```

**Expected Output:**
```
User Role: admin
Admin Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Step 2: Test Admin Endpoints

#### 2a. Get All Users
```powershell
$headers = @{ "Authorization" = "Bearer $adminToken" }
$response = Invoke-WebRequest -Uri "https://athithya-backend.onrender.com/api/auth/admin/users" -Method Get -Headers $headers
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

#### 2b. Get Statistics
```powershell
$headers = @{ "Authorization" = "Bearer $adminToken" }
$response = Invoke-WebRequest -Uri "https://athithya-backend.onrender.com/api/auth/admin/stats" -Method Get -Headers $headers
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

#### 2c. Get Specific User (replace USER_ID)
```powershell
$headers = @{ "Authorization" = "Bearer $adminToken" }
$userId = "PASTE_USER_ID_HERE"
$response = Invoke-WebRequest -Uri "https://athithya-backend.onrender.com/api/auth/admin/users/$userId" -Method Get -Headers $headers
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

#### 2d. Update User Role (replace USER_ID)
```powershell
$headers = @{ "Authorization" = "Bearer $adminToken" }
$userId = "PASTE_USER_ID_HERE"
$updateBody = '{"role":"host"}'
$response = Invoke-WebRequest -Uri "https://athithya-backend.onrender.com/api/auth/admin/users/$userId/role" -Method Patch -Headers $headers -Body $updateBody -ContentType "application/json"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

#### 2e. Delete User (replace USER_ID)
```powershell
$headers = @{ "Authorization" = "Bearer $adminToken" }
$userId = "PASTE_USER_ID_HERE"
$response = Invoke-WebRequest -Uri "https://athithya-backend.onrender.com/api/auth/admin/users/$userId" -Method Delete -Headers $headers
$response.Content
```

---

### Step 3: Test Access Control (Non-Admin User)

```powershell
# Sign in as a regular guest/host user
$normalSignin = '{"email":"guest@example.com","password":"password123"}'
$normalResponse = Invoke-WebRequest -Uri "https://athithya-backend.onrender.com/api/auth/signin" -Method Post -Body $normalSignin -ContentType "application/json"
$normalData = $normalResponse.Content | ConvertFrom-Json
$normalToken = $normalData.token

# Try to access admin endpoint (should get 403 Forbidden)
$headers = @{ "Authorization" = "Bearer $normalToken" }
try {
    Invoke-WebRequest -Uri "https://athithya-backend.onrender.com/api/auth/admin/stats" -Method Get -Headers $headers
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__) - Access Denied (Expected!)" -ForegroundColor Green
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    Write-Host "Response: $errorBody" -ForegroundColor Yellow
}
```

**Expected Output:**
```
Status: 403 - Access Denied (Expected!)
Response: {"success":false,"message":"Access denied. Admin privileges required."}
```

---

## 📊 Expected Responses

### ✅ Success - Get Statistics
```json
{
  "success": true,
  "statistics": {
    "totalUsers": 5,
    "verifiedUsers": 3,
    "unverifiedUsers": 2,
    "roles": {
      "guest": 3,
      "host": 1,
      "admin": 1
    }
  }
}
```

### ❌ Error - No Token (401)
```json
{
  "success": false,
  "message": "Authentication required. Please provide a token."
}
```

### ❌ Error - Non-Admin User (403)
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

---

## 🎯 All Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | Get all users |
| GET | `/admin/users/:id` | Get user by ID |
| PATCH | `/admin/users/:id/role` | Update user role |
| DELETE | `/admin/users/:id` | Delete user |
| GET | `/admin/stats` | Get user statistics |

**Required Header:** `Authorization: Bearer <admin-token>`

---

## 🚀 For Frontend Developers

### Authentication Flow
1. User signs in → receives JWT token
2. Token contains `userId` and `role`
3. If `role === 'admin'`, show admin panel
4. Include token in all admin API calls

### Example Frontend Code (JavaScript)
```javascript
// Sign in
const signinResponse = await fetch('https://athithya-backend.onrender.com/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token, user } = await signinResponse.json();

// Check if admin
if (user.role === 'admin') {
  // Show admin panel
  
  // Fetch admin data
  const statsResponse = await fetch('https://athithya-backend.onrender.com/api/auth/admin/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const stats = await statsResponse.json();
}
```

---

## ✅ Testing Checklist

- [ ] Set a user as admin in MongoDB
- [ ] Sign in with admin credentials
- [ ] Test GET /admin/users (should return user list)
- [ ] Test GET /admin/stats (should return statistics)
- [ ] Test PATCH /admin/users/:id/role (should update role)
- [ ] Test with non-admin token (should get 403 error)
- [ ] Test without token (should get 401 error)

---

**Happy Testing! 🎉**
