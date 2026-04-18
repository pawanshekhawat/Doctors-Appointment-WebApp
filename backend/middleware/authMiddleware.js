import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.userRole)) {
        return res.status(403).json({ success: false, message: 'Not authorized for this action' });
    }
    next();
};

export default authMiddleware;
export { requireRole };
