import { Router } from "express";
import { RefreshToken } from "../../common/models/refreshToken.model";

const authRoutes = Router();


authRoutes.get("/refresh", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token" });
    }

    try {
        // verify JWT
        const decoded = verifyToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
        );

        // check DB
        const storedToken = await RefreshToken.findOne({
        token: refreshToken,
        });

        if (!storedToken) {
        return res.status(401).json({ message: "Token not found" });
        }

        // generate new access token
        const newAccessToken = generateAccessToken(decoded.userId);

        res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
        });

        return res.json({ message: "Refreshed" });

    } catch (err) {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
});



authRoutes.get("/logout", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.json({ message: "Logged out" });
});

export default authRoutes;