import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("FATAL CONFIGURATION ERROR: JWT_SECRET missing or too short (min 32 chars)");
}

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  return req.cookies?.token;
};

//Authenticate JWT Token from Header or Cookie
export const authenticate = (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return next(new AppError("Authentication token missing.", 401, "UNAUTHORIZED"));
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    next();
  } catch {
    next(new AppError("Invalid or expired token.", 401, "INVALID_TOKEN"));
  }
};

const hasAll = (claim, required) =>
  Array.isArray(claim) && claim.includes(required);

//Authorize by permission
export const requirePermission = (permission) => (req, res, next) => {
  if (!hasAll(req.user?.permissions, permission)) {
    return next(new AppError("You lack permission to perform this action.", 403, "FORBIDDEN"));
  }
  next();
};

//authorized by role
export const requireRole = (role) => (req, res, next) => {
  if (!hasAll(req.user?.roles, role)) {
    return next(new AppError(`Access denied. Requires ${role} role.`, 403, "FORBIDDEN"));
  }
  next();
};