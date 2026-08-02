import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    symbol: {
        type: String,
        required: [true, "Stock symbol is required"],
        uppercase: true,
        trim: true,
        maxlength: [10, "Symbol looks too long"],
    },
    companyName: {
        type: String,
        trim: true,
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [0.0001, "Quantity must be greater than 0"],
    },
    avgBuyPrice: {
        type: Number,
        required: [true, "Average buy price is required"],
        min: [0, "Buy price cannot be negative"],
    },
    // Manually tracked "current" price for now — will be replaced/refreshed
    // by the live Finnhub price feed in the stock-data module. Keeping it
    // on the document lets the portfolio summary work standalone today,
    // and gives the live-price module an obvious field to update.
    currentPrice: {
        type: Number,
        min: [0, "Price cannot be negative"],
    },
    sector: {
        type: String,
        trim: true,
    },
    purchaseDate: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
        maxlength: [500, "Notes cannot exceed 500 characters"],
        trim: true,
    },
}, { timestamps: true });

// A user shouldn't have two separate holding documents for the same symbol —
// buying more of a stock should average into the existing position instead.
holdingSchema.index({ user: 1, symbol: 1 }, { unique: true });

// --- Derived fields, computed on read, never stored (avoids stale data) ---
holdingSchema.virtual("investedValue").get(function() {
    return this.quantity * this.avgBuyPrice;
});

holdingSchema.virtual("currentValue").get(function() {
    const price = this.currentPrice ?? this.avgBuyPrice;
    return this.quantity * price;
});

holdingSchema.virtual("profitLoss").get(function() {
    return this.currentValue - this.investedValue;
});

holdingSchema.virtual("profitLossPercent").get(function() {
    if (this.investedValue === 0) return 0;
    return (this.profitLoss / this.investedValue) * 100;
});

holdingSchema.set("toJSON", { virtuals: true });
holdingSchema.set("toObject", { virtuals: true });

const Holding = mongoose.model("Holding", holdingSchema);

export default Holding;