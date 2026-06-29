import type { Request } from "express";

type SortOrder = "asc" | "desc";

/**
 * Parse sort query params from a request.
 * Returns a Prisma-compatible orderBy object.
 *
 * Usage: ?sortBy=id&sortOrder=desc
 * Supports nested fields: ?sortBy=student.name&sortOrder=asc
 */
export const parseSortParams = (
  req: Request,
  defaultField: string = "id",
  defaultOrder: SortOrder = "desc"
): Record<string, unknown> => {
  const sortBy = (req.query.sortBy as string) || defaultField;
  const sortOrder = (req.query.sortOrder as SortOrder) || defaultOrder;

  // Handle nested fields like "student.name" or "student.user.name"
  // Build nested Prisma orderBy, e.g. "student.user.name" => { student: { user: { name: "asc" } } }
  const parts = sortBy.split(".");
  if (parts.length > 1) {
    const result: Record<string, unknown> = {};
    let current: Record<string, unknown> = result;
    for (let i = 0; i < parts.length; i++) {
      const key = parts[i] as string;
      if (i === parts.length - 1) {
        current[key] = sortOrder;
      } else {
        const next: Record<string, unknown> = {};
        current[key] = next;
        current = next;
      }
    }
    return result;
  }

  return { [sortBy]: sortOrder };
};
