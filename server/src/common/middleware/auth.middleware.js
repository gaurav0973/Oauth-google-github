import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;

        if (!token) {
        return res.status(401).json({ message: "No access token" });
        }

        const decoded = verifyToken(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();

    } catch (err) {
        return res.status(401).json({ message: "Invalid access token" });
    }
};