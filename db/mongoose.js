const mongoose = require("mongoose")

require("dotenv").config()
mongoose.connect(`${process.env.MONGO_URL}`, {
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    socketTimeoutMS: 45000,
})
.then(() => {console.log("connected to mongoDB")})
.catch((error) => {console.error("connection error", error)})

const userSchema = new mongoose.Schema({
    firstname: {type: String, required: true},
    lastname : {type: String, required: true},
    email: { type: String, required: true, unique: true, lowercase: true, trim: true},
    password: { type: String, required: true},
    role: { 
        type: String, 
        enum: ['guest', 'host', 'admin'], 
        default: 'guest',
        required: true 
    },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true },
        lastUpdated: { type: Date }
    }
}, { timestamps: true })

// OTP Schema
const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // Auto-delete after 5 minutes
})

// Post Schema for experiences and properties
const postSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    userRole: { 
        type: String, 
        enum: ['guest', 'host'], 
        required: true 
    },
    postType: { 
        type: String, 
        enum: ['experience', 'service', 'plan', 'trek'], 
        required: true 
    },
    title: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 200
    },
    description: { 
        type: String, 
        required: true,
        maxlength: 5000
    },
    photos: [{ 
        url: { type: String },
        public_id: { type: String },
        resource_type: { type: String, default: 'image' }
    }],
    videos: [{ 
        url: { type: String },
        public_id: { type: String },
        resource_type: { type: String, default: 'video' }
    }],
    location: {
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true },
        address: { type: String, trim: true },
        meetingPoint: { type: String, trim: true },  // Meeting point/landmark for services
        coordinates: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number] }  // [longitude, latitude]
        }
    },
    // Trek-specific fields
    duration: {
        days: { type: Number, min: 0 },
        nights: { type: Number, min: 0 }
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Difficult', 'Difficult', 'Challenging'],
        default: 'Moderate'
    },
    categories: [{
        type: String,
        enum: ['Adventure', 'Wildlife', 'Spiritual', 'Cultural', 'Beach', 'Mountain', 'Desert', 'Forest', 'Historical', 'Pilgrimage', 'Snow', 'Camping', 'Backpacking', 'Photography', 'Nature', 'Luxury', 'Budget']
    }],
    isFeatured: {
        type: Boolean,
        default: false
    },
    price: { 
        amount: { type: Number, min: 0 },
        total: { type: Number, min: 0 },
        perPerson: { type: Number, min: 0 },
        currency: { type: String, default: 'INR' },
        period: { type: String, enum: ['night', 'hour', 'day', 'person', 'total'], default: 'person' }
    },
    amenities: [{ 
        type: String  // WiFi, Pool, Parking, etc.
    }],
    capacity: {
        guests: { type: Number, min: 1 },
        maxPeople: { type: Number, min: 1 },
        bedrooms: { type: Number, min: 0 },
        beds: { type: Number, min: 0 },
        bathrooms: { type: Number, min: 0 }
    },
    plan: {
        name: { type: String, trim: true },
        latitude: { type: Number },
        longitude: { type: Number }
    },
    availability: {
        startDate: { type: Date },
        endDate: { type: Date },
        isAvailable: { type: Boolean, default: true }
    },
    rating: {
        average: { type: Number, min: 0, max: 5, default: 0 },
        count: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'archived'],
        default: 'active'
    }
}, { timestamps: true })

// Indexes for better query performance
postSchema.index({ user: 1, createdAt: -1 })
postSchema.index({ postType: 1, status: 1 })
postSchema.index({ 'location.city': 1, 'location.country': 1 })
postSchema.index({ categories: 1 })
postSchema.index({ isFeatured: 1, status: 1 })
postSchema.index({ difficulty: 1, postType: 1 })
// Geospatial index for nearby search
postSchema.index({ 'location.coordinates': '2dsphere' })

const Post = mongoose.model("post", postSchema)

// Review Schema for host reviews
const reviewSchema = new mongoose.Schema({
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    reviewerRole: {
        type: String,
        enum: ['guest', 'host'],
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    }
}, { timestamps: true })

// Indexes for reviews
reviewSchema.index({ host: 1, createdAt: -1 })
reviewSchema.index({ reviewer: 1 })
reviewSchema.index({ post: 1 })
reviewSchema.index({ rating: 1 })

// Prevent duplicate reviews from same user to same host for same post
reviewSchema.index({ host: 1, reviewer: 1, post: 1 }, { unique: true, sparse: true })

const User = mongoose.model("user", userSchema)
const OTP = mongoose.model("otp", otpSchema)
const Review = mongoose.model("review", reviewSchema)

module.exports = { User, OTP, Post, Review } 