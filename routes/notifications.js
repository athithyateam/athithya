const express = require("express")
const { Notification } = require("../db/mongoose")
const { checkAuth } = require("../middleware/checkRole")

const notificationRouter = express.Router()

// GET MY NOTIFICATIONS
notificationRouter.get("/", checkAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly } = req.query

        const filter = { recipient: req.user.userId }
        if (unreadOnly === 'true') filter.read = false

        const skip = (Number(page) - 1) * Number(limit)

        const notifications = await Notification.find(filter)
            .populate('sender', 'firstname lastname avatar')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip)

        const total = await Notification.countDocuments(filter)
        const unreadCount = await Notification.countDocuments({ recipient: req.user.userId, read: false })

        return res.status(200).json({
            success: true,
            count: notifications.length,
            total,
            unreadCount,
            page: Number(page),
            notifications
        })
    } catch (error) {
        console.error("Get notifications error:", error)
        return res.status(500).json({ success: false, message: "Error fetching notifications" })
    }
})

// CREATE NOTIFICATION (Internal or Debug)
notificationRouter.post("/", checkAuth, async (req, res) => {
    try {
        const { recipientId, title, message, type, link } = req.body

        const notification = await Notification.create({
            recipient: recipientId || req.user.userId, // Default to self for testing
            sender: req.user.userId,
            title,
            message,
            type: type || 'info',
            link
        })

        return res.status(201).json({
            success: true,
            message: "Notification created",
            notification
        })
    } catch (error) {
        console.error("Create notification error:", error)
        return res.status(500).json({ success: false, message: "Error creating notification" })
    }
})

// MARK AS READ
notificationRouter.put("/:id/read", checkAuth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.userId },
            { read: true },
            { new: true }
        )

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" })
        }

        return res.status(200).json({
            success: true,
            message: "Marked as read",
            notification
        })
    } catch (error) {
        console.error("Mark read error:", error)
        return res.status(500).json({ success: false, message: "Error updating notification" })
    }
})

// MARK ALL AS READ
notificationRouter.put("/mark-all/read", checkAuth, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.userId, read: false },
            { read: true }
        )

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        })
    } catch (error) {
        console.error("Mark all read error:", error)
        return res.status(500).json({ success: false, message: "Error updating notifications" })
    }
})

// DELETE NOTIFICATION
notificationRouter.delete("/:id", checkAuth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user.userId
        })

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" })
        }

        return res.status(200).json({
            success: true,
            message: "Notification deleted"
        })
    } catch (error) {
        console.error("Delete notification error:", error)
        return res.status(500).json({ success: false, message: "Error deleting notification" })
    }
})

// CLEAR ALL
notificationRouter.delete("/clear/all", checkAuth, async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user.userId })

        return res.status(200).json({
            success: true,
            message: "Notifications cleared"
        })
    } catch (error) {
        console.error("Clear all error:", error)
        return res.status(500).json({ success: false, message: "Error clearing notifications" })
    }
})

module.exports = notificationRouter
