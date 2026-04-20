import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '../../services/customBaseQuery';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: customBaseQuery(),
  tagTypes: ['User', 'Complaint', 'Department', 'DepartmentStaff', 'Staff'],
  endpoints: (builder) => ({
    // ── Analytics ──────────────────────────────────────────────────────────────
    getAnalytics: builder.query<any, { startDate?: string; endDate?: string } | void>({
      query: (params) => ({ url: '/admin/analytics', method: 'GET', params: params || {} }),
      providesTags: ['Complaint'],
    }),

    // ── User Approval ──────────────────────────────────────────────────────────
    getPendingUsers: builder.query<any, void>({
      query: () => ({ url: '/admin/pending-users', method: 'GET' }),
      providesTags: ['User'],
    }),
    approveUser: builder.mutation<any, string>({
      query: (id) => ({ url: `/admin/users/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: ['User'],
    }),
    rejectUser: builder.mutation<any, { id: string; reason: string }>({
      query: ({ id, reason }) => ({ url: `/admin/users/${id}/reject`, method: 'PATCH', data: { reason } }),
      invalidatesTags: ['User'],
    }),

    // ── Departments ────────────────────────────────────────────────────────────
    getDepartments: builder.query<any, void>({
      query: () => ({ url: '/departments', method: 'GET' }),
      providesTags: ['Department'],
    }),
    createDepartment: builder.mutation<any, { name: string; slaTargetHours: number; description?: string }>({
      query: (data) => ({ url: '/departments', method: 'POST', data }),
      invalidatesTags: ['Department'],
    }),
    getDepartmentById: builder.query<any, string>({
      query: (id) => ({ url: `/departments/${id}`, method: 'GET' }),
      providesTags: (_result, _error, id) => [{ type: 'Department', id }],
    }),
    updateDepartment: builder.mutation<any, { id: string; data: { name?: string; slaTargetHours?: number; description?: string } }>({
      query: ({ id, data }) => ({ url: `/departments/${id}`, method: 'PATCH', data }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Department', id }, 'Department'],
    }),
    getDepartmentStaff: builder.query<any, string>({
      query: (id) => ({ url: `/departments/${id}/staff`, method: 'GET' }),
      providesTags: (_result, _error, id) => [{ type: 'DepartmentStaff', id }],
    }),
    assignHead: builder.mutation<any, { deptId: string; staffId: string }>({
      query: ({ deptId, staffId }) => ({
        url: `/departments/${deptId}/assign-head`,
        method: 'PATCH',
        data: { staffId },
      }),
      invalidatesTags: (_result, _error, { deptId }) => [
        { type: 'Department', id: deptId },
        'Department',
      ],
    }),

    // ── Staff ────────────────────────────────────────────────────────────────
    createStaff: builder.mutation<any, any>({
      query: (data) => ({ url: '/users', method: 'POST', data }),
      invalidatesTags: ['User', 'Staff'],
    }),
    getStaffMembers: builder.query<any, { unassigned?: boolean; departmentId?: string } | void>({
      query: (params) => ({ url: '/users/staff', method: 'GET', params: params || {} }),
      providesTags: ['Staff'],
    }),
    promoteStaff: builder.mutation<any, { userId: string; deptId: string }>({
      query: ({ userId }) => ({ url: `/users/${userId}/promote`, method: 'PATCH' }),
      invalidatesTags: (_result, _error, { deptId }) => [{ type: 'DepartmentStaff', id: deptId }],
    }),
    removeStaffFromDepartment: builder.mutation<any, { userId: string; deptId: string }>({
      query: ({ userId }) => ({ url: `/users/${userId}/remove-department`, method: 'PATCH' }),
      invalidatesTags: (_result, _error, { deptId }) => [
        { type: 'DepartmentStaff', id: deptId },
        'Staff',
      ],
    }),
    assignStaffToDepartment: builder.mutation<any, { userId: string; departmentId: string; currentDeptId: string }>({
      query: ({ userId, departmentId }) => ({
        url: `/users/${userId}/assign-department`,
        method: 'PATCH',
        data: { departmentId },
      }),
      invalidatesTags: (_result, _error, { currentDeptId }) => [
        { type: 'DepartmentStaff', id: currentDeptId },
        'Staff',
        'Department',
      ],
    }),
  }),
});

export const {
  useGetAnalyticsQuery,
  useGetPendingUsersQuery,
  useApproveUserMutation,
  useRejectUserMutation,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useGetDepartmentByIdQuery,
  useUpdateDepartmentMutation,
  useGetDepartmentStaffQuery,
  useAssignHeadMutation,
  useCreateStaffMutation,
  useGetStaffMembersQuery,
  usePromoteStaffMutation,
  useRemoveStaffFromDepartmentMutation,
  useAssignStaffToDepartmentMutation,
} = adminApi;
