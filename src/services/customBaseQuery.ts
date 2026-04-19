import { BaseQueryFn } from '@reduxjs/toolkit/query/react';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

const axiosInstance = axios.create({
  // Fallback strictly matches Mongoose server endpoint for CORS/Cookies
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

export type CustomBaseQueryConfig = {
  url: string;
  method: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
};

export const customBaseQuery = (): BaseQueryFn<
  CustomBaseQueryConfig,
  unknown,
  unknown
> => async ({ url, method, data, params }) => {
  try {
    const result = await axiosInstance({ url, method, data, params });
    return { data: result.data };
  } catch (axiosError) {
    const err = axiosError as AxiosError;

    // Handle single 401 Unauthorized simple retry pattern without Mutex
    if (err.response?.status === 401 && url !== '/auth/refresh') {
      try {
        // Call refresh endpoint
        await axiosInstance({ url: '/auth/refresh', method: 'POST' });
        
        // Retry the original request
        const retryResult = await axiosInstance({ url, method, data, params });
        return { data: retryResult.data };
      } catch (refreshError) {
        // If refresh fails, hard redirect to login
        window.location.href = '/login';
        return {
          error: {
            status: err.response?.status,
            data: err.response?.data || err.message,
          },
        };
      }
    }

    return {
      error: {
        status: err.response?.status,
        data: err.response?.data || err.message,
      },
    };
  }
};
