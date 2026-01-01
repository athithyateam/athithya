const express = require("express")
const { Post, User, Review } = require("../db/mongoose")
const { checkAuth } = require("../middleware/checkRole")
const cloudinary = require("../utils/cloudinary")
const multer = require("multer")
const storage = multer.memoryStorage()

// File size limit: 3MB per file (to stay under Vercel's 4.5MB body limit)
const upload = multer({ 
    storage,
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB
    }
})
const postRouter = express.Router()

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: "File size too large. Maximum size is 3MB per file",
                error: err.message
            })
        }
        return res.status(400).json({
            success: false,
            message: "File upload error",
            error: err.message
        })
    }
    next(err)
}

// CREATE POST - Only authenticated users (guests can share experiences, hosts can share properties/experiences)
postRouter.post("/", checkAuth, upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "videos", maxCount: 5 }
]), handleMulterError, async(req, res) => {
        console.log('req.files:', req.files);
    try {
        const { 
            postType, title, description, location, 
            price, amenities, capacity, availability,
            planName, priceTotal, pricePerPerson, maxPeople,
            duration, difficulty, categories, isFeatured
        } = req.body

        // helper to parse JSON fields sent as strings in form-data
        const parseIfJson = (value) => {
            if (!value) return undefined
            if (typeof value === 'object') return value
            try {
                if (typeof value === 'string' && (value.trim().startsWith('{') || value.trim().startsWith('['))) {
                    return JSON.parse(value)
                }
            } catch (e) {
                // not JSON, return as-is
            }
            return value
        }

        const parsedPrice = parseIfJson(price)
        const parsedCapacity = parseIfJson(capacity)
        const parsedLocation = parseIfJson(location)

        // Validate and sanitize location coordinates
        if (parsedLocation && parsedLocation.coordinates) {
            // Check if coordinates is a valid GeoJSON Point
            if (parsedLocation.coordinates.type === 'Point' && 
                Array.isArray(parsedLocation.coordinates.coordinates) &&
                parsedLocation.coordinates.coordinates.length === 2 &&
                parsedLocation.coordinates.coordinates.every(coord => typeof coord === 'number' && !isNaN(coord))) {
                // Valid GeoJSON, keep it
            } else {
                // Invalid structure, remove it to prevent MongoDB geospatial errors
                delete parsedLocation.coordinates
            }
        }

        // Handle file uploads
        // NOTE: For Vercel deployment, each file must be under 3MB
        // For larger files, consider using direct upload from frontend to Cloudinary
        const uploadToCloudinary = (file, resourceType) => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({ resource_type: resourceType }, (error, result) => {
                    if (error) {
                        console.error(`Cloudinary upload error [${resourceType}]:`, error);
                        return reject(error);
                    }
                    if (!result) {
                        console.error(`Cloudinary upload result is undefined for [${resourceType}] file.`);
                        return reject(new Error('No result from Cloudinary'));
                    }
                    // return the whole result so callers can store public_id and secure_url
                    resolve(result);
                }).end(file.buffer);
            });
        };

        let photoUrls = [];
        let videoUrls = [];
        if (req.files && req.files["photos"]) {
            for (const file of req.files["photos"]) {
                const result = await uploadToCloudinary(file, "image");
                photoUrls.push({ url: result.secure_url, public_id: result.public_id, resource_type: result.resource_type || 'image' });
            }
        }
        if (req.files && req.files["videos"]) {
            for (const file of req.files["videos"]) {
                const result = await uploadToCloudinary(file, "video");
                videoUrls.push({ url: result.secure_url, public_id: result.public_id, resource_type: result.resource_type || 'video' });
            }
        }

        // Validation
        // Acceptable post types: experience, service, trek (plan moved to itineraries API)
        if (!postType || !['experience', 'service', 'trek'].includes(postType)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid post type. Must be one of: 'experience', 'service', 'trek'. Use /api/itineraries for trip plans." 
            })
        }

        if (!title || !description) {
            return res.status(400).json({ 
                success: false, 
                message: "Title and description are required" 
            })
        }

        // Guests can post 'experience'. Hosts can post any type including 'service' and 'trek'.
        if (req.user.role === 'guest' && postType !== 'experience') {
            return res.status(403).json({
                success: false,
                message: "Guests can only post 'experience'. Hosts can post 'service' and 'trek' as well. Use /api/itineraries for trip plans."
            });
        }

        // Build price and capacity objects with new fields
        const priceObj = {
            ...(parsedPrice || {}),
        }
        if (priceTotal) priceObj.total = Number(priceTotal)
        if (pricePerPerson) priceObj.perPerson = Number(pricePerPerson)

        const capacityObj = {
            ...(parsedCapacity || {}),
        }
        if (maxPeople) capacityObj.maxPeople = Number(maxPeople)

        // Parse duration if provided
        const parsedDuration = parseIfJson(duration)

        const post = await Post.create({
            user: req.user.userId,
            userRole: req.user.role,
            postType,
            title,
            description,
            photos: photoUrls,
            videos: videoUrls,
            location: parsedLocation || (location || {}),
            plan: planName ? { name: planName } : undefined,
            price: priceObj,
            amenities: amenities || [],
            capacity: capacityObj,
            availability: availability || {},
            duration: parsedDuration || undefined,
            difficulty: difficulty || undefined,
            categories: parseIfJson(categories) || [],
            isFeatured: isFeatured === 'true' || isFeatured === true || false
        })

        return res.status(201).json({ 
            success: true, 
            message: "Post created successfully",
            post 
        })
    } catch (error) {
        console.error("Create post error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error creating post",
            error: error.message 
        })
    }
})

