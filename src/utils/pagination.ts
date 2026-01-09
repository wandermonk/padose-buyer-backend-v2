import { PaginationParams, PaginationMeta } from '../types/common';

export function parsePaginationParams(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(500, Math.max(1, parseInt(String(query.limit || '20'), 10)));

  return { page, limit };
}

export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

