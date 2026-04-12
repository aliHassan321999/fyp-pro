import { Response } from 'express';

/**
 * Standardized Response Logic ensuring all API outputs strictly follow the project format.
 * Format: { success: boolean, message: string, data?: any }
 * 
 * @param res Express Response Object
 * @param statusCode HTTP Status Code
 * @param success Boolean indicator of operation success
 * @param message Human-readable message
 * @param data Optional payload
 */
export const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: any
) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};
