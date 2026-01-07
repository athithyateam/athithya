# Athithya - Himalayan Travel & Trekking Backend

Athithya is a specialized backend platform designed to power premium travel and trekking experiences, with a focus on the Himalayan region. It connects adventure seekers (Guests) with local experts and certified guides (Hosts), fostering authentic community-driven tourism in Uttarakhand.

---

## Technical Overview

Built with a modern Node.js stack, the API handles identity management, geospatial trek discovery, community interactions, and automated media processing.

### Key Capabilities
- **Identity & Trust**: Role-role based access control (Guest, Host, Admin) with OTP-verified registration and Google OAuth.
- **Geospatial Discovery**: Advanced MongoDB geospatial queries to find treks and services based on real-time location.
- **Media Engine**: Seamless integration with Cloudinary for handling high-resolution trekking photos and videos.
- **Community Layer**: Comprehensive review system for hosts and experiences, plus real-time notifications.
- **Content Management**: Priority featured content discovery and search filtering.

---

## Documentation Index

Detailed guides for specific modules:
- [🚀 Quick Start Guide](QUICK_START.md) - Get up and running in minutes.
- [📚 Main API Documentation](API_DOCUMENTATION.md) - Core endpoints for posts and auth.
- [🏔️ Experiences & Treks API](EXPERIENCES_API_DOCUMENTATION.md) - Deep dive into trekking posts.
- [👤 Service Providers API](SERVICES_API_DOCUMENTATION.md) - Managing local services.
- [⭐ Reviews & Ratings](REVIEWS_API_DOCUMENTATION.md) - Trust and safety protocols.
- [🗺️ Itinerary Management](ITINERARY_API_DOCUMENTATION.md) - Planning and scheduling.
- [📍 Location & Geospatial](LOCATION_API_DOCUMENTATION.md) - How mapping works.

---

## 🛠️ Environment Setup

### Prerequisites
- Node.js v18+
- MongoDB instance (local or Atlas)
- Cloudinary Account (for media)
- SMTP/Email provider (for OTP)

### Installation

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file in the root:
   ```env
   # Core
   MONGO_URL=your_mongodb_uri
   JWT_SECRET=your_secure_random_string
   PORT=3000

   # Frontend URL for CORS
   FRONTEND_URL=http://localhost:5173

   # Media (Cloudinary)
   CLOUDINARY_CLOUD_NAME=name
   CLOUDINARY_API_KEY=key
   CLOUDINARY_API_SECRET=secret

   # Email (Nodemailer)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email
   EMAIL_PASSWORD=app_password
   ```

3. **Run Services**
   ```bash
   # Development (with nodemon)
   npm run dev

   # Production
   npm start
   ```

---

## 🏗️ Architecture

The project follows a modular route-middleware-model pattern:
- `/routes`: Endpoint definitions and controller logic.
- `/middleware`: Auth guards, role checks, and request validation.
- `/db`: Mongoose schemas and database connection pooling.
- `/utils`: Shared helpers (Cloudinary, Email, etc.).
- `/jwt`: Token signing and verification logic.

---

## Core API Endpoints

| Resource | Path | Description |
|----------|------|-------------|
| **Auth** | `/api/auth` | Login, Register, OTP, Password Reset |
| **Posts** | `/api/posts` | Treks, Services, and Experiences |
| **Users** | `/api/users` | Profile management and Host discovery |
| **Reviews** | `/api/reviews` | Rating and feedback system |
| **Itinerary** | `/api/itineraries` | Trip planning and day-by-day guides |
| **Notice** | `/api/notifications` | User activity alerts |

---

## License
Developed for the Athithya Team. All rights reserved. 🏔️