// GET ALL POSTS - Public (with filtering)
postRouter.get("/", async(req, res) => {
    try {
        const { 
            postType, userRole, city, country, state,
            minPrice, maxPrice, status, 
            difficulty, categories, isFeatured,
            page = 1, limit = 20 
        } = req.query

        // Build filter query
        const filter = {}
        
        if (postType) filter.postType = postType
        if (userRole) filter.userRole = userRole
        if (city) filter['location.city'] = new RegExp(city, 'i')
        if (state) filter['location.state'] = new RegExp(state, 'i')
        if (country) filter['location.country'] = new RegExp(country, 'i')
        if (status) filter.status = status
        else filter.status = 'active' // Default to active posts only
        
        // Trek-specific filters
        if (difficulty) filter.difficulty = difficulty
        if (categories) filter.categories = { $in: categories.split(',') }
        if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true'

        // Price range filter
        if (minPrice || maxPrice) {
            filter['price.perPerson'] = {}
            if (minPrice) filter['price.perPerson'].$gte = Number(minPrice)
            if (maxPrice) filter['price.perPerson'].$lte = Number(maxPrice)
        }

        const skip = (Number(page) - 1) * Number(limit)
        
        const posts = await Post.find(filter)
            .populate('user', 'firstname lastname email role')
            .sort({ isFeatured: -1, createdAt: -1 })
            .limit(Number(limit))
            .skip(skip)

        const total = await Post.countDocuments(filter)

        return res.status(200).json({ 
            success: true,
            count: posts.length,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            posts 
        })
    } catch (error) {
        console.error("Get posts error:", error)
        return res.status(500).json({ success: false, message: "Error fetching posts" })
    }
})

// Note: GET /treks endpoint is now in the DEDICATED TREK ENDPOINTS section below

// GET ALL TREKS (Simplified) - Public
postRouter.get("/all/treks", async(req, res) => {
    try {
        const { limit = 50, page = 1 } = req.query

        const skip = (Number(page) - 1) * Number(limit)

        const posts = await Post.find({ 
            postType: 'trek', 
            status: 'active' 
        })
            .populate('user', 'firstname lastname email role')
            .sort({ isFeatured: -1, createdAt: -1 })
            .limit(Number(limit))
            .skip(skip)

        const total = await Post.countDocuments({ postType: 'trek', status: 'active' })

        return res.status(200).json({ 
            success: true,
            count: posts.length,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            posts 
        })
    } catch (error) {
        console.error("Get all treks error:", error)
        return res.status(500).json({ success: false, message: "Error fetching all treks" })
    }
})

// GET FEATURED TREKS - Public
postRouter.get("/featured/treks", async(req, res) => {
    try {
        const { limit = 20 } = req.query

        const posts = await Post.find({ 
            postType: 'trek', 
            isFeatured: true, 
            status: 'active' 
        })
            .populate('user', 'firstname lastname email role')
            .sort({ createdAt: -1 })
            .limit(Number(limit))

        return res.status(200).json({ 
            success: true,
            count: posts.length,
            posts 
        })
    } catch (error) {
        console.error("Get featured treks error:", error)
        return res.status(500).json({ success: false, message: "Error fetching featured treks" })
    }
})

// GET TOP-RATED TREKS - Public
// Returns treks sorted by average rating from reviews
postRouter.get("/top-rated/treks", async(req, res) => {
    try {
        const { limit = 10, minRating = 0 } = req.query

        // Aggregate reviews to calculate average rating per trek post
        const topRatedTreks = await Review.aggregate([
            {
                // Only include reviews that have a post reference
                $match: { 
                    post: { $exists: true, $ne: null }
                }
            },
            {
                // Group by post and calculate average rating
                $group: {
                    _id: '$post',
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 }
                }
            },
            {
                // Filter by minimum rating if specified
                $match: {
                    averageRating: { $gte: Number(minRating) }
                }
            },
            {
                // Sort by average rating (highest first)
                $sort: { averageRating: -1, reviewCount: -1 }
            },
            {
                // Limit results
                $limit: Number(limit)
            },
            {
                // Lookup the actual post details
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'postDetails'
                }
            },
            {
                // Unwind the post details array
                $unwind: '$postDetails'
            },
            {
                // Only include trek posts that are active
                $match: {
                    'postDetails.postType': 'trek',
                    'postDetails.status': 'active'
                }
            },
            {
                // Lookup user details
                $lookup: {
                    from: 'users',
                    localField: 'postDetails.user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                // Project final shape
                $project: {
                    _id: '$postDetails._id',
                    title: '$postDetails.title',
                    description: '$postDetails.description',
                    postType: '$postDetails.postType',
                    photos: '$postDetails.photos',
                    videos: '$postDetails.videos',
                    location: '$postDetails.location',
                    price: '$postDetails.price',
                    duration: '$postDetails.duration',
                    difficulty: '$postDetails.difficulty',
                    categories: '$postDetails.categories',
                    amenities: '$postDetails.amenities',
                    capacity: '$postDetails.capacity',
                    availability: '$postDetails.availability',
                    isFeatured: '$postDetails.isFeatured',
                    status: '$postDetails.status',
                    createdAt: '$postDetails.createdAt',
                    updatedAt: '$postDetails.updatedAt',
                    user: {
                        $arrayElemAt: [
                            {
                                $map: {
                                    input: '$userDetails',
                                    as: 'user',
                                    in: {
                                        _id: '$$user._id',
                                        firstname: '$$user.firstname',
                                        lastname: '$$user.lastname',
                                        email: '$$user.email',
                                        role: '$$user.role'
                                    }
                                }
                            },
                            0
                        ]
                    },
                    averageRating: { $round: ['$averageRating', 1] },
                    reviewCount: '$reviewCount'
                }
            }
        ])

        return res.status(200).json({ 
            success: true,
            count: topRatedTreks.length,
            treks: topRatedTreks
        })
    } catch (error) {
        console.error("Get top-rated treks error:", error)
        return res.status(500).json({ success: false, message: "Error fetching top-rated treks" })
    }
})

