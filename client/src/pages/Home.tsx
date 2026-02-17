import PostList from "@/components/post/PostList";
import { usePostStore } from "@/store/usePostStore";
import { useEffect } from "react";
import LoadingState from "@/components/LoadingState";

const Home = () => {
  const { posts, loading, hasMore, getAllPosts, loadMorePosts } =
    usePostStore();

  useEffect(() => {
    getAllPosts(10);
  }, [getAllPosts]);

  if (loading && posts.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PostList
        posts={posts}
        onLoadMore={loadMorePosts}
        hasMore={hasMore}
        isLoadingMore={loading && posts.length > 0}
      />
    </div>
  );
};

export default Home;
