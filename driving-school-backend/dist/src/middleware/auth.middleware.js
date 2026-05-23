import jwt from "jsonwebtoken";
const getTokenFromRequest = (req) => {
    // First try Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader) {
        return authHeader.split(" ")[1];
    }
    // Fallback to cookie
    return req.cookies?.token;
};
export const authenticate = (req, res, next) => {
    const token = getTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};
//# sourceMappingURL=auth.middleware.js.map