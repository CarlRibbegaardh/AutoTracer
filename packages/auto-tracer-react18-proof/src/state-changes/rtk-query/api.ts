/**
 * RTK Query API configuration.
 * Defines queries and mutations for user and post data.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { User, Post } from "./types";

/**
 * RTK Query API with mocked endpoints for testing.
 * Demonstrates query and mutation hook patterns.
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    // Simple query returning primitive/simple object
    getUser: builder.query<User, number>({
      // Mock implementation for testing
      queryFn: async (id) => ({
        data: {
          id,
          name: "John Doe",
          email: "john@example.com",
          profile: {
            bio: "Software Developer",
            avatar: "avatar.jpg",
          },
        },
      }),
    }),
    // Complex query returning array of objects
    getPosts: builder.query<Post[], void>({
      queryFn: async () => ({
        data: [
          { id: 1, title: "Post 1", content: "Content 1", authorId: 1 },
          { id: 2, title: "Post 2", content: "Content 2", authorId: 2 },
        ],
      }),
    }),
    // Mutation returning simple object
    updateUser: builder.mutation<User, Partial<User> & { id: number }>({
      queryFn: async ({ id, ...patch }) => ({
        data: {
          id,
          name: patch.name || "Updated Name",
          email: patch.email || "updated@example.com",
          profile: patch.profile || {
            bio: "Updated Bio",
            avatar: "updated.jpg",
          },
        },
      }),
    }),
    // Mutation returning complex object
    createPost: builder.mutation<Post, Omit<Post, "id">>({
      queryFn: async (post) => ({
        data: {
          id: Date.now(),
          ...post,
        },
      }),
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetPostsQuery,
  useUpdateUserMutation,
  useCreatePostMutation,
} = api;
