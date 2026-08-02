import mongoose from "mongoose";

const portfolioSnapshotSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    date: {
        // normalized to midnight UTC so there's at most one snapshot per
        // calendar day per user (see the unique index below)
        type: Date,
        required: true,
    },
    totalInvested: {
        type: Number,
        required: true,
    },
    totalCurrentValue: {
        type: Number,
        required: true,
    },
    totalProfitLoss: {
        type: Number,
        required: true,
    },
    totalProfitLossPercent: {
        type: Number,
        required: true,
    },
    holdingsCount: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

// One snapshot per user per day — re-saving the same day overwrites it
// (see upsert in portfolioSnapshotService.js) rather than creating duplicates.
portfolioSnapshotSchema.index({ user: 1, date: 1 }, { unique: true });

const PortfolioSnapshot = mongoose.model("PortfolioSnapshot", portfolioSnapshotSchema);

export default PortfolioSnapshot;