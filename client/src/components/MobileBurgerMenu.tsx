import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { User } from "@/types/user";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreatePostDialog from "./post/createPostDialog";

interface MobileBurgerMenuProps {
  user: User | null;
}

export const MobileBurgerMenu = ({ user }: MobileBurgerMenuProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex sm:hidden items-center">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[300px] sm:w-[400px] bg-white pl-2"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-4 py-4 px-2">
            <Link
              to="/"
              className="font-bold text-xl"
              onClick={() => setOpen(false)}
            >
              Twitter
            </Link>
            {user ? (
              <>
                <div className="w-full">
                  <CreatePostDialog />
                </div>
                <Button
                  className="flex items-center justify-start gap-3 p-0"
                  onClick={() => {
                    navigate("/profile");
                    setOpen(false);
                  }}
                >
                  <UserAvatar src={user.photo} alt={user.name} />
                  <span className="font-semibold">
                    {user.name} {user.surname}
                  </span>
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-3 mt-4">
                <Button asChild>
                  <Link to="/sign-in" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/sign-up" onClick={() => setOpen(false)}>
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};
