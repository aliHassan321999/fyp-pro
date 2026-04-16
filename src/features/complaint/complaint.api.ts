import { api } from '../../services/api';
import { 
  ComplaintResponse, 
  CreateComplaintDto, 
  GetComplaintsResponse,
  GetComplaintActivityResponse,
  UpdateComplaintStatusDto,
  AssignComplaintDto,
  GetStaffResponse
} from './complaint.types';

export const complaintApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getComplaints: builder.query<GetComplaintsResponse, void>({
      query: () => ({
        url: '/complaints',
        method: 'GET',
      }),
      providesTags: ['Complaint'],
    }),
    getComplaintDetails: builder.query<ComplaintResponse, string>({
      query: (id) => ({
        url: `/complaints/${id}`,
        method: 'GET',
      }),
      providesTags: ['Complaint'],
    }),
    getComplaintActivity: builder.query<GetComplaintActivityResponse, string>({
      query: (id) => ({
        url: `/complaints/${id}/activity`,
        method: 'GET',
      }),
      providesTags: ['Complaint'],
    }),
    createComplaint: builder.mutation<ComplaintResponse, CreateComplaintDto>({
      query: (body) => ({
        url: '/complaints',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Complaint'],
    }),
    updateComplaintStatus: builder.mutation<ComplaintResponse, UpdateComplaintStatusDto>({
      query: ({ id, status }) => ({
        url: `/complaints/${id}/status`,
        method: 'PATCH',
        data: { status },
      }),
      invalidatesTags: ['Complaint'],
    }),
    assignComplaint: builder.mutation<ComplaintResponse, AssignComplaintDto>({
      query: ({ id, assignedStaffId }) => ({
        url: `/complaints/${id}/assign`,
        method: 'PATCH',
        data: { assignedStaffId },
      }),
      invalidatesTags: ['Complaint'],
    }),
    getStaff: builder.query<GetStaffResponse, void>({
      query: () => ({
        url: '/users/staff',
        method: 'GET',
      }),
    }),
  }),
});

export const { 
  useGetComplaintsQuery, 
  useCreateComplaintMutation, 
  useUpdateComplaintStatusMutation,
  useGetComplaintDetailsQuery,
  useGetComplaintActivityQuery,
  useAssignComplaintMutation,
  useGetStaffQuery
} = complaintApi;
