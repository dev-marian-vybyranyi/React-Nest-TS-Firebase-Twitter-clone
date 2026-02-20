import { useAuthStore } from "@/store/useAuthStore";
import { useCommentStore } from "@/store/useCommentStore";
import toast from "react-hot-toast";
import type { Comment } from "@/types/comment";
import ActionDropdown from "../ActionDropdown";

interface CommentDropdownProps {
  comment: Comment;
  onEdit: () => void;
}

const CommentDropdown = ({ comment, onEdit }: CommentDropdownProps) => {
  const { deleteComment } = useCommentStore();
  const { user } = useAuthStore();

  const handleDelete = async () => {
    if (!user) return;

    try {
      await deleteComment(comment.postId, comment.id, user.uid);
      toast.success("Comment deleted successfully");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <ActionDropdown
      onEdit={onEdit}
      onDelete={handleDelete}
      deleteTitle="Delete Comment"
      deleteDescription="Are you sure you want to permanently delete this comment? This action is irreversible."
    />
  );
};

export default CommentDropdown;
