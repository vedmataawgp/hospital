import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./auth";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; role: string };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized", message: "No token provided" });
    return;
  }
  const decoded = verifyToken(auth.slice(7));
  if (!decoded) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token" });
    return;
  }
  req.user = decoded;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden", message: "Insufficient permissions" });
      return;
    }
    next();
  };
}
