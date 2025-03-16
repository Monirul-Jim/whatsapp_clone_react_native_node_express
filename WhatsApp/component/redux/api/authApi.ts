import {baseApi} from './baseApi';

const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    registerUser: builder.mutation({
      query: userInfo => ({
        url: '/auth/register/',
        method: 'POST',
        body: userInfo,
      }),
    }),
    login: builder.mutation({
      query: credentials => ({
        url: '/auth/login/',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});
export const {useRegisterUserMutation, useLoginMutation} = authApi;
