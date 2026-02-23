import ActionDropdown from "@/components/ActionDropdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { usePostStore } from "@/store/usePostStore";
import type { Post } from "@/types/post";
import { useState } from "react";
import toast from "react-hot-toast";
import PostForm from "./PostForm";

interface PostDropdownProps {
  post: Post;
}

const PostDropdown = ({ post }: PostDropdownProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { deletePost } = usePostStore();

  const handleDelete = async () => {
    try {
      await deletePost(post.id);
      toast.success("Post deleted successfully");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  return (
    <>
      <ActionDropdown
        onEdit={() => setShowEditDialog(true)}
        onDelete={handleDelete}
        deleteTitle="Are you sure?"
        deleteDescription="This action is irreversible. The post will be permanently deleted."
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
