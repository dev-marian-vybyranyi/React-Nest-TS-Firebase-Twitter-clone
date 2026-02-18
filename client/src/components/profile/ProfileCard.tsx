import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { auth } from "@/firebase";
import type { User as UserType } from "@/types/user";
import { LogOut, User } from "lucide-react";
import { useState } from "react";
import ChangePasswordDialog from "../auth/ChangePasswordDialog";
import DeleteProfileDialog from "./DeleteProfileDialog";
import EditProfileDialog from "./EditProfileDialog";

interface ProfileCardProps {
  user: UserType;
  onSignOut?: () => Promise<void>;
  isLoading: boolean;
}

const ProfileCard = ({ user, onSignOut, isLoading }: ProfileCardProps) => {
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const providerData = auth.currentUser?.providerData[0];

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2">
        <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-slate-100 overflow-hidden">
          {user.photo ? (
            <img
              src={user.photo}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-16 w-16 text-slate-400" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold">
          {user.name} {user.surname}
        </CardTitle>
        <CardDescription className="text-sm">{user.email}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {onSignOut && (
          <>
            <EditProfileDialog />
            {providerData?.providerId === "password" && (
              <ChangePasswordDialog />
            )}
          </>
        )}
        {onSignOut && (
          <>
            <Button
              variant="outline"
              className="w-full gap-2 justify-start pl-4"
              onClick={() => setShowSignOutDialog(true)}
              disabled={isLoading}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
            <ConfirmationDialog
              open={showSignOutDialog}
              onOpenChange={setShowSignOutDialog}
              title="Sign out"
              description="Are you sure you want to sign out?"
              confirmLabel="Sign Out"
              onConfirm={onSignOut}
              variant="default"
              buttonDisabled={isLoading}
            />
          </>
        )}
        {onSignOut && <DeleteProfileDialog />}
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