// GET NEARBY TREKS - Public
// Find treks near a given location using coordinates
postRouter.get("/nearby/treks", async(req, res) => {
    try {
        const { 
            latitude, 
            longitude, 
            maxDistance = 100000,  // Default 100km in meters
            limit = 20,
            difficulty,
            minPrice,
            maxPrice,
            categories
        } = req.query

        // Validate required parameters
        if (!latitude || !longitude) {
            return res.status(400).json({ 
                success: false, 
                message: "Latitude and longitude are required" 
            })
        }

        const lat = parseFloat(latitude)
        const lng = parseFloat(longitude)

        // Validate coordinate values
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid latitude or longitude values" 
            })
        }

        // Build query filter
        const filter = {
            postType: 'trek',
            status: 'active',
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat]  // MongoDB expects [longitude, latitude]
                    },
                    $maxDistance: parseInt(maxDistance)  // Distance in meters
                }
            }
        }

        // Add optional filters
        if (difficulty) filter.difficulty = difficulty
        if (categories) filter.categories = { $in: categories.split(',') }
        
        // Price range filter
        if (minPrice || maxPrice) {
            filter['price.perPerson'] = {}
            if (minPrice) filter['price.perPerson'].$gte = Number(minPrice)
            if (maxPrice) filter['price.perPerson'].$lte = Number(maxPrice)
        }

        const treks = await Post.find(filter)
            .populate('user', 'firstname lastname email role')
            .limit(Number(limit))

        // Calculate distance for each trek (in kilometers)
        const treksWithDistance = treks.map(trek => {
            const trekObj = trek.toObject()
            
            // Calculate distance if coordinates exist
            if (trek.location?.coordinates?.coordinates) {
                const [trekLng, trekLat] = trek.location.coordinates.coordinates
                const distance = calculateDistance(lat, lng, trekLat, trekLng)
                trekObj.distance = Math.round(distance * 10) / 10  // Round to 1 decimal
                trekObj.distanceUnit = 'km'
            }
            
            return trekObj
        })

        return res.status(200).json({ 
            success: true,
            count: treksWithDistance.length,
            searchLocation: {
                latitude: lat,
                longitude: lng,
                maxDistance: `${maxDistance / 1000}km`
            },
            treks: treksWithDistance
        })
    } catch (error) {
        console.error("Get nearby treks error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching nearby treks" 
        })
    }
})

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    
    return distance
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180)
}

// GET USER'S POSTS - Public (view anyone's posts)
postRouter.get("/user/:userId", async(req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId })
            .populate('user', 'firstname lastname email role')
            .sort({ createdAt: -1 })

        return res.status(200).json({ 
            success: true,
            count: posts.length,
            posts 
        })
    } catch (error) {
        console.error("Get user posts error:", error)
        return res.status(500).json({ success: false, message: "Error fetching user posts" })
    }
})

// GET MY POSTS - Authenticated user's own posts
postRouter.get("/my/posts", checkAuth, async(req, res) => {
    try {
        const posts = await Post.find({ user: req.user.userId })
            .sort({ createdAt: -1 })

        return res.status(200).json({ 
            success: true,
            count: posts.length,
            posts 
        })
    } catch (error) {
        console.error("Get my posts error:", error)
        return res.status(500).json({ success: false, message: "Error fetching your posts" })
    }
})

// UPDATE POST - Only post owner
postRouter.put("/:id", checkAuth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" })
        }

        // Check if user is the owner
        if (post.user.toString() !== req.user.userId) {
            return res.status(403).json({ 
                success: false, 
                message: "You can only edit your own posts" 
            })
        }

        const { 
            title, description, images, location, 
            price, amenities, capacity, availability, status,
            planName, priceTotal, pricePerPerson, maxPeople,
            duration, difficulty, isFeatured
        } = req.body

        const parseIfJson = (value) => {
            if (!value) return undefined
            if (typeof value === 'object') return value
            try {
                if (typeof value === 'string' && (value.trim().startsWith('{') || value.trim().startsWith('['))) {
                    return JSON.parse(value)
                }
            } catch (e) {}
            return value
        }

        const parsedPrice = parseIfJson(price)
        const parsedCapacity = parseIfJson(capacity)
        const parsedLocation = parseIfJson(location)

        // Update fields
        if (title) post.title = title
        if (description) post.description = description
        if (images) post.images = images
        if (parsedLocation || location) post.location = { ...post.location, ...(parsedLocation || location) }

        // update price
        if (parsedPrice || priceTotal || pricePerPerson) {
            post.price = { ...post.price, ...(parsedPrice || {}) }
            if (priceTotal) post.price.total = Number(priceTotal)
            if (pricePerPerson) post.price.perPerson = Number(pricePerPerson)
        }

        if (amenities) post.amenities = amenities

        // update capacity
        if (parsedCapacity || maxPeople) {
            post.capacity = { ...post.capacity, ...(parsedCapacity || {}) }
            if (maxPeople) post.capacity.maxPeople = Number(maxPeople)
        }

        // update plan name
        if (planName) {
            post.plan = { ...(post.plan || {}), name: planName }
        }

        if (availability) post.availability = { ...post.availability, ...availability }
        if (status) post.status = status
        
        // Update trek-specific fields
        if (duration) post.duration = parseIfJson(duration)
        if (difficulty) post.difficulty = difficulty
        if (isFeatured !== undefined) post.isFeatured = isFeatured === 'true' || isFeatured === true

        await post.save()

        return res.status(200).json({ 
            success: true, 
            message: "Post updated successfully",
            post 
        })
    } catch (error) {
        console.error("Update post error:", error)
        return res.status(500).json({ success: false, message: "Error updating post" })
    }
})

// DELETE POST - Only post owner
postRouter.delete("/:id", checkAuth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" })
        }

        // Check if user is the owner
        if (post.user.toString() !== req.user.userId) {
            return res.status(403).json({ 
                success: false, 
                message: "You can only delete your own posts" 
            })
        }

        // delete associated Cloudinary assets (photos & videos)
        const deleteFromCloudinary = (publicId, resourceType = 'image') => {
            return new Promise((resolve) => {
                if (!publicId) return resolve()
                cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (err, result) => {
                    if (err) console.error(`Cloudinary destroy error for ${publicId}:`, err)
                    else console.log(`Cloudinary destroy result for ${publicId}:`, result)
                    resolve()
                })
            })
        }

        const assets = []
        if (Array.isArray(post.photos)) assets.push(...post.photos)
        if (Array.isArray(post.videos)) assets.push(...post.videos)

        for (const asset of assets) {
            const publicId = asset && (asset.public_id || asset.publicId || null)
            const resourceType = asset && (asset.resource_type || 'image')
            if (publicId) {
                // don't await all at once to avoid throttling, but await each sequentially
                await deleteFromCloudinary(publicId, resourceType)
            }
        }

        await Post.findByIdAndDelete(req.params.id)

        return res.status(200).json({ 
            success: true, 
            message: "Post deleted successfully" 
        })
    } catch (error) {
        console.error("Delete post error:", error)
        return res.status(500).json({ success: false, message: "Error deleting post" })
    }
})

// ==================== DEDICATED EXPERIENCE ENDPOINTS ====================
// These endpoints automatically set postType to "experience" for simplified API usage

