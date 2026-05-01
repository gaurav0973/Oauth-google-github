import mongoose from "mongoose";

const oauthAccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    provider: {
        type: String,
        enum: ['google', 'github'],
    },
    providerAccountId: {
        type: String,
    }
}, {
    timestamps: true
});

oauthAccountSchema.index(
    { provider: 1, providerAccountId: 1 },
    { unique: true }
);

export const OauthAccount = mongoose.model("OauthAccount", oauthAccountSchema);