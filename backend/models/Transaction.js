import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    holding: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Holding",
        // not required: a SELL that fully closes a position will leave the
        // Holding deleted, but we still want the transaction record to remain
    },
    symbol: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ["BUY", "SELL"],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [0.0001, "Quantity must be greater than 0"],
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative"],
    },
    totalValue: {
        type: Number,
        required: true,
    },
    notes: {
        type: String,
        maxlength: 500,
        trim: true,
    },
    executedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

transactionSchema.index({ user: 1, symbol: 1, executedAt: -1 });

// Auto-compute totalValue if not explicitly provided
transactionSchema.pre("validate", function(next) {
    if (this.totalValue === undefined || this.totalValue === null) {
        this.totalValue = this.quantity * this.price;
    }
    next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;