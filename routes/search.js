const express = require("express");
const { Post } = require("../db/mongoose");
const searchRouter = express.Router();

// SEARCH API - Search across all posts: itineraries, experiences, treks, and services
// GET /api/search?q=query&type=all|itinerary|experience|trek|service&location=city&difficulty=Easy&category=Adventure
searchRouter.get("/", async (req, res) => {
    try {
        const {
            q, // search query
            type = "all", // all, itinerary, experience, trek, service
            location, // city or country filter
            difficulty, // difficulty level for treks
            category, // category filter
            minPrice,
            maxPrice,
            sortBy = "createdAt", // createdAt, rating, price
            sortOrder = "desc", // desc, asc
            page = 1,
            limit = 20
        } = req.query;

        // Build the base query
        let query = {
            status: "active"
        };

        // Filter by type
        if (type === "itinerary") {
            query.postType = "plan";
        } else if (type === "experience") {
            query.postType = "experience";
        } else if (type === "trek") {
            query.postType = "trek";
        } else if (type === "service") {
            query.postType = "service";
        } else if (type === "all") {
            query.postType = { $in: ["plan", "experience", "trek", "service"] };
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid type parameter. Must be 'all', 'itinerary', 'experience', 'trek', or 'service'"
            });
        }

        // Text search across title, subtitle, description
        if (q && q.trim()) {
            query.$or = [
                { title: { $regex: q, $options: "i" } },
                { subtitle: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { "location.city": { $regex: q, $options: "i" } },
                { "location.country": { $regex: q, $options: "i" } }
            ];
        }

        // Location filter
        if (location && location.trim()) {
            query.$or = query.$or || [];
            query.$or.push(
                { "location.city": { $regex: location, $options: "i" } },
                { "location.state": { $regex: location, $options: "i" } },
                { "location.country": { $regex: location, $options: "i" } }
            );
        }

        // Difficulty filter (for treks/plans)
        if (difficulty) {
            query.difficulty = difficulty;
        }

        // Category filter
        if (category) {
            query.categories = { $in: [category] };
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query["price.perPerson"] = {};
            if (minPrice) {
                query["price.perPerson"].$gte = parseFloat(minPrice);
            }
            if (maxPrice) {
                query["price.perPerson"].$lte = parseFloat(maxPrice);
            }
        }

        // Sorting
        let sortOptions = {};
        if (sortBy === "rating") {
            sortOptions["rating.average"] = sortOrder === "asc" ? 1 : -1;
        } else if (sortBy === "price") {
            sortOptions["price.perPerson"] = sortOrder === "asc" ? 1 : -1;
        } else {
            sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        let results = await Post.find(query)
            .populate("user", "firstname lastname email avatar role")
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalCount = await Post.countDocuments(query);

        // Transformation to match requested output (flatten rating)
        results = results.map(item => ({
            ...item,
            rating: item.rating?.average || 0
        }));

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        res.status(200).json({
            success: true,
            message: "Search completed successfully",
            data: {
                results,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalResults: totalCount,
                    resultsPerPage: limitNum,
                    hasNextPage,
                    hasPrevPage
                },
                filters: {
                    query: q || null,
                    type,
                    location: location || null,
                    difficulty: difficulty || null,
                    category: category || null,
                    priceRange: {
                        min: minPrice || null,
                        max: maxPrice || null
                    }
                }
            }
        });

    } catch (error) {
        console.error("Search API error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to perform search",
            error: error.message
        });
    }
});

