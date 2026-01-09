const express = require("express")
const bcrypt = require("bcrypt")
const axios = require("axios")
const { OAuth2Client } = require("google-auth-library")
const { validateUser, signupSchema, signinSchema, otpCompleteSchema } = require("../middleware/validateUser")
const { jwt, jwtkey } = require("../jwt/jwt")
const { User, OTP } = require("../db/mongoose")
const { generateOTP, sendOTPEmail } = require("../utils/emailService")
const { checkAuth, checkAdmin, checkHost } = require("../middleware/checkRole")
const validateReq = require("../middleware/validateReq")
const cloudinary = require("../utils/cloudinary")
const multer = require("multer")

const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB
    }
})
const userrouter = express.Router()

// INITIATE SIGNUP - Send OTP when user submits signup form
userrouter.post("/signup/initiate", validateUser(signupSchema), async (req, res) => {
    const { firstname, lastname, email, password, role } = req.body

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" })
        }

        // Validate role (only guest or host allowed)
        if (role && !['guest', 'host'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Only 'guest' or 'host' allowed."
            })
        }

        // Generate OTP
        const otp = generateOTP()

        // Save OTP to database
        await OTP.findOneAndUpdate(
            { email },
            { email, otp },
            { upsert: true, new: true }
        )

        // Send OTP via email
        const emailResult = await sendOTPEmail(email, otp)

        if (!emailResult.success) {
            console.error("Email sending failed:", emailResult.error)
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP email",
                error: emailResult.error?.message || "Unknown error"
            })
        }

        return res.status(200).json({
            success: true,
            message: "OTP sent to your email. Please verify to complete signup.",
            email: email
        })
    } catch (error) {
        console.error("Signup initiate error:", error)
        return res.status(500).json({
            success: false,
            message: "Error initiating signup - " + (error?.message || "Unknown error")
        })
    }
})

// COMPLETE SIGNUP - Verify OTP and create account
userrouter.post("/signup/complete", validateUser(otpCompleteSchema), async (req, res) => {
    const { firstname, lastname, email, password, role, otp } = req.body

    if (!otp) {
        return res.status(400).json({ success: false, message: "OTP is required" })
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" })
        }

        // Validate role (only guest or host allowed, admin must be set from backend)
        const userRole = role || 'guest' // Default to guest if not specified
        if (!['guest', 'host'].includes(userRole)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Only 'guest' or 'host' allowed."
            })
        }

        // Verify OTP
        const otpRecord = await OTP.findOne({ email, otp })
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" })
        }

        // Delete used OTP
        await OTP.deleteOne({ email, otp })

        // Create verified user
        const hashedPass = await bcrypt.hash(password, 10)
        const user = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPass,
            role: userRole,
            isVerified: true
        })

        const token = jwt.sign({ userId: user._id, role: user.role }, jwtkey, { expiresIn: "30d" })
        return res.status(201).json({
            success: true,
            message: "Account created and verified successfully",
            token,
            isVerified: true,
            user: {
                id: user._id.toString(),
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                avatar: user.avatar || null,
                description: user.description || ""
            }
        })
    } catch (error) {
        console.error("Signup complete error:", error)
        return res.status(500).json({
            success: false,
            message: "Error creating user - " + (error?.message || "Unknown error")
        })
    }
})

// SEND OTP
userrouter.post("/send-otp", async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" })
    }

    try {
        // Check if user already exists and is verified
        const existingUser = await User.findOne({ email })
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ success: false, message: "Email already registered and verified" })
        }

        // Generate OTP
        const otp = generateOTP()

        // Save OTP to database
        await OTP.findOneAndUpdate(
            { email },
            { email, otp },
            { upsert: true, new: true }
        )

        // Send OTP via email
        const emailResult = await sendOTPEmail(email, otp)

        if (!emailResult.success) {
            console.error("Email sending failed:", emailResult.error)
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP email",
                error: emailResult.error?.message || "Unknown error"
            })
        }

        return res.status(200).json({ success: true, message: "OTP sent successfully to your email" })
    } catch (error) {
        console.error("Send OTP error:", error)
        return res.status(500).json({
            success: false,
            message: "Error sending OTP - " + (error?.message || "Unknown error")
        })
    }
})

