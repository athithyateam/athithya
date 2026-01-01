const express = require("express")
const { Review, User, Post } = require("../db/mongoose")
const { checkAuth } = require("../middleware/checkRole")
const reviewRouter = express.Router()

// CREATE REVIEW - Authenticated users can review hosts
reviewRouter.post("/", checkAuth, async(req, res) => {
    try {
        const { hostId, postId, rating, comment } = req.body

        // Validation
        if (!hostId || !rating || !comment) {
            return res.status(400).json({ 
                success: false, 
                message: "Host ID, rating, and comment are required" 
            })
        }

        // Check if host exists and is actually a host
        const host = await User.findById(hostId)
        if (!host) {
            return res.status(404).json({ 
                success: false, 
                message: "Host not found" 
            })
        }

        if (host.role !== 'host') {
            return res.status(400).json({ 
                success: false, 
                message: "Reviews can only be given to hosts" 
            })
        }

        // Users cannot review themselves
        if (req.user.userId === hostId) {
            return res.status(400).json({ 
                success: false, 
                message: "You cannot review yourself" 
            })
        }

        // Validate rating
        const ratingNum = Number(rating)
        if (ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ 
                success: false, 
                message: "Rating must be between 1 and 5" 
            })
        }

        // Check if post exists if provided
        if (postId) {
            const post = await Post.findById(postId)
            if (!post) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Post not found" 
                })
            }

            // Check if the post belongs to the host
            if (post.user.toString() !== hostId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "This post does not belong to the specified host" 
                })
            }

            // Check if user already reviewed this host for this post
            const existingReview = await Review.findOne({
                host: hostId,
                reviewer: req.user.userId,
                post: postId
            })

            if (existingReview) {
                return res.status(400).json({ 
                    success: false, 
                    message: "You have already reviewed this host for this post" 
                })
            }
        }

        // Create review
        const review = await Review.create({
            host: hostId,
            reviewer: req.user.userId,
            reviewerRole: req.user.role,
            post: postId || undefined,
            rating: ratingNum,
            comment
        })

        const populatedReview = await Review.findById(review._id)
            .populate('reviewer', 'firstname lastname email role')
            .populate('host', 'firstname lastname email role')
            .populate('post', 'title postType')

        return res.status(201).json({ 
            success: true, 
            message: "Review created successfully",
            review: populatedReview 
        })
    } catch (error) {
        console.error("Create review error:", error)
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "You have already reviewed this host for this post" 
            })
        }
        return res.status(500).json({ success: false, message: "Error creating review" })
    }
})

// GET ALL REVIEWS FOR A HOST - Public
reviewRouter.get("/host/:hostId", async(req, res) => {
    try {
        const { 
            rating, 
            page = 1, 
            limit = 20 
        } = req.query

        const filter = { 
            host: req.params.hostId
        }

        if (rating) filter.rating = Number(rating)

        const skip = (Number(page) - 1) * Number(limit)

        const reviews = await Review.find(filter)
            .populate('reviewer', 'firstname lastname email role')
            .populate('post', 'title postType')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip)

        const total = await Review.countDocuments(filter)

        // Calculate average rating and rating distribution
        const allReviews = await Review.find({ 
            host: req.params.hostId
        })

        const avgRating = allReviews.length > 0 
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
            : 0

        const ratingDistribution = {
            5: allReviews.filter(r => r.rating === 5).length,
            4: allReviews.filter(r => r.rating === 4).length,
            3: allReviews.filter(r => r.rating === 3).length,
            2: allReviews.filter(r => r.rating === 2).length,
            1: allReviews.filter(r => r.rating === 1).length
        }

        return res.status(200).json({ 
            success: true,
            count: reviews.length,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            averageRating: Number(avgRating.toFixed(2)),
            totalReviews: allReviews.length,
            ratingDistribution,
            reviews 
        })
    } catch (error) {
        console.error("Get host reviews error:", error)
        return res.status(500).json({ success: false, message: "Error fetching reviews" })
    }
})

