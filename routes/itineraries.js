const express = require("express")
const { Post, User } = require("../db/mongoose")
const { checkAuth } = require("../middleware/checkRole")
const cloudinary = require("../utils/cloudinary")
const multer = require("multer")
const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB
    }
})
const itineraryRouter = express.Router()

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

// CREATE ITINERARY/PLAN - Only authenticated users (guests can share their trip plans)
itineraryRouter.post("/", checkAuth, upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "videos", maxCount: 5 }
]), handleMulterError, async (req, res) => {
    console.log('=== DEBUG: req.body ===', req.body);
    console.log('=== DEBUG: req.files ===', req.files);
    console.log('=== DEBUG: req.headers[content-type] ===', req.headers['content-type']);

    try {
        // Ensure req.body exists and has required fields
        const title = req.body?.title;
        const subtitle = req.body?.subtitle;
        const description = req.body?.description;
        const location = req.body?.location;
        const price = req.body?.price;
        const capacity = req.body?.capacity;
        const planName = req.body?.planName;
        const priceTotal = req.body?.priceTotal;
        const pricePerPerson = req.body?.pricePerPerson;
        const maxPeople = req.body?.maxPeople;
        const duration = req.body?.duration;
        const difficulty = req.body?.difficulty;
        const categories = req.body?.categories;
        const tags = req.body?.tags;
        const amenities = req.body?.amenities;
        const availability = req.body?.availability;

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

        const parsedLocation = parseIfJson(location)
        const parsedDuration = parseIfJson(duration)
        const parsedPrice = parseIfJson(price)
        const parsedCapacity = parseIfJson(capacity)
        const parsedTags = parseIfJson(tags)
        const parsedAmenities = parseIfJson(amenities)
        const parsedAvailability = parseIfJson(availability)

        // Validation
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required"
            })
        }

        // Handle file uploads to Cloudinary
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
                photoUrls.push({ url: result.secure_url, public_id: result.public_id, resource_type: result.resource_type || 'image' });
            }
        }
        if (req.files && req.files["videos"]) {
            for (const file of req.files["videos"]) {
                const result = await uploadToCloudinary(file, "video");
                videoUrls.push({ url: result.secure_url, public_id: result.public_id, resource_type: result.resource_type || 'video' });
            }
        }

        // Build price and capacity objects
        const priceObj = {}
        if (parsedPrice?.perPerson) priceObj.perPerson = Number(parsedPrice.perPerson)
        else if (pricePerPerson) priceObj.perPerson = Number(pricePerPerson)
        if (priceTotal) priceObj.total = Number(priceTotal)

        const capacityObj = {}
        if (parsedCapacity?.maxPeople) capacityObj.maxPeople = Number(parsedCapacity.maxPeople)
        else if (maxPeople) capacityObj.maxPeople = Number(maxPeople)

        const itinerary = await Post.create({
            user: req.user.userId,
            userRole: req.user.role,
            postType: 'plan',
            title,
            subtitle,
            description,
            location: parsedLocation || {},
            plan: planName ? { name: planName } : undefined,
            price: priceObj,
            capacity: capacityObj,
            tags: parsedTags || [],
            amenities: parsedAmenities || [],
            availability: parsedAvailability || {},
            duration: parsedDuration || undefined,
            difficulty: difficulty || undefined,
            categories: parseIfJson(categories) || [],
            photos: photoUrls,
            videos: videoUrls
        })

        return res.status(201).json({
            success: true,
            message: "Itinerary created successfully",
            itinerary
        })
    } catch (error) {
        console.error("Create itinerary error:", error)
        return res.status(500).json({
            success: false,
            message: "Error creating itinerary",
            error: error.message
        })
    }
})

