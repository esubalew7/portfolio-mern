// Import mongoose
import mongoose from "mongoose";

// Import bcrypt for hashing passwords
import bcrypt from "bcryptjs";

// Create user schema
const userSchema = new mongoose.Schema(
    {
        // Email field
        email: {
            type: String,        // Data type
            required: true,      // Must be provided
            unique: true,        // No duplicate emails
            trim: true,          // Remove spaces
            lowercase: true,     // Convert to lowercase
        },

        // Password field (optional for Google-authenticated users)
        password: {
            type: String,        // Stored as hashed string
            required: false,     // Google users may not have a password
        },

        // Profile fields
        name: {
            type: String,
            trim: true,
            default: '',
        },
        role: {
            type: String,
            trim: true,
            default: '',
        },
        profileImage: {
            type: String,
            default: '',
        },

        // Two-Factor Authentication fields
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        twoFactorSecret: {
            type: String,
            default: '',
        },
        recoveryCodes: {
            type: [String],
            default: [],
        },
        last2FAVerifiedAt: {
            type: Date,
            default: null,
        },
        twoFactorAttempts: {
            type: Number,
            default: 0,
        },
        twoFactorLockedUntil: {
            type: Date,
            default: null,
        },

        // Password change tracking
        passwordChangedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true, // adds createdAt & updatedAt automatically
    }
);


// ========================================
// 🔐 HASH PASSWORD BEFORE SAVING
// ========================================
userSchema.pre("save", async function () {
    // Only hash if password is present and modified
    if (!this.password || !this.isModified("password")) {
        return;
    }

    // Generate salt (adds randomness)
    const salt = await bcrypt.genSalt(10);

    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
});


// ========================================
// 🔐 COMPARE PASSWORD METHOD
// ========================================
userSchema.methods.comparePassword = async function (enteredPassword) {
    // Compare entered password with hashed password
    return await bcrypt.compare(enteredPassword, this.password);
};


// Create model
const User = mongoose.model("User", userSchema);

// Export model
export default User;