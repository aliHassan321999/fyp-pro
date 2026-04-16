import { api } from '../../services/api';
import { LoginRequest, AuthResponse, AuthUser } from './auth.types';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<{ success: boolean; message: string }, any>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        data: userData,
      }),
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        data: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Forcefully inject the logged-in user into the getMe cache instantly to prevent Route Bounces!
          dispatch(
            authApi.util.updateQueryData('getMe', undefined, () => {
              return data as any;
            })
          );
        } catch {}
      },
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'], // Clearing auth tag resets the cached session
    }),
    getMe: builder.query<AuthResponse, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      providesTags: ['Auth'], // Subscribes to the auth session
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetMeQuery, useRegisterMutation } = authApi;
