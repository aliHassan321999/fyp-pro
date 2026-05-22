import { api } from '../../services/api';

interface Staff {
  _id: string;
  email: string;
  rank: string;
  accountStatus: string;
  profile: {
    fullName: string;
  };
  createdAt: string;
  stats: {
    assignedCount: number;
    resolvedCount: number;
    slaBreaches: number;
    complianceRate: number;
    lastActivityAt: string | null;
  };
}

interface DepartmentStaffResponse {
  success: boolean;
  message: string;
  data: Staff[];
}

interface DepartmentHeadDashboard {
  success: boolean;
  message: string;
  data: {
    stats: {
      unassigned: number;
      inProgress: number;
      resolvedToday: number;
      slaAtRisk: number;
    };
    recentComplaints: any[];
  };
}

export const departmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDepartmentStaff: builder.query<DepartmentStaffResponse, string>({
      query: (departmentId) => ({
        url: `/departments/${departmentId}/staff`,
        method: 'GET',
      }),
      providesTags: ['Department'],
    }),
    getDepartmentHeadDashboard: builder.query<DepartmentHeadDashboard, void>({
      query: () => ({
        url: `/departments/head/dashboard`,
        method: 'GET',
      }),
      providesTags: ['Department'],
    }),
    getDepartmentById: builder.query<any, string>({
      query: (departmentId) => ({
        url: `/departments/${departmentId}`,
        method: 'GET',
      }),
      providesTags: ['Department'],
    }),
    getRecommendedStaff: builder.query<any, string>({
      query: (departmentId) => ({
        url: `/departments/${departmentId}/recommend-staff`,
        method: 'GET',
      }),
      providesTags: ['Department'],
    }),
    getAvailableStaff: builder.query<any, void>({
      query: () => ({
        url: '/users/staff?unassigned=true',
        method: 'GET',
      }),
      providesTags: ['Department'],
    }),
    createStaff: builder.mutation<any, any>({
      query: (staffData) => ({
        url: '/users',
        method: 'POST',
        body: staffData,
      }),
      invalidatesTags: ['Department'],
    }),
  }),
});

export const {
  useGetDepartmentStaffQuery,
  useGetDepartmentHeadDashboardQuery,
  useGetDepartmentByIdQuery,
  useGetRecommendedStaffQuery,
  useGetAvailableStaffQuery,
  useCreateStaffMutation,
} = departmentApi;
