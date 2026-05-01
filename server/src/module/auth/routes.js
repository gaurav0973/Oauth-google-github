import { Router } from "express";

const authRoutes = Router();

authRoutes.get("/logout", (req, res) => {
    res.clearCookie("token");
    return res.json({
        message: "Logged out successfully",
    });
});

export default authRoutes;