// CREATE EXPERIENCE - Dedicated endpoint for sharing travel experiences
postRouter.post("/experiences", checkAuth, upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "videos", maxCount: 5 }
]), handleMulterError, async(req, res) => {
    try {
        const { 
            title, description, location, 
            pricePerPerson, maxPeople,
            duration, difficulty, categories, isFeatured,
            amenities, availability,
            city, state, country, meetingPoint,
            days, nights, period
        } = req.body

        // Helper to parse JSON fields
        const parseIfJson = (value) => {
            if (!value) return undefined
            if (typeof value === 'object') return value
            try {
                if (typeof value === 'string' && (value.trim().startsWith('{') || value.trim().startsWith('['))) {
                    return JSON.parse(value)
                }
            } catch (e) {
                // not JSON, return as-is
            }
            return value
        }

        const parsedLocation = parseIfJson(location)

        // Handle file uploads
        const uploadToCloudinary = (file, resourceType) => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({ resource_type: resourceType }, (error, result) => {
                    if (error) {
                        console.error(`Cloudinary upload error [${resourceType}]:`, error);
                        return reject(error);
                    }
                    if (!result) {
                        console.error(`Cloudinary upload result is undefined for [${resourceType}] file.`);
                        return reject(new Error('No result from Cloudinary'));
                    }
                    resolve(result);
                }).end(file.buffer);
            });
        };

        let photoUrls = [];
        let videoUrls = [];
        if (req.files && req.files["photos"]) {
            for (const file of req.files["photos"]) {
                const result = await uploadToCloudinary(file, "image");
                photoUrls.push({ 
                    url: result.secure_url, 
                    public_id: result.public_id, 
                    resource_type: result.resource_type || 'image' 
                });
            }
        }
        if (req.files && req.files["videos"]) {
            for (const file of req.files["videos"]) {
                const result = await uploadToCloudinary(file, "video");
                videoUrls.push({ 
                    url: result.secure_url, 
                    public_id: result.public_id, 
                    resource_type: result.resource_type || 'video' 
                });
            }
        }

        // Validation
        if (!title || !description) {
            return res.status(400).json({ 
                success: false, 
                message: "Title and description are required" 
            })
        }

        // Build location object
        const locationObj = parsedLocation || {}
        if (city) locationObj.city = city
        if (state) locationObj.state = state
        if (country) locationObj.country = country
        if (meetingPoint) locationObj.meetingPoint = meetingPoint
        
        console.log("Location before cleanup:", JSON.stringify(locationObj));
        
        // Validate GeoJSON coordinates structure
        if (locationObj.coordinates) {
            // Check if coordinates is a valid GeoJSON Point
            if (locationObj.coordinates.type === 'Point' && 
                Array.isArray(locationObj.coordinates.coordinates) &&
                locationObj.coordinates.coordinates.length === 2) {
                // Valid GeoJSON, keep it
                console.log("Valid GeoJSON coordinates found");
            } else {
                // Invalid structure, remove it
                console.log("Removing invalid coordinates");
                delete locationObj.coordinates;
            }
        }
        
        console.log("Location after cleanup:", JSON.stringify(locationObj));

        // Build price object
        const priceObj = {}
        if (pricePerPerson) priceObj.perPerson = Number(pricePerPerson)
        if (period) priceObj.period = period

        // Build capacity object
        const capacityObj = {}
        if (maxPeople) capacityObj.maxPeople = Number(maxPeople)

        // Build duration object
        const durationObj = parseIfJson(duration) || {}
        if (days) durationObj.days = Number(days)
        if (nights) durationObj.nights = Number(nights)

        // Create experience post with automatic postType: "experience"
        const experience = await Post.create({
            user: req.user.userId,
            userRole: req.user.role,
            postType: 'experience',  // Automatically set to experience
            title,
            description,
            photos: photoUrls,
            videos: videoUrls,
            location: Object.keys(locationObj).length > 0 ? locationObj : undefined,
            price: Object.keys(priceObj).length > 0 ? priceObj : undefined,
            duration: Object.keys(durationObj).length > 0 ? durationObj : undefined,
            amenities: parseIfJson(amenities) || [],
            capacity: Object.keys(capacityObj).length > 0 ? capacityObj : undefined,
            availability: parseIfJson(availability),
            difficulty: difficulty || undefined,
            categories: parseIfJson(categories) || [],
            isFeatured: isFeatured === 'true' || isFeatured === true || false
        })

        return res.status(201).json({ 
            success: true, 
            message: "Experience created successfully",
            experience 
        })
    } catch (error) {
        console.error("Create experience error:", error)
        console.error("Error stack:", error.stack)
        return res.status(500).json({ 
            success: false, 
            message: "Error creating experience",
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
    }
})

// GET ALL EXPERIENCES - Automatically filtered to postType: "experience"
postRouter.get("/experiences", async(req, res) => {
    try {
        const { 
            city, country, state,
            minPrice, maxPrice, status,
            difficulty, categories, isFeatured,
            page = 1, limit = 20 
        } = req.query

        // Build filter query with automatic experience filter
        const filter = { 
            postType: 'experience',  // Automatically filter for experiences only
            status: status || 'active'
        }
        
        if (city) filter['location.city'] = new RegExp(city, 'i')
        if (state) filter['location.state'] = new RegExp(state, 'i')
        if (country) filter['location.country'] = new RegExp(country, 'i')
        if (difficulty) filter.difficulty = difficulty
        if (categories) filter.categories = { $in: categories.split(',') }
        if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true'

        // Price range filter
        if (minPrice || maxPrice) {
            filter['price.perPerson'] = {}
            if (minPrice) filter['price.perPerson'].$gte = Number(minPrice)
            if (maxPrice) filter['price.perPerson'].$lte = Number(maxPrice)
        }

        const skip = (Number(page) - 1) * Number(limit)
        
        const experiences = await Post.find(filter)
            .populate('user', 'firstname lastname email role')
            .sort({ isFeatured: -1, createdAt: -1 })
            .limit(Number(limit))
            .skip(skip)

        const total = await Post.countDocuments(filter)

        return res.status(200).json({ 
            success: true,
            count: experiences.length,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            experiences 
        })
    } catch (error) {
        console.error("Get experiences error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching experiences" 
        })
    }
})

// GET FEATURED EXPERIENCES
postRouter.get("/experiences/featured/list", async(req, res) => {
    try {
        const { limit = 10 } = req.query

        const experiences = await Post.find({ 
            postType: 'experience',
            isFeatured: true,
            status: 'active'
        })
        .populate('user', 'firstname lastname email role')
        .sort({ createdAt: -1 })
        .limit(Number(limit))

        return res.status(200).json({ 
            success: true,
            count: experiences.length,
            experiences 
        })
    } catch (error) {
        console.error("Get featured experiences error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching featured experiences" 
        })
    }
})

