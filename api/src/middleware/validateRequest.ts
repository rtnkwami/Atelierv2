import { Request, Response, NextFunction } from "express";
import z from "zod";

export function validate<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const issues = result.error.issues;
        const errors = issues.map(issue => ({
            field: issue.path.join("."),
            code: issue.code,
            message: issue.message
        }));
        return res.status(400).json({ errors });
    }

    req.body = result.data;
    next();
  };
}