import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type PostType = "TEXT" | "IMAGE" | "VIDEO" | "LINK" | "POLL" | "EVENT";

export interface EntrepreneurshipPost {
  id: string;
  content: string;
  type: PostType;
  images: string[];
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isPinned: boolean;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  postLikes: {
    id: string;
    userId: string;
  }[];
  postComments: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      image?: string;
    };
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface PostComment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentId?: string;
  likes: number;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  replies: PostComment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  type?: PostType;
  images?: string[];
  tags?: string[];
}

export interface CreateCommentData {
  content: string;
  parentId?: string;
}

export interface PostsFilters {
  page?: number;
  limit?: number;
  type?: PostType;
  search?: string;
  authorId?: string;
}

export function useEntrepreneurshipPosts(filters: PostsFilters = {}) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["entrepreneurship-posts", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.type) params.append("type", filters.type);
      if (filters.search) params.append("search", filters.search);
      if (filters.authorId) params.append("authorId", filters.authorId);

      const response = await fetch(`/api/entrepreneurship/posts?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostData) => {
      const response = await fetch("/api/entrepreneurship/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-posts"] });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ postId, data }: { postId: string; data: Partial<CreatePostData> }) => {
      const response = await fetch(`/api/entrepreneurship/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-posts"] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/entrepreneurship/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-posts"] });
    },
  });

  return {
    posts: data?.posts || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createPost: createPostMutation.mutateAsync,
    isCreating: createPostMutation.isPending,
    updatePost: updatePostMutation.mutateAsync,
    isUpdating: updatePostMutation.isPending,
    deletePost: deletePostMutation.mutateAsync,
    isDeleting: deletePostMutation.isPending,
  };
}

export function usePost(postId: string) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["entrepreneurship-post", postId],
    queryFn: async () => {
      const response = await fetch(`/api/entrepreneurship/posts/${postId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }
      return response.json();
    },
    enabled: !!postId,
  });

  return {
    post: data,
    isLoading,
    error,
    refetch,
  };
}

export function usePostComments(postId: string, filters: { page?: number; limit?: number } = {}) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["entrepreneurship-post-comments", postId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/entrepreneurship/posts/${postId}/comments?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      return response.json();
    },
    enabled: !!postId,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (data: CreateCommentData) => {
      const response = await fetch(`/api/entrepreneurship/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create comment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-posts"] });
    },
  });

  return {
    comments: data?.comments || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createComment: createCommentMutation.mutateAsync,
    isCreating: createCommentMutation.isPending,
  };
}

export function usePostLike(postId: string) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/entrepreneurship/posts/${postId}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-posts"] });
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-post", postId] });
    },
  });

  return {
    toggleLike: likeMutation.mutateAsync,
    isLiking: likeMutation.isPending,
  };
}

export function usePostShare(postId: string) {
  const queryClient = useQueryClient();

  const shareMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/entrepreneurship/posts/${postId}/share`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to share post");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-posts"] });
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-post", postId] });
    },
  });

  return {
    sharePost: shareMutation.mutateAsync,
    isSharing: shareMutation.isPending,
  };
}
