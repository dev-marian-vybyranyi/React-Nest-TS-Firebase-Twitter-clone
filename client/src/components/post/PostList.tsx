import type { Post } from "@/types/post";
import PostCard from "./PostCard";
import EmptyPostsState from "./EmptyPostsState";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

interface PostListProps {
  posts?: Post[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

const PostList = ({
  posts,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: PostListProps) => {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasMore && onLoadMore) {
      onLoadMore();
    }
  }, [inView, hasMore, onLoadMore]);

  if (!posts || posts.length === 0) {
    return <EmptyPostsState />;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasMore && !isLoadingMore && <div ref={ref} className="h-10" />}

      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center text-gray-500 py-4 text-sm">
          No more posts
        </div>
      )}
    </div>
  );
};

export default PostList;