// GET MY EXPERIENCES - Experiences posted by logged-in user
postRouter.get("/experiences/my/list", checkAuth, async(req, res) => {
    try {
        const experiences = await Post.find({ 
            user: req.user.userId,
            postType: 'experience'
        }).sort({ createdAt: -1 })

        return res.status(200).json({ 
            success: true,
            count: experiences.length,
            experiences 
        })
    } catch (error) {
        console.error("Get my experiences error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching your experiences" 
        })
    }
})

// GET EXPERIENCES BY USER ID
postRouter.get("/experiences/user/:userId", async(req, res) => {
    try {
        const experiences = await Post.find({
            user: req.params.userId,
            postType: 'experience',
            status: 'active'
        })
        .populate('user', 'firstname lastname email role')
        .sort({ createdAt: -1 })

        return res.status(200).json({ 
            success: true,
            count: experiences.length,
            experiences 
        })
    } catch (error) {
        console.error("Get user experiences error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching user experiences" 
        })
    }
})

// GET SINGLE EXPERIENCE BY ID - Must come AFTER specific routes
postRouter.get("/experiences/:id", async(req, res) => {
    try {
        const experience = await Post.findOne({
            _id: req.params.id,
            postType: 'experience'  // Ensure it's an experience
        }).populate('user', 'firstname lastname email role')

        if (!experience) {
            return res.status(404).json({ 
                success: false, 
                message: "Experience not found" 
            })
        }

        return res.status(200).json({ 
            success: true, 
            experience 
        })
    } catch (error) {
        console.error("Get experience error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching experience" 
        })
    }
})

// GET EXPERIENCES BY USER ID - Public
postRouter.get("/experiences/user/:userId", async(req, res) => {
    try {
        const experiences = await Post.find({
            user: req.params.userId,
            postType: 'experience',
            status: 'active'
        })
        .populate('user', 'firstname lastname email role')
        .sort({ createdAt: -1 })

        return res.status(200).json({ 
            success: true,
            count: experiences.length,
            experiences 
        })
    } catch (error) {
        console.error("Get user experiences error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching user experiences" 
        })
    }
})

// UPDATE EXPERIENCE - Only owner can update
postRouter.put("/experiences/:id", checkAuth, async(req, res) => {
    try {
        const experience = await Post.findOne({
            _id: req.params.id,
            postType: 'experience'
        })

        if (!experience) {
            return res.status(404).json({ 
                success: false, 
                message: "Experience not found" 
            })
        }

        // Check ownership
        if (experience.user.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: "You can only update your own experiences" 
            })
        }

        const { 
            title, description, location, price, amenities,
            capacity, availability, categories, isFeatured, status,
            difficulty, duration
        } = req.body

        const parseIfJson = (value) => {
            if (!value) return undefined
            if (typeof value === 'object') return value
            try {
                if (typeof value === 'string' && (value.trim().startsWith('{') || value.trim().startsWith('['))) {
                    return JSON.parse(value)
                }
            } catch (e) {}
            return value
        }

        // Update fields
        if (title) experience.title = title
        if (description) experience.description = description
        if (location) experience.location = { ...experience.location, ...parseIfJson(location) }
        if (price) experience.price = { ...experience.price, ...parseIfJson(price) }
        if (amenities) experience.amenities = parseIfJson(amenities)
        if (capacity) experience.capacity = { ...experience.capacity, ...parseIfJson(capacity) }
        if (availability) experience.availability = { ...experience.availability, ...parseIfJson(availability) }
        if (categories) experience.categories = parseIfJson(categories)
        if (difficulty) experience.difficulty = difficulty
        if (duration) experience.duration = parseIfJson(duration)
        if (status) experience.status = status
        if (isFeatured !== undefined) experience.isFeatured = isFeatured === 'true' || isFeatured === true

        await experience.save()

        return res.status(200).json({ 
            success: true,
            message: "Experience updated successfully",
            experience 
        })
    } catch (error) {
        console.error("Update experience error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error updating experience" 
        })
    }
})

// DELETE EXPERIENCE - Only owner or admin can delete
postRouter.delete("/experiences/:id", checkAuth, async(req, res) => {
    try {
        const experience = await Post.findOne({
            _id: req.params.id,
            postType: 'experience'
        })

        if (!experience) {
            return res.status(404).json({ 
                success: false, 
                message: "Experience not found" 
            })
        }

        // Check ownership
        if (experience.user.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: "You can only delete your own experiences" 
            })
        }

        // Delete photos and videos from Cloudinary
        if (experience.photos && experience.photos.length > 0) {
            for (const photo of experience.photos) {
                if (photo.public_id) {
                    await cloudinary.uploader.destroy(photo.public_id)
                }
            }
        }
        if (experience.videos && experience.videos.length > 0) {
            for (const video of experience.videos) {
                if (video.public_id) {
                    await cloudinary.uploader.destroy(video.public_id, { resource_type: 'video' })
                }
            }
        }

        await Post.findByIdAndDelete(req.params.id)

        return res.status(200).json({ 
            success: true, 
            message: "Experience deleted successfully" 
        })
    } catch (error) {
        console.error("Delete experience error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error deleting experience" 
        })
    }
})

// ==================== DEDICATED SERVICE ENDPOINTS ====================
// These endpoints automatically set postType to "service" for simplified API usage

