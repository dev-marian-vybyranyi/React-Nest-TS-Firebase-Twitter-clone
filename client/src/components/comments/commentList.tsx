import { useEffect } from "react";
import { useCommentStore } from "@/store/useCommentStore";
import CommentCard from "./commentCard";
import { Loader2 } from "lucide-react";

interface CommentListProps {
  postId: string;
}

const CommentList = ({ postId }: CommentListProps) => {
  const { comments, loading, error, fetchComments } = useCommentStore();

  useEffect(() => {
    fetchComments(postId);
  }, [postId, fetchComments]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  if (comments.length === 0) {
    return (
      <div className="text-center text-slate-500">
        No comments yet. Be the first to reply!
      </div>
    );
  }

  return (
    <div className="divide divide-slate-200">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;
