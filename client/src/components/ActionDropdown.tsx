import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit2, EllipsisVertical, Trash2 } from "lucide-react";
import { useState } from "react";

import ConfirmationDialog from "@/components/ui/confirmation-dialog";

interface ActionDropdownProps {
  onEdit?: () => void;
  onDelete: () => Promise<void> | void;
  deleteTitle?: string;
  deleteDescription?: string;
}

const ActionDropdown = ({
  onEdit,
  onDelete,
  deleteTitle = "Are you sure?",
  deleteDescription = "This action is irreversible.",
}: ActionDropdownProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    await onDelete();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 hover:bg-slate-100 rounded-full transition-colors flex items-start h-min">
            <EllipsisVertical className="w-5 h-5 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white">
          {onEdit && (
            <DropdownMenuItem className="cursor-pointer" onClick={onEdit}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
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
        title={deleteTitle}
        description={deleteDescription}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
};

export default ActionDropdown;
