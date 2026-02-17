import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePostStore } from "@/store/usePostStore";
import { Edit2, EllipsisVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface PostDropdownProps {
  postId: string;
}

const PostDropdown = ({ postId }: PostDropdownProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deletePost = usePostStore((state) => state.deletePost);

  const handleDelete = async () => {
    try {
      await deletePost(postId);
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
          <DropdownMenuItem className="cursor-pointer">
            <Edit2 className="w-4 h-4 mr-2" />
            Редагувати
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Видалити
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action is irreversible. The post will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostDropdown;
