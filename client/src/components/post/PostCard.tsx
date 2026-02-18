import { Card } from "@/components/ui/card";

import { formatDate } from "@/lib/utils";
import type { Post } from "@/types/post";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import PostDropdown from "./PostDropdown";
import { useAuthStore } from "@/store/useAuthStore";
import ReactionBar from "./ReactionBar";

interface PostCardProps {
  post?: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAuthStore();
  const isOwnPost = user?.uid === post?.userId;

  if (!post) {
    return null;
  }

  return (
    <Card className="overflow-hidden shadow-sm bg-white py-0 pt-4 gap-6">
      <div className="flex items-center gap-3 px-4">
        <Link to={`/profile/${post.userId}`} className="shrink-0">
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
            {post.user?.photo ? (
              <img
                src={post.user.photo}
                alt={`${post.user.name} ${post.user.surname}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to={`/profile/${post.userId}`}
            className="font-semibold text-sm text-slate-900 hover:underline"
          >
            {post.user?.name || "Unknown"} {post.user?.surname || "User"}
          </Link>
          <p className="text-xs text-slate-500">{formatDate(post.createdAt)}</p>
        </div>
        {isOwnPost && <PostDropdown post={post} />}
      </div>

      <div className="flex flex-col px-4">
        <h3 className="font-semibold text-xl leading-tight text-slate-900">
          {post.title}
        </h3>
        <p className="text-slate-600 text-base leading-relaxed">{post.text}</p>
      </div>

      <div className="w-full h-auto overflow-hidden">
        {post.photo && (
          <img
            src={post.photo}
            alt={post.title}
            className="w-full h-auto object-cover max-h-[500px] rounded-lg"
            loading="lazy"
          />
        )}
      </div>

      <ReactionBar postId={post.id} />
    </Card>
  );
};

export default PostCard;
