# Deployment Guide

## Vercel Deployment Limitations

### File Upload Constraints

Vercel serverless functions have the following limitations:

**Hobby Plan:**
- Request body size: **4.5 MB** max
- Execution timeout: **10 seconds**
- File size per upload: **3 MB** max (enforced by our code)

**Pro Plan:**
- Request body size: **4.5 MB** max  
- Execution timeout: **60 seconds**

### Recommendations for File Uploads

#### Option 1: Compress Images Before Upload (Recommended)
Ensure images are optimized before uploading:
- Use image compression tools
- Resize images to reasonable dimensions (e.g., 1920x1080 max)
- Keep individual files under 3MB

#### Option 2: Direct Frontend Upload to Cloudinary
For large files, implement client-side direct upload:

```javascript
// Frontend: Direct upload to Cloudinary
const uploadWidget = cloudinary.createUploadWidget({
  cloudName: 'your-cloud-name',
  uploadPreset: 'your-upload-preset'
}, (error, result) => {
  if (!error && result.event === "success") {
    // Send only the Cloudinary URL to your backend
    const photoUrl = result.info.secure_url;
  }
});
```

Then send only the URLs to your backend instead of the actual files.

#### Option 3: Alternative Hosting
For applications requiring large file uploads, consider:
- Railway
- Render
- DigitalOcean App Platform
- AWS EC2 or similar VPS

These platforms typically don't have the same serverless limitations.

### Environment Variables

Ensure all environment variables are set in Vercel Dashboard:

```
MONGO_URL=mongodb://...
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
BREVO_API_KEY=your-brevo-key
```

### MongoDB Configuration

Ensure your MongoDB allows connections from:
- IP Whitelist: `0.0.0.0/0` (all IPs)
- Or add specific Vercel IPs if using a restrictive firewall

### Testing

**Local Testing (No Limits):**
```bash
npm start
# Test with http://localhost:3000
```

**Vercel Testing (With Limits):**
```bash
# Use your deployed URL
https://athithya-pi.vercel.app
```

### Error Messages

The API now returns detailed error messages:

```json
{
  "success": false,
  "message": "Error creating post",
  "error": "File size too large. Maximum size is 3MB per file"
}
```

### File Upload Tips for Users

**For Photos:**
- Format: JPG, PNG, WebP
- Size: Under 3MB each
- Max count: 10 photos
- Resolution: Optimize to 1920x1080 or lower

**For Videos:**
- Format: MP4, MOV
- Size: Under 3MB each (very short clips only)
- Max count: 5 videos
- Consider using video hosting services (YouTube, Vimeo) and just store links

### Monitoring

Check Vercel logs for errors:
1. Go to Vercel Dashboard
2. Select your project
3. Click **Deployments**
4. Click on latest deployment
5. Click **View Function Logs**

---

## Successful Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] MongoDB allows Vercel connections
- [ ] Latest code pushed to GitHub
- [ ] Vercel auto-deployed successfully
- [ ] Test endpoints without files work
- [ ] Test with small files (under 3MB)
- [ ] Users informed about file size limits
