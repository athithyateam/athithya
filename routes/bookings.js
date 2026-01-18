const express = require("express")
const { Booking, Post, User, Notification } = require("../db/mongoose")
const { checkAuth } = require("../middleware/checkRole")
const bookingRouter = express.Router()

/**
 * API 1: Create a booking request
 * POST /api/bookings
 * Allows guests to book a trip/experience
 */
bookingRouter.post("/", checkAuth, async (req, res) => {
    try {
        const {
            postId,
            numberOfPeople,
            startDate,
            endDate,
            guestMessage
        } = req.body

        // Validation
        if (!postId || !numberOfPeople || !startDate) {
            return res.status(400).json({
                success: false,
                message: "Post ID, number of people, and start date are required"
            })
        }

        // Get the post details
        const post = await Post.findById(postId).populate('user')
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }

        // Check if the post is available
        if (post.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: "This trip is not available for booking"
            })
        }

        // Check if user is trying to book their own post
        if (post.user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot book your own trip"
            })
        }

        // Calculate total amount safely
        let totalAmount = 0
        if (post.price) {
            if (post.price.perPerson) {
                totalAmount = post.price.perPerson * numberOfPeople
            } else if (post.price.amount) {
                totalAmount = post.price.amount
            } else if (post.price.total) {
                totalAmount = post.price.total
            }
        }

        // Create the booking
        const booking = new Booking({
            guest: req.user._id,
            host: post.user._id,
            post: postId,
            postType: post.postType,
            postTitle: post.title,
            numberOfPeople,
            totalAmount,
            bookingDate: new Date(),
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            guestMessage: guestMessage || "",
            status: 'pending'
        })

        await booking.save()

        // Create notification for the host
        const notification = new Notification({
            recipient: post.user._id,
            sender: req.user._id,
            title: "New Booking Request",
            message: `${req.user.firstname} ${req.user.lastname} has requested to book "${post.title}"`,
            type: 'info',
            link: `/bookings/${booking._id}`,
            metadata: { postId: post._id }
        })

        await notification.save()

        // Populate guest details before sending response
        await booking.populate('guest', 'firstname lastname email avatar')
        await booking.populate('post', 'title postType photos')

        res.status(201).json({
            success: true,
            message: "Booking request sent successfully",
            data: booking
        })

    } catch (error) {
        console.error("Error creating booking:", error)
        res.status(500).json({
            success: false,
            message: "Failed to create booking",
            error: error.message
        })
    }
})

/**
 * API 2: Get all booking requests for a host
 * GET /api/bookings/host/requests
 * Allows hosts to see all booking requests for their trips
 */
bookingRouter.get("/host/requests", checkAuth, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query

        // Build query
        const query = { host: req.user._id }
        if (status) {
            query.status = status
        }

        // Get total count for pagination
        const total = await Booking.countDocuments(query)

        // Get bookings
        const bookings = await Booking.find(query)
            .populate('guest', 'firstname lastname email avatar')
            .populate('post', 'title postType photos location')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        // Get counts by status
        const pendingCount = await Booking.countDocuments({ host: req.user._id, status: 'pending' })
        const acceptedCount = await Booking.countDocuments({ host: req.user._id, status: 'accepted' })
        const declinedCount = await Booking.countDocuments({ host: req.user._id, status: 'declined' })

        res.status(200).json({
            success: true,
            data: bookings,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            },
            summary: {
                pending: pendingCount,
                accepted: acceptedCount,
                declined: declinedCount,
                total: pendingCount + acceptedCount + declinedCount
            }
        })

    } catch (error) {
        console.error("Error fetching booking requests:", error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking requests",
            error: error.message
        })
    }
})

/**
 * API 2.1: Accept a booking request
 * PATCH /api/bookings/:bookingId/accept
 * Allows hosts to accept a booking request
 */
