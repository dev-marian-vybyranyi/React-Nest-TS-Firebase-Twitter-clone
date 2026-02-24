import PostList from "@/components/post/PostList";
import { usePostStore } from "@/store/usePostStore";
import { useEffect } from "react";
import PostCardSkeleton from "@/components/post/PostCardSkeleton";
import SortDropdown from "@/components/post/SortDropdown";

const Home = () => {
  const { posts, loading, hasMore, fetchPosts } = usePostStore();

  useEffect(() => {
    fetchPosts(5);
  }, [fetchPosts]);

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <SortDropdown />
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <SortDropdown />
      <PostList
        posts={posts}
        onLoadMore={() => fetchPosts(5, true)}
        hasMore={hasMore}
        isLoadingMore={loading && posts.length > 0}
      />
    </div>
  );
};

export default Home;
