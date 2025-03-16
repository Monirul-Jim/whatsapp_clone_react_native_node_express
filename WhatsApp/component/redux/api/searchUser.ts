import {baseApi} from './baseApi';

const userApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getSearchUser: builder.query({
      query: searchUser => ({
        url: `/auth/search`,
        method: 'GET',
        params: {searchUser},
      }),
    }),
    addedUser: builder.mutation({
      query: data => ({
        url: '/added/added-user',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['addedUser'],
    }),
    getAddedUsers: builder.query({
      query: userId => ({
        url: `/added/${userId}/added-users`,
        method: 'GET',
      }),
      providesTags: ['addedUser'],
    }),
  }),
});

export const {
  useGetSearchUserQuery,
  useAddedUserMutation,
  useGetAddedUsersQuery,
} = userApi;
