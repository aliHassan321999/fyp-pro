import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '../../services/customBaseQuery';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: customBaseQuery(),
  tagTypes: ['User', 'Complaint', 'Department'],
  endpoints: (builder) => ({
    getAnalytics: builder.query<any, { startDate?: string; endDate?: string } | void>({
      query: (params) => ({ url: '/admin/analytics', method: 'GET', params: params || {} }),
      providesTags: ['Complaint'], // Forces auto-refresh when ANY complaint mutates globally
    }),
    getPendingUsers: builder.query<any, void>({
      query: () => ({ url: '/admin/pending-users', method: 'GET' }),
      providesTags: ['User'],
    }),
    approveUser: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/users/${id}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['User'],
    }),
    rejectUser: builder.mutation<any, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/users/${id}/reject`,
        method: 'PATCH',
        data: { reason },
      }),
      invalidatesTags: ['User'],
    }),
    createDepartment: builder.mutation<any, { name: string; slaTargetHours: number; description?: string }>({
      query: (data) => ({
        url: '/departments',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Department'],
    }),
    getDepartments: builder.query<any, void>({
      query: () => ({
        url: '/departments',
        method: 'GET',
      }),
      providesTags: ['Department'],
    }),
    createStaff: builder.mutation<any, any>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetAnalyticsQuery,
  useGetPendingUsersQuery,
  useApproveUserMutation,
  useRejectUserMutation,
  useCreateDepartmentMutation,
  useGetDepartmentsQuery,
  useCreateStaffMutation,
} = adminApi;