// GET REVIEWS BY REVIEWER - Get all reviews written by a user
reviewRouter.get("/reviewer/:reviewerId", async(req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query

        const skip = (Number(page) - 1) * Number(limit)

        const reviews = await Review.find({ reviewer: req.params.reviewerId })
            .populate('host', 'firstname lastname email role')
            .populate('post', 'title postType')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip)

        const total = await Review.countDocuments({ reviewer: req.params.reviewerId })

        return res.status(200).json({ 
            success: true,
            count: reviews.length,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            reviews 
        })
    } catch (error) {
        console.error("Get reviewer reviews error:", error)
        return res.status(500).json({ success: false, message: "Error fetching reviews" })
    }
})

// GET MY REVIEWS - Get reviews written by authenticated user
reviewRouter.get("/my/reviews", checkAuth, async(req, res) => {
    try {
        const reviews = await Review.find({ reviewer: req.user.userId })
            .populate('host', 'firstname lastname email role')
            .populate('post', 'title postType')
            .sort({ createdAt: -1 })

        return res.status(200).json({ 
            success: true,
            count: reviews.length,
            reviews 
        })
    } catch (error) {
        console.error("Get my reviews error:", error)
        return res.status(500).json({ success: false, message: "Error fetching your reviews" })
    }
})

// GET REVIEWS RECEIVED BY ME (for hosts) - Get reviews received by authenticated user
reviewRouter.get("/received", checkAuth, async(req, res) => {
    try {
        if (req.user.role !== 'host') {
            return res.status(403).json({ 
                success: false, 
                message: "Only hosts can view received reviews" 
            })
        }

        const { 
            rating, 
            page = 1, 
            limit = 20 
        } = req.query

        const filter = { 
            host: req.user.userId
        }

        if (rating) filter.rating = Number(rating)

        const skip = (Number(page) - 1) * Number(limit)

        const reviews = await Review.find(filter)
            .populate('reviewer', 'firstname lastname email role')
            .populate('post', 'title postType')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip)

        const total = await Review.countDocuments(filter)

        return res.status(200).json({ 
            success: true,
            count: reviews.length,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            reviews 
        })
    } catch (error) {
        console.error("Get received reviews error:", error)
        return res.status(500).json({ success: false, message: "Error fetching received reviews" })
    }
})

// GET SINGLE REVIEW BY ID
reviewRouter.get("/:id", async(req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('reviewer', 'firstname lastname email role')
            .populate('host', 'firstname lastname email role')
            .populate('post', 'title postType')

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" })
        }

        return res.status(200).json({ success: true, review })
    } catch (error) {
        console.error("Get review error:", error)
        return res.status(500).json({ success: false, message: "Error fetching review" })
    }
})

// UPDATE REVIEW - Only review owner
reviewRouter.put("/:id", checkAuth, async(req, res) => {
    try {
        const review = await Review.findById(req.params.id)

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" })
        }

        // Check if user is the review owner
        if (review.reviewer.toString() !== req.user.userId) {
            return res.status(403).json({ 
                success: false, 
                message: "You can only edit your own reviews" 
            })
        }

        const { rating, comment } = req.body

        // Update fields
        if (rating !== undefined) {
            const ratingNum = Number(rating)
            if (ratingNum < 1 || ratingNum > 5) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Rating must be between 1 and 5" 
                })
            }
            review.rating = ratingNum
        }
        if (comment !== undefined) review.comment = comment

        await review.save()

        const updatedReview = await Review.findById(review._id)
            .populate('reviewer', 'firstname lastname email role')
            .populate('host', 'firstname lastname email role')
            .populate('post', 'title postType')

        return res.status(200).json({ 
            success: true, 
            message: "Review updated successfully",
            review: updatedReview 
        })
    } catch (error) {
        console.error("Update review error:", error)
        return res.status(500).json({ success: false, message: "Error updating review" })
    }
})

// DELETE REVIEW - Only review owner
reviewRouter.delete("/:id", checkAuth, async(req, res) => {
    try {
        const review = await Review.findById(req.params.id)

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" })
        }

        // Check if user is the review owner
        if (review.reviewer.toString() !== req.user.userId) {
            return res.status(403).json({ 
                success: false, 
                message: "You can only delete your own reviews" 
            })
        }

        await Review.findByIdAndDelete(req.params.id)

        return res.status(200).json({ 
            success: true, 
            message: "Review deleted successfully" 
        })
    } catch (error) {
        console.error("Delete review error:", error)
        return res.status(500).json({ success: false, message: "Error deleting review" })
    }
})

module.exports = reviewRouter
