import { Router } from "express";

const authRoutes = Router();


authRoutes.get("/refresh", (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token" });
    }

    try {
        const decoded = verifyToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
        );

        const newAccessToken = generateAccessToken(decoded.userId);

        res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
        });

        return res.json({ message: "Access token refreshed" });

    } catch (err) {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
});



authRoutes.get("/logout", (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.json({ message: "Logged out" });
});

export default authRoutes;