// CREATE SERVICE - Dedicated endpoint for host services
postRouter.post("/services", checkAuth, upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "videos", maxCount: 5 }
]), handleMulterError, async(req, res) => {
    try {
        // Only hosts can create services
        if (req.user.role !== 'host') {
            return res.status(403).json({
                success: false,
                message: "Only hosts can create services"
            });
        }

        const { 
            title, description, location, 
            price, amenities, capacity, availability,
            priceTotal, pricePerPerson, maxPeople,
            categories, isFeatured, duration,
            city, state, country, meetingPoint,
            days, nights, period
        } = req.body

        // Helper to parse JSON fields
        const parseIfJson = (value) => {
            if (!value) return undefined
            if (typeof value === 'object') return value
            try {
                if (typeof value === 'string' && (value.trim().startsWith('{') || value.trim().startsWith('['))) {
                    return JSON.parse(value)
                }
            } catch (e) {
                // not JSON, return as-is
            }
            return value
        }

        const parsedPrice = parseIfJson(price)
        const parsedCapacity = parseIfJson(capacity)
        const parsedLocation = parseIfJson(location)

        // Handle file uploads
        const uploadToCloudinary = (file, resourceType) => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({ resource_type: resourceType }, (error, result) => {
                    if (error) {
                        console.error(`Cloudinary upload error [${resourceType}]:`, error);
                        return reject(error);
                    }
                    if (!result) {
                        console.error(`Cloudinary upload result is undefined for [${resourceType}] file.`);
                        return reject(new Error('No result from Cloudinary'));
                    }
                    resolve(result);
                }).end(file.buffer);
            });
        };

        let photoUrls = [];
        let videoUrls = [];
        if (req.files && req.files["photos"]) {
            for (const file of req.files["photos"]) {
                const result = await uploadToCloudinary(file, "image");
                photoUrls.push({ 
                    url: result.secure_url, 
                    public_id: result.public_id, 
                    resource_type: result.resource_type || 'image' 
                });
            }
        }
        if (req.files && req.files["videos"]) {
            for (const file of req.files["videos"]) {
                const result = await uploadToCloudinary(file, "video");
                videoUrls.push({ 
                    url: result.secure_url, 
                    public_id: result.public_id, 
                    resource_type: result.resource_type || 'video' 
                });
            }
        }

        // Validation
        if (!title || !description) {
            return res.status(400).json({ 
                success: false, 
                message: "Title and description are required" 
            })
        }

        // Build location object
        const locationObj = parsedLocation || {}
        if (city) locationObj.city = city
        if (state) locationObj.state = state
        if (country) locationObj.country = country
        if (meetingPoint) locationObj.meetingPoint = meetingPoint

        // Build price object
        const priceObj = {
            ...(parsedPrice || {}),
        }
        if (priceTotal) priceObj.total = Number(priceTotal)
        if (pricePerPerson) priceObj.perPerson = Number(pricePerPerson)
        if (period) priceObj.period = period

        // Build capacity object
        const capacityObj = {
            ...(parsedCapacity || {}),
        }
        if (maxPeople) capacityObj.maxPeople = Number(maxPeople)

        // Build duration object
        const durationObj = parseIfJson(duration) || {}
        if (days) durationObj.days = Number(days)
        if (nights) durationObj.nights = Number(nights)

        // Create service post with automatic postType: "service"
        const service = await Post.create({
            user: req.user.userId,
            userRole: req.user.role,
            postType: 'service',  // Automatically set to service
            title,
            description,
            photos: photoUrls,
            videos: videoUrls,
            location: locationObj,
            price: priceObj,
            duration: durationObj,
            amenities: parseIfJson(amenities) || [],
            capacity: capacityObj,
            availability: parseIfJson(availability) || {},
            categories: parseIfJson(categories) || [],
            isFeatured: isFeatured === 'true' || isFeatured === true || false
        })

        return res.status(201).json({ 
            success: true, 
            message: "Service created successfully",
            service 
        })
    } catch (error) {
        console.error("Create service error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error creating service",
            error: error.message 
        })
    }
})

// GET ALL SERVICES - Automatically filtered to postType: "service"
postRouter.get("/services", async(req, res) => {
    try {
        const { 
            city, country, state,
            minPrice, maxPrice, status,
            categories, isFeatured,
            page = 1, limit = 20 
        } = req.query

        // Build filter query with automatic service filter
        const filter = { 
            postType: 'service',  // Automatically filter for services only
            status: status || 'active'
        }
        
        if (city) filter['location.city'] = new RegExp(city, 'i')
        if (state) filter['location.state'] = new RegExp(state, 'i')
        if (country) filter['location.country'] = new RegExp(country, 'i')
        if (categories) filter.categories = { $in: categories.split(',') }
        if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true'

        // Price range filter
        if (minPrice || maxPrice) {
            filter['price.perPerson'] = {}
            if (minPrice) filter['price.perPerson'].$gte = Number(minPrice)
            if (maxPrice) filter['price.perPerson'].$lte = Number(maxPrice)
        }

        const skip = (Number(page) - 1) * Number(limit)
        
        const services = await Post.find(filter)
            .populate('user', 'firstname lastname email role')
            .sort({ isFeatured: -1, createdAt: -1 })
            .limit(Number(limit))
            .skip(skip)

        const total = await Post.countDocuments(filter)

        return res.status(200).json({ 
            success: true,
            count: services.length,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            services 
        })
    } catch (error) {
        console.error("Get services error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching services" 
        })
    }
})

// GET SINGLE SERVICE BY ID
postRouter.get("/services/:id", async(req, res) => {
    try {
        const service = await Post.findOne({
            _id: req.params.id,
            postType: 'service'  // Ensure it's a service
        }).populate('user', 'firstname lastname email role')

        if (!service) {
            return res.status(404).json({ 
                success: false, 
                message: "Service not found" 
            })
        }

        return res.status(200).json({ 
            success: true, 
            service 
        })
    } catch (error) {
        console.error("Get service error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching service" 
        })
    }
})

// GET FEATURED SERVICES
postRouter.get("/services/featured/list", async(req, res) => {
    try {
        const { limit = 10 } = req.query

        const services = await Post.find({ 
            postType: 'service',
            isFeatured: true,
            status: 'active'
        })
        .populate('user', 'firstname lastname email role')
        .sort({ createdAt: -1 })
        .limit(Number(limit))

        return res.status(200).json({ 
            success: true,
            count: services.length,
            services 
        })
    } catch (error) {
        console.error("Get featured services error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching featured services" 
        })
    }
})

// GET MY SERVICES - Services posted by logged-in host
postRouter.get("/services/my/list", checkAuth, async(req, res) => {
    try {
        if (req.user.role !== 'host') {
            return res.status(403).json({
                success: false,
                message: "Only hosts can access this endpoint"
            });
        }

        const services = await Post.find({ 
            user: req.user.userId,
            postType: 'service'
        }).sort({ createdAt: -1 })

        return res.status(200).json({ 
            success: true,
            count: services.length,
            services 
        })
    } catch (error) {
        console.error("Get my services error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching your services" 
        })
    }
})