bookingRouter.patch("/:bookingId/accept", checkAuth, async (req, res) => {
    try {
        const { bookingId } = req.params
        const { hostResponse } = req.body

        // Find the booking
        const booking = await Booking.findById(bookingId)
            .populate('guest', 'firstname lastname email')
            .populate('post', 'title')

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            })
        }

        // Check if the user is the host
        if (booking.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to accept this booking"
            })
        }

        // Check if booking is still pending
        if (booking.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot accept a booking that is already ${booking.status}`
            })
        }

        // Update booking status
        booking.status = 'accepted'
        booking.hostResponse = hostResponse || ""
        booking.respondedAt = new Date()
        await booking.save()

        // Create notification for the guest
        const notification = new Notification({
            recipient: booking.guest._id,
            sender: req.user._id,
            title: "Booking Accepted",
            message: `Your booking request for "${booking.postTitle}" has been accepted!`,
            type: 'success',
            link: `/bookings/${booking._id}`,
            metadata: { postId: booking.post._id }
        })

        await notification.save()

        res.status(200).json({
            success: true,
            message: "Booking accepted successfully",
            data: booking
        })

    } catch (error) {
        console.error("Error accepting booking:", error)
        res.status(500).json({
            success: false,
            message: "Failed to accept booking",
            error: error.message
        })
    }
})

/**
 * API 2.2: Decline a booking request
 * PATCH /api/bookings/:bookingId/decline
 * Allows hosts to decline a booking request
 */
bookingRouter.patch("/:bookingId/decline", checkAuth, async (req, res) => {
    try {
        const { bookingId } = req.params
        const { hostResponse } = req.body

        // Find the booking
        const booking = await Booking.findById(bookingId)
            .populate('guest', 'firstname lastname email')
            .populate('post', 'title')

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            })
        }

        // Check if the user is the host
        if (booking.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to decline this booking"
            })
        }

        // Check if booking is still pending
        if (booking.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot decline a booking that is already ${booking.status}`
            })
        }

        // Update booking status
        booking.status = 'declined'
        booking.hostResponse = hostResponse || ""
        booking.respondedAt = new Date()
        await booking.save()

        // Create notification for the guest
        const notification = new Notification({
            recipient: booking.guest._id,
            sender: req.user._id,
            title: "Booking Declined",
            message: `Your booking request for "${booking.postTitle}" has been declined`,
            type: 'warning',
            link: `/bookings/${booking._id}`,
            metadata: { postId: booking.post._id }
        })

        await notification.save()

        res.status(200).json({
            success: true,
            message: "Booking declined successfully",
            data: booking
        })

    } catch (error) {
        console.error("Error declining booking:", error)
        res.status(500).json({
            success: false,
            message: "Failed to decline booking",
            error: error.message
        })
    }
})

/**
 * API 2.3: Get booking details
 * GET /api/bookings/:bookingId
 * Get details of a specific booking
 */
bookingRouter.get("/:bookingId", checkAuth, async (req, res) => {
    try {
        const { bookingId } = req.params

        const booking = await Booking.findById(bookingId)
            .populate('guest', 'firstname lastname email avatar')
            .populate('host', 'firstname lastname email avatar')
            .populate('post', 'title postType photos location price')

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            })
        }

        // Check if user is authorized to view this booking
        if (booking.guest._id.toString() !== req.user._id.toString() &&
            booking.host._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this booking"
            })
        }

        res.status(200).json({
            success: true,
            data: booking
        })

    } catch (error) {
        console.error("Error fetching booking:", error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking",
            error: error.message
        })
    }
})

/**
 * API 2.4: Get guest's bookings
 * GET /api/bookings/guest/my-bookings
 * Allows guests to see all their booking requests
 */
bookingRouter.get("/guest/my-bookings", checkAuth, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query

        // Build query
        const query = { guest: req.user._id }
        if (status) {
            query.status = status
        }

        // Get total count for pagination
        const total = await Booking.countDocuments(query)

        // Get bookings
        const bookings = await Booking.find(query)
            .populate('host', 'firstname lastname email avatar')
            .populate('post', 'title postType photos location')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        res.status(200).json({
            success: true,
            data: bookings,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error("Error fetching guest bookings:", error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
            error: error.message
        })
    }
})

module.exports = bookingRouter