// VERIFY OTP
userrouter.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required" })
    }

    try {
        // Find OTP in database
        const otpRecord = await OTP.findOne({ email, otp })

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" })
        }

        // Delete used OTP
        await OTP.deleteOne({ email, otp })

        return res.status(200).json({ success: true, message: "OTP verified successfully" })
    } catch (error) {
        console.error("Verify OTP error:", error)
        return res.status(500).json({
            success: false,
            message: "Error verifying OTP - " + (error?.message || "Unknown error")
        })
    }
})

// SIGNUP
userrouter.post("/signup", validateUser(signupSchema), async (req, res) => {
    const { firstname, lastname, email, password, role, otp } = req.body

    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" })
        }

        // Validate role (only guest or host allowed)
        const userRole = role || 'guest'
        if (!['guest', 'host'].includes(userRole)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Only 'guest' or 'host' allowed."
            })
        }

        // Verify OTP if provided
        if (otp) {
            const otpRecord = await OTP.findOne({ email, otp })
            if (!otpRecord) {
                return res.status(400).json({ success: false, message: "Invalid or expired OTP" })
            }
            // Delete used OTP
            await OTP.deleteOne({ email, otp })
        }

        const hashedPass = await bcrypt.hash(password, 10)
        const user = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPass,
            role: userRole,
            isVerified: otp ? true : false // Verified if OTP was provided
        })

        const token = jwt.sign({ userId: user._id, role: user.role }, jwtkey, { expiresIn: "30d" })
        return res.status(201).json({
            success: true,
            message: otp ? "User created and verified successfully" : "User created successfully",
            token,
            isVerified: user.isVerified,
            user: {
                id: user._id.toString(),
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                avatar: user.avatar || null,
                description: user.description || ""
            }
        })
    } catch (error) {
        console.error("Signup error:", error)
        return res.status(500).json({
            success: false,
            message: "Error creating user - " + (error?.message || "Unknown error")
        })
    }
})

// SIGNIN
userrouter.post("/signin", validateUser(signinSchema), async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) {
            console.log(`Signin failed: User not found for email ${email}`);
            return res.status(400).json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            console.log(`Signin failed: Password mismatch for email ${email}`);
            return res.status(400).json({ success: false, message: "Invalid credentials" })
        }

        // Ensure jwtkey exists
        const key = jwtkey || 'your-secret-key-change-this';

        // Stringify ID to avoid issues with non-plain objects in JWT
        const token = jwt.sign({ userId: user._id.toString(), role: user.role }, key, { expiresIn: "30d" })

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id.toString(),
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified || false,
                avatar: user.avatar || null,
                description: user.description || ""
            }
        })
    } catch (error) {
        console.error("DETAILED Signin error:", {
            error: error?.message,
            stack: error?.stack,
            email: email
        })
        return res.status(500).json({
            success: false,
            message: "Error logging in - " + (error?.message || "Unknown error"),
            error: error?.message || "Internal Server Error",
            debugName: error?.name,
            stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
        })
    }
})

// FORGOT PASSWORD
userrouter.post("/forgot-password", async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" })
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        const otp = generateOTP()

        await OTP.findOneAndUpdate(
            { email },
            { email, otp },
            { upsert: true, new: true }
        )

        const emailResult = await sendOTPEmail(
            email,
            otp,
            "Password Reset - OTP",
            "Password Reset Request"
        )

        if (!emailResult.success) {
            return res.status(500).json({ success: false, message: "Failed to send OTP email" })
        }

        return res.status(200).json({ success: true, message: "OTP sent to your email" })
    } catch (error) {
        console.error("Forgot password error:", error)
        return res.status(500).json({ success: false, message: "Error sending OTP" })
    }
})

// RESET PASSWORD
userrouter.post("/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: "All fields are required" })
    }

    try {
        const otpRecord = await OTP.findOne({ email, otp })
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" })
        }

        const hashedPass = await bcrypt.hash(newPassword, 10)

        await User.findOneAndUpdate(
            { email },
            { password: hashedPass }
        )

        await OTP.deleteOne({ email, otp })

        return res.status(200).json({ success: true, message: "Password reset successfully" })
    } catch (error) {
        console.error("Reset password error:", error)
        return res.status(500).json({ success: false, message: "Error resetting password" })
    }
})

