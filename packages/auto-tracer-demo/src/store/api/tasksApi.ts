import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Task, TaskId, CreateTaskData, UpdateTaskData } from "../../domain";

/**
 * RTK Query API for task operations
 *
 * Uses MSW to intercept requests and provide mock responses.
 */
export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    /**
     * Fetch all tasks
     */
    getTasks: builder.query<Task[], void>({
      query: () => "/tasks",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Task" as const, id })),
              { type: "Task", id: "LIST" },
            ]
          : [{ type: "Task", id: "LIST" }],
    }),

    /**
     * Fetch a single task by ID
     */
    getTask: builder.query<Task, TaskId>({
      query: (id) => `/tasks/${id}`,
      providesTags: (result, error, id) => [{ type: "Task", id }],
    }),

    /**
     * Create a new task
     */
    createTask: builder.mutation<Task, CreateTaskData>({
      query: (data) => ({
        url: "/tasks",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),

    /**
     * Update an existing task
     */
    updateTask: builder.mutation<Task, { id: TaskId; data: UpdateTaskData }>({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),

    /**
     * Delete a task
     */
    deleteTask: builder.mutation<void, TaskId>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
