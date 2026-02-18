import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useProfileActions } from "@/hooks/useProfileActions";

const DeleteProfileDialog = () => {
  const [open, setOpen] = useState(false);
  const { handleDeleteAccount } = useProfileActions();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          className="w-full gap-2 justify-start pl-4 bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
        >
          <Trash2 className="h-4 w-4" />
          Delete profile
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete profile</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your profile?
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="outline"
            className="text-red-600"
            onClick={handleDeleteAccount}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProfileDialog;
