import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please provide a valid email address",
        ],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
        select: false, // never return password by default in queries
    },
    riskTolerance: {
        type: String,
        enum: ["conservative", "moderate", "aggressive"],
        default: "moderate",
    },
    currency: {
        type: String,
        default: "USD",
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    lastLoginAt: {
        type: Date,
    },
    passwordChangedAt: {
        type: Date,
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
}, {
    timestamps: true, // adds createdAt, updatedAt
});

// Hash password before saving, only if it was modified
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);

    // If this isn't a new doc, track when password was changed (used to invalidate old JWTs)
    if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000;
    }
    next();
});

// Instance method: compare entered password with hashed password in DB
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Instance method: check if password was changed after a given JWT timestamp
userSchema.methods.changedPasswordAfter = function(jwtTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return jwtTimestamp < changedTimestamp;
    }
    return false;
};

// Remove sensitive fields whenever a user doc is converted to JSON (e.g. sent in API response)
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.passwordResetToken;
    delete obj.passwordResetExpires;
    return obj;
};

const User = mongoose.model("User", userSchema);

export default User;