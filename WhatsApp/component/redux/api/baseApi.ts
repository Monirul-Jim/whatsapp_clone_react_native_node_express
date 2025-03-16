import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {RootState} from '../store';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://10.0.2.2:5000/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, {getState}) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['addedUser'],
  endpoints: () => ({}),
});
