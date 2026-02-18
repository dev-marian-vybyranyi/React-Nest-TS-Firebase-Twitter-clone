import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { User as UserType } from "@/types/user";
import { LogOut, Trash2, User } from "lucide-react";
import ChangePasswordDialog from "../auth/ChangePasswordDialog";
import EditProfileDialog from "./EditProfileDialog";
import { auth } from "@/firebase";

interface ProfileCardProps {
  user: UserType;
  onSignOut?: () => Promise<void>;
  onDeleteAccount?: () => void;
  isLoading: boolean;
}

const ProfileCard = ({
  user,
  onSignOut,
  onDeleteAccount,
  isLoading,
}: ProfileCardProps) => {
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
          <Button
            variant="outline"
            className="w-full gap-2 justify-start pl-4"
            onClick={onSignOut}
            disabled={isLoading}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        )}
        {onDeleteAccount && (
          <Button
            variant="destructive"
            className="w-full gap-2 justify-start pl-4 bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
            onClick={onDeleteAccount}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
