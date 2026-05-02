import { Router } from "express";
import { RefreshToken } from "../../common/models/refreshToken.model";

const authRoutes = Router();


authRoutes.get("/refresh", async (req, res) => {
    const oldToken = req.cookies.refreshToken;

    if (!oldToken) {
        return res.status(401).json({ message: "No refresh token" });
    }

    try {
        // ✅ verify JWT
        const decoded = verifyToken(
        oldToken,
        process.env.JWT_REFRESH_SECRET
        );

        // ✅ find token in DB
        const storedToken = await RefreshToken.findOne({
        token: oldToken,
        });

        // 🚨 TOKEN REUSE DETECTED
        if (!storedToken || storedToken.isRevoked) {
        // 🔥 security action: logout all sessions
        await RefreshToken.deleteMany({ userId: decoded.userId });

        return res.status(403).json({
            message: "Refresh token reuse detected",
        });
        }

        // 🔥 ROTATION STARTS HERE

        // 1. revoke old token
        storedToken.isRevoked = true;
        await storedToken.save();

        // 2. issue new tokens
        const newAccessToken = generateAccessToken(decoded.userId);
        const newRefreshToken = generateRefreshToken(decoded.userId);

        // 3. store new refresh token
        await RefreshToken.create({
        userId: decoded.userId,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        // 4. set cookies
        res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({ message: "Token rotated" });

    } catch (err) {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
});


authRoutes.get("/logout", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        await RefreshToken.updateOne(
        { token: refreshToken },
        { isRevoked: true }
        );
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.json({ message: "Logged out" });
});

export default authRoutes;