// GET SERVICES BY HOST/USER ID
postRouter.get("/services/host/:userId", async(req, res) => {
    try {
        const services = await Post.find({
            user: req.params.userId,
            postType: 'service',
            status: 'active'
        })
        .populate('user', 'firstname lastname email role')
        .sort({ createdAt: -1 })

        return res.status(200).json({ 
            success: true,
            count: services.length,
            services 
        })
    } catch (error) {
        console.error("Get host services error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching host services" 
        })
    }
})

// UPDATE SERVICE - Only owner can update
postRouter.put("/services/:id", checkAuth, async(req, res) => {
    try {
        const service = await Post.findOne({
            _id: req.params.id,
            postType: 'service'
        })

        if (!service) {
            return res.status(404).json({ 
                success: false, 
                message: "Service not found" 
            })
        }

        // Check ownership
        if (service.user.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: "You can only update your own services" 
            })
        }

        const allowedUpdates = [
            'title', 'description', 'location', 'price', 'amenities',
            'capacity', 'availability', 'categories', 'isFeatured', 'status'
        ]

        const updates = {}
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key]
            }
        })

        const updatedService = await Post.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('user', 'firstname lastname email role')

        return res.status(200).json({ 
            success: true,
            message: "Service updated successfully",
            service: updatedService 
        })
    } catch (error) {
        console.error("Update service error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error updating service" 
        })
    }
})

// DELETE SERVICE - Only owner or admin can delete
postRouter.delete("/services/:id", checkAuth, async(req, res) => {
    try {
        const service = await Post.findOne({
            _id: req.params.id,
            postType: 'service'
        })

        if (!service) {
            return res.status(404).json({ 
                success: false, 
                message: "Service not found" 
            })
        }

        // Check ownership
        if (service.user.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: "You can only delete your own services" 
            })
        }

        // Delete photos and videos from Cloudinary
        if (service.photos && service.photos.length > 0) {
            for (const photo of service.photos) {
                if (photo.public_id) {
                    await cloudinary.uploader.destroy(photo.public_id)
                }
            }
        }
        if (service.videos && service.videos.length > 0) {
            for (const video of service.videos) {
                if (video.public_id) {
                    await cloudinary.uploader.destroy(video.public_id, { resource_type: 'video' })
                }
            }
        }

        await Post.findByIdAndDelete(req.params.id)

        return res.status(200).json({ 
            success: true, 
            message: "Service deleted successfully" 
        })
    } catch (error) {
        console.error("Delete service error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error deleting service" 
        })
    }
})

// ==================== DEDICATED TREK ENDPOINTS ====================
// These endpoints automatically set postType to "trek" for simplified API usage

// CREATE TREK - Dedicated endpoint for treks (Host only)
postRouter.post("/treks", checkAuth, upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "videos", maxCount: 5 }
]), handleMulterError, async(req, res) => {
    try {
        // Only hosts can create treks
        if (req.user.role !== 'host' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Only hosts can create treks"
            })
        }

        const { 
            title, description, location, 
            pricePerPerson, maxPeople,
            duration, difficulty, categories, isFeatured,
            amenities, availability
        } = req.body

        // helper to parse JSON fields sent as strings in form-data
        const parseIfJson = (value) => {
            if (!value) return undefined
            if (typeof value === 'object') return value
            try {
                if (typeof value === 'string' && (value.trim().startsWith('{') || value.trim().startsWith('['))) {
                    return JSON.parse(value)
                }
            } catch (e) {
                return value
            }
            return value
        }

        // Validation
        if (!title || !description) {
            return res.status(400).json({ 
                success: false, 
                message: "Title and description are required" 
            })
        }

        if (!pricePerPerson) {
            return res.status(400).json({ 
                success: false, 
                message: "Price per person is required for treks" 
            })
        }

        if (!duration) {
            return res.status(400).json({ 
                success: false, 
                message: "Duration (days and nights) is required for treks" 
            })
        }

        // Handle file uploads
        const uploadToCloudinary = (file, resourceType) => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({ resource_type: resourceType }, (error, result) => {
                    if (error) {
                        console.error(`Cloudinary upload error [${resourceType}]:`, error)
                        return reject(error)
                    }
                    if (!result) {
                        console.error(`Cloudinary upload result is undefined for [${resourceType}] file.`)
                        return reject(new Error('No result from Cloudinary'))
                    }
                    resolve(result)
                }).end(file.buffer)
            })
        }

        let photoUrls = []
        let videoUrls = []
        if (req.files && req.files["photos"]) {
            for (const file of req.files["photos"]) {
                const result = await uploadToCloudinary(file, "image")
                photoUrls.push({ url: result.secure_url, public_id: result.public_id, resource_type: result.resource_type || 'image' })
            }
        }
        if (req.files && req.files["videos"]) {
            for (const file of req.files["videos"]) {
                const result = await uploadToCloudinary(file, "video")
                videoUrls.push({ url: result.secure_url, public_id: result.public_id, resource_type: result.resource_type || 'video' })
            }
        }

        const trek = await Post.create({
            user: req.user.userId,
            userRole: req.user.role,
            postType: 'trek',
            title,
            description,
            photos: photoUrls,
            videos: videoUrls,
            location: parseIfJson(location) || {},
            price: {
                perPerson: Number(pricePerPerson),
                currency: 'INR'
            },
            capacity: {
                maxPeople: maxPeople ? Number(maxPeople) : undefined
            },
            amenities: parseIfJson(amenities) || [],
            availability: parseIfJson(availability) || {},
            duration: parseIfJson(duration),
            difficulty: difficulty || undefined,
            categories: parseIfJson(categories) || [],
            isFeatured: isFeatured === 'true' || isFeatured === true || false
        })

        return res.status(201).json({ 
            success: true, 
            message: "Trek created successfully",
            trek 
        })
    } catch (error) {
        console.error("Create trek error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error creating trek",
            error: error.message 
        })
    }
})

