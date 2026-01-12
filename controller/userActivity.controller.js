const UserActivity = require("../models/UserActivity");

// ✅ Helper function to log activity (used by other controllers)
exports.logActivity = async (activityData) => {
    try {
        const {
            userId,
            userName,
            userEmail,
            userRole,
            action,
            actionDetails,
            ipAddress,
            metadata,
        } = activityData;

        const activity = new UserActivity({
            userId,
            userName,
            userEmail,
            userRole,
            action,
            actionDetails,
            ipAddress,
            metadata: metadata || {},
        });

        await activity.save();
        console.log(`✅ Activity logged: ${action} by ${userName}`);
        return activity;
    } catch (error) {
        console.error("❌ Error logging activity:", error);
        // Don't throw error - activity logging should not break main flow
        return null;
    }
};

// ✅ Get all activities with filtering and pagination
exports.getAllActivities = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            action,
            userId,
            userRole,
            startDate,
            endDate,
            search,
        } = req.query;

        // Build filter object
        const filter = {};

        if (action) {
            filter.action = action;
        }

        if (userId) {
            filter.userId = userId;
        }

        if (userRole) {
            filter.userRole = userRole;
        }

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                // Add one day to include the end date
                const endDateTime = new Date(endDate);
                endDateTime.setDate(endDateTime.getDate() + 1);
                filter.createdAt.$lt = endDateTime;
            }
        }

        // Search by name or email
        if (search) {
            filter.$or = [
                { userName: { $regex: search, $options: "i" } },
                { userEmail: { $regex: search, $options: "i" } },
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get total count for pagination
        const totalCount = await UserActivity.countDocuments(filter);

        // Fetch activities
        const activities = await UserActivity.find(filter)
            .sort({ createdAt: -1 }) // Newest first
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            message: "Activities fetched successfully",
            data: {
                activities,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount,
                    limit: parseInt(limit),
                },
            },
        });
    } catch (error) {
        console.error("❌ Error fetching activities:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch activities",
            error: error.message,
        });
    }
};

// ✅ Get activities for a specific user
exports.getActivitiesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50 } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        const activities = await UserActivity.find({ userId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            message: "User activities fetched successfully",
            data: activities,
        });
    } catch (error) {
        console.error("❌ Error fetching user activities:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user activities",
            error: error.message,
        });
    }
};

// ✅ Get activity statistics
exports.getActivityStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const filter = {};

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const endDateTime = new Date(endDate);
                endDateTime.setDate(endDateTime.getDate() + 1);
                filter.createdAt.$lt = endDateTime;
            }
        }

        // Get counts by action type
        const actionStats = await UserActivity.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$action",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);

        // Get counts by user role
        const roleStats = await UserActivity.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$userRole",
                    count: { $sum: 1 },
                },
            },
        ]);

        // Get total count
        const totalCount = await UserActivity.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: "Activity statistics fetched successfully",
            data: {
                totalActivities: totalCount,
                byAction: actionStats,
                byRole: roleStats,
            },
        });
    } catch (error) {
        console.error("❌ Error fetching activity stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch activity statistics",
            error: error.message,
        });
    }
};

// ✅ Manually log an activity (if needed)
exports.createActivity = async (req, res) => {
    try {
        const {
            userId,
            userName,
            userEmail,
            userRole,
            action,
            actionDetails,
            ipAddress,
            metadata,
        } = req.body;

        // Validate required fields
        if (!userId || !userName || !userEmail || !userRole || !action) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const activity = await this.logActivity({
            userId,
            userName,
            userEmail,
            userRole,
            action,
            actionDetails,
            ipAddress,
            metadata,
        });

        if (!activity) {
            return res.status(500).json({
                success: false,
                message: "Failed to log activity",
            });
        }

        res.status(201).json({
            success: true,
            message: "Activity logged successfully",
            data: activity,
        });
    } catch (error) {
        console.error("❌ Error creating activity:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create activity",
            error: error.message,
        });
    }
};
