import { useCommentStore } from "@/store/useCommentStore";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import CommentCard from "./commentCard";

interface CommentListProps {
  postId: string;
}

const CommentList = ({ postId }: CommentListProps) => {
  const { comments, loadingStates, errors, fetchComments } = useCommentStore();
  const postComments = comments[postId] || [];
  const loading = loadingStates[postId] || false;
  const error = errors[postId] || null;

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

  if (postComments.length === 0) {
    return (
      <div className="text-center text-slate-500">
        No comments yet. Be the first to reply!
      </div>
    );
  }

  return (
    <div className="divide divide-slate-200">
      {postComments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;