// GOOGLE SIGNIN
userrouter.post("/google", async (req, res) => {
    const { token, role } = req.body; // access_token from frontend

    try {
        // Verify token and get user info from Google
        const googleRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const { email, given_name, family_name, picture, sub } = googleRes.data;

        let user = await User.findOne({ email });

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPass = await bcrypt.hash(randomPassword, 10);

            const userRole = role && ['guest', 'host'].includes(role) ? role : 'guest';

            user = await User.create({
                firstname: given_name,
                lastname: family_name || '',
                email,
                password: hashedPass,
                role: userRole,
                isVerified: true,
                avatar: picture ? { url: picture } : undefined
            });
        }

        if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
        }

        const jwtToken = jwt.sign({ userId: user._id.toString(), role: user.role }, jwtkey, { expiresIn: "30d" });

        return res.status(200).json({
            success: true,
            message: "Google login successful",
            token: jwtToken,
            user: {
                id: user._id.toString(),
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                avatar: user.avatar || null,
                description: user.description || ""
            }
        });

    } catch (error) {
        console.error("Google signin error:", error);
        return res.status(500).json({
            success: false,
            message: "Error with Google signin - " + (error?.message || "Unknown error"),
            error: error?.message || "Internal Server Error"
        });
    }
})

// ============= ADMIN ENDPOINTS =============

// GET ALL USERS (Admin only)
userrouter.get("/admin/users", checkAuth, checkAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '-password') // Exclude password field
            .sort({ createdAt: -1 }); // Newest first

        return res.status(200).json({
            success: true,
            count: users.length,
            users
        })
    } catch (error) {
        console.error("Get users error:", error)
        return res.status(500).json({ success: false, message: "Error fetching users" })
    }
})

// GET USER BY ID (Admin only)
userrouter.get("/admin/users/:id", checkAuth, checkAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id, '-password')

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        return res.status(200).json({ success: true, user })
    } catch (error) {
        console.error("Get user error:", error)
        return res.status(500).json({ success: false, message: "Error fetching user" })
    }
})

// UPDATE USER ROLE (Admin only)
userrouter.patch("/admin/users/:id/role", checkAuth, checkAdmin, async (req, res) => {
    const { role } = req.body

    if (!role || !['guest', 'host', 'admin'].includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Invalid role. Must be 'guest', 'host', or 'admin'"
        })
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password')

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        return res.status(200).json({
            success: true,
            message: "User role updated successfully",
            user
        })
    } catch (error) {
        console.error("Update role error:", error)
        return res.status(500).json({ success: false, message: "Error updating user role" })
    }
})

// DELETE USER (Admin only)
userrouter.delete("/admin/users/:id", checkAuth, checkAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        })
    } catch (error) {
        console.error("Delete user error:", error)
        return res.status(500).json({ success: false, message: "Error deleting user" })
    }
})

// GET STATISTICS (Admin only)
userrouter.get("/admin/stats", checkAuth, checkAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments()
        const guestCount = await User.countDocuments({ role: 'guest' })
        const hostCount = await User.countDocuments({ role: 'host' })
        const adminCount = await User.countDocuments({ role: 'admin' })
        const verifiedCount = await User.countDocuments({ isVerified: true })

        return res.status(200).json({
            success: true,
            statistics: {
                totalUsers,
                verifiedUsers: verifiedCount,
                unverifiedUsers: totalUsers - verifiedCount,
                roles: {
                    guest: guestCount,
                    host: hostCount,
                    admin: adminCount
                }
            }
        })
    } catch (error) {
        console.error("Get stats error:", error)
        return res.status(500).json({ success: false, message: "Error fetching statistics" })
    }
})

// UPDATE USER PROFILE
userrouter.put("/profile", checkAuth, upload.single("avatar"), async (req, res) => {
    try {
        const { firstname, lastname, description, removeAvatar } = req.body
        const user = await User.findById(req.user.userId)

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        if (firstname) user.firstname = firstname
        if (lastname) user.lastname = lastname
        if (description !== undefined) user.description = description

        // Handle avatar removal
        if (removeAvatar === "true" || removeAvatar === true) {
            if (user.avatar && user.avatar.public_id) {
                try {
                    await cloudinary.uploader.destroy(user.avatar.public_id)
                } catch (err) {
                    console.error("Avatar deletion failed:", err)
                }
            }
            user.avatar = undefined;
        }
        else if (req.file) {
            // Delete old avatar if it exists
            if (user.avatar && user.avatar.public_id) {
                try {
                    await cloudinary.uploader.destroy(user.avatar.public_id)
                } catch (err) {
                    console.error("Old avatar deletion failed:", err)
                }
            }

            // Upload new avatar
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({
                    resource_type: "image",
                    folder: "avatars"
                }, (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }).end(req.file.buffer)
            })

            user.avatar = {
                url: result.secure_url,
                public_id: result.public_id
            }
        }

        await user.save()

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                description: user.description
            }
        })
    } catch (error) {
        console.error("Update profile error:", error)
        res.status(500).json({ success: false, message: "Error updating profile" })
    }
})

