import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    symbol: {
        type: String,
        required: [true, "Symbol is required"],
        uppercase: true,
        trim: true,
        maxlength: 10,
    },
    companyName: {
        type: String,
        trim: true,
    },
    note: {
        type: String,
        maxlength: 300,
        trim: true,
    },
    targetPrice: {
        type: Number,
        min: 0,
    },
    alertDirection: {
        // "above": notify when price rises to/above targetPrice (breakout watch)
        // "below": notify when price falls to/below targetPrice (dip watch)
        type: String,
        enum: ["above", "below"],
        default: "above",
    },
    alertEnabled: {
        type: Boolean,
        default: true,
    },
    alertTriggeredAt: {
        // set once the alert has fired, so it doesn't re-fire on every poll.
        // Cleared (set back to null) if the user edits targetPrice/direction,
        // re-arming the alert.
        type: Date,
        default: null,
    },
}, { timestamps: true });

// One watchlist entry per symbol per user
watchlistSchema.index({ user: 1, symbol: 1 }, { unique: true });

const Watchlist = mongoose.model("Watchlist", watchlistSchema);

export default Watchlist;