// GET ALL TREKS - Public with filtering (same as /api/posts/treks but cleaner endpoint)
postRouter.get("/treks", async(req, res) => {
    try {
        const { 
            city, country, state,
            minPrice, maxPrice, 
            difficulty, categories,
            minDays, maxDays,
            isFeatured,
            sortBy = 'createdAt',
            order = 'desc',
            page = 1, 
            limit = 20 
        } = req.query

        // Build filter query
        const filter = { postType: 'trek', status: 'active' }
        
        // Location filters
        if (city) filter['location.city'] = new RegExp(city, 'i')
        if (state) filter['location.state'] = new RegExp(state, 'i')
        if (country) filter['location.country'] = new RegExp(country, 'i')
        
        // Price range filter
        if (minPrice || maxPrice) {
            filter['price.perPerson'] = {}
            if (minPrice) filter['price.perPerson'].$gte = Number(minPrice)
            if (maxPrice) filter['price.perPerson'].$lte = Number(maxPrice)
        }
        
        // Duration filter (days)
        if (minDays || maxDays) {
            filter['duration.days'] = {}
            if (minDays) filter['duration.days'].$gte = Number(minDays)
            if (maxDays) filter['duration.days'].$lte = Number(maxDays)
        }
        
        // Trek-specific filters
        if (difficulty) filter.difficulty = difficulty
        if (categories) filter.categories = { $in: categories.split(',') }
        if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true'

        // Build sort object
        const sortOrder = order === 'asc' ? 1 : -1
        const sortOptions = {}
        
        // Valid sort fields
        const validSortFields = ['createdAt', 'price.perPerson', 'duration.days', 'difficulty', 'title']
        if (validSortFields.includes(sortBy)) {
            sortOptions[sortBy] = sortOrder
        } else {
            sortOptions.createdAt = -1
        }
        
        // Add secondary sort by isFeatured and createdAt
        if (sortBy !== 'createdAt') {
            sortOptions.isFeatured = -1
            sortOptions.createdAt = -1
        }

        const skip = (Number(page) - 1) * Number(limit)
        
        const treks = await Post.find(filter)
            .populate('user', 'firstname lastname email role')
            .sort(sortOptions)
            .limit(Number(limit))
            .skip(skip)

        const total = await Post.countDocuments(filter)

        return res.status(200).json({ 
            success: true,
            count: treks.length,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            treks 
        })
    } catch (error) {
        console.error("Get treks error:", error)
        return res.status(500).json({ success: false, message: "Error fetching treks" })
    }
})

// GET SINGLE TREK BY ID - Public
postRouter.get("/treks/:id", async(req, res) => {
    try {
        const trek = await Post.findOne({ _id: req.params.id, postType: 'trek' })
            .populate('user', 'firstname lastname email role')

        if (!trek) {
            return res.status(404).json({ success: false, message: "Trek not found" })
        }

        return res.status(200).json({ success: true, trek })
    } catch (error) {
        console.error("Get trek error:", error)
        return res.status(500).json({ success: false, message: "Error fetching trek" })
    }
})

// UPDATE TREK - Only trek owner
postRouter.put("/treks/:id", checkAuth, async(req, res) => {
    try {
        const trek = await Post.findOne({ _id: req.params.id, postType: 'trek' })

        if (!trek) {
            return res.status(404).json({ success: false, message: "Trek not found" })
        }

        // Check if user is the owner
        if (trek.user.toString() !== req.user.userId) {
            return res.status(403).json({ 
                success: false, 
                message: "You can only edit your own treks" 
            })
        }

        const { 
            title, description, location, 
            pricePerPerson, maxPeople,
            duration, difficulty, categories, isFeatured,
            amenities, availability, status
        } = req.body

        const parseIfJson = (value) => {
            if (!value) return undefined
            if (typeof value === 'object') return value
            try {
                if (typeof value === 'string' && (value.trim().startsWith('{') || value.trim().startsWith('['))) {
                    return JSON.parse(value)
                }
            } catch (e) {}
            return value
        }

        // Update fields
        if (title) trek.title = title
        if (description) trek.description = description
        if (location) trek.location = { ...trek.location, ...parseIfJson(location) }
        
        // Update price
        if (pricePerPerson) {
            trek.price = { ...trek.price, perPerson: Number(pricePerPerson) }
        }
        
        // Update capacity
        if (maxPeople) {
            trek.capacity = { ...trek.capacity, maxPeople: Number(maxPeople) }
        }

        if (amenities) trek.amenities = parseIfJson(amenities)
        if (availability) trek.availability = { ...trek.availability, ...parseIfJson(availability) }
        if (status) trek.status = status
        
        // Update trek-specific fields
        if (duration) trek.duration = parseIfJson(duration)
        if (difficulty) trek.difficulty = difficulty
        if (categories) trek.categories = parseIfJson(categories)
        if (isFeatured !== undefined) trek.isFeatured = isFeatured === 'true' || isFeatured === true

        await trek.save()

        return res.status(200).json({ 
            success: true, 
            message: "Trek updated successfully",
            trek 
        })
    } catch (error) {
        console.error("Update trek error:", error)
        return res.status(500).json({ success: false, message: "Error updating trek" })
    }
})

// DELETE TREK - Only trek owner
postRouter.delete("/treks/:id", checkAuth, async(req, res) => {
    try {
        const trek = await Post.findOne({ _id: req.params.id, postType: 'trek' })

        if (!trek) {
            return res.status(404).json({ success: false, message: "Trek not found" })
        }

        // Check if user is the owner
        if (trek.user.toString() !== req.user.userId) {
            return res.status(403).json({ 
                success: false, 
                message: "You can only delete your own treks" 
            })
        }

        // Delete associated Cloudinary assets
        const deleteFromCloudinary = (publicId, resourceType = 'image') => {
            return new Promise((resolve) => {
                if (!publicId) return resolve()
                cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (err, result) => {
                    if (err) console.error(`Cloudinary destroy error for ${publicId}:`, err)
                    else console.log(`Cloudinary destroy result for ${publicId}:`, result)
                    resolve()
                })
            })
        }

        const assets = []
        if (Array.isArray(trek.photos)) assets.push(...trek.photos)
        if (Array.isArray(trek.videos)) assets.push(...trek.videos)

        for (const asset of assets) {
            const publicId = asset && (asset.public_id || asset.publicId || null)
            const resourceType = asset && (asset.resource_type || 'image')
            if (publicId) {
                await deleteFromCloudinary(publicId, resourceType)
            }
        }

        await Post.findByIdAndDelete(req.params.id)

        return res.status(200).json({ 
            success: true, 
            message: "Trek deleted successfully" 
        })
    } catch (error) {
        console.error("Delete trek error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error deleting trek" 
        })
    }
})

// GET SINGLE POST BY ID - Public
// IMPORTANT: This route must be at the END to avoid catching specific routes
postRouter.get("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'firstname lastname email role')

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" })
        }

        return res.status(200).json({ success: true, post })
    } catch (error) {
        console.error("Get post error:", error)
        return res.status(500).json({ success: false, message: "Error fetching post" })
    }
})

module.exports = postRouter