// UPDATE USER LOCATION - For both hosts and guests
userrouter.put("/location", validateReq, async (req, res) => {
    const { latitude, longitude, address, city, state, country } = req.body

    console.log('=== UPDATE LOCATION REQUEST ===')
    console.log('User ID:', req.userId)
    console.log('Location data:', { latitude, longitude, address, city, state, country })

    try {
        // Validate that at least coordinates are provided
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required"
            })
        }

        // Validate coordinate ranges
        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({
                success: false,
                message: "Latitude must be between -90 and 90"
            })
        }

        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                message: "Longitude must be between -180 and 180"
            })
        }

        // Update user location
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            {
                location: {
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    address: address || '',
                    city: city || '',
                    state: state || '',
                    country: country || '',
                    lastUpdated: new Date()
                }
            },
            { new: true, runValidators: true }
        ).select('-password -otp -otpExpires')

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        console.log('Location updated successfully for user:', updatedUser._id)
        console.log('Saved location:', updatedUser.location)

        res.status(200).json({
            success: true,
            message: "Location updated successfully",
            data: {
                userId: updatedUser._id,
                role: updatedUser.role,
                location: updatedUser.location
            }
        })

    } catch (error) {
        console.error("Error updating location:", error)
        res.status(500).json({
            success: false,
            message: "Failed to update location",
            error: error.message
        })
    }
})

// GET USER LOCATION - For both hosts and guests
userrouter.get("/location", validateReq, async (req, res) => {
    console.log('=== GET LOCATION REQUEST ===')
    console.log('User ID:', req.userId)

    try {
        const user = await User.findById(req.userId).select('location role firstname lastname')

        if (!user) {
            console.log('User not found:', req.userId)
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        console.log('Retrieved location for user:', user._id)
        console.log('Location data:', user.location)

        res.status(200).json({
            success: true,
            data: {
                userId: user._id,
                role: user.role,
                name: `${user.firstname} ${user.lastname}`,
                location: user.location || null
            }
        })

    } catch (error) {
        console.error("Error fetching location:", error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch location",
            error: error.message
        })
    }
})

// GET USER PROFILE WITH ALL POSTS - Public endpoint
userrouter.get("/profile/:userId", async (req, res) => {
    try {
        const { userId } = req.params
        const { Post } = require("../db/mongoose")

        // Get user details (exclude sensitive fields)
        const user = await User.findById(userId).select('-password -otp -otpExpires')

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // Get all posts by this user
        const posts = await Post.find({
            user: userId,
            status: 'active'
        }).sort({ createdAt: -1 })

        // Count posts by type
        const postStats = {
            total: posts.length,
            experiences: posts.filter(p => p.postType === 'experience').length,
            services: posts.filter(p => p.postType === 'service').length,
            treks: posts.filter(p => p.postType === 'trek').length,
            plans: posts.filter(p => p.postType === 'plan').length
        }

        // Get reviews if user is a host
        let reviews = []
        let reviewStats = null
        if (user.role === 'host') {
            const { Review } = require("../db/mongoose")
            reviews = await Review.find({ host: userId })
                .populate('reviewer', 'firstname lastname avatar')
                .sort({ createdAt: -1 })
                .limit(10) // Latest 10 reviews

            if (reviews.length > 0) {
                const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
                reviewStats = {
                    totalReviews: reviews.length,
                    averageRating: (totalRating / reviews.length).toFixed(1),
                    ratings: {
                        5: reviews.filter(r => r.rating === 5).length,
                        4: reviews.filter(r => r.rating === 4).length,
                        3: reviews.filter(r => r.rating === 3).length,
                        2: reviews.filter(r => r.rating === 2).length,
                        1: reviews.filter(r => r.rating === 1).length
                    }
                }
            }
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    description: user.description,
                    isVerified: user.isVerified,
                    location: user.location,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                },
                postStats,
                posts,
                reviews: user.role === 'host' ? reviews : undefined,
                reviewStats: user.role === 'host' ? reviewStats : undefined
            }
        })

    } catch (error) {
        console.error("Error fetching user profile:", error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch user profile",
            error: error.message
        })
    }
})

