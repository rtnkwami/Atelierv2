import { auth } from "@config/auth.config.ts";
import type { Request, Response, NextFunction } from "express";
import logger from "@config/logger.config.ts";

export async function verifyJwt (req: Request, res: Response, next: NextFunction) {
    try {
        const idToken = req.headers.authorization?.split(" ")[1];

        if (!idToken) {
            return res.status(401).json({ error: "Unauthorized" }) 
        }
        const payload = await auth.verifyIdToken(idToken);
        req.user = payload;

        next()
    } catch (error) {
        logger.error({ error }, "Auth Error")
    }
}