import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.json({ success: false, message: 'Not authorized, token missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        return res.json({ success: false, message: 'Invalid or expired token' });
    }
};

export default authMiddleware;
