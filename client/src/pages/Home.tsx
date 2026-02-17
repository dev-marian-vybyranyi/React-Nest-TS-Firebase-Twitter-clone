import PostList from "@/components/post/PostList";
import { usePostStore } from "@/store/usePostStore";
import { useEffect } from "react";
import LoadingState from "@/components/LoadingState";

const Home = () => {
  const { posts, loading, getAllPosts } = usePostStore();

  useEffect(() => {
    getAllPosts();
  }, [getAllPosts]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="px-96">
      <PostList posts={posts} />
    </div>
  );
};

export default Home;
