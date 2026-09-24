/**
 * Domain types for the RTK Query component demonstration.
 * Defines the shape of users and posts.
 */

export interface User {
  id: number;
  name: string;
  email: string;
  profile: {
    bio: string;
    avatar: string;
  };
}

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
}
