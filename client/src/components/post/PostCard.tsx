import { Card } from "@/components/ui/card";

import { UserAvatar } from "@/components/ui/user-avatar";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type { Post } from "@/types/post";
import { useState } from "react";
import { Link } from "react-router-dom";
import CommentForm from "../comments/commentForm";
import CommentList from "../comments/commentList";
import PostDropdown from "./PostDropdown";
import ReactionBar from "./ReactionBar";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAuthStore();
  const [showComments, setShowComments] = useState(false);
  const isOwnPost = user?.uid === post?.userId;

  return (
    <Card className="overflow-hidden shadow-sm bg-white py-4 gap-6">
      <div className="flex items-center gap-3 px-4">
        <Link to={`/profile/${post.userId}`} className="shrink-0">
          <UserAvatar
            src={post.user?.photo}
            alt={`${post.user?.name} ${post.user?.surname}`}
            className="w-10 h-10"
          />
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

      <ReactionBar
        postId={post.id}
        initialLikes={post.likes}
        initialDislikes={post.dislikes}
        initialCommentsCount={post.commentsCount}
        initialUserReaction={post.userReaction}
        onCommentClick={() => setShowComments(!showComments)}
      />

      {showComments && (
        <>
          <CommentForm postId={post.id} />
          <CommentList postId={post.id} />
        </>
      )}
    </Card>
  );
};

export default PostCard;