// GET ALL ITINERARIES - Public (with filtering)
itineraryRouter.get("/", async (req, res) => {
    try {
        const {
            city, country, state,
            minPrice, maxPrice, tags,
            difficulty, categories,
            page = 1, limit = 20
        } = req.query

        // Build filter query - only for plan postType
        const filter = { postType: 'plan', status: 'active' }

        if (city) filter['location.city'] = new RegExp(city, 'i')
        if (state) filter['location.state'] = new RegExp(state, 'i')
        if (country) filter['location.country'] = new RegExp(country, 'i')
        if (tags) filter.tags = { $in: tags.split(',') }

        if (difficulty) filter.difficulty = difficulty
        if (categories) filter.categories = { $in: categories.split(',') }

        // Price range filter
        if (minPrice || maxPrice) {
            filter['price.perPerson'] = {}
            if (minPrice) filter['price.perPerson'].$gte = Number(minPrice)
            if (maxPrice) filter['price.perPerson'].$lte = Number(maxPrice)
        }

        const skip = (Number(page) - 1) * Number(limit)

        const itineraries = await Post.find(filter)
            .populate('user', 'firstname lastname email role avatar')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip)

        const total = await Post.countDocuments(filter)

        return res.status(200).json({
            success: true,
            count: itineraries.length,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            itineraries
        })
    } catch (error) {
        console.error("Get itineraries error:", error)
        return res.status(500).json({ success: false, message: "Error fetching itineraries" })
    }
})

// GET SINGLE ITINERARY BY ID - Public
itineraryRouter.get("/:id", async (req, res) => {
    try {
        const itinerary = await Post.findById(req.params.id)
            .populate('user', 'firstname lastname email role avatar')

        if (!itinerary) {
            return res.status(404).json({ success: false, message: "Itinerary not found" })
        }

        if (itinerary.postType !== 'plan') {
            return res.status(400).json({ success: false, message: "This is not an itinerary" })
        }

        return res.status(200).json({ success: true, itinerary })
    } catch (error) {
        console.error("Get itinerary error:", error)
        return res.status(500).json({ success: false, message: "Error fetching itinerary" })
    }
})

// GET USER'S ITINERARIES - Public (view anyone's itineraries)
itineraryRouter.get("/user/:userId", async (req, res) => {
    try {
        const itineraries = await Post.find({
            user: req.params.userId,
            postType: 'plan'
        })
            .populate('user', 'firstname lastname email role avatar')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            count: itineraries.length,
            itineraries
        })
    } catch (error) {
        console.error("Get user itineraries error:", error)
        return res.status(500).json({ success: false, message: "Error fetching user itineraries" })
    }
})

// GET MY ITINERARIES - Authenticated user's own itineraries
itineraryRouter.get("/my/itineraries", checkAuth, async (req, res) => {
    try {
        const itineraries = await Post.find({
            user: req.user.userId,
            postType: 'plan'
        })
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            count: itineraries.length,
            itineraries
        })
    } catch (error) {
        console.error("Get my itineraries error:", error)
        return res.status(500).json({ success: false, message: "Error fetching your itineraries" })
    }
})

