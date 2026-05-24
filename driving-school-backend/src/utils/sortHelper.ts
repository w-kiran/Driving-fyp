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

  // Handle nested fields like "student.name"
  const dotIndex = sortBy.indexOf(".");
  if (dotIndex !== -1) {
    const parent = sortBy.substring(0, dotIndex);
    const child = sortBy.substring(dotIndex + 1);
    return { [parent]: { [child]: sortOrder } };
  }

  return { [sortBy]: sortOrder };
};
