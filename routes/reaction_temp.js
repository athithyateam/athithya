// TOGGLE REACTION - Authenticated users
postRouter.put("/:id/react", checkAuth, async (req, res) => {
    try {
        const { emoji } = req.body
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" })
        }

        const userId = req.user.userId
        // We might want to fetch user to get latest name, but req.user usually has it from token or checkAuth
        // checkAuth middleware usually attaches decoded token. 
        // If token doesn't have firstname, we default (or fetch user).
        // Let's assume req.user is populated or we use a fallback. 
        // Actually, checkAuth usually just sets req.user = decodedToken.
        // Let's fetch user name to be safe if not in token, OR just use "User" if missing.
        // Better: let's fetch the user quickly or trust the token.
        // For now, I'll rely on req.user.firstname if available, otherwise just "User".
        // UPDATED: Mongoose schema defines reactions.name.

        const userName = req.user.firstname || "User"

        const existingIndex = post.reactions.findIndex(r => r.user.toString() === userId)

        if (existingIndex > -1) {
            // Check if same emoji
            if (post.reactions[existingIndex].emoji === emoji) {
                // Remove
                post.reactions.splice(existingIndex, 1)
            } else {
                // Update
                post.reactions[existingIndex].emoji = emoji
                post.reactions[existingIndex].timestamp = Date.now()
            }
        } else {
            // Add
            post.reactions.push({
                user: userId,
                name: userName,
                emoji
            })
        }

        await post.save()

        return res.status(200).json({
            success: true,
            message: "Reaction updated",
            reactions: post.reactions
        })

    } catch (error) {
        console.error("Reaction error:", error)
        return res.status(500).json({ success: false, message: "Error updating reaction" })
    }
})