// UPDATE ITINERARY - Only itinerary owner
itineraryRouter.put("/:id", checkAuth, upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "videos", maxCount: 5 }
]), handleMulterError, async (req, res) => {
    try {
        const itinerary = await Post.findById(req.params.id)

        if (!itinerary) {
            return res.status(404).json({ success: false, message: "Itinerary not found" })
        }

        if (itinerary.postType !== 'plan') {
            return res.status(400).json({ success: false, message: "This is not an itinerary" })
        }

        // Check if user is the owner
        if (itinerary.user.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only edit your own itineraries"
            })
        }

        const {
            title, subtitle, description, location,
            planName, priceTotal, pricePerPerson, maxPeople,
            duration, difficulty, tags, status, categories, availability,
            existingPhotos: existingPhotosStr,
            existingVideos: existingVideosStr
        } = req.body

        // helper to parse JSON fields
        const parseIfJson = (value) => {
            if (!value) return undefined
            if (typeof value === 'object') return value
            try {
                if (typeof value === 'string' && (value.trim().startsWith('{') || value.trim().startsWith('['))) {
                    return JSON.parse(value)
                }
            } catch (e) { }
            return value
        }

        const parsedLocation = parseIfJson(location)
        const parsedPrice = parseIfJson(priceTotal || pricePerPerson) ? null : {} // just for structure
        const parsedDuration = parseIfJson(duration)
        const parsedCapacity = parseIfJson(maxPeople) ? null : {}
        const parsedTags = parseIfJson(tags)
        const parsedCategories = parseIfJson(categories)
        const parsedAvailability = parseIfJson(availability)
        const existingPhotos = parseIfJson(existingPhotosStr) || []
        const existingVideos = parseIfJson(existingVideosStr) || []

        // Cloudinary cleanup for removed photos
        const currentPhotoIds = existingPhotos.map(p => p.public_id).filter(id => id)
        for (const photo of (itinerary.photos || [])) {
            if (photo.public_id && !currentPhotoIds.includes(photo.public_id)) {
                try {
                    await cloudinary.uploader.destroy(photo.public_id)
                } catch (err) {
                    console.error("Cloudinary photo delete error during update:", err)
                }
            }
        }

        // Cloudinary cleanup for removed videos
        const currentVideoIds = existingVideos.map(v => v.public_id).filter(id => id)
        for (const video of (itinerary.videos || [])) {
            if (video.public_id && !currentVideoIds.includes(video.public_id)) {
                try {
                    await cloudinary.uploader.destroy(video.public_id, { resource_type: 'video' })
                } catch (err) {
                    console.error("Cloudinary video delete error during update:", err)
                }
            }
        }

        // Upload new files
        const uploadToCloudinary = (file, resourceType) => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({ resource_type: resourceType }, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }).end(file.buffer);
            });
        };

        let newPhotos = []
        if (req.files && req.files["photos"]) {
            for (const file of req.files["photos"]) {
                const result = await uploadToCloudinary(file, "image");
                newPhotos.push({ url: result.secure_url, public_id: result.public_id, resource_type: result.resource_type || 'image' });
            }
        }

        let newVideos = []
        if (req.files && req.files["videos"]) {
            for (const file of req.files["videos"]) {
                const result = await uploadToCloudinary(file, "video");
                newVideos.push({ url: result.secure_url, public_id: result.public_id, resource_type: result.resource_type || 'video' });
            }
        }

        // Update fields
        if (title) itinerary.title = title
        if (subtitle) itinerary.subtitle = subtitle
        if (description) itinerary.description = description

        itinerary.photos = [...existingPhotos, ...newPhotos]
        itinerary.videos = [...existingVideos, ...newVideos]

        if (parsedLocation) itinerary.location = { ...itinerary.location, ...parsedLocation }

        // update price
        if (priceTotal || pricePerPerson) {
            itinerary.price = { ...itinerary.price }
            if (priceTotal) itinerary.price.total = Number(priceTotal)
            if (pricePerPerson) itinerary.price.perPerson = Number(pricePerPerson)
        }

        // update capacity
        if (maxPeople) {
            itinerary.capacity = { ...itinerary.capacity }
            itinerary.capacity.maxPeople = Number(maxPeople)
        }

        // update plan name
        if (planName) {
            itinerary.plan = { ...(itinerary.plan || {}), name: planName }
        }

        if (parsedTags) itinerary.tags = parsedTags
        if (parsedCategories) itinerary.categories = parsedCategories
        if (parsedAvailability) itinerary.availability = parsedAvailability
        if (status) itinerary.status = status

        // Update itinerary-specific fields
        if (parsedDuration) itinerary.duration = parsedDuration
        if (difficulty) itinerary.difficulty = difficulty

        await itinerary.save()

        return res.status(200).json({
            success: true,
            message: "Itinerary updated successfully",
            itinerary
        })
    } catch (error) {
        console.error("Update itinerary error:", error)
        return res.status(500).json({ success: false, message: "Error updating itinerary", error: error.message })
    }
})

// DELETE ITINERARY - Only itinerary owner
itineraryRouter.delete("/:id", checkAuth, async (req, res) => {
    try {
        const itinerary = await Post.findById(req.params.id)

        if (!itinerary) {
            return res.status(404).json({ success: false, message: "Itinerary not found" })
        }

        if (itinerary.postType !== 'plan') {
            return res.status(400).json({ success: false, message: "This is not an itinerary" })
        }

        // Check if user is the owner
        if (itinerary.user.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own itineraries"
            })
        }

        await Post.findByIdAndDelete(req.params.id)

        return res.status(200).json({
            success: true,
            message: "Itinerary deleted successfully"
        })
    } catch (error) {
        console.error("Delete itinerary error:", error)
        return res.status(500).json({ success: false, message: "Error deleting itinerary" })
    }
})

