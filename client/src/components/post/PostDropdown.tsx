import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { usePostStore } from "@/store/usePostStore";
import type { Post } from "@/types/post";
import { Edit2, EllipsisVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import PostForm from "./PostForm";

interface PostDropdownProps {
  post: Post;
}

const PostDropdown = ({ post }: PostDropdownProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const deletePost = usePostStore((state) => state.deletePost);

  const handleDelete = async () => {
    try {
      await deletePost(post.id);
      toast.success("Post deleted successfully");
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
            <EllipsisVertical className="w-5 h-5 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setShowEditDialog(true)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Are you sure?"
        description="This action is irreversible. The post will be permanently deleted."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white p-6" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to your post here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <PostForm
            post={post}
            onSuccess={() => setShowEditDialog(false)}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostDropdown;
