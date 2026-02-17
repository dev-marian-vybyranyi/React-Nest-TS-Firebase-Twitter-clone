import type { Post } from "@/types/post";
import PostCard from "./PostCard";
import EmptyPostsState from "./EmptyPostsState";

interface PostListProps {
  posts?: Post[];
}

const PostList = ({ posts }: PostListProps) => {
  if (!posts || posts.length === 0) {
    return <EmptyPostsState />;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;
