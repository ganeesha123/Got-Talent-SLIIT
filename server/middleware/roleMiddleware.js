// Middleware to check roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            const role = req.user ? req.user.role : 'none';
            return res.status(403).json({ message: `Role ${role} is not authorized to access this resource` });
        }
        next();
    };
};