// ADVANCED SEARCH - More detailed search with multiple filters
// POST /api/search/advanced
searchRouter.post("/advanced", async (req, res) => {
    try {
        const {
            searchText,
            postTypes = ["plan", "experience"], // array of types
            locations = [], // array of cities/countries
            difficulties = [], // array of difficulty levels
            categories = [], // array of categories
            priceRange = {},
            durationRange = {}, // for itineraries
            amenities = [], // array of amenities
            rating = null, // minimum rating
            sortBy = "createdAt",
            sortOrder = "desc",
            page = 1,
            limit = 20
        } = req.body;

        // Build query
        let query = { status: "active" };

        // Filter by post types
        if (postTypes && postTypes.length > 0) {
            query.postType = { $in: postTypes };
        }

        // Text search
        if (searchText && searchText.trim()) {
            query.$text = { $search: searchText };
        }

        // Location filter
        if (locations && locations.length > 0) {
            query.$or = [
                { "location.city": { $in: locations.map(l => new RegExp(l, "i")) } },
                { "location.country": { $in: locations.map(l => new RegExp(l, "i")) } }
            ];
        }

        // Difficulty filter
        if (difficulties && difficulties.length > 0) {
            query.difficulty = { $in: difficulties };
        }

        // Categories filter
        if (categories && categories.length > 0) {
            query.categories = { $in: categories };
        }

        // Price range
        if (priceRange.min !== undefined || priceRange.max !== undefined) {
            query["price.perPerson"] = {};
            if (priceRange.min !== undefined) {
                query["price.perPerson"].$gte = priceRange.min;
            }
            if (priceRange.max !== undefined) {
                query["price.perPerson"].$lte = priceRange.max;
            }
        }

        // Duration range (for itineraries)
        if (durationRange.minDays !== undefined || durationRange.maxDays !== undefined) {
            query["duration.days"] = {};
            if (durationRange.minDays !== undefined) {
                query["duration.days"].$gte = durationRange.minDays;
            }
            if (durationRange.maxDays !== undefined) {
                query["duration.days"].$lte = durationRange.maxDays;
            }
        }

        // Amenities filter
        if (amenities && amenities.length > 0) {
            query.amenities = { $all: amenities };
        }

        // Minimum rating filter
        if (rating !== null && rating !== undefined) {
            query["rating.average"] = { $gte: parseFloat(rating) };
        }

        // Sorting
        let sortOptions = {};
        if (sortBy === "rating") {
            sortOptions["rating.average"] = sortOrder === "asc" ? 1 : -1;
        } else if (sortBy === "price") {
            sortOptions["price.perPerson"] = sortOrder === "asc" ? 1 : -1;
        } else {
            sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        const [results, totalCount] = await Promise.all([
            Post.find(query)
                .populate("user", "firstname lastname email avatar role")
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Post.countDocuments(query)
        ]);

        // Calculate pagination
        const totalPages = Math.ceil(totalCount / limitNum);

        res.status(200).json({
            success: true,
            message: "Advanced search completed successfully",
            data: {
                results,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalResults: totalCount,
                    resultsPerPage: limitNum,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            }
        });

    } catch (error) {
        console.error("Advanced search error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to perform advanced search",
            error: error.message
        });
    }
});

// GET SEARCH SUGGESTIONS - Quick autocomplete suggestions
// GET /api/search/suggestions?q=query
searchRouter.get("/suggestions", async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Query parameter 'q' is required"
            });
        }

        // Get title suggestions
        const suggestions = await Post.find({
            status: "active",
            postType: { $in: ["plan", "experience"] },
            $or: [
                { title: { $regex: q, $options: "i" } },
                { "location.city": { $regex: q, $options: "i" } }
            ]
        })
            .select("title location.city postType")
            .limit(10)
            .lean();

        // Format suggestions
        const formatted = suggestions.map(item => ({
            text: item.title,
            location: item.location?.city || "",
            type: item.postType === "plan" ? "itinerary" : "experience"
        }));

        res.status(200).json({
            success: true,
            data: {
                suggestions: formatted
            }
        });

    } catch (error) {
        console.error("Search suggestions error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get search suggestions",
            error: error.message
        });
    }
});

// GET BY LOCATION - Get all itineraries and experiences by location
// GET /api/search/by-location?location=city&type=all&sortBy=createdAt&page=1&limit=20
searchRouter.get("/by-location", async (req, res) => {
    try {
        const {
            location,
            type = "all", // all, itinerary, experience
            sortBy = "createdAt",
            sortOrder = "desc",
            page = 1,
            limit = 20
        } = req.query;

        // Validate location parameter
        if (!location || !location.trim()) {
            return res.status(400).json({
                success: false,
                message: "Location parameter is required"
            });
        }

        // Build query
        let query = {
            status: "active",
            $or: [
                { "location.city": { $regex: location, $options: "i" } },
                { "location.state": { $regex: location, $options: "i" } },
                { "location.country": { $regex: location, $options: "i" } }
            ]
        };

        // Filter by type
        if (type === "itinerary") {
            query.postType = "plan";
        } else if (type === "experience") {
            query.postType = "experience";
        } else if (type === "all") {
            query.postType = { $in: ["plan", "experience"] };
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid type parameter. Must be 'all', 'itinerary', or 'experience'"
            });
        }

        // Sorting
        let sortOptions = {};
        if (sortBy === "rating") {
            sortOptions["rating.average"] = sortOrder === "asc" ? 1 : -1;
        } else if (sortBy === "price") {
            sortOptions["price.perPerson"] = sortOrder === "asc" ? 1 : -1;
        } else {
            sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        const [results, totalCount] = await Promise.all([
            Post.find(query)
                .populate("user", "firstname lastname email avatar role")
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Post.countDocuments(query)
        ]);

        // Group results by type for better organization
        const itineraries = results.filter(item => item.postType === "plan");
        const experiences = results.filter(item => item.postType === "experience");

        // Calculate pagination
        const totalPages = Math.ceil(totalCount / limitNum);

        res.status(200).json({
            success: true,
            message: `Found ${totalCount} results for location: ${location}`,
            data: {
                location: location,
                summary: {
                    total: totalCount,
                    itineraries: itineraries.length,
                    experiences: experiences.length
                },
                results: {
                    all: results,
                    itineraries: itineraries,
                    experiences: experiences
                },
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalResults: totalCount,
                    resultsPerPage: limitNum,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            }
        });

    } catch (error) {
        console.error("Location search error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search by location",
            error: error.message
        });
    }
});

module.exports = searchRouter;
