import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { useProfileActions } from "@/hooks/useProfileActions";
import { Trash2 } from "lucide-react";
import { useState } from "react";

const DeleteProfileDialog = () => {
  const [open, setOpen] = useState(false);
  const { handleDeleteAccount } = useProfileActions();

  return (
    <>
      <Button
        variant="destructive"
        className="w-full gap-2 justify-start pl-4 bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        Delete profile
      </Button>
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete profile"
        description="Are you sure you want to delete your profile?"
        confirmLabel="Delete"
        onConfirm={handleDeleteAccount}
        variant="destructive"
      />
    </>
  );
};

export default DeleteProfileDialog;
