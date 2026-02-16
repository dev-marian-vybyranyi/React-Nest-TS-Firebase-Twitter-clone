import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RectangleEllipsis } from "lucide-react";
import { useState } from "react";
import ChangePasswordForm from "./ChangePasswordForm";

const ChangePasswordDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 justify-start pl-4">
          <RectangleEllipsis className="h-4 w-4" />
          Change password
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>Update your password</DialogDescription>
        </DialogHeader>
        <ChangePasswordForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
