import { Response } from 'express';
import { ApiResponse } from '../types/common';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: unknown
): void {
  const errorResponse: { code: string; message: string; details?: unknown } = {
    code,
    message,
  };
  
  if (details && typeof details === 'object') {
    errorResponse.details = details;
  }
  
  const response: ApiResponse<never> = {
    success: false,
    error: errorResponse,
  };
  res.status(statusCode).json(response);
}