// TOGGLE REACTION ON ITINERARY - Authenticated users
itineraryRouter.put("/:id/react", checkAuth, async (req, res) => {
    try {
        const { emoji } = req.body

        // Validate emoji input
        if (!emoji || typeof emoji !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: "Valid emoji is required" 
            })
        }

        const itinerary = await Post.findById(req.params.id)

        if (!itinerary) {
            return res.status(404).json({ success: false, message: "Itinerary not found" })
        }

        if (itinerary.postType !== 'plan') {
            return res.status(400).json({ success: false, message: "This is not an itinerary" })
        }

        const userId = req.user.userId

        // Fetch user to get accurate name
        const user = await User.findById(userId)
        const userName = user ? `${user.firstname} ${user.lastname}` : "User"

        // Ensure reactions array exists
        if (!itinerary.reactions) itinerary.reactions = []

        const existingIndex = itinerary.reactions.findIndex(r => r.user.toString() === userId)

        let action = ''
        if (existingIndex > -1) {
            // Check if same emoji
            if (itinerary.reactions[existingIndex].emoji === emoji) {
                // Remove - user clicked the same emoji to unreact
                itinerary.reactions.splice(existingIndex, 1)
                action = 'removed'
            } else {
                // Update - user changed to a different emoji
                itinerary.reactions[existingIndex].emoji = emoji
                itinerary.reactions[existingIndex].name = userName
                itinerary.reactions[existingIndex].timestamp = Date.now()
                action = 'updated'
            }
        } else {
            // Add - new reaction
            itinerary.reactions.push({
                user: userId,
                name: userName,
                emoji
            })
            action = 'added'
        }

        await itinerary.save()

        // Calculate reaction statistics
        const reactionStats = {}
        itinerary.reactions.forEach(reaction => {
            reactionStats[reaction.emoji] = (reactionStats[reaction.emoji] || 0) + 1
        })

        return res.status(200).json({
            success: true,
            message: `Reaction ${action}`,
            action,
            reactions: itinerary.reactions,
            reactionStats,
            totalReactions: itinerary.reactions.length,
            userReaction: action === 'removed' ? null : emoji
        })

    } catch (error) {
        console.error("Itinerary reaction error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error updating reaction",
            error: error.message 
        })
    }
})

// GET REACTION STATISTICS FOR AN ITINERARY - Public
itineraryRouter.get("/:id/reactions", async (req, res) => {
    try {
        const itinerary = await Post.findById(req.params.id).select('reactions postType')

        if (!itinerary) {
            return res.status(404).json({ success: false, message: "Itinerary not found" })
        }

        if (itinerary.postType !== 'plan') {
            return res.status(400).json({ success: false, message: "This is not an itinerary" })
        }

        // Calculate reaction statistics
        const reactionStats = {}
        const reactions = itinerary.reactions || []
        
        reactions.forEach(reaction => {
            if (!reactionStats[reaction.emoji]) {
                reactionStats[reaction.emoji] = {
                    count: 0,
                    users: []
                }
            }
            reactionStats[reaction.emoji].count++
            reactionStats[reaction.emoji].users.push({
                userId: reaction.user,
                name: reaction.name,
                timestamp: reaction.timestamp
            })
        })

        // Get user's reaction if authenticated
        let userReaction = null
        if (req.user && req.user.userId) {
            const userReactionObj = reactions.find(r => r.user.toString() === req.user.userId)
            if (userReactionObj) {
                userReaction = userReactionObj.emoji
            }
        }

        return res.status(200).json({
            success: true,
            totalReactions: reactions.length,
            reactionStats,
            userReaction,
            allReactions: reactions
        })

    } catch (error) {
        console.error("Get itinerary reactions error:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching reactions",
            error: error.message 
        })
    }
})

module.exports = itineraryRouter
