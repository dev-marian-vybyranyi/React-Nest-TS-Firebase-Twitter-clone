import PostList from "@/components/post/PostList";
import { usePostStore } from "@/store/usePostStore";
import { useEffect } from "react";

const Home = () => {
  const { posts, loading, getAllPosts } = usePostStore();

  useEffect(() => {
    getAllPosts();
  }, [getAllPosts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-slate-500">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="px-96">
      <PostList posts={posts} />
    </div>
  );
};

export default Home;