// GET TOP-RATED HOSTS - Public
// Returns hosts sorted by average rating from reviews
userrouter.get("/top-rated/hosts", async (req, res) => {
    try {
        const { limit = 10, minRating = 0, location } = req.query
        const { Review, Post } = require("../db/mongoose")

        // Validate parameters
        const ratingValue = Number(minRating)
        if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
            return res.status(400).json({
                success: false,
                message: "Invalid minRating value. Must be between 0 and 5"
            })
        }

        const limitValue = Number(limit)
        if (isNaN(limitValue) || limitValue < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid limit value. Must be a positive number"
            })
        }

        // Aggregate reviews to calculate average rating per host
        const topRatedHosts = await Review.aggregate([
            {
                // Only include reviews that have a host reference
                $match: {
                    host: { $exists: true, $ne: null }
                }
            },
            {
                // Group by host and calculate average rating
                $group: {
                    _id: '$host',
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 }
                }
            },
            {
                // Filter by minimum rating if specified
                $match: {
                    averageRating: { $gte: ratingValue }
                }
            },
            {
                // Sort by average rating (highest first), then by review count
                $sort: { averageRating: -1, reviewCount: -1 }
            },
            {
                // Limit results
                $limit: limitValue
            },
            {
                // Lookup the actual user details
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'hostDetails'
                }
            },
            {
                // Unwind the host details array
                $unwind: '$hostDetails'
            },
            {
                // Only include users with host role
                $match: {
                    'hostDetails.role': 'host'
                }
            },
            {
                // Lookup posts by this host
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'posts'
                }
            },
            {
                // Project final shape
                $project: {
                    _id: '$hostDetails._id',
                    firstname: '$hostDetails.firstname',
                    lastname: '$hostDetails.lastname',
                    email: '$hostDetails.email',
                    role: '$hostDetails.role',
                    isVerified: '$hostDetails.isVerified',
                    location: '$hostDetails.location',
                    avatar: '$hostDetails.avatar',
                    createdAt: '$hostDetails.createdAt',
                    updatedAt: '$hostDetails.updatedAt',
                    averageRating: { $round: ['$averageRating', 1] },
                    reviewCount: '$reviewCount',
                    totalPosts: { $size: '$posts' },
                    activePosts: {
                        $size: {
                            $filter: {
                                input: '$posts',
                                as: 'post',
                                cond: { $eq: ['$$post.status', 'active'] }
                            }
                        }
                    },
                    postsByType: {
                        trek: {
                            $size: {
                                $filter: {
                                    input: '$posts',
                                    as: 'post',
                                    cond: { $eq: ['$$post.postType', 'trek'] }
                                }
                            }
                        },
                        service: {
                            $size: {
                                $filter: {
                                    input: '$posts',
                                    as: 'post',
                                    cond: { $eq: ['$$post.postType', 'service'] }
                                }
                            }
                        },
                        experience: {
                            $size: {
                                $filter: {
                                    input: '$posts',
                                    as: 'post',
                                    cond: { $eq: ['$$post.postType', 'experience'] }
                                }
                            }
                        }
                    }
                }
            }
        ])

        // Apply location filter if specified (post-aggregation)
        let filteredHosts = topRatedHosts
        if (location) {
            const locationLower = location.toLowerCase()
            filteredHosts = topRatedHosts.filter(host => {
                if (!host.location) return false
                const city = (host.location.city || '').toLowerCase()
                const state = (host.location.state || '').toLowerCase()
                const country = (host.location.country || '').toLowerCase()
                return city.includes(locationLower) ||
                    state.includes(locationLower) ||
                    country.includes(locationLower)
            })
        }

        return res.status(200).json({
            success: true,
            count: filteredHosts.length,
            hosts: filteredHosts
        })
    } catch (error) {
        console.error("Get top-rated hosts error:", error)
        return res.status(500).json({
            success: false,
            message: "Error fetching top-rated hosts"
        })
    }
})

// GET SINGLE USER BY ID (Authenticated users)
// NOTE: This route must be at the end to avoid conflicts with other routes
userrouter.get("/:id", checkAuth, async (req, res) => {
    try {
        const { id } = req.params

        // Find user and exclude password field
        const user = await User.findById(id).select('-password')

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id.toString(),
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                avatar: user.avatar || null,
                description: user.description || "",
                location: user.location,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        })
    } catch (error) {
        console.error("Get user error:", error)
        return res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error?.message || "Internal Server Error"
        })
    }
})

module.exports = userrouter
