import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Validates req.body against a Zod schema.
 * On failure: returns 400 with field-level error messages.
 * On success: replaces req.body with the parsed (coerced + defaulted) data.
 */
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = (result.error as ZodError).issues.map((e) => ({
        field:   e.path.join(".") || "body",
        message: e.message,
      }));

      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    // Replace req.body with the clean, coerced, default-filled data
    req.body = result.data;
    next();
  };
}
