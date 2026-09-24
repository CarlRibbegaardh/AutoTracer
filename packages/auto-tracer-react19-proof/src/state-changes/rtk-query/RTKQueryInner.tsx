/**
 * Inner component that uses RTK Query hooks.
 * Demonstrates various query and mutation hook patterns.
 */

import React from "react";
import { useReactTracer } from "@autotracer/react19";
import {
  useGetUserQuery,
  useGetPostsQuery,
  useUpdateUserMutation,
  useCreatePostMutation,
} from "./api";

export const RTKQueryInner: React.FC = () => {
  const logger = useReactTracer();

  // Query hooks only
  const userQuery = useGetUserQuery(1);
  logger.labelState(0, "userQuery", userQuery);

  const postsQuery = useGetPostsQuery();
  logger.labelState(1, "postsQuery", postsQuery);

  // Mutation hooks - these return tuples
  const [updateUser, updateUserResult] = useUpdateUserMutation();
  logger.labelState(
    2,
    "updateUser",
    updateUser,
    "updateUserResult",
    updateUserResult
  );

  const [createPost, createPostResult] = useCreatePostMutation();
  logger.labelState(
    3,
    "createPost",
    createPost,
    "createPostResult",
    createPostResult
  );

  return (
    <div>
      <h2>User Query</h2>
      <div>Loading: {String(userQuery.isLoading)}</div>
      <div>Success: {String(userQuery.isSuccess)}</div>
      {userQuery.data && (
        <div>
          <div>Name: {userQuery.data.name}</div>
          <div>Email: {userQuery.data.email}</div>
          <div>Bio: {userQuery.data.profile.bio}</div>
        </div>
      )}
      <button
        onClick={() =>
          updateUser({
            id: 1,
            name: "Updated Name",
            email: "updated@example.com",
          })
        }
      >
        Update User
      </button>

      <h2>Posts Query</h2>
      <div>Loading: {String(postsQuery.isLoading)}</div>
      <div>Success: {String(postsQuery.isSuccess)}</div>
      {postsQuery.data && (
        <div>
          <div>Posts Count: {postsQuery.data.length}</div>
          {postsQuery.data.map((post) => (
            <div key={post.id}>
              {post.title}: {post.content}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() =>
          createPost({
            title: "New Post",
            content: "New Content",
            authorId: 1,
          })
        }
      >
        Create Post
      </button>

      <h2>Mutation Results</h2>
      <div>Update User Loading: {String(updateUserResult.isLoading)}</div>
      <div>Create Post Loading: {String(createPostResult.isLoading)}</div>
      {updateUserResult.data && (
        <div>Updated User: {updateUserResult.data.name}</div>
      )}
      {createPostResult.data && (
        <div>Created Post: {createPostResult.data.title}</div>
      )}
    </div>
  